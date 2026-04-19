import { db, storage, auth } from '../../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import dynamicMenu from '../../data/dynamicMenu';
import { categories as defaultCategories } from '../../data/menuData';

// ─── CONNECTION TEST ────────────────────────────────────────────────────────
export const testConnection = async () => {
  try {
    const testDocRef = doc(collection(db, '_connection_test'));
    await setDoc(testDocRef, { timestamp: new Date().toISOString(), message: 'Connection successful' });
    console.log('✅ Firebase connection test successful! Wrote sample data to Firestore.');
    await deleteDoc(testDocRef);
  } catch (err) {
    console.error('❌ Firebase connection test failed. Please verify your Firestore rules and .env configuration:', err);
  }
};
// Run the connection test when the app initializes this service (Disabled for production speed)
// testConnection();

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

export const fetchCategories = async () => {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    throw err;
  }
};

export const subscribeCategories = (callback) => {
  const q = query(collection(db, 'categories'));
  const unsub = onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('Categories Subscription Error:', err);
  });
  return unsub;
};

export const addCategory = async (categoryObj) => {
  if (!auth.currentUser) throw new Error("Authentication required to add categories.");
  const id = categoryObj.id || `cat-${Date.now()}`;
  await setDoc(doc(db, 'categories', id), { ...categoryObj, id });
  return categoryObj;
};
export const updateCategory = (id, updatedCat) => {
  if (!auth.currentUser) throw new Error("Authentication required to update categories.");
  return updateDoc(doc(db, 'categories', id), updatedCat);
};
export const deleteCategory = async (id) => {
  if (!auth.currentUser) throw new Error("Authentication required to delete categories.");
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error(`Permission Denied: Your account (${auth.currentUser?.email}) is NOT authorized in Firestore rules to delete categories.`);
    }
    throw err;
  }
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const fetchProducts = async () => {
  try {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to fetch products:', err);
    throw err;
  }
};

export const subscribeProducts = (callback, activeCategoryId = null) => {
  const q = query(collection(db, 'products'));
  const unsub = onSnapshot(q, (snap) => {
    let prods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // If we get an empty snapshot from a live listener, it means data was deleted
    if (activeCategoryId && activeCategoryId !== 'all') {
      prods = prods.filter(p => p.categoryId === activeCategoryId);
    }
    callback(prods);
  }, (err) => {
    console.error('Products Subscription Error:', err);
  });
  return unsub;
};

export const addProduct = async (product) => {
  if (!auth.currentUser) throw new Error("Authentication required to add products.");
  const id = product.id || `prod-${Date.now()}`;
  const newProduct = { ...product, id, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'products', id), newProduct);
  return newProduct;
};

export const updateProduct = (id, updatedProduct) => {
  if (!auth.currentUser) throw new Error("Authentication required to update products.");
  return updateDoc(doc(db, 'products', id), { ...updatedProduct, updatedAt: new Date().toISOString() });
};

export const deleteProduct = async (id) => {
  if (!auth.currentUser) throw new Error("Authentication required to delete products.");
  try {
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const imageUrl = data.image || data.img;
      // If it's a Firebase Storage URL, delete the file too
      if (imageUrl && (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.startsWith('gs://'))) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
          console.log('✅ Deleted associated image from Storage (Product)');
        } catch (err) {
          console.warn('⚠️ Storage image delete failed (Product):', err.message);
        }
      }
    }
    console.log(`[Delete Product] Requesting delete for ${id} by user: ${auth.currentUser?.email}`);
    await deleteDoc(docRef);
    console.log('✅ Deleted Firestore document (Product)');
    return true;
  } catch (err) {
    console.error('Delete Product Error:', err.code, err.message);
    if (err.code === 'permission-denied') {
      throw new Error(`Permission Denied: You (${auth.currentUser?.email || 'unauthenticated'}) do not have rights to delete products.`);
    }
    throw err;
  }
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const placeOrder = async (orderPayload) => {
  // Step 6 Debug: Log Firebase Config
  console.log('[DEBUG] Active Firebase Config:', {
    projectId: auth.app.options.projectId,
    authDomain: auth.app.options.authDomain
  });

  try {
    const orderId = `STM-${Date.now()}`;
    const trackingToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const newOrder = { 
      ...orderPayload, 
      id: orderId, 
      trackingToken,
      createdAt: new Date().toISOString(),
      status: orderPayload.status || 'Pending',
      isNewForAdmin: true,
      chatEnabled: true,
      unreadAdmin: 0,
      unreadCustomer: 0
    };

    // DEBUG: Write #1 - Primary Order
    console.log('[DEBUG] Attempting Write #1: /orders/' + orderId);
    console.log('[DEBUG] Payload #1:', JSON.stringify(newOrder, null, 2));
    
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      console.log('[DEBUG] Write #1 SUCCESS');
    } catch (err1) {
      console.error('[DEBUG] Write #1 FAILED:', {
        code: err1.code,
        message: err1.message,
        path: '/orders/' + orderId
      });
      throw err1; // Propagate to outer catch
    }

    const publicData = {
      id: orderId,
      status: newOrder.status || 'pending',
      items: newOrder.items || [],
      total: newOrder.total || 0,
      mode: newOrder.mode || 'delivery',
      paymentProofSubmitted: false,
      createdAt: new Date()
    };

    // DEBUG: Write #2 - Public Tracking
    console.log('[DEBUG] Attempting Write #2: /public_tracking/' + orderId);
    console.log('[DEBUG] Payload #2:', JSON.stringify(publicData, null, 2));

    try {
      await setDoc(doc(db, 'public_tracking', orderId), publicData);
      console.log('[DEBUG] Write #2 SUCCESS');
    } catch (err2) {
      console.error('[DEBUG] Write #2 FAILED:', {
        code: err2.code,
        message: err2.message,
        path: '/public_tracking/' + orderId
      });
      throw err2; // Propagate to outer catch
    }

    localStorage.setItem('stm_last_order_id', orderId);
    return newOrder;
  } catch (err) {
    console.error('[DEBUG] placeOrder General Error:', err);
    throw new Error('Failed to place order: ' + err.message);
  }
};

