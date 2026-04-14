import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Star, Clock, ChevronRight, Flame, Tag, Truck, ShieldCheck,
  Search, MapPin, ShoppingBag, Utensils, Heart, Timer,
  ArrowRight, Phone, Mail, Instagram, Facebook, Twitter, Play, Smartphone,
  Download, CheckCircle, ChevronLeft, QrCode, Apple, User, Bell, Filter,
  Zap, CloudRain, Activity, Award, Repeat, Bookmark, Mic, Leaf, Target, Info,
  MessageCircle, CreditCard, ScanLine, ExternalLink, Wifi, Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { shopInfo, outlets } from '../data/menuData'
import { API_URL } from '../config/api'
import { dataService } from '../admin/services/dataService'
import { useCart } from '../context/CartContext'
import { Plus, Minus, Image as ImageIcon, PlayCircle } from 'lucide-react'
import { galleryMedia } from '../data/galleryData'

/* ── tiny floating food component ── */
function FloatingFood({ emoji, delay, left, size }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 15, -10] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', left, fontSize: size || '40px', opacity: 0.15, zIndex: 0, pointerEvents: 'none', top: `${20 + delay * 15}%` }}
    >{emoji}</motion.div>
  )
}

/* ── favorite item card component ── */
function FavoriteItemCard({ item, idx, inCart, addToCart, navigate }) {
  const [isJustAdded, setIsJustAdded] = useState(false);
  
  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(item);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 2000);
  };

  const badges = ["Popular", "Best Seller", "Hot Pick", "Recommended"];
  const badge = badges[idx % badges.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -10 }}
      style={{ 
        background: 'white', 
        borderRadius: '32px', 
        overflow: 'hidden', 
        border: '1px solid #eef2f6', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden', background: '#f8fafc' }} onClick={() => navigate('/menu')}>
        <img 
          src={item.image || 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=400'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
          alt={item.name} 
        />
        <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'var(--gold)', color: 'var(--green-dark)', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}>
          {badge}
        </div>
      </div>
      
      <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green-dark)', lineHeight: 1.2 }}>{item.name}</h3>
          <span style={{ fontSize: '22px', fontWeight: 950, color: 'var(--green-mid)' }}>${parseFloat(item.price).toFixed(2)}</span>
        </div>
        
        <p style={{ color: 'var(--text-light)', fontSize: '15px', fontWeight: 500, lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
          {item.description || 'Authentic taste prepared fresh daily with the finest ingredients.'}
        </p>
        
        <button 
          onClick={handleAdd}
          style={{ 
            width: '100%',
            border: 'none', 
            background: isJustAdded ? '#22c55e' : 'var(--green-dark)', 
            color: 'white', 
            fontWeight: 800, 
            fontSize: '16px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '10px', 
            padding: '16px', 
            borderRadius: '18px', 
            boxShadow: isJustAdded ? '0 10px 20px rgba(34,197,94,0.3)' : '0 10px 20px rgba(1,50,32,0.15)',
            transition: 'all 0.3s ease'
          }}
        >
          {isJustAdded ? (
            <><CheckCircle size={20} /> Added!</>
          ) : inCart ? (
            <><ShoppingBag size={20} /> Add More</>
          ) : (
            <><Plus size={20} /> Add to Tray</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0)
  const heroImages = [
    '/aboutusimage/tehtarik_premium.png', 
    '/aboutusimage/burger_bg.png', 
    '/aboutusimage/juice_bg.png', 
    '/aboutusimage/tea_snacks_bg.png'
  ]
  const { cartItems, addToCart, updateQty } = useCart()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [weatherAlert, setWeatherAlert] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [dynamicProducts, setDynamicProducts] = useState([])

  useEffect(() => {
    const fetchData = () => {
      setDynamicProducts(dataService.getProducts().filter(p => p.active))
    };
    
    fetchData();
    window.addEventListener('storage', fetchData);
    window.addEventListener('stm_data_updated', fetchData);
    
    return () => {
      window.removeEventListener('storage', fetchData);
      window.removeEventListener('stm_data_updated', fetchData);
    }
  }, [])


  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 8000)
    return () => clearInterval(timer)
  }, [])


  const scroll = (d) => {
    if (scrollRef.current) {
      const s = scrollRef.current.scrollLeft
      scrollRef.current.scrollTo({ left: d === 'left' ? s - 320 : s + 320, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', position: 'relative', overflow: 'hidden' }}>
      
      {/* ══════════ SHOP HIGHLIGHTS (Premium Style) ══════════ */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ 
          background: 'linear-gradient(to right, #ffffff, #f8fafc, #ffffff)', 
          borderBottom: '1px solid #f1f5f9', 
          padding: '14px 0', 
          zIndex: 1001,
          position: 'relative'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
           {[
             { emoji: "❤️", text: "Made Fresh Daily", color: "#fecaca" },
             { emoji: "👨‍🍳", text: "Prepared with Care", color: "#d1fae5" },
             { emoji: "📍", text: "Marine Terrace Favorite Spot", color: "#e0f2fe" }
           ].map((item, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.2, duration: 0.8, ease: "easeOut" }}
               whileHover={{ y: -2, background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
               style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '10px', 
                 padding: '8px 20px', 
                 borderRadius: '100px', 
                 background: 'rgba(255,255,255,0.6)', 
                 border: '1px solid #f1f5f9',
                 transition: 'all 0.3s ease',
                 cursor: 'default'
               }}
             >
               <span style={{ 
                 fontSize: '18px', 
                 background: item.color, 
                 width: '32px', 
                 height: '32px', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 borderRadius: '50%' 
               }}>
                 {item.emoji}
               </span>
               <span style={{ 
                 fontSize: '14px', 
                 fontWeight: 800, 
                 color: 'var(--green-dark)', 
                 letterSpacing: '-0.2px' 
               }}>
                 {item.text}
               </span>
             </motion.div>
           ))}
        </div>
      </motion.div>

      {/* ══════════ SMART HEADER BAR ══════════ */}
      <div style={{ background: 'white', borderBottom: '1px solid #eef2f6', padding: '16px 0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div className="container smart-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="header-address-pill" style={{ background: 'var(--cream)', padding: '10px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <MapPin size={18} color="var(--green-mid)" />
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)' }}>Blk 55 Marine Terrace, #01-303</span>
              <ChevronRight size={14} color="var(--text-light)" />
            </div>
          </div>
          <div className="smart-header-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={22} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'var(--danger, #ef4444)', borderRadius: '50%', border: '2px solid white' }} />
            </button>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} color="var(--green-dark)" />
              </div>
            </Link>
          </div>
        </div>
      </div>


      {/* ══════════ ACTIVE ORDER TRACKER ══════════ */}
      <ActiveOrderTracker />

      {/* ══════════ HERO SECTION ══════════ */}
      <section style={{ position: 'relative', height: '85vh', minHeight: '600px', overflow: 'hidden', background: 'var(--green-dark)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0.1 }}
            transition={{ duration: 1.5 }}
            style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroImages[heroIdx]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        </AnimatePresence>

        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '2px', background: 'var(--gold)' }} />
              <span style={{ color: 'var(--gold)', fontWeight: 800, letterSpacing: '3px', fontSize: '14px', textTransform: 'uppercase' }}>EST. 1988 · Singapore</span>
            </div>
            <h1 style={{ color: 'white', fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-1.5px', marginBottom: '28px' }}>
              Authentic Drinks and Warm Comfort Food <span style={{ color: 'var(--gold)', letterSpacing: '-0.5px' }}>Delivered Fresh</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(16px, 2vw, 19px)', fontWeight: 500, maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
              Enjoy signature Teh Tarik, comforting hot beverages, crispy snacks, and satisfying meals — prepared fresh and delivered with care.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-gold" style={{ padding: '18px 40px', borderRadius: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={20} color="var(--green-dark)" /> Order Now
              </Link>
              <Link to="/menu" className="btn" style={{ padding: '18px 40px', borderRadius: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                View Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ SCANPAY QR MODAL (Full Payment Flow) ══════════ */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQR(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(1, 50, 32, 0.92)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
            <motion.div initial={{ scale: 0.85, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '40px', padding: '36px 32px', textAlign: 'center', maxWidth: '440px', width: '100%', position: 'relative', overflow: 'hidden', margin: 'auto 0' }}>
              
              {/* Close button */}
              <button onClick={() => setShowQR(false)} style={{ position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '18px', fontWeight: 700, transition: 'all 0.2s' }}>✕</button>

              {/* Step Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                {['Scan QR', 'Pay', 'Confirm'].map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'var(--green-mid)' : '#e2e8f0', color: i === 0 ? 'white' : 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>{i + 1}</div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: i === 0 ? 'var(--green-dark)' : 'var(--text-light)' }}>{step}</span>
                    </div>
                    {i < 2 && <div style={{ width: '20px', height: '2px', background: '#e2e8f0', borderRadius: '1px' }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Header */}
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--green-tint), rgba(5,150,105,0.1))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <ScanLine size={32} color="var(--green-mid)" />
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '8px', letterSpacing: '-0.5px' }}>ScanPay — QR PayNow</h3>
              <p style={{ color: 'var(--text-light)', fontWeight: 600, marginBottom: '28px', fontSize: '15px', lineHeight: 1.5 }}>
                Scan the QR to complete payment.<br />
                <span style={{ color: 'var(--green-mid)', fontWeight: 700 }}>After payment, tap "I Have Paid"</span> and send your screenshot on WhatsApp.
              </p>

              {/* QR Code Image */}
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '28px', border: '2px solid #e2e8f0', marginBottom: '24px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green-mid)', color: 'white', padding: '4px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>SGQR PayNow</div>
                <div style={{ width: '240px', height: '300px', background: 'white', margin: '12px auto 0', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <object
                    data="/CamScanner.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
                    type="application/pdf"
                    style={{ width: '240px', height: '300px', border: 'none' }}
                  >
                    {/* Fallback if browser can't render PDF inline */}
                    <img 
                      src="/qr-payment.png" 
                      alt="SGQR PayNow Code" 
                      style={{ width: '200px', height: '200px', objectFit: 'contain' }} 
                      onError={(e) => { e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PayNow_STMSalam'; }}
                    />
                  </object>
                </div>
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-light)', fontWeight: 700 }}>
                  PayNow: <span style={{ color: 'var(--green-dark)', fontWeight: 900 }}>{shopInfo.phone}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                {[
                  { icon: <ShieldCheck size={14} />, text: 'Verified' },
                  { icon: <ScanLine size={14} />, text: 'SGQR' },
                  { icon: <Shield size={14} />, text: 'Secure' }
                ].map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', padding: '5px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, color: 'var(--green-mid)' }}>
                    {badge.icon} {badge.text}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const message = `Hello STM Salam! 👋\n\nI have completed my PayNow payment.\n\n💳 Payment Method: ScanPay (SGQR PayNow)\n📞 Contact: My attached screenshot\n\nPlease verify my payment. Thank you! 🙏`
                    const whatsappUrl = `https://wa.me/${shopInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="btn btn-gold" 
                  style={{ width: '100%', padding: '20px', borderRadius: '18px', fontSize: '17px', justifyContent: 'center', boxShadow: '0 10px 30px rgba(212,175,55,0.35)', gap: '10px', border: 'none', cursor: 'pointer' }}
                >
                  <CheckCircle size={22} /> I Have Paid
                </motion.button>
                
                <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600, lineHeight: 1.5, margin: '0' }}>
                  Clicking "<strong>I Have Paid</strong>" will open WhatsApp so you can send your payment screenshot for verification.
                </p>

                <button onClick={() => setShowQR(false)} style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'transparent', color: 'var(--text-light)', fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={{ marginTop: '32px' }}>

        {/* ══════════ PAYMENT & QUICK ACTION STRIP ══════════ */}
        <div className="quick-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { icon: <MessageCircle size={28} />, label: 'WhatsApp Pay', desc: 'Order via chat', color: '#25d366', bg: 'rgba(37,211,102,0.08)', action: () => window.open(`https://wa.me/${shopInfo.whatsapp.replace(/[^0-9]/g, '')}`, '_blank') },
            { icon: <ScanLine size={28} />, label: 'ScanPay', desc: 'QR PayNow', color: 'var(--green-mid)', bg: 'var(--green-tint)', action: () => setShowQR(true) },
            { icon: <CreditCard size={28} />, label: 'Pay via PayNow', desc: 'Scan & Pay Securely', color: '#4f46e5', bg: 'rgba(79,70,229,0.06)', action: () => navigate('/checkout') },
            { icon: <Smartphone size={28} />, label: 'Get the App', desc: 'iOS & Android', color: 'var(--gold)', bg: 'var(--gold-tint)', action: () => document.getElementById('app-download')?.scrollIntoView({ behavior: 'smooth' }) },
          ].map((a, i) => (
            <motion.button key={i} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }} onClick={a.action}
              style={{ background: 'white', border: '1px solid #eef2f6', borderRadius: '24px', padding: '28px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: '0.3s' }}>
              <div className="action-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '18px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>{a.icon}</div>
              <div className="action-label" style={{ fontWeight: 900, fontSize: '15px', color: 'var(--green-dark)' }}>{a.label}</div>
              <div className="action-desc" style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 700 }}>{a.desc}</div>
            </motion.button>
          ))}
        </div>

        {/* ══════════ OFFER / PROMO SECTION ══════════ */}
        <section style={{ marginBottom: '80px' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--green-dark)', color: 'white', borderRadius: '32px', padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px rgba(1,50,32,0.1)', position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ position: 'absolute', right: '-5%', top: '-20%', opacity: 0.05 }}><ShoppingBag size={240} color="white" /></div>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '540px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Star size={20} color="var(--gold)" />
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>Seasonal Offer</span>
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '36px', marginBottom: '16px', lineHeight: 1.2 }}>Today’s Highlights</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '32px', lineHeight: 1.6 }}>
                Enjoy selected favourites and seasonal specials, perfect for tea time, lunch, or evening cravings.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/menu')} className="btn" style={{ background: 'var(--gold)', color: 'var(--green-dark)', padding: '16px 32px', borderRadius: '14px', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} /> Start Your Order
                </button>
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '20px' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', transform: 'translateY(10px)' }}>
                <img src="/aboutusimage/juice_bg.png" alt="Special Drink" style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900, color: 'var(--green-dark)', textAlign: 'center', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Special Drink</div>
              </div>
              <div style={{ position: 'relative', width: '140px', height: '140px', transform: 'translateY(-10px)' }}>
                <img src="/aboutusimage/tea_snacks_bg.png" alt="Snack Platter" style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900, color: 'var(--green-dark)', textAlign: 'center', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Snack Platter</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════ CUSTOMER FAVORITES SECTION ══════════ */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: '42px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '16px', letterSpacing: '-1.5px' }}
            >
              Customer Favorites
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ color: 'var(--text-light)', fontSize: '18px', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}
            >
              Enjoy STM Salam’s most-loved drinks and snacks, freshly prepared every day.
            </motion.p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px', marginBottom: '56px' }}>
            {dynamicProducts.filter(item => [
              "Teh Tarik", 
              "Msala Tea With Ginger", 
              "Ginger Kopi", 
              "Hot Teh O Limau", 
              "Milo Hot", 
              "Beef Burger Classic"
            ].includes(item.name)).map((item, idx) => (
              <FavoriteItemCard 
                key={item.id} 
                item={item} 
                idx={idx} 
                inCart={cartItems.find(c => c.id === item.id)}
                addToCart={addToCart}
                navigate={navigate}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/menu')}
              style={{ 
                background: 'white', 
                color: 'var(--green-dark)', 
                border: '2px solid var(--green-dark)', 
                padding: '18px 48px', 
                borderRadius: '20px', 
                fontWeight: 900, 
                fontSize: '18px', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              View Full Menu <ChevronRight size={22} />
            </motion.button>
          </div>
        </section>

        {/* ══════════ WHY CHOOSE STM SALAM ══════════ */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { icon: <Flame size={32} />, title: 'Freshly Made', desc: 'Prepared hot upon your order.' },
              { icon: <Zap size={32} />, title: 'Fast Delivery', desc: 'Zero-G delivery speeds direct to you.' },
              { icon: <Heart size={32} />, title: 'Local Favorites', desc: 'Authentic Marine Terrace Kopitiam taste.' },
              { icon: <Tag size={32} />, title: 'Affordable Prices', desc: 'Delicious food without breaking the bank.' }
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--cream)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-mid)', margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                  {f.icon}
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--green-dark)', marginBottom: '8px' }}>{f.title}</h4>
                <p style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 600 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ GALLERY HIGHLIGHTS SECTION ══════════ */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', padding: '0 10px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--green-tint)', color: 'var(--green-mid)', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                <ImageIcon size={14} /> Our Visual Journey
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--green-dark)', letterSpacing: '-1.5px' }}>Moments at Salam</h2>
            </div>
            <Link to="/gallery" style={{ color: 'var(--green-mid)', fontWeight: 800, textDecoration: 'none', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              View All Media <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {galleryMedia.slice(0, 4).map((file, i) => {
              const isVideo = file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.mov');
              return (
                <motion.div
                  key={file}
                  whileHover={{ scale: 0.98 }}
                  onClick={() => navigate('/gallery')}
                  style={{ 
                    position: 'relative', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    aspectRatio: '1/1',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    background: '#000'
                  }}
                >
                  {isVideo ? (
                    <video 
                      src={`/aboutusimage/${file}`} 
                      muted 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  ) : (
                    <img src={`/aboutusimage/${file}`} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                    {isVideo && <PlayCircle size={40} color="white" style={{ opacity: 0.8 }} />}
                  </div>
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', opacity: 0 }}>
                    {/* Hover effect to show view details */}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ══════════ CALL TO ACTION ══════════ */}
        <section style={{ marginBottom: '80px', padding: '0 20px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #013220 100%)', 
              borderRadius: '24px', 
              padding: '80px 32px', 
              textAlign: 'center', 
              position: 'relative', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(1, 50, 32, 0.15)'
            }}>
            
            {/* ── Floating Background Glows ── */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                x: [0, 10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                position: 'absolute', top: '-20%', right: '-10%', 
                width: '300px', height: '300px', 
                background: 'rgba(255,255,255,0.15)', 
                borderRadius: '50%', filter: 'blur(60px)',
                zIndex: 0
              }} 
            />
            <motion.div 
              animate={{ 
                y: [0, 30, 0],
                x: [0, -20, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ 
                position: 'absolute', bottom: '-20%', left: '-5%', 
                width: '250px', height: '250px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '50%', filter: 'blur(50px)',
                zIndex: 0
              }} 
            />
            
            {/* ── Preparing Items Animation (Floating Food) ── */}
            {[
              { e: '☕', t: '5%', l: '10%', s: '32px', d: 0 },
              { e: '🍔', t: '15%', l: '85%', s: '40px', d: 1 },
              { e: '🥟', t: '70%', l: '8%', s: '36px', d: 2 },
              { e: '🍛', t: '65%', l: '88%', s: '38px', d: 1.5 },
              { e: '🧊', t: '40%', l: '92%', s: '30px', d: 0.5 },
              { e: '🍰', t: '80%', l: '15%', s: '28px', d: 2.5 }
            ].map((food, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.25, scale: 1 }}
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 1 }
                }}
                style={{ position: 'absolute', top: food.t, left: food.l, fontSize: food.s, zIndex: 0, filter: 'grayscale(0.2) contrast(1.2)' }}
              >
                {food.e}
              </motion.div>
            ))}
            
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
              <motion.h2 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ fontSize: '42px', fontWeight: 950, color: '#FFFFFF', marginBottom: '20px', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                Ready to Order?
              </motion.h2>
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '19px', fontWeight: 500, marginBottom: '48px', lineHeight: 1.6 }}>
                Browse our full menu to select your favourites, customise your order, and check out seamlessly with our dedicated ordering page.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button 
                  whileHover={{ y: -4, scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/menu')} 
                  style={{ 
                    background: '#FFFFFF', 
                    color: '#059669', 
                    padding: '18px 48px', 
                    borderRadius: '14px', 
                    fontWeight: 800, 
                    fontSize: '18px', 
                    border: 'none', 
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                  }}>
                  Start Your Order
                </motion.button>
                
                <motion.button 
                  whileHover={{ y: -2, background: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/menu')} 
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    padding: '18px 42px', 
                    borderRadius: '14px', 
                    fontWeight: 700, 
                    fontSize: '16px', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    cursor: 'pointer'
                  }}>
                  Explore Full Menu
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════ WHATSAPP ORDER CTA ══════════ */}
        <section style={{ marginBottom: '64px' }}>
          <div className="whatsapp-promo-box" style={{ background: 'linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%)', borderRadius: '40px', padding: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '10%', bottom: '-20%', opacity: 0.1 }}><MessageCircle size={200} /></div>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <MessageCircle size={20} color="white" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>WhatsApp Ordering</span>
              </div>
              <h2 style={{ color: 'white', fontSize: '36px', fontWeight: 950, marginBottom: '16px', lineHeight: 1.1 }}>Order via WhatsApp — It's That Simple</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 600, marginBottom: '32px', lineHeight: 1.7 }}>
                Send us your order on WhatsApp. Pay via PayNow or Cash. Get automated delivery notifications: <em>"Your cargo has cleared Earth's atmosphere!"</em>
              </p>
              <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${shopInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'white', color: '#075e54', padding: '16px 32px', borderRadius: '18px', fontWeight: 900, fontSize: '16px', textDecoration: 'none' }}>
                  <MessageCircle size={22} /> Chat Now
                </a>
                <Link to="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '16px 32px', borderRadius: '18px', fontWeight: 900, fontSize: '16px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)' }}>
                  <ExternalLink size={20} /> View Catalog
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
              {['📦 Send your order list', '💳 Pay via PayNow / ScanPay', '🚀 Track your Zero-G Delivery'].map((step, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.12)', padding: '16px 24px', borderRadius: '16px', color: 'white', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(8px)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 950 }}>{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ LOYALTY + REFERRAL ══════════ */}
        <div className="loyalty-referral-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '64px' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', border: '1px solid #eef2f6', display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ background: 'var(--gold-tint)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={48} color="var(--gold)" />
            </div>
            <div>
              <h4 style={{ fontSize: '22px', fontWeight: 950, marginBottom: '8px' }}>Loyalty Progress</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Only <span style={{ color: 'var(--gold)' }}>260 points</span> away from a FREE Nasi Lemak!</p>
              <div style={{ height: '8px', background: 'var(--cream)', borderRadius: '4px' }}>
                <div style={{ width: '75%', height: '100%', background: 'var(--gold)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--green-dark)', padding: '40px', borderRadius: '40px', color: 'white', display: 'flex', gap: '32px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1 }}><Zap size={120} color="var(--gold)" /></div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <h4 style={{ fontSize: '22px', fontWeight: 950, marginBottom: '8px' }}>Invite & Get $10</h4>
              <p style={{ opacity: 0.8, fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>Share your invite link and both of you get $10 Credits.</p>
              <button className="btn btn-gold" style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '12px' }}>Copy Invite Link</button>
            </div>
          </div>
        </div>

        {/* ══════════ APP DOWNLOAD — GOOGLE PLAY & APP STORE ══════════ */}
        <section id="app-download" style={{ marginBottom: '64px' }}>
          <div className="app-download-box" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', borderRadius: '40px', padding: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Floating food in anti-gravity */}
            <motion.div animate={{ y: [-8, 12, -8] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: 'absolute', right: '15%', top: '15%', fontSize: '60px', opacity: 0.3 }}>☕</motion.div>
            <motion.div animate={{ y: [10, -15, 10] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', right: '30%', bottom: '15%', fontSize: '50px', opacity: 0.2 }}>🍔</motion.div>
            <motion.div animate={{ y: [-5, 10, -5], rotate: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity }} style={{ position: 'absolute', right: '8%', bottom: '25%', fontSize: '45px', opacity: 0.25 }}>🥟</motion.div>

            <div style={{ maxWidth: '500px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Smartphone size={20} color="var(--gold)" />
                <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>Mobile App</span>
              </div>
              <h2 style={{ color: 'white', fontSize: '38px', fontWeight: 950, marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                Download STM Salam App 
                <span style={{ background: 'var(--gold)', color: 'var(--green-dark)', padding: '6px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Coming Soon</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', fontWeight: 600, marginBottom: '32px', lineHeight: 1.7 }}>
                Get exclusive app-only deals. Order in seconds, track your Zero-G delivery in real-time, and earn double loyalty points.
              </p>

              <div className="app-store-btns" style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                {/* Google Play */}
                <a href="https://play.google.com/store" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', color: '#1a1a1a', padding: '14px 24px', borderRadius: '16px', textDecoration: 'none', transition: '0.3s' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.382.218-.712.609-.92z" fill="#4285F4"/><path d="M17.219 8.381l-3.427 3.62 3.427 3.618 3.87-2.174a1.123 1.123 0 000-1.89l-3.87-2.174z" fill="#FBBC04"/><path d="M3.609 1.814L13.792 12l3.427-3.619L5.64.596c-.4-.224-.87-.23-1.292-.009-.133.07-.3.185-.74.627v.6z" fill="#34A853"/><path d="M13.792 12L3.61 22.186c.44.442.607.557.74.627.421.22.891.215 1.291-.01l11.578-6.804L13.792 12z" fill="#EA4335"/></svg>
                  <div><div style={{ fontSize: '10px', fontWeight: 600 }}>GET IT ON</div><div style={{ fontSize: '16px', fontWeight: 900, marginTop: '-2px' }}>Google Play</div></div>
                </a>
                {/* App Store */}
                <a href="https://apps.apple.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', color: '#1a1a1a', padding: '14px 24px', borderRadius: '16px', textDecoration: 'none', transition: '0.3s' }}>
                  <Apple size={28} />
                  <div><div style={{ fontSize: '10px', fontWeight: 600 }}>Download on the</div><div style={{ fontSize: '16px', fontWeight: 900, marginTop: '-2px' }}>App Store</div></div>
                </a>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                {[{ icon: <Shield size={18} />, text: 'Secure Payments' }, { icon: <Wifi size={18} />, text: 'Real-time Tracking' }, { icon: <Zap size={18} />, text: '2x Loyalty Points' }].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700 }}>
                    <span style={{ color: 'var(--gold)' }}>{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '240px', height: '480px', background: 'var(--green-dark)', borderRadius: '36px', border: '3px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', position: 'relative' }}>
                <div style={{ padding: '24px 16px 16px', background: '#0d3320' }}>
                  <div style={{ fontWeight: 800, fontSize: '18px', color: 'white' }}>Our Location</div>
                  <div style={{ opacity: 0.7, color: 'white', fontSize: '12px' }}>Blk 55 Marine Terrace, #01-303, Singapore 440055</div>
                  <div style={{ color: 'var(--gold)', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', marginTop: '8px' }}>ZERO-G DELIVERY</div>
                </div>
                <div style={{ padding: '16px', flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400" style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="Classic Lamb Burger" />
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 900, color: 'var(--green-dark)', fontSize: '14px', marginBottom: '4px' }}>Classic Lamb Burger</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, color: 'var(--green-mid)', fontSize: '14px' }}>$10.00</div>
                        <div style={{ background: 'var(--gold)', color: 'var(--green-dark)', padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>ADD</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '8px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <img src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="Hummus Falafel" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--green-dark)', fontSize: '12px', marginBottom: '2px' }}>Hummus Falafel</div>
                      <div style={{ fontWeight: 800, color: 'var(--green-mid)', fontSize: '11px' }}>$8.50</div>
                    </div>
                    <div style={{ width: '24px', height: '24px', background: 'var(--green-tint)', color: 'var(--green-dark)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>+</div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '8px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="Onion Rings" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--green-dark)', fontSize: '12px', marginBottom: '2px' }}>Onion Rings</div>
                      <div style={{ fontWeight: 800, color: 'var(--green-mid)', fontSize: '11px' }}>$5.00</div>
                    </div>
                    <div style={{ width: '24px', height: '24px', background: 'var(--green-tint)', color: 'var(--green-dark)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>+</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

/* ── Active Order Tracker Sub-Component ── */
function ActiveOrderTracker() {
  const [activeOrder, setActiveOrder] = useState(null)
  const orderId = localStorage.getItem('stm_last_order_id')

  useEffect(() => {
    if (!orderId) return
    const checkOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`)
        const data = await res.json()
        if (data.id && data.status !== 'delivered') setActiveOrder(data)
        else setActiveOrder(null)
      } catch (e) { console.log('Tracker error') }
    }
    checkOrder()
    const interval = setInterval(checkOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  if (!activeOrder) return null

  const statusMap = { pending: 'Order Received', accepted: 'Kitchen Accepting', preparing: 'Preparing Delicious Food', ready: 'Packing Your Bags', delivering: 'Courier is On the Move' }
  const progressMap = { pending: 10, accepted: 30, preparing: 60, ready: 80, delivering: 95 }

  return (
    <Link to={`/tracking/${orderId}`} style={{ display: 'block', textDecoration: 'none', background: 'white', borderBottom: '1.5px solid #eef2f6' }}>
      <div className="container" style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Activity size={24} color="var(--gold)" />
          <div style={{ position: 'absolute', bottom: -4, right: -4, width: '14px', height: '14px', border: '3px solid white', borderRadius: '50%', background: 'var(--success, #22c55e)', animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--green-dark)' }}>{statusMap[activeOrder.status]}...</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success, #22c55e)', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>ARRIVING IN 14 MIN</div>
          </div>
          <div style={{ height: '6px', background: 'var(--cream)', borderRadius: '3px' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressMap[activeOrder.status]}%` }} style={{ height: '100%', background: 'var(--success, #22c55e)', borderRadius: '3px' }} />
          </div>
        </div>
        <ChevronRight size={20} color="var(--text-light)" />
      </div>
    </Link>
  )
}
