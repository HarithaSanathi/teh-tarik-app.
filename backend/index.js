import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Firebase Admin
import { db, firebaseReady } from './lib/firebase.js';

// Menu data & Parser
import dynamicMenu from '../frontend/src/data/dynamicMenu.js';
import { menuItems, categories, shopInfo, outlets } from '../frontend/src/data/menuData.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'salam123stm';

// Helper for Firestore with Timeout
const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore Timeout')), ms))
  ]);
};

// Helper to parse filename (Duplicate of frontend logic for backend use)
const parseFileName = (fileName) => {
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const priceMatch = nameWithoutExt.match(/(\d+\.\d+)/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : 0.00;
    let name = nameWithoutExt
        .replace(/\(.*?\)/g, '')
        .replace(/SGD|SDG/gi, '')
        .replace(/(\d+\.\d+)/g, '')
        .replace(/_/g, ' ')
        .trim();
    name = name.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    return { name: name || "Delicious Item", price: price };
};

// Process dynamicMenu into flat arrays for immediate use
const allDynamicItems = [];
const dynamicCategoriesList = [];
let _pCount = 0;

Object.entries(dynamicMenu).forEach(([catName, fileList]) => {
    const catId = catName.toLowerCase().replace(/\s+/g, '-');
    dynamicCategoriesList.push({
        id: catId,
        name: catName,
        image: `/SMT FOOD/SMT FOOD/${catName}/${fileList[0]}`,
        emoji: '🍽️',
        active: true
    });
    fileList.forEach(file => {
        const { name, price } = parseFileName(file);
        allDynamicItems.push({
            id: `dp-${_pCount++}`,
            categoryId: catId,
            name: name,
            price: price,
            image: `/SMT FOOD/SMT FOOD/${catName}/${file}`,
            description: `Authentic ${name} - prepared fresh.`,
            prepTime: 15,
            active: true
        });
    });
});

// Optional Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Connection: Active (Cloud Persistence)');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================
// SEEDING (Comprehensive from Dynamic Menu)
// ============================================================
const seedFirestore = async () => {
  if (!firebaseReady) {
    console.warn('⏩ Skipping Firestore Seeding: No Service Account provided.');
    return;
  }
  try {
    const catsRef = db.collection('categories');
    const prodsRef = db.collection('products');

    const catsSnap = await withTimeout(catsRef.limit(1).get());
    const prodsSnap = await withTimeout(prodsRef.limit(1).get());

    if (catsSnap.empty || prodsSnap.empty) {
      console.log('🌱 Starting Comprehensive Seeding from Dynamic Menu...');
      
      const catBatch = db.batch();
      const prodBatch = db.batch();
      
      let prodCount = 0;

      for (const [catName, fileList] of Object.entries(dynamicMenu)) {
        const catId = catName.toLowerCase().replace(/\s+/g, '-');
        
        // Use the first item's image as the category image
        const firstItemFile = fileList[0];
        const catImg = `/SMT FOOD/SMT FOOD/${catName}/${firstItemFile}`;

        // Add Category
        const catDoc = catsRef.doc(catId);
        catBatch.set(catDoc, {
          id: catId,
          name: catName,
          image: catImg,
          emoji: '🍽️',
          active: true,
          createdAt: new Date().toISOString()
        });

        // Add Products for this category
        fileList.forEach(file => {
          const { name, price } = parseFileName(file);
          const prodId = `p-${Date.now()}-${prodCount++}`;
          const prodDoc = prodsRef.doc(prodId);
          prodBatch.set(prodDoc, {
            id: prodId,
            categoryId: catId,
            name: name,
            price: price,
            image: `/SMT FOOD/SMT FOOD/${catName}/${file}`,
            description: `Authentic ${name} - prepared fresh.`,
            prepTime: 15,
            active: true,
            badge: null,
            createdAt: new Date().toISOString()
          });
        });
      }

      await catBatch.commit();
      await prodBatch.commit();
      console.log('✅ Seeding Complete: Categories and Products synced.');
    }
  } catch (err) {
    console.error('❌ Firestore Seeding error:', err.message);
  }
};
seedFirestore();

// ============================================================
// AUTH ROUTES
// ============================================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const userRef = db.collection('users').doc(email);
    const existing = await userRef.get();
    if (existing.exists) return res.status(409).json({ error: 'User exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, phone, password: hashedPassword, createdAt: new Date().toISOString() };
    await userRef.set(userData);

    if (supabase) {
      await supabase.from('users').insert([userData]);
    }

    const { password: _, ...user } = userData;
    return res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(401).json({ error: 'Invalid credentials' });

    const user = userDoc.data();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ORDER ROUTES
// ============================================================

app.post('/api/orders', async (req, res) => {
  const { customer, items, total, mode, payment, notes } = req.body;
  const orderId = `STM-${Date.now()}`;
  
  try {
    const orderData = { 
      id: orderId, customer, items, total, mode, payment, notes, 
      status: 'Pending', order_status: 'pending',
      createdAt: new Date().toISOString() 
    };
    await db.collection('orders').doc(orderId).set(orderData);

    if (supabase) {
      await supabase.from('orders').insert([orderData]);
    }

    console.log(`📦 New Order Received: ${orderId}`);
    res.status(201).json({ success: true, orderId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map(doc => doc.data());
    res.json({ total: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await db.collection('orders').doc(req.params.id).update({ 
      status, 
      order_status: status.toLowerCase(),
      updatedAt: new Date().toISOString()
    });
    if (supabase) {
      await supabase.from('orders').update({ status }).eq('id', req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// DATA ROUTES
// ============================================================
app.get('/api/info', (req, res) => res.json({ shopInfo, outlets }));

app.get('/api/menu', async (req, res) => {
  if (!firebaseReady) return res.json(allDynamicItems); // Use full dynamic menu
  try {
    const snap = await withTimeout(db.collection('products').get());
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    console.warn('⚠️ Firestore Menu Query failed, falling back to local data:', err.message);
    res.json(allDynamicItems); 
  }
});

app.get('/api/categories', async (req, res) => {
  if (!firebaseReady) return res.json(dynamicCategoriesList); // Use fall dynamic categories
  try {
    const snap = await withTimeout(db.collection('categories').get());
    const categoriesList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(categoriesList);
  } catch (err) {
    console.warn('⚠️ Firestore Categories Query failed, falling back to local data:', err.message);
    res.json(dynamicCategoriesList);
  }
});

app.post('/api/products', async (req, res) => {
  const prod = req.body;
  if (!prod.id) prod.id = `stm-prod-${Date.now()}`;
  try {
    if (firebaseReady) {
      await db.collection('products').doc(prod.id).set({ ...prod, createdAt: new Date().toISOString() });
    } else {
      allDynamicItems.unshift({ ...prod, createdAt: new Date().toISOString() });
    }
    
    if (supabase) {
      await supabase.from('products').insert([prod]);
    }
    res.status(201).json({ success: true, product: prod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    if (firebaseReady) {
      await db.collection('products').doc(req.params.id).update({ ...req.body, updatedAt: new Date().toISOString() });
    } else {
      const idx = allDynamicItems.findIndex(p => p.id === req.params.id);
      if (idx !== -1) {
        allDynamicItems[idx] = { ...allDynamicItems[idx], ...req.body, updatedAt: new Date().toISOString() };
      }
    }
    
    if (supabase) {
      await supabase.from('products').update(req.body).eq('id', req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (firebaseReady) {
      await db.collection('products').doc(req.params.id).delete();
    } else {
      const idx = allDynamicItems.findIndex(p => p.id === req.params.id);
      if (idx > -1) allDynamicItems.splice(idx, 1);
    }
    
    if (supabase) {
      await supabase.from('products').delete().eq('id', req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`\n🚀 STM Backend (Firestore) Listening on PORT ${PORT}`));