export const fetchOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    throw err;
  }
};

export const subscribeOrders = (callback) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('Orders Subscription Error:', err);
  });
  return unsub;
};

export const fetchOrderById = async (id) => {
  try {
    const docRef = doc(db, 'orders', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    throw new Error('Order not found');
  } catch (err) {
    console.error('Failed to fetch order:', err);
    throw err;
  }
};

export const updateOrderStatus = async (id, status) => {
  if (!auth.currentUser) throw new Error("Authentication required to update order status.");
  const updatedAt = new Date().toISOString();
  
  // Update main order
  await updateDoc(doc(db, 'orders', id), { status, order_status: status.toLowerCase(), updatedAt });
  
  // Sync status to public tracking
  try {
    await updateDoc(doc(db, 'public_tracking', id), { status, updatedAt });
  } catch (e) {
    console.warn('Public tracking sync failed - document might not exist for old order.');
  }
};

export const deleteOrder = async (id) => {
  const allowedAdmins = [
    'stmsalam@gmail.com',
    'admin@stmsalam.com',
    'admin@stm.com'
  ];

  if (!auth.currentUser) throw new Error("Authentication required to delete orders.");
  
  if (!allowedAdmins.includes(auth.currentUser.email)) {
    throw new Error(`Permission Denied: You (${auth.currentUser.email}) do not have rights to delete orders.`);
  }

  console.log(`[Delete Order] Requesting delete for ${id} by user: ${auth.currentUser?.email}`);
  try {
    await deleteDoc(doc(db, 'orders', id));
    console.log('✅ Deleted Firestore document (Order)');
  } catch (err) {
    console.error('Delete Order Error:', err.code, err.message);
    if (err.code === 'permission-denied') {
      throw new Error(`Permission Denied: You (${auth.currentUser?.email || 'unauthenticated'}) do not have rights to delete orders.`);
    }
    throw err;
  }
};

// ─── ORDER CHAT & NOTIFICATIONS ──────────────────────────────────────────────

export const sendMessage = async (orderId, message, token = null) => {
  const msgId = `msg-${Date.now()}`;
  const msgDoc = doc(collection(db, 'orders', orderId, 'messages'), msgId);
  const msgData = {
    ...message,
    id: msgId,
    token: token,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  await setDoc(msgDoc, msgData);
  
  // Update unread count on the order
  const orderRef = doc(db, 'orders', orderId);
  const snap = await getDoc(orderRef);
  if (snap.exists()) {
    const data = snap.data();
    if (message.senderRole === 'admin') {
      await updateDoc(orderRef, { unreadCustomer: (data.unreadCustomer || 0) + 1 });
    } else {
      await updateDoc(orderRef, { 
        unreadAdmin: (data.unreadAdmin || 0) + 1,
        lastGuestVerifyToken: token 
      });
    }
  }
  return msgData;
};

export const subscribeMessages = (orderId, callback, token = null) => {
  const collectionRef = collection(db, 'orders', orderId, 'messages');
  
  if (token) {
    console.warn('Customer live chat reading is disabled for security.');
    callback([]); // Return empty list to guest
    return () => {}; // No-op unsubscribe
  }
  
  // Admin uses standard unrestricted query
  const q = query(collectionRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const markMessagesAsRead = async (orderId, role, token = null) => {
  const orderRef = doc(db, 'orders', orderId);
  if (role === 'admin') {
    await updateDoc(orderRef, { unreadAdmin: 0 });
  } else {
    console.log('Guest mark-as-read Suppressed.');
  }
};

export const markOrderAsSeen = async (orderId) => {
  if (!auth.currentUser) return;
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { isNewForAdmin: false, unreadAdmin: 0 });
};

// ─── GALLERY ────────────────────────────────────────────────────────────────
export const fetchGallery = async () => {
  try {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to fetch gallery:', err);
    throw err;
  }
};

export const subscribeGallery = (callback) => {
  const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('Gallery Subscription Error:', err);
  });
  return unsub;
};

export const addGalleryItem = async (item) => {
  if (!auth.currentUser) throw new Error("Authentication required to manage gallery.");
  const id = item.id || `gallery-${Date.now()}`;
  const newItem = { ...item, id, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'gallery', id), newItem);
  return newItem;
};

