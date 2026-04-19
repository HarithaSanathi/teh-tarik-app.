import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import ChatWindow from '../components/ChatWindow'
import { markMessagesAsRead } from '../admin/services/dataService'
import { Plus, CheckCircle, Clock, Package, Truck, ReceiptText, ArrowLeft, MessageCircle, FileCheck, Paperclip, RefreshCw, Loader } from 'lucide-react'

export default function OrderTracking() {
  const { orderId: id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !id) return;
    setUploading(true);
    try {
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
      const fileRef = storageRef(storage, `proofs/${id}_${Date.now()}.webp`);
      await uploadBytes(fileRef, blob, { contentType: 'image/webp' });
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, 'orders', id), { payment_screenshot: url });
      
      // Step 5 Final Fix: Sync safe boolean (No URL exposure)
      try {
        await updateDoc(doc(db, 'public_tracking', id), { paymentProofSubmitted: true });
      } catch (e) {}

      alert('Proof of payment submitted!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { id: 'pending', label: 'Order Placed', desc: 'We have received your order', icon: <Plus size={20} /> },
    { id: 'confirmed', label: 'Confirmed', desc: 'Kitchen has accepted your order', icon: <CheckCircle size={20} /> },
    { id: 'preparing', label: 'Preparing', desc: 'Our chefs are grilling your kebabs', icon: <Clock size={20} /> },
    { id: 'ready', label: 'Food Ready', desc: 'Order is packed and ready', icon: <Package size={20} /> },
    { id: 'delivering', label: 'Out for Delivery', desc: 'Driver is on the way', icon: <Truck size={20} /> },
    { id: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!', icon: <CheckCircle size={20} /> }
  ]

  const getActiveStep = (status) => {
    if (!status) return 0;
    const idx = steps.findIndex(s => s.id === status.toLowerCase())
    return idx === -1 ? 0 : idx
  }

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    // Step 5 Secure Fix: Real-time listener from safe PUBLIC_TRACKING collection
    const unsub = onSnapshot(doc(db, 'public_tracking', id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
        setError(false);
      } else {
        // Fallback or error if not found in public collection
        setError(true);
      }
      setLoading(false);
    }, (err) => {
      console.error('Tracking Error:', err);
      setError(true);
      setLoading(false);
    });

    return () => unsub();
  }, [id])

  const openChat = () => {
    setShowChat(true);
    markMessagesAsRead(id, 'customer', tokenFromUrl);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '20px', background: '#f8fafc' }}>
        <Loader size={48} className="spin" color="var(--gold)" />
        <h2 style={{ fontWeight: 800, color: 'var(--green-dark)' }}>Connecting to Kitchen...</h2>
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '24px', textAlign: 'center', padding: '20px' }}>
        <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptText size={40} color="#ef4444" />
        </div>
        <div>
            <h2 style={{ fontSize: '28px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '12px' }}>Order Not Found</h2>
            <p style={{ color: '#64748b', maxWidth: '400px' }}>We couldn't find an order with ID: <strong>{id}</strong>. Please check your order history or link.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="btn btn-gold" style={{ padding: '16px 32px', borderRadius: '16px' }}>View My Orders</button>
      </div>
    )
  }

  const activeStep = getActiveStep(order.status || order.stage || 'pending')
  const orderType = order.mode || 'delivery'

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', position: 'relative' }}>
      
      {/* Chat Modal */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', height: '80vh' }}>
            <ChatWindow 
              orderId={id} 
              role="customer" 
              senderId={id}
              token={tokenFromUrl}
              onClose={() => setShowChat(false)} 
            />
          </div>
        </div>
      )}

      {/* Premium Header */}
      <div style={{ background: 'var(--green-dark)', padding: '60px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=1800)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', padding: '8px 16px', borderRadius: '12px' }}>
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
             <div>
                <h1 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: '8px' }}>Your Order Status</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 600 }}>ID: <span style={{ color: 'white' }}>#{order.id?.slice(-8)}</span> · {(order.items || []).length} Items</p>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px 40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 950, fontSize: '32px', lineHeight: 1 }}>{steps[activeStep]?.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 800, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</div>
             </div>
          </div>
           {order.paymentProofSubmitted && (
             <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, marginTop: '16px', alignSelf: 'flex-start' }}>
                <FileCheck size={16} /> Payment proof submitted
             </div>
           )}
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        {/* Progress Tracker Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div style={{ background: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ position: 'relative' }}>
                 {/* Main Line */}
                 <div style={{ position: 'absolute', left: '26px', top: '24px', bottom: '24px', width: '4px', background: '#f1f5f9', zIndex: 0 }} />
                 {/* Progress Overlay */}
                 <div style={{ 
                    position: 'absolute', left: '26px', top: '24px', 
                    height: `${(activeStep / (steps.length - 1)) * 100}%`, 
                    width: '4px', background: 'var(--green-mid)', zIndex: 1,
                    transition: 'all 1s ease-in-out'
                 }} />

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', zIndex: 2 }}>
                    {steps.map((step, i) => {
                      const isCompleted = i < activeStep
                      const isActive = i === activeStep
                      return (
                        <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                           <div style={{
                             width: '56px', height: '56px', borderRadius: '18px',
                             background: isCompleted ? 'var(--green-mid)' : isActive ? 'var(--gold)' : 'white',
                             border: `3px solid ${isCompleted ? 'var(--green-mid)' : isActive ? 'var(--gold)' : '#e2e8f0'}`,
                             color: isCompleted || isActive ? 'white' : '#94a3b8',
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             transition: 'all 0.3s'
                           }}>
                             {isCompleted ? <CheckCircle size={24} /> : step.icon}
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 900, fontSize: '18px', color: isCompleted || isActive ? '#0f172a' : '#94a3b8' }}>{step.label}</div>
                              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{step.desc}</div>
                           </div>
                           {isActive && (
                             <div style={{ background: 'var(--gold-tint)', color: 'var(--gold)', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900 }}>LIVE</div>
                           )}
                        </div>
                      )
                    })}
                 </div>
              </div>
           </div>

           {/* Map Embed or Placeholder */}
           <div style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', height: '340px', border: '1px solid #e2e8f0', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200)', backgroundSize: 'cover', opacity: 0.6 }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center' }}>
                 <div style={{ background: 'white', padding: '16px 24px', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'inline-flex', alignItems: 'center', gap: '12px', fontWeight: 900 }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--green-mid)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    GPS Tracking Active
                 </div>
              </div>
           </div>
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {/* Order Summary */}
           <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--cream)', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <ReceiptText size={22} color="var(--green-mid)" />
                 <h3 style={{ fontSize: '18px', fontWeight: 950, color: 'var(--green-dark)' }}>Order Summary</h3>
              </div>
              <div style={{ padding: '32px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {(order.items || []).map((item, idx) => (
                       <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                             <span style={{ fontWeight: 900, fontSize: '14px', background: 'var(--cream)', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.qty}</span>
                             <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{item.name}</span>
                          </div>
                          <span style={{ fontWeight: 950, fontSize: '15px' }}>${((item.price || 0) * (item.qty || 0)).toFixed(2)}</span>
                       </div>
                    ))}
                 </div>
                 <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#64748b' }}>Total Paid</span>
                    <span style={{ fontWeight: 950, fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '-1px' }}>${order.total}</span>
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!order.paymentProofSubmitted && (
                <label style={{ 
                  width: '100%', borderRadius: '20px', padding: '20px', background: '#f8fafc', 
                  color: 'var(--green-dark)', border: '2.5px dashed var(--border)', fontWeight: 950, 
                  fontSize: '16px', cursor: uploading ? 'wait' : 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '12px', boxSizing: 'border-box'
                }}>
                  {uploading ? <RefreshCw className="spin" size={20} /> : <Paperclip size={20} />}
                  {uploading ? 'Uploading Proof...' : 'Upload Payment Receipt'}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
              )}
              {tokenFromUrl && (
                <button 
                  onClick={openChat}
                  style={{ 
                    width: '100%', borderRadius: '20px', padding: '20px', background: 'var(--gold)', color: 'var(--green-dark)', border: 'none', fontWeight: 950, fontSize: '18px', boxShadow: '0 10px 25px rgba(212,175,55,0.2)', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' 
                  }}
                >
                  <MessageCircle size={22} />
                  Send Note to Kitchen
                  {order.unreadCustomer > 0 && (
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', border: '2px solid white', animation: 'bounce 1s infinite' }}>
                      {order.unreadCustomer} NEW
                    </div>
                  )}
                </button>
              )}
              <WhatsAppChatButton 
                message={`Hi STM Salam, I want to check my order status for order #${id}`} 
                type="button" 
                label="Check Status on WhatsApp" 
                style={{ width: '100%', borderRadius: '20px', padding: '20px', background: 'var(--green-dark)', color: 'white', border: 'none', fontWeight: 950, fontSize: '18px', boxShadow: '0 10px 25px rgba(1,50,32,0.15)' }} 
              />
              <button 
                onClick={() => navigate('/menu')}
                style={{ width: '100%', borderRadius: '20px', padding: '20px', background: 'white', color: 'var(--green-dark)', border: '2px solid var(--green-dark)', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
              >
                 <Plus size={20} /> Order More Food
              </button>
           </div>
        </div>
      </div>

      <style>{`
         @keyframes pulse {
           0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
           70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
           100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
         }
      `}</style>
    </div>
  )
}
