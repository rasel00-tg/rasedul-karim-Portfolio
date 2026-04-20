import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, GraduationCap, School, CheckCircle2, Rocket, Monitor, Palette } from 'lucide-react';

const InfoSection = ({ title, icon: Icon, children }) => (
  <div style={{ marginBottom: '40px', width: '100%', maxWidth: '800px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
      <Icon size={24} color="#00f0ff" />
      <h3 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', color: '#fff', textShadow: '0 0 10px rgba(0,240,255,0.3)', letterSpacing: '1px' }}>
        {title}
      </h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
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
          background: 'rgba(5, 0, 15, 0.99)',
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
            padding: '60px 15px' // Horizontal padding for screen fit
          }}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{
              position: 'fixed', top: '25px', right: '25px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff',
              borderRadius: '50%', padding: '12px', display: 'flex', transition: 'all 0.3s', zIndex: 100
            }}
          >
            <X size={24} />
          </button>

          {/* 1. Profile Picture - Compact Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'relative', width: '100%', maxWidth: '600px', textAlign: 'center', marginBottom: '40px' }}
          >
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '80%', height: '80%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
              filter: 'blur(50px)', zIndex: 0
            }}></div>
            <img 
              src="/aboutpic.png" 
              alt="Rasedul Karim" 
              style={{ 
                width: '100%', height: 'auto', maxHeight: '60vh', objectFit: 'contain', 
                position: 'relative', zIndex: 1
              }} 
            />
          </motion.div>

          {/* 2. Identity Section - STRICT ONE LINE NAME */}
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '1000px', marginBottom: '60px' }}>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 10vw, 6rem)', 
              color: '#fff', 
              margin: '0 0 5px 0', 
              fontWeight: '900', 
              letterSpacing: '-1px', 
              lineHeight: 1,
              whiteSpace: 'nowrap', // Essential to prevent breaking
              overflow: 'hidden',
              textOverflow: 'clip',
              width: '100%',
              display: 'block',
              textShadow: '0 0 30px rgba(0,240,255,0.4)'
            }}>
              RASEDUL KARIM
            </h1>
            <h2 style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)', color: '#00f0ff', margin: '0 0 25px 0', fontWeight: '400', letterSpacing: '2px', opacity: 0.9 }}>
              SOFTWARE AND WEB DEVELOPER & PHOTO EDITOR
            </h2>
            <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)', margin: '0 auto 30px auto' }}></div>
            <p style={{ 
              color: '#D0D0D0', 
              fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', 
              lineHeight: 1.6, 
              textAlign: 'center',
              fontWeight: '400',
              padding: '0 10px'
            }}>
              I am a Software and Web Developer & Photo Editor with a passion for clean code and stunning visuals. Creating robust web solutions and high-quality designs to enhance user experience.
            </p>
          </div>

          {/* 3. Resume Content - Compact Vertical Integration */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '50px', 
            width: '100%'
          }}>
            
            {/* Contact Info - Compact Single Line Formats */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              borderRadius: '20px',
              padding: '25px 15px',
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#fff', whiteSpace: 'nowrap' }}>
                <Mail color="#00f0ff" size={18} />
                <span><span style={{color: '#888'}}>Email:</span> rasedul.karim.dev@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#fff', whiteSpace: 'nowrap' }}>
                <Phone color="#00f0ff" size={18} />
                <span><span style={{color: '#888'}}>Phone:</span> +8801871176267</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.85rem, 2.8vw, 1rem)', color: '#fff', textAlign: 'center' }}>
                <MapPin color="#00f0ff" size={18} />
                <span><span style={{color: '#888'}}>Address:</span> Natun Pollan Para, Teknaf, Cox's Bazar</span>
              </div>
            </div>

            {/* Education - Miniaturized */}
            <InfoSection title="Education" icon={GraduationCap}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#B0B0B0', fontSize: '1rem', textAlign: 'center', lineHeight: 1.2 }}>
                <div>- Supia Nuria Dhakil Madrasah</div>
                <div>- Teknaf Model Pailot High School</div>
                <div>- Teknaf Degree College</div>
              </div>
            </InfoSection>

            {/* Courses - Bold Titles, Compact Spacing */}
            <InfoSection title="Courses" icon={Monitor}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
                <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                  <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>Programming Hero Specialized Learning</div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>programminghero.com</div>
                </div>
                <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                  <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>Web Dev & Competitive Programming</div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>phitron.io</div>
                </div>
                <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                  <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold' }}>Photo Editing & Digital Art Mastery</div>
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>Self-taught Excellence</div>
                </div>
              </div>
            </InfoSection>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