export const updateGalleryItem = (id, updatedItem) => {
  if (!auth.currentUser) throw new Error("Authentication required to manage gallery.");
  return updateDoc(doc(db, 'gallery', id), { ...updatedItem, updatedAt: new Date().toISOString() });
};

export const deleteGalleryItem = async (id) => {
  if (!auth.currentUser) throw new Error("Authentication required to manage gallery.");
  try {
    const docRef = doc(db, 'gallery', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.url && (data.url.includes('firebasestorage.googleapis.com') || data.url.startsWith('gs://'))) {
        try {
          const imageRef = ref(storage, data.url);
          await deleteObject(imageRef);
          console.log('✅ Deleted associated image from Storage (Gallery)');
        } catch (err) {
          console.warn('⚠️ Storage file delete failed (Gallery):', err.message);
        }
      }
    }
    console.log(`[Delete Gallery] Requesting delete for ${id} by user: ${auth.currentUser?.email}`);
    await deleteDoc(docRef);
    console.log('✅ Deleted Firestore document (Gallery)');
    return true;
  } catch (err) {
    console.error('Delete Gallery Item Error:', err.code, err.message);
    if (err.code === 'permission-denied') {
      throw new Error(`Permission Denied: You (${auth.currentUser?.email || 'unauthenticated'}) do not have rights to delete gallery items.`);
    }
    throw err;
  }
};

// ─── LOCAL STORAGE MIGRATION ────────────────────────────────────────────────

export const getLocalStorageSnapshot = () => {
  try {
    return {
      categories: JSON.parse(localStorage.getItem('stm_categories') || '[]'),
      products: JSON.parse(localStorage.getItem('stm_products') || '[]'),
      orders: JSON.parse(localStorage.getItem('stm_orders') || '[]'),
      gallery: JSON.parse(localStorage.getItem('stm_gallery') || '[]'),
    };
  } catch (e) {
    return { categories: [], products: [], orders: [], gallery: [] };
  }
};

