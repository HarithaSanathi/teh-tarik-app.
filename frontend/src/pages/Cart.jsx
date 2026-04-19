import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, Tag, ChevronRight, ShoppingBag, ArrowLeft, Info, ReceiptText, MessageSquare, User, Smartphone, X } from 'lucide-react'
import { menuItems, shopInfo, promos } from '../data/menuData'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppChatButton from '../components/WhatsAppChatButton'

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, subtotal, totalItems, clearCart } = useCart()
  const { user, isGuest } = useAuth()
  const [promoCode, setPromoCode] = useState('')
  const [activePromo, setActivePromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [showGuestModal, setShowGuestModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const lastOrderId = localStorage.getItem('stm_last_order_id');
    if (lastOrderId && cartItems.length === 0) {
      console.log('Redirecting to existing order tracking from Cart:', lastOrderId);
      navigate(`/tracking/${lastOrderId}`, { replace: true });
    }
  }, [cartItems.length, navigate]);

  const handleApplyPromo = () => {
    const found = promos.find(p => p.code === promoCode)
    if (found) {
      setActivePromo(found)
      setPromoError('')
    } else {
      setPromoError('Invalid promo code')
      setActivePromo(null)
    }
  }

  const deliveryFee = subtotal >= 30 ? 0 : shopInfo.deliveryFee
  const discount = activePromo ? (activePromo.code === 'SALAM10' ? subtotal * 0.10 : 0) : 0
  const taxRate = 0.09 // 9% GST
  const taxableAmount = subtotal - discount
  const tax = taxableAmount * taxRate
  const total = taxableAmount + tax + deliveryFee

  const handleProceed = () => {
    if (total < 10) {
      alert('Minimum order is SGD 10. Please add more items to your cart.');
      return;
    }
    if (user) navigate('/checkout')
    else setShowGuestModal(true)
  }

  const handleWhatsAppOrder = (isDirectGuest = false) => {
    const itemsList = cartItems.map(item => `* ${item.name} x${item.qty}`).join('\n');
    
    const message = `*New STM Order*\n` +
      `Order ID: TBD (Guest Request)\n` +
      `Customer: Guest Customer\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Total: SGD ${total.toFixed(2)}*\n\n` +
      `Hello STM Salam, I would like to place this order via WhatsApp. Please advise on delivery timing and payment.`;
    
    const whatsappUrl = `https://wa.me/${(shopInfo?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    clearCart()
    navigate('/')
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ background: 'var(--bg-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
         <div style={{ background: 'white', padding: '60px 40px', borderRadius: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', maxWidth: '440px', width: '100%' }}>
            <div style={{ width: '120px', height: '120px', background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
               <ShoppingBag size={56} color="var(--text-light)" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-dark)', marginBottom: '12px' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px' }}>Looks like you haven't added anything to your cart yet. Browse our menu to find something delicious!</p>
            <Link to="/menu" className="btn btn-gold" style={{ width: '100%', padding: '18px', borderRadius: '18px', justifyContent: 'center' }}>
               Start Ordering <ChevronRight size={20} />
            </Link>
         </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: 'var(--green-dark)', padding: '60px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=1800)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', textDecoration: 'none', fontWeight: 800, fontSize: '14px', marginBottom: '24px' }}>
            <ArrowLeft size={16} /> Back to Menu
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', marginBottom: '8px' }}>Your Cart</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px' }}>You have {totalItems} signature items selected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '18px', overflow: 'hidden', flexShrink: 0 }}>
                <img loading="lazy" src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3 style={{ fontWeight: 900, fontSize: '18px', color: 'var(--text-dark)' }}>{item.name}</h3>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.4 }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--cream)', borderRadius: '12px', padding: '6px 12px' }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-mid)', display: 'flex' }}><Minus size={16} /></button>
                    <span style={{ fontWeight: 900, fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-mid)', display: 'flex' }}><Plus size={16} /></button>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--green-mid)' }}>${(item.price * item.qty).toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
          <Link to="/menu" style={{ color: 'var(--green-mid)', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textAlign: 'center', padding: '20px', border: '2px dashed var(--border)', borderRadius: '20px' }}>
            + Add more delicious items
          </Link>
        </div>

        {/* Right Column: Summary */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ background: 'var(--green-dark)', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
              <ReceiptText size={24} color="var(--gold)" />
              <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Payment Summary</h3>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Subtotal</span>
                    <span style={{ fontWeight: 800 }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Tax (GST 9%)</span>
                    <span style={{ fontWeight: 800 }}>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Delivery Fee</span>
                    <span style={{ fontWeight: 800, color: deliveryFee === 0 ? 'var(--success)' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                  <div style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase' }}>Grand Total</div>
                  <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--green-dark)', lineHeight: 1 }}>${total.toFixed(2)}</div>
              </div>

              <button 
                onClick={handleProceed} 
                className="btn btn-gold" 
                disabled={total < 10}
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  fontSize: '18px', 
                  borderRadius: '18px', 
                  justifyContent: 'center', 
                  boxShadow: total < 10 ? 'none' : 'var(--shadow-gold)',
                  background: total < 10 ? '#cbd5e1' : 'var(--gold)',
                  cursor: total < 10 ? 'not-allowed' : 'pointer'
                }}>
                {total < 10 ? 'Minimum Order SGD 10' : 'Proceed to Checkout'} <ChevronRight size={20} />
              </button>

              {total < 10 && (
                <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 800, textAlign: 'center', marginTop: '12px' }}>
                  Please add SGD ${(10 - total).toFixed(2)} more to reach the minimum order.
                </p>
              )}

              <WhatsAppChatButton 
                message="Hi STM Salam, I need help with my cart." 
                type="button" 
                label="Help with Order?" 
                style={{ width: '100%', marginTop: '16px', padding: '16px', fontSize: '15px', borderRadius: '16px', background: 'var(--cream)', color: 'var(--green-dark)', boxShadow: 'none' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* SELECTION MODAL FOR GUESTS */}
      <AnimatePresence>
        {showGuestModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGuestModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(1,50,32,0.6)', backdropFilter: 'blur(8px)' }} />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} style={{ position: 'relative', background: 'white', maxWidth: '480px', width: '100%', borderRadius: '40px', padding: '48px 40px', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', textAlign: 'center' }}>
                <button onClick={() => setShowGuestModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--cream)', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
                
                <div style={{ width: '80px', height: '80px', background: 'var(--gold-tint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                   <ShoppingBag size={40} color="var(--gold)" />
                </div>
                
                <h2 style={{ fontSize: '28px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '12px', letterSpacing: '-1px' }}>Quick Checkout</h2>
                <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 600, marginBottom: '40px', lineHeight: 1.6 }}>How would you like to place your <span style={{ color: 'var(--green-dark)', fontWeight: 800 }}>$${total.toFixed(2)}</span> order today?</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <button onClick={() => navigate('/login?redirect=/checkout')} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', background: 'var(--green-dark)', color: 'white', borderRadius: '24px', border: 'none', cursor: 'pointer', textAlign: 'left', boxShadow: '0 10px 30px rgba(1,50,32,0.2)' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 900, fontSize: '16px' }}>Quick Sign-In</div>
                         <div style={{ fontSize: '12px', opacity: 0.6, fontWeight: 700 }}>Earn Loyalty Points + Faster Tracking</div>
                      </div>
                      <ChevronRight size={20} opacity={0.5} />
                   </button>
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
                      <div style={{ flex: 1, height: '1.5px', background: '#eef2f6' }} />
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>or order direct</span>
                      <div style={{ flex: 1, height: '1.5px', background: '#eef2f6' }} />
                   </div>
                   
                   <button onClick={handleWhatsAppOrder} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', background: 'white', color: 'var(--green-dark)', borderRadius: '24px', border: '2.5px solid #eef2f6', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={24} color="#16a34a" /></div>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: 900, fontSize: '16px' }}>Order via WhatsApp</div>
                         <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>No Account Needed. Chat to Confirm.</div>
                      </div>
                      <ChevronRight size={20} color="#94a3b8" />
                   </button>
                </div>
                
                <p style={{ marginTop: '32px', fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                   Secure 256-bit order system
                </p>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
