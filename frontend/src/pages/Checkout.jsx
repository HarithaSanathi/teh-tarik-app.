import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Banknote, Wallet, Phone, Home, Bike, ShieldCheck, ChevronDown, Check, User, Mail, MessageSquare, ArrowLeft, ReceiptText, Lock, QrCode, ArrowRight } from 'lucide-react'
import { shopInfo } from '../data/menuData'
import { useCart } from '../context/CartContext'
import { API_URL } from '../config/api'
import { placeOrder } from '../admin/services/dataService'

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, subtotal, clearCart } = useCart()
  const [mode, setMode] = useState('delivery')
  const [payment, setPayment] = useState('card')
  const [formData, setFormData] = useState({
    name: 'Ahmad Faiz',
    phone: '+65 9123 4567',
    email: 'faiz@example.com',
    address: 'Blk 50A Marine Terrace, #01-303, Singapore 441050',
    notes: '',
  })
  const [paymentStatus, setPaymentStatus] = useState('idle') // 'idle' | 'awaiting' | 'verifying' | 'success'
  const [orderDetails, setOrderDetails] = useState(null)
  const [processing, setProcessing] = useState(false)

  const deliveryFee = mode === 'delivery' ? (subtotal >= 30 ? 0 : shopInfo.deliveryFee) : 0
  const taxRate = 0.09 // 9% GST
  const tax = subtotal * taxRate
  const total = subtotal + tax + deliveryFee

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const verifyPayment = async () => {
    setPaymentStatus('verifying')
    
    // Simulate Status API Check (3 seconds)
    setTimeout(async () => {
      setPaymentStatus('success')
      await finalizeOrder(true) // Finalize and Confirm
    }, 3000)
  }

  const handlePlaceOrder = async () => {
    setProcessing(true)
    try {
      // Create order first to get an ID
      const newOrder = await placeOrder({
          customer: formData,
          items: cartItems,
          total: total.toFixed(2),
          mode,
          payment,
          notes: formData.notes,
          payment_status: payment === 'cash' ? 'pending' : (payment === 'paynow' ? 'awaiting_screenshot' : 'paid'),
          stage: 'kitchen_preparation'
      });

      setOrderDetails(newOrder)
      
      if (payment === 'paynow') {
        setPaymentStatus('awaiting')
      } else if (payment === 'card') {
        // HitPay / Card logic would go here
        setPaymentStatus('awaiting')
      } else {
        // Cash order - proceed to success
        finalizeSuccess(newOrder)
      }
    } catch (err) {
      alert('Failed to process order.')
    } finally {
      setProcessing(false)
    }
  }

  const handlePaidNotification = () => {
    const message = `Hello STM Salam, I have completed payment.\n\nOrder ID: ${orderDetails.id}\nName: ${formData.name}\nPhone: ${formData.phone}\nAmount: SGD ${total.toFixed(2)}\n\nI am attaching the payment screenshot here.`
    const whatsappUrl = `https://wa.me/${shopInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    finalizeSuccess(orderDetails)
  }

  const finalizeSuccess = (order) => {
    clearCart()
    localStorage.setItem('stm_last_order_id', order.id)
    navigate(`/tracking/${order.id}`)
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/menu')} className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Menu</button>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: 'var(--green-dark)', padding: '60px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=1800)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', cursor: 'pointer', fontWeight: 800, fontSize: '14px', marginBottom: '24px' }}>
            <ArrowLeft size={16} /> Return to Cart
          </button>
          <div>
            <h1 style={{ color: 'white', fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', marginBottom: '8px' }}>Finalize Order</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px' }}>Review your details and confirm your order</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* MODE SELECTOR */}
          <section style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--gold-tint)', color: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
              Choose Fulfillment
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { id: 'delivery', icon: <Bike size={24} />, title: 'Doorstep Delivery', sub: 'To your location' },
                { id: 'pickup', icon: <Home size={24} />, title: 'Self-Pickup', sub: 'Collect from shop' }
              ].map(m => (
                <div key={m.id} onClick={() => setMode(m.id)} style={{
                  border: `2.5px solid ${mode === m.id ? 'var(--green-mid)' : 'var(--border)'}`,
                  borderRadius: '20px', padding: '24px', cursor: 'pointer',
                  background: mode === m.id ? 'var(--green-tint)' : 'white',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}>
                  <div style={{ color: mode === m.id ? 'var(--green-mid)' : 'var(--text-light)', marginBottom: '16px' }}>{m.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: '18px', color: mode === m.id ? 'var(--green-mid)' : 'var(--text-dark)' }}>{m.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 600 }}>{m.sub}</div>
                  {mode === m.id && <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--green-mid)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} /></div>}
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT INFO */}
          <section style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--gold-tint)', color: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              Contact Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
               <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', fontWeight: 700 }} />
               <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', fontWeight: 700 }} />
            </div>
            {mode === 'delivery' && (
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Delivery Address" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', fontWeight: 700, width: '100%', minHeight: '80px', marginBottom: '20px' }} />
            )}
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Order Notes (Optional)" style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', fontWeight: 700, width: '100%', minHeight: '80px' }} />
          </section>

          {/* PAYMENT OPTIONS */}
          <section style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--gold-tint)', color: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
              Payment Method
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {[
                 { id: 'paynow', icon: <QrCode size={22} />, title: 'Scan Pay (SGQR)', sub: 'Pay via any Banking App / PayLah' },
                 { id: 'cash', icon: <Banknote size={22} />, title: 'Cash on Hand', sub: mode === 'delivery' ? 'Pay rider upon delivery' : 'Pay at the counter' }
               ].map(p => (
                 <div key={p.id} onClick={() => setPayment(p.id)} style={{
                   display: 'grid', gridTemplateColumns: '48px 1fr 24px', alignItems: 'center',
                   border: `1.5px solid ${payment === p.id ? 'var(--green-mid)' : 'var(--border)'}`,
                   background: payment === p.id ? 'var(--green-tint)' : 'white',
                   borderRadius: '20px', padding: '18px 20px', cursor: 'pointer', transition: '0.2s'
                 }}>
                   <div style={{ color: payment === p.id ? 'var(--green-mid)' : 'var(--text-light)' }}>{p.icon}</div>
                   <div>
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>{p.sub}</div>
                   </div>
                   <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${payment === p.id ? 'var(--green-mid)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {payment === p.id && <div style={{ width: '10px', height: '10px', background: 'var(--green-mid)', borderRadius: '50%' }} />}
                   </div>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div style={{ background: 'white', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '32px' }}>
               <h3 style={{ fontSize: '19px', fontWeight: 900, marginBottom: '24px' }}>Order Summary</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                  {cartItems.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                      <span>{i.qty}x {i.name}</span>
                      <span>${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  ))}
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)' }}><span>Delivery Fee</span><span>${deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900, color: 'var(--green-dark)', marginTop: '8px' }}><span>Total</span><span>${total.toFixed(2)}</span></div>
               </div>
               <button onClick={handlePlaceOrder} disabled={processing} className="btn btn-gold" style={{ width: '100%', padding: '18px', fontSize: '16px', borderRadius: '16px', justifyContent: 'center' }}>
                 {processing ? 'Processing...' : 'Place Order'}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ SCAN PAY MODAL ══════════ */}
      <AnimatePresence>
        {paymentStatus === 'awaiting' && orderDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(1, 50, 32, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: 'white', borderRadius: '40px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center', position: 'relative' }}>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--gold-tint)', padding: '8px 16px', borderRadius: '100px', color: 'var(--gold)', fontWeight: 800, fontSize: '13px', marginBottom: '16px' }}>
                  <QrCode size={16} /> Scan to Pay
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '8px' }}>{shopInfo.name}</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '15px' }}>Please scan the QR code below using your banking app</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '2px dashed #e2e8f0', marginBottom: '24px' }}>
                <div style={{ width: '240px', height: '300px', background: 'white', margin: '0 auto', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  {/* CamScanner SGQR code */}
                  <object
                    data="/CamScanner.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                    type="application/pdf"
                    style={{ width: '240px', height: '300px', border: 'none' }}
                  >
                    <img src="/qr-payment.png" alt="SGQR Code" style={{ width: '200px', height: '200px', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=STMSalam_Payment'; }} />
                  </object>
                </div>
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Amount Due</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--green-dark)' }}>SGD {total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Order ID</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--gold)' }}>#{orderDetails.id}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={handlePaidNotification} className="btn btn-gold" style={{ width: '100%', padding: '20px', borderRadius: '18px', fontSize: '18px', justifyContent: 'center', boxShadow: '0 10px 25px rgba(201, 163, 68, 0.3)' }}>
                  I Have Paid
                </button>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>
                  Clicking "I Have Paid" will open WhatsApp to send your screenshot.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