export const seedFromLocalStorage = async (forceRewrite = false) => {
  if (!auth.currentUser) throw new Error("Authentication required to seed data.");
  console.log('Smart Seeding: Syncing items to Cloud...');
  
  const existingProdsSnap = await getDocs(collection(db, 'products'));
  const existingProdIds = new Set(existingProdsSnap.docs.map(d => d.id));

  const existingCatsSnap = await getDocs(collection(db, 'categories'));
  const existingCatIds = new Set(existingCatsSnap.docs.map(d => d.id));

  const existingGallerySnap = await getDocs(collection(db, 'gallery'));
  const existingGalleryIds = new Set(existingGallerySnap.docs.map(d => d.id));

  // Flatten dynamicMenu object into a products array
  const prods = [];
  const folderCasingMap = {
    'SNACKS': 'snacks', 'BURGER KABABAB': 'BURGER KABABAB', 'DINOSAUR': 'DINOSAUR',
    'DESERT': 'desert', 'COLD DRINKS': 'cold drinks', 'CAN DRINKS': 'CAN DRINKS',
    'INDIAN FOOD': 'indian food', 'SUGARCANE': 'SUGARCANE', 'HOT': 'HOT', 'SIDES': 'sides'
  };

  Object.keys(dynamicMenu).forEach(categoryKey => {
    dynamicMenu[categoryKey].forEach((filename, i) => {
      const cleanName = filename.replace('.png', '').replace('.jpg', '').replace(/_/g, ' ');
      const priceMatch = cleanName.match(/SGD\s*(\d+(\.\d+)?)/i);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 5.0;
      let name = cleanName.replace(/SGD\s*\d+(\.\d+)?/i, '').trim() || 'Menu Item';
      
      const categoryIdMap = {
        'SNACKS': 'snacks', 'BURGER KABABAB': 'burgers-kebabs', 'DINOSAUR': 'dinosaur',
        'DESERT': 'desserts', 'COLD DRINKS': 'cold-drinks', 'CAN DRINKS': 'can-drinks',
        'INDIAN FOOD': 'indian', 'SUGARCANE': 'sugarcane', 'HOT': 'hot-drinks', 'SIDES': 'sides'
      };
      const catId = categoryIdMap[categoryKey] || 'snacks';
      const matchedCat = defaultCategories.find(c => c.id === catId);
      const realFolderPath = folderCasingMap[categoryKey] || categoryKey;

      const pId = `stm-prod-${categoryKey.substring(0,3).toLowerCase()}-${i}`;
      // CRITICAL: We only seed if the item was NEVER there. 
      // This prevents deleted items from coming back.
      if (!existingProdIds.has(pId)) {
        prods.push({
          id: pId, name, price, categoryId: catId,
          category: matchedCat ? matchedCat.name : categoryKey,
          badge: i % 5 === 0 ? 'bestseller' : '',
          active: true, img: `/SMT FOOD/SMT FOOD/${realFolderPath}/${filename}`,
        });
      }
    });
  });

  // 1. Seed Categories (Only if missing)
  let catCount = 0;
  for (const cat of defaultCategories) {
    const catId = cat.id;
    if (!existingCatIds.has(catId)) {
      await setDoc(doc(db, 'categories', catId), { 
        ...cat, id: catId, active: true,
        icon: cat.icon || cat.emoji || '🍽️',
        order: cat.order || (catCount + 1)
      });
      catCount++;
    }
  }

  // 2. Seed Products
  for (const prod of prods) {
    await setDoc(doc(db, 'products', prod.id), { ...prod, createdAt: new Date().toISOString() });
  }

  // 3. Seed Gallery
  let gCount = 0;
  try {
    const { galleryMedia } = await import('../../data/galleryData');
    for (const [i, file] of galleryMedia.entries()) {
      const gId = `gallery-seed-${i}`;
      // Only add if it's not already in cloud. 
      // If admin deleted it, we respect that and don't re-add.
      if (!existingGalleryIds.has(gId)) {
        const isVideo = file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.mov');
        await setDoc(doc(db, 'gallery', gId), {
          id: gId, url: `/aboutusimage/${file}`, type: isVideo ? 'video' : 'image',
          title: file.replace(/_/g, ' ').split('.')[0].substring(0, 20),
          active: true, createdAt: new Date().toISOString()
        });
        gCount++;
      }
    }
  } catch (err) { console.warn('Gallery seeding skip:', err); }

  return { categories: catCount, products: prods.length, orders: 0, gallery: gCount };
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const fetchDashboardStats = async () => {
  const orders = await fetchOrders();
  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0).toFixed(2),
    popularItems: ['Teh Tarik Special', 'Nasi Lemak'],
    recentOrders: orders.slice(0, 5),
  };
};

// ─── Legacy sync dataService object ──────────────────────────────────────────

let _cachedCategories = [];
let _cachedProducts   = [];
let _cachedOrders     = [];
let _cachedGallery    = [];

const notifyDataUpdated = () => window.dispatchEvent(new Event('stm_data_updated'));

// Start global listeners
subscribeCategories(cats => { _cachedCategories = cats; notifyDataUpdated(); });
subscribeProducts(prods   => { _cachedProducts   = prods; notifyDataUpdated(); });
subscribeOrders(ords      => { _cachedOrders     = ords; });
subscribeGallery(items    => { _cachedGallery    = items; notifyDataUpdated(); });

export const dataService = {
  getCategories: () => [..._cachedCategories],
  getProducts: ()   => [..._cachedProducts],
  getProductsByCategory: (catId) => _cachedProducts.filter(p => p.categoryId === catId),
  getOrders: ()     => [..._cachedOrders],
  getGallery: ()    => [..._cachedGallery],

  addCategory,
  updateCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  placeOrder,
  updateOrderStatus,
  deleteOrder,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,

  subscribeCategories,
  subscribeProducts,
  subscribeOrders,
  subscribeGallery,
  fetchOrderById,
  getDashboardStats: fetchDashboardStats,
  seedFromLocalStorage,
  sendMessage,
  subscribeMessages,
  markMessagesAsRead,
  markOrderAsSeen,
};
