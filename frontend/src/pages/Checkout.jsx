import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPin, CreditCard, Banknote, Wallet, Phone, Home, Bike, 
  ShieldCheck, ChevronDown, Check, User, Mail, MessageSquare, 
  ArrowLeft, ReceiptText, Lock, QrCode, ArrowRight, PlayCircle, XCircle 
} from 'lucide-react'
import { shopInfo } from '../data/menuData';
import payScanner from '../assets/payscanner_real.png';
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../admin/services/dataService'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppChatButton from '../components/WhatsAppChatButton'
import { storage, db } from '../lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateDoc, doc } from 'firebase/firestore'
import { RefreshCw, Paperclip } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  
  // Defensive Context Access
  const cart = useCart() || {}
  const { cartItems = [], subtotal = 0, clearCart } = cart
  
  const auth = useAuth() || {}
  const { user, isGuest } = auth
  
  const [mode, setMode] = useState('delivery')
  const [payment, setPayment] = useState('paynow')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    notes: '',
  })

  const [orderDetails, setOrderDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Step 2 Requirement: Handle back navigation and order persistence
  useEffect(() => {
    const lastOrderId = localStorage.getItem('stm_last_order_id');
    // If we have a last order and the cart is empty, redirect to tracking instead of showing empty checkout
    if (lastOrderId && (!cartItems || cartItems.length === 0)) {
      console.log('Redirecting to existing order tracking:', lastOrderId);
      navigate(`/tracking/${lastOrderId}`, { replace: true });
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.address || prev.address
      }));
    }
  }, [user]);

  const safeSubtotal = Number(subtotal) || 0
  const deliveryFee = mode === 'delivery' ? (safeSubtotal >= 30 ? 0 : (shopInfo?.deliveryFee || 5)) : 0
  const taxRate = 0.09 
  const tax = safeSubtotal * taxRate
  const total = safeSubtotal + tax + deliveryFee

  const handleChange = (e) => {
    if (e?.target) {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  }

  const handlePlaceOrder = async () => {
    if (total < 10) {
      alert('Minimum order is SGD 10. Please add more items to your cart.');
      return;
    }

    if (!formData?.name || !formData?.phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    setProcessing(true)
    try {
      const newOrder = await placeOrder({
          customer: formData,
          items: cartItems || [],
          total: (total || 0).toFixed(2),
          mode,
          payment,
          notes: formData.notes || '',
          payment_status: payment === 'cash' ? 'Cash on Delivery' : 'Pending Verification',
          order_status: payment === 'cash' ? 'Pending' : 'Pending Payment Confirmation',
          stage: 'kitchen_preparation',
          userId: user?.id || 'anonymous'
      });

      setOrderDetails(newOrder)
      
      if (payment === 'paynow') {
        setShowPaymentModal(true)
      } else {
        finalizeSuccess(newOrder)
      }
    } catch (err) {
      console.error('Order Error:', err);
      alert('Failed to process order: ' + err.message);
    } finally {
      setProcessing(false)
    }
  }

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !orderDetails) return;
    setUploadingScreenshot(true);
    try {
      // Basic compression before upload
      const compressedDataURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.8));
          };
          img.src = re.target.result;
        };
        reader.readAsDataURL(file);
      });

      const blob = await (await fetch(compressedDataURL)).blob();
      const fileRef = storageRef(storage, `proofs/${orderDetails.id}_${Date.now()}.webp`);
      await uploadBytes(fileRef, blob, { contentType: 'image/webp' });
      const url = await getDownloadURL(fileRef);
      
      // Update order record
      await updateDoc(doc(db, 'orders', orderDetails.id), { payment_screenshot: url });
      
      // Step 5 Final Fix: Sync safe boolean to public tracking (No URL exposure)
      try {
        await updateDoc(doc(db, 'public_tracking', orderDetails.id), { paymentProofSubmitted: true });
      } catch (e) {}

      setScreenshotUrl(url);
      alert('Payment screenshot uploaded successfully!');
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handlePaidNotification = () => {
    if (!orderDetails) return;
    
    const itemsList = (cartItems || []).map(item => `* ${item.name} x${item.qty}`).join('\n');
    const addressLine = mode === 'delivery' ? `\nAddress: ${formData.address}` : '\nOption: Store Pickup';
    
    // Step 4 Requirement: Only add line if screenshot truly exists
    const screenshotLine = screenshotUrl ? `\n\nPayment screenshot uploaded. Please check order record.` : '';

    const message = `*New STM Order*\n` +
      `Order ID: ${orderDetails.id}\n` +
      `Customer: ${formData.name}\n` +
      `Phone: ${formData.phone}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Total: SGD ${(total || 0).toFixed(2)}*` +
      `${addressLine}` +
      screenshotLine;

    const waUrl = `https://wa.me/${(shopInfo?.whatsapp || '6591915766').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
    finalizeSuccess(orderDetails)
  }

  const finalizeSuccess = (order) => {
    if (clearCart) clearCart()
    if (order?.id) {
       localStorage.setItem('stm_last_order_id', order.id)
       // Use replace: true to prevent back navigation to the checkout form
       navigate(`/tracking/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`, { replace: true })
    } else {
       navigate('/', { replace: true })
    }
  }

  const [locating, setLocating] = useState(false)

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
            headers: { 'User-Agent': 'STM-Salam-Digital-Platform' }
          });
          const data = await res.json()
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          setFormData(prev => ({ ...prev, address }))
        } catch (err) {
          console.error('Geocoding error:', err)
          setFormData(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }))
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        alert('Unable to get your location. Please check browser permissions.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--green-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 800, color: '#64748b' }}>Preparing Checkout...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div style={{ maxWidth: '440px', background: 'white', padding: '48px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ReceiptText size={40} color="var(--gold)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '12px' }}>Your Cart is Empty</h2>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>Add some delicacies from our menu to start your order.</p>
          <button onClick={() => navigate('/menu')} style={{ width: '100%', padding: '18px', background: 'var(--green-dark)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            Start Ordering <ArrowRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: 'var(--green-dark)', padding: '60px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000)', backgroundSize: 'cover' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/cart')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', marginBottom: '24px' }}>
            <ArrowLeft size={16} /> Edit Order
          </button>
          <h1 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 950, letterSpacing: '-2px', marginBottom: '8px' }}>Finalize Order</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', fontWeight: 500 }}>{isGuest ? 'Guest Checkout (WhatsApp Confirmation)' : 'Secure Cloud Ordering'}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left: Info Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <section style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', background: 'var(--green-tint)', color: 'var(--green-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</div>
              Itemized Order
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>{item.qty}</div>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>{item.name}</span>
                  </div>

                  <span style={{ fontWeight: 950, color: 'var(--green-dark)' }}>${((item.price || 0) * (item.qty || 0)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', background: 'var(--green-tint)', color: 'var(--green-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</div>
              Order Type
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ id: 'delivery', icon: <Bike size={20} />, text: 'Delivery' }, { id: 'pickup', icon: <Home size={20} />, text: 'Pickup' }].map(opt => (
                <button key={opt.id} onClick={() => setMode(opt.id)} style={{ padding: '16px', borderRadius: '16px', border: `2.5px solid ${mode === opt.id ? 'var(--green-mid)' : '#f1f5f9'}`, background: mode === opt.id ? 'var(--green-tint)' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                  <span style={{ color: mode === opt.id ? 'var(--green-mid)' : '#64748b' }}>{opt.icon}</span>
                  <span style={{ fontWeight: 800, color: mode === opt.id ? 'var(--green-dark)' : '#64748b' }}>{opt.text}</span>
                </button>
              ))}
            </div>
          </section>

          <section style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', background: 'var(--green-tint)', color: 'var(--green-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>3</div>
              Delivery Details
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, boxSizing: 'border-box' }} />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, boxSizing: 'border-box' }} />
              {mode === 'delivery' && (
                <div style={{ position: 'relative' }}>
                  <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Exact Delivery Address" style={{ width: '100%', padding: '14px', paddingRight: '120px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, boxSizing: 'border-box', minHeight: '80px' }} />
                  <button onClick={handleDetectLocation} disabled={locating} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--green-dark)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {locating ? 'Locating...' : 'DETECT ME'}
                  </button>
                </div>
              )}
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any specific requests?" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, boxSizing: 'border-box', minHeight: '60px' }} />
            </div>
          </section>

          {!isGuest && (
            <section style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', background: 'var(--green-tint)', color: 'var(--green-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>4</div>
                Payment Method
              </h2>
              <div style={{ display: 'grid', gap: '10px' }}>
                {[{ id: 'paynow', icon: <QrCode size={18} />, title: 'PayNow SGQR' }, { id: 'cash', icon: <Banknote size={18} />, title: 'Cash' }].map(p => (
                  <button key={p.id} onClick={() => setPayment(p.id)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: `2.5px solid ${payment === p.id ? 'var(--green-mid)' : '#f1f5f9'}`, background: payment === p.id ? 'var(--green-tint)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                    <div style={{ color: payment === p.id ? 'var(--green-mid)' : '#64748b' }}>{p.icon}</div>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{p.title}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>Final Total</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 600 }}><span>Subtotal</span><span>${safeSubtotal.toFixed(2)}</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 600 }}><span>Fulfillment</span><span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: 600 }}><span>GST (9%)</span><span>${tax.toFixed(2)}</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 950, color: 'var(--green-dark)', marginTop: '4px' }}><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <button 
              onClick={handlePlaceOrder} 
              disabled={processing || total < 10} 
              style={{ 
                width: '100%', 
                padding: '20px', 
                background: (total < 10) ? '#cbd5e1' : 'var(--green-dark)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '16px', 
                fontWeight: 900, 
                cursor: (processing || total < 10) ? 'not-allowed' : 'pointer', 
                fontSize: '17px', 
                animation: total < 10 ? 'none' : 'pulse 2s infinite' 
              }}
            >
              {total < 10 ? 'Minimum Order SGD 10 Required' : (processing ? 'Processing...' : (isGuest ? 'Order via WhatsApp' : 'Confirm Order'))}
            </button>

            {total < 10 && (
              <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 800, textAlign: 'center', marginTop: '12px' }}>
                Your order total of ${total.toFixed(2)} is below the SGD 10 minimum.
              </p>
            )}
            
            <WhatsAppChatButton 
              message="Hi STM Salam, I want help with payment." 
              type="button" 
              label="Payment Help?" 
              style={{ width: '100%', marginTop: '16px', padding: '16px', fontSize: '15px', borderRadius: '16px', background: 'var(--gold-tint)', color: 'var(--green-dark)', boxShadow: 'none' }} 
            />

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#94a3b8' }}>
              <Lock size={14} /> <span style={{ fontSize: '12px', fontWeight: 700 }}>Secure End-to-End Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PayNow Scanner Modal ── */}
      <AnimatePresence>
        {showPaymentModal && orderDetails && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderTop: '6px solid var(--gold)', borderRadius: '32px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 950, marginBottom: '8px' }}>Scan & Pay</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Scan this code to make payment</p>
              <img loading="lazy" src={payScanner} alt="Scanner" style={{ width: '200px', maxWidth: '100%', borderRadius: '12px', marginBottom: '16px' }} />
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                  padding: '12px', background: screenshotUrl ? '#f0fdf4' : '#f8fafc', 
                  border: screenshotUrl ? '2px solid #16a34a' : '2px dashed #cbd5e1',
                  borderRadius: '12px', cursor: 'pointer', transition: '0.2s'
                }}>
                  {uploadingScreenshot ? <RefreshCw className="animate-spin" size={18} /> : (screenshotUrl ? <CheckCircle size={18} color="#16a34a" /> : <Paperclip size={18} color="#64748b" />)}
                  <span style={{ fontWeight: 800, fontSize: '13px', color: screenshotUrl ? '#166534' : '#64748b' }}>
                    {uploadingScreenshot ? 'Uploading...' : (screenshotUrl ? 'Screenshot Attached' : 'Tap to Upload Receipt')}
                  </span>
                  <input type="file" accept="image/*" onChange={handleScreenshotUpload} style={{ display: 'none' }} disabled={uploadingScreenshot} />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button onClick={() => {
                  const itemsList = (cartItems || []).map(item => `* ${item.name} x${item.qty}`).join('\n');
                  const addressLine = mode === 'delivery' ? `\nAddress: ${formData.address}` : '\nOption: Store Pickup';
                  const message = `*New STM Order*\nOrder ID: ${orderDetails.id}\nCustomer: ${formData.name}\nPhone: ${formData.phone}\n\n*Items:*\n${itemsList}\n\n*Total: SGD ${(total || 0).toFixed(2)}*${addressLine}`;
                  const waUrl = `https://wa.me/${(shopInfo?.whatsapp || '6591915766').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(waUrl, '_blank');
                }} style={{ flex: 1, padding: '12px', background: 'var(--green-mid)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>Share on WhatsApp</button>
                <button onClick={() => { finalizeSuccess(orderDetails); }} style={{ flex: 1, padding: '12px', background: 'var(--green-dark)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>I Have Completed Payment</button>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ marginTop: '8px', padding: '8px', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}>Back</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
