import { db } from '../../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

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
// Run the connection test when the app initializes this service
testConnection();

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
  const id = categoryObj.id || `cat-${Date.now()}`;
  await setDoc(doc(db, 'categories', id), { ...categoryObj, id });
  return categoryObj;
};
export const updateCategory = (id, updatedCat) => updateDoc(doc(db, 'categories', id), updatedCat);
export const deleteCategory = (id) => deleteDoc(doc(db, 'categories', id));

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
  const id = product.id || `prod-${Date.now()}`;
  await setDoc(doc(db, 'products', id), { ...product, id });
  return product;
};
export const updateProduct = (id, updatedProduct) => updateDoc(doc(db, 'products', id), updatedProduct);
export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const placeOrder = async (orderPayload) => {
  try {
    const orderId = `STM-${Date.now()}`;
    const newOrder = { ...orderPayload, id: orderId, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'orders', orderId), newOrder);
    localStorage.setItem('stm_last_order_id', orderId);
    return newOrder;
  } catch (err) {
    console.error('Failed to place order:', err);
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

export const updateOrderStatus = (id, status) => updateDoc(doc(db, 'orders', id), { status, order_status: status.toLowerCase(), updatedAt: new Date().toISOString() });
export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

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

// Trigger a custom event when data updates to easily notify React components
const notifyDataUpdated = () => window.dispatchEvent(new Event('stm_data_updated'));

subscribeCategories(cats => { _cachedCategories = cats; notifyDataUpdated(); });
subscribeProducts(prods => { _cachedProducts = prods; notifyDataUpdated(); });
subscribeOrders(ords => { _cachedOrders = ords; });

export const dataService = {
  getCategories: () => [..._cachedCategories],
  getProducts: ()   => [..._cachedProducts],
  getProductsByCategory: (catId) => _cachedProducts.filter(p => p.categoryId === catId),
  getOrders: ()     => [..._cachedOrders],

  addCategory,
  updateCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct,
  placeOrder,
  updateOrderStatus,
  deleteOrder,

  subscribeCategories,
  subscribeProducts,
  subscribeOrders,
  fetchOrderById,
  getDashboardStats: fetchDashboardStats,
};
