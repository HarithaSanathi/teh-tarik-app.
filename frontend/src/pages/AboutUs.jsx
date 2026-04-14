import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, MapPin, Phone, Users, Scroll, ChefHat, Heart, Award, Star, ArrowRight, Play, X, Maximize2 } from 'lucide-react'
import { galleryMedia } from '../data/galleryData'
import { Link } from 'react-router-dom'

/* ── REUSABLE ANIMATED SECTION ── */
const RevealSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
)

export default function AboutUs() {
  const [selectedMedia, setSelectedMedia] = useState(null)

  const mediaItems = galleryMedia.map(file => {
    const isVideo = file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.mov')
    return {
      url: `/aboutusimage/${file}`,
      type: isVideo ? 'video' : 'image',
      name: file
    }
  })

  // Use the search result to find a good hero video
  const heroVideo = mediaItems.find(m => m.type === 'video')?.url || '/bg1.jpeg'
  
  const values = [
    { title: '100% Halal Certified', icon: <Award size={32} />, desc: 'Strictly adhered to Halal standards since our very first day.' },
    { title: 'Cooked Fresh Daily', icon: <ChefHat size={32} />, desc: 'No shortcuts. We prepare every dish fresh, every single morning.' },
    { title: 'Fast Delivery', icon: <Clock size={32} />, desc: 'Serving our community with speed that respects your hunger.' },
    { title: 'Family Recipes', icon: <Scroll size={32} />, desc: 'Recipes passed down through generations, preserved with love.' },
    { title: 'Genuine Hospitality', icon: <Heart size={32} />, desc: 'In Marine Terrace, you aren’t just a customer; you are family.' },
    { title: 'Premium Ingredients', icon: <Star size={32} />, desc: 'Handpicked spices and fresh produce for that unmistakable depth.' },
  ]

  return (
    <div style={{ background: '#fffaf5', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── SECTION 1: HERO ABOUT ── */}
      <section style={{ height: '90vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <video src={heroVideo} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(1,50,32,0.6), rgba(1,50,32,0.3), #fffaf5)' }} />
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '24px', opacity: 0.9 }}>
              Genuine Taste Since 1988
            </div>
            <h1 style={{ fontSize: 'clamp(48px, 8vw, 90px)', fontWeight: 950, lineHeight: 0.9, letterSpacing: '-3px', marginBottom: '32px' }}>
              The Soul of <br /> <span style={{ color: 'var(--gold)' }}>Marine Terrace.</span>
            </h1>
            <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto', opacity: 0.9, fontWeight: 500, lineHeight: 1.6 }}>
              Experience the peak of Marine Terrace hospitality. Premium ingredients, crafted with excellence and delivered with grace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: OUR STORY ── */}
      <section style={{ padding: '140px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
            <RevealSection>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', background: 'rgba(212,175,55,0.1)', borderRadius: '50%', zIndex: -1 }} />
                <img 
                  src="/aboutusimage/tea_snacks_bg.png" 
                  alt="Our Heritage" 
                  style={{ width: '100%', borderRadius: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }} 
                />
                <div style={{ position: 'absolute', bottom: '-30px', right: '40px', background: 'var(--green-dark)', color: 'white', padding: '32px', borderRadius: '32px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: '40px', fontWeight: 950, color: 'var(--gold)' }}>35+</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Years of Flavor</div>
                </div>
              </div>
            </RevealSection>
            
            <RevealSection delay={0.2}>
              <h2 style={{ fontSize: '42px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '32px', lineHeight: 1.1 }}>
                A Legacy Crafted <br /> <span style={{ color: 'var(--green-mid)' }}>With Deep Devotion.</span>
              </h2>
              <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-dark)', marginBottom: '24px' }}>
                Established in 1988, <strong>STM Salam</strong> has been serving the Marine Terrace community with authentic, high-quality, and deeply flavorful Halal Indian-Muslim cuisine. 
              </p>
              <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--text-light)', marginBottom: '40px' }}>
                From our gourmet Lamb Burgers to our signature Teh Tarik, every item on our menu is crafted with care, preserving generations of family tradition while embracing modern tastes. We believe that good food is the universal language of connection, and our mission is to deliver that connection right to your doorstep.
              </p>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-dark)' }}>
                    <Users size={24} />
                 </div>
                 <div>
                    <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--green-dark)' }}>Community Trusted</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-light)' }}>Part of the family since 1988</p>
                 </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: SIGNATURE EXPERIENCE ── */}
      <section style={{ padding: '120px 0', background: 'var(--green-dark)', color: 'white' }}>
        <div className="container">
          <RevealSection>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '16px', color: 'var(--gold)' }}>Signature Experience</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Crafted with excellence, delivered with grace.</p>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Signature Lamb Burger', img: '/aboutusimage/burger_bg.png', desc: 'Premium gourmet patty, grilled to perfection with fresh toppings.' },
              { title: 'Signature Teh Tarik', img: '/aboutusimage/tehtarik_premium.png', desc: 'Silky, frothy, and pulled to perfection every single time.' },
              { title: 'Fresh Seasonal Juices', img: '/aboutusimage/juice_bg.png', desc: 'Natural, cold-pressed goodness to refresh your soul.' },
            ].map((fav, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                 <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ height: '300px', overflow: 'hidden' }}>
                       <img src={fav.img} alt={fav.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '32px' }}>
                       <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>{fav.title}</h3>
                       <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 0 }}>{fav.desc}</p>
                    </div>
                 </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: OUR VALUES ── */}
      <section style={{ padding: '140px 0' }}>
        <div className="container">
          <RevealSection>
            <div style={{ maxWidth: '700px', margin: '0 auto 80px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '42px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '16px' }}>What Defines Us</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-light)' }}>Our commitment to quality hasn’t changed since 1988.</p>
            </div>
          </RevealSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {values.map((v, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <div style={{ background: 'white', padding: '48px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.03)', border: '1px solid #f0f4f8', height: '100%' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'rgba(212,175,55,0.1)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green-dark)', marginBottom: '16px' }}>{v.title}</h3>
                  <p style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: '15px' }}>{v.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: GALLERY SHOWCASE ── */}
      <section style={{ padding: '120px 0', background: '#fff' }}>
        <div className="container">
          <RevealSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
              <div>
                <h2 style={{ fontSize: '42px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '12px' }}>Moments Captured</h2>
                <p style={{ fontSize: '18px', color: 'var(--text-light)', margin: 0 }}>A glimpse into our kitchen and our happy community.</p>
              </div>
              <Link to="/gallery" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green-mid)', fontWeight: 800, textDecoration: 'none', fontSize: '15px' }}>
                View All Highlights <ArrowRight size={18} />
              </Link>
            </div>
          </RevealSection>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {mediaItems.slice(0, 8).map((item, i) => (
              <RevealSection key={i} delay={i * 0.05}>
                <motion.div
                  whileHover={{ scale: 0.96 }}
                  onClick={() => setSelectedMedia(item)}
                  style={{ borderRadius: '20px', overflow: 'hidden', aspectRatio: '1/1', cursor: 'pointer', position: 'relative' }}
                >
                  {item.type === 'video' ? (
                    <video 
                      src={item.url} 
                      muted 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onMouseOver={e => e.target.play()}
                      onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  ) : (
                    <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {item.type === 'video' && (
                    <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={18} color="white" fill="white" />
                    </div>
                  )}
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHY CUSTOMERS LOVE US ── */}
      <section style={{ padding: '140px 0', background: 'rgba(1, 50, 32, 0.03)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '100px', alignItems: 'center' }}>
            <RevealSection>
               <h2 style={{ fontSize: '42px', fontWeight: 950, color: 'var(--green-dark)', marginBottom: '32px' }}>
                 Why Marine Terrace <br /> <span style={{ color: 'var(--green-mid)' }}>Chooses Salam.</span>
               </h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {[
                    { label: 'Unmatched Freshness', desc: 'We don’t believe in leftovers. Everything is cooked fresh every daily.' },
                    { label: 'Generational Trust', desc: 'Over 35 years of consistent quality across Marine Terrace.' },
                    { label: 'True Authenticity', desc: 'Real family recipes, zero industrial shortcuts.' },
                  ].map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ color: 'var(--gold)' }}><CheckCircle size={28} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 900, color: 'var(--green-dark)' }}>{item.label}</h4>
                        <p style={{ margin: 0, color: 'var(--text-light)', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </RevealSection>
            <RevealSection delay={0.3}>
               <div style={{ background: 'white', padding: '60px', borderRadius: '48px', boxShadow: '0 30px 60px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
                     {[1,2,3,4,5].map(s => <Star key={s} size={24} fill="var(--gold)" color="var(--gold)" />)}
                  </div>
                  <p style={{ fontSize: '22px', fontWeight: 500, color: 'var(--green-dark)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '32px' }}>
                    "The best Teh Tarik in Singapore, hands down. I’ve been coming here since I was a kid. The burgers are gourmet quality and the hospitality is even better."
                  </p>
                  <div style={{ fontWeight: 900, color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '13px' }}>
                    — Local Resident, Marine Terrace
                  </div>
               </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: VISIT / CONTACT ── */}
      <section style={{ padding: '120px 0' }}>
         <div className="container">
            <RevealSection>
              <div style={{ background: 'var(--green-dark)', borderRadius: '64px', overflow: 'hidden', padding: '80px', display: 'flex', flexWrap: 'wrap', gap: '80px', alignItems: 'center', color: 'white' }}>
                 <div style={{ flex: '1 1 400px' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: 950, marginBottom: '32px', color: 'var(--gold)' }}>Visit Us Today</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                       <div style={{ display: 'flex', gap: '16px' }}>
                          <MapPin size={24} color="var(--gold)" />
                          <div>
                             <div style={{ fontWeight: 800, fontSize: '18px' }}>Our Location</div>
                             <div style={{ opacity: 0.7 }}>Blk 55 Marine Terrace, #01-303, Singapore 440055</div>
                          </div>
                       </div>
                       <div style={{ display: 'flex', gap: '16px' }}>
                          <Phone size={24} color="var(--gold)" />
                          <div>
                             <div style={{ fontWeight: 800, fontSize: '18px' }}>Call Us</div>
                             <div style={{ opacity: 0.7 }}>+65 9191 5766</div>
                          </div>
                       </div>
                       <div style={{ display: 'flex', gap: '16px' }}>
                          <Clock size={24} color="var(--gold)" />
                          <div>
                             <div style={{ fontWeight: 800, fontSize: '18px' }}>Opening Hours</div>
                             <div style={{ opacity: 0.7 }}>Daily 9:00 AM – 11:00 PM</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '40px' }}>Join us at our peak of hospitality or have the experience delivered.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <Link to="/menu" style={{ background: 'var(--gold)', color: 'var(--green-dark)', padding: '20px 40px', borderRadius: '24px', fontWeight: 900, textDecoration: 'none', fontSize: '18px' }}>Order Online Now</Link>
                       <Link to="/menu" style={{ color: 'white', padding: '20px 40px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', fontWeight: 800, textDecoration: 'none' }}>View Our Full Menu</Link>
                    </div>
                 </div>
              </div>
            </RevealSection>
         </div>
      </section>

      {/* ── LIGHTBOX MODAL (Gallery Integration) ── */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
            onClick={() => setSelectedMedia(null)}
          >
            <motion.button style={{ position: 'absolute', top: '30px', right: '30px', background: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 101 }}>
              <X size={24} color="black" />
            </motion.button>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '32px', overflow: 'hidden' }}>
              {selectedMedia.type === 'video' ? <video src={selectedMedia.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '85vh' }} /> : <img src={selectedMedia.url} style={{ maxWidth: '100%', maxHeight: '85vh' }} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
