import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, GraduationCap, Monitor, Sparkles, User } from 'lucide-react';

const InfoSection = ({ title, icon: Icon, children }) => (
  <div style={{ marginBottom: '24px', width: '100%', maxWidth: '700px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
      <Icon size={18} color="#00f0ff" />
      <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', color: '#fff', textShadow: '0 0 10px rgba(0,240,255,0.3)', letterSpacing: '1px' }}>
        {title}
      </h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
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
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 0, 15, 0.98)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          style={{
            width: '100%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '40px 16px 60px 16px'
          }}
        >
          {/* Close Button */}
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed', 
              top: '20px', 
              right: '20px',
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(0, 240, 255, 0.3)', 
              cursor: 'pointer', 
              color: '#00f0ff',
              borderRadius: '50%', 
              padding: '10px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              boxShadow: '0 0 15px rgba(0,240,255,0.25)'
            }}
            aria-label="Close modal"
          >
            <X size={22} />
          </motion.button>

          {/* 1. Profile Picture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'relative', width: '100%', maxWidth: '420px', textAlign: 'center', marginBottom: '20px' }}
          >
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '85%', height: '85%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)', zIndex: 0
            }}></div>
            <img 
              src="/aboutpic.png" 
              alt="Rasedul Karim" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '45vh', 
                objectFit: 'contain', 
                position: 'relative', 
                zIndex: 1 
              }} 
            />
          </motion.div>

          {/* 2. Identity Section - STRICT ONE LINE NAME */}
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '100%', marginBottom: '25px', padding: '0 8px' }}>
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <h1 style={{ 
                fontSize: 'clamp(1.6rem, 7vw, 3.8rem)', 
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#fff', 
                margin: '0 0 6px 0', 
                fontWeight: 900, 
                letterSpacing: '1px', 
                lineHeight: 1.1,
                whiteSpace: 'nowrap', 
                textShadow: '0 0 25px rgba(0,240,255,0.5)',
                textAlign: 'center'
              }}>
                RASEDUL KARIM
              </h1>
            </div>
            <h2 style={{ fontSize: 'clamp(0.85rem, 2.8vw, 1.1rem)', color: '#00f0ff', margin: '0 0 14px 0', fontWeight: 600, letterSpacing: '1px' }}>
              SOFTWARE & WEB DEVELOPER | PHOTO EDITOR
            </h2>
            <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)', margin: '0 auto 16px auto' }}></div>
            <p style={{ 
              color: '#CBD5E1', 
              fontSize: 'clamp(0.92rem, 2.5vw, 1.08rem)', 
              lineHeight: 1.6, 
              textAlign: 'center',
              fontWeight: 400,
              maxWidth: '650px',
              margin: '0 auto'
            }}>
              Passionate about creating modern, robust software systems, intuitive web solutions, and high-quality digital visual art to elevate user experience.
            </p>
          </div>

          {/* 3. Resume Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '20px', 
            width: '100%' 
          }}>
            
            {/* Contact Info - STRICT SINGLE LINE ITEMS */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              width: '100%',
              maxWidth: '580px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'center',
              boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.82rem, 2.7vw, 0.95rem)', color: '#fff', whiteSpace: 'nowrap' }}>
                <Mail color="#00f0ff" size={16} />
                <span><strong style={{color: '#94A3B8'}}>Email:</strong> rasedul.karim.dev@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.82rem, 2.7vw, 0.95rem)', color: '#fff', whiteSpace: 'nowrap' }}>
                <Phone color="#00f0ff" size={16} />
                <span><strong style={{color: '#94A3B8'}}>Phone:</strong> +8801871176267</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.78rem, 2.5vw, 0.9rem)', color: '#fff', whiteSpace: 'nowrap' }}>
                <MapPin color="#00f0ff" size={16} />
                <span><strong style={{color: '#94A3B8'}}>Address:</strong> Natun Pollan Para, Teknaf, Cox's Bazar</span>
              </div>
            </div>

            {/* Education */}
            <InfoSection title="Education" icon={GraduationCap}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '14px 20px',
                width: '100%',
                maxWidth: '580px',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '6px', 
                color: '#E2E8F0', 
                fontSize: '0.9rem', 
                textAlign: 'center' 
              }}>
                <div>• Supia Nuria Dhakil Madrasah</div>
                <div>• Teknaf Model Pailot High School</div>
                <div>• Teknaf Degree College</div>
              </div>
            </InfoSection>

            {/* Courses - Bold Titles */}
            <InfoSection title="Courses & Certifications" icon={Monitor}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '16px 20px',
                width: '100%',
                maxWidth: '580px',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '12px' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '0.98rem', fontWeight: 'bold' }}>Programming Hero Specialized Learning</div>
                  <div style={{ color: '#00f0ff', fontSize: '0.8rem', marginTop: '2px' }}>programminghero.com</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '0.98rem', fontWeight: 'bold' }}>Web Dev & Competitive Programming</div>
                  <div style={{ color: '#00f0ff', fontSize: '0.8rem', marginTop: '2px' }}>phitron.io</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '0.98rem', fontWeight: 'bold' }}>Photo Editing & Digital Art Mastery</div>
                  <div style={{ color: '#00f0ff', fontSize: '0.8rem', marginTop: '2px' }}>Self-taught Excellence</div>
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
