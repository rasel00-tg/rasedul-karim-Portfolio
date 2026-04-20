import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, GraduationCap, School, CheckCircle2, Rocket, Monitor, Palette } from 'lucide-react';

const InfoSection = ({ title, icon: Icon, children }) => (
  <div style={{ marginBottom: '50px', width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
      <Icon size={32} color="#00f0ff" />
      <h3 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', color: '#fff', textShadow: '0 0 15px rgba(0,240,255,0.4)', letterSpacing: '1px' }}>
        {title}
      </h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
      {children}
    </div>
  </div>
);

const AboutModal = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 0, 15, 0.98)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          style={{
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '80px 20px'
          }}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{
              position: 'fixed', top: '30px', right: '30px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff',
              borderRadius: '50%', padding: '15px', display: 'flex', transition: 'all 0.3s', zIndex: 100
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.color = '#00f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <X size={28} />
          </button>

          {/* 1. Profile Picture - Centered and Large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ position: 'relative', width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '60px' }}
          >
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '80%', height: '80%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, transparent 70%)',
              filter: 'blur(60px)', zIndex: 0
            }}></div>
            <img 
              src="/aboutpic.png" 
              alt="Rasedul Karim" 
              style={{ 
                width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain', 
                position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 30px rgba(0,240,255,0.15))'
              }} 
            />
          </motion.div>

          {/* 2. Main Identity & Summary - Centered */}
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '900px', marginBottom: '80px' }}>
            <h1 style={{ 
              fontSize: 'clamp(3rem, 12vw, 6.5rem)', color: '#fff', margin: '0 0 10px 0', 
              fontWeight: '900', letterSpacing: '-2px', lineHeight: 1,
              textShadow: '0 0 40px rgba(0,240,255,0.5)'
            }}>
              RASEDUL KARIM
            </h1>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#00f0ff', margin: '0 0 30px 0', fontWeight: '400', letterSpacing: '4px', opacity: 0.9 }}>
              SOFTWARE AND WEB DEVELOPER & PHOTO EDITOR
            </h2>
            <div style={{ width: '120px', height: '4px', background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)', margin: '0 auto 40px auto' }}></div>
            <p style={{ 
              color: '#F0F0F0', 
              fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', 
              lineHeight: 1.8, 
              textAlign: 'center',
              fontWeight: '400',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              I am a seasoned Software and Web Developer & Photo Editor with a deep passion for creating clean, efficient code and stunning visuals. My dedication lies in developing robust web solutions and high-quality designs that meet client needs and enhance user experience.
            </p>
          </div>

          {/* 3. Resume Content Grid - Optimized for Mobile (Flex-Wrap & Center) */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '80px', 
            width: '100%', 
            maxWidth: '1200px' 
          }}>
            
            {/* Contact Info Card - Floating & Centered elements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ width: '100%', maxWidth: '500px' }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '30px',
                padding: '40px 20px',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: 0, color: '#00f0ff', fontSize: '1.8rem', fontWeight: 'bold' }}>Contact Info</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <Mail color="#00f0ff" size={24} style={{ marginBottom: '5px' }} />
                  <span style={{ color: '#fff', fontSize: '1.2rem' }}>rasedul.karim.dev@gmail.com</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <Phone color="#00f0ff" size={24} style={{ marginBottom: '5px' }} />
                  <span style={{ color: '#fff', fontSize: '1.2rem' }}>+8801871176267</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <MapPin color="#00f0ff" size={24} style={{ marginBottom: '5px' }} />
                  <span style={{ color: '#fff', fontSize: '1.1rem', maxWidth: '300px' }}>
                    Natun Pollan Para, Teknaf, Cox's Bazar-4760
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Education & Courses Section - Centered Lists */}
            <div style={{ width: '100%', maxWidth: '600px' }}>
              <InfoSection title="Education" icon={GraduationCap}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <li style={{ color: '#E0E0E0', fontSize: '1.2rem', textAlign: 'center' }}>- Supia Nuria Dhakil Madrasah</li>
                  <li style={{ color: '#E0E0E0', fontSize: '1.2rem', textAlign: 'center' }}>- Teknaf Model Pailot High School (School)</li>
                  <li style={{ color: '#E0E0E0', fontSize: '1.2rem', textAlign: 'center' }}>- Teknaf Degree College (College)</li>
                </ul>
              </InfoSection>

              <InfoSection title="Courses" icon={Monitor}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
                  <li style={{ textAlign: 'center' }}>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>Programming Hero Specialized Learning</div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>programminghero.com</div>
                  </li>
                  <li style={{ textAlign: 'center' }}>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>Web Development & Competitive Programming</div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>phitron.io</div>
                  </li>
                  <li style={{ textAlign: 'center' }}>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>Photo Editing & Digital Art Mastery</div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Self-taught Expertise</div>
                  </li>
                </ul>
              </InfoSection>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
