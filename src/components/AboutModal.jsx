import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
          background: 'rgba(5, 0, 15, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '50px 0', // Completely removed horizontal padding
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
            /* Completely Frameless Layout - No Background, No Borders */
            width: '100%',
            maxWidth: '1600px', // Increased heavily to allow edge-to-edge stretching
            padding: '50px 0 80px 0', // Removed horizontal padding to allow image to touch edges
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '50px',
            position: 'relative'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'fixed', top: '30px', right: '30px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff',
              borderRadius: '50%', padding: '15px', display: 'flex', transition: 'all 0.3s', zIndex: 10
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

          {/* Frameless Content Wrapper: Display row on large screens, column on mobile */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '60px'
          }}>
            
            {/* Premium Image - Massive, touching the edges */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              style={{ 
                flex: '1 1 100%',
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Massive ambient glow behind the image to make it pop visually on black background */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(50px)',
                zIndex: 0
              }}></div>
              
              <img 
                src="/aboutpic.png" 
                alt="Rasedul Karim" 
                loading="lazy"
                style={{ 
                  height: 'auto', 
                  width: '100%', 
                  maxWidth: '100vw', // Edge to edge on mobile!
                  maxHeight: '75vh', // Protect from being too tall on desktop
                  objectFit: 'cover', // ensure it fills the width perfectly
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8))', // Soft shadow instead of border
                  position: 'relative',
                  zIndex: 1,
                  willChange: 'transform'
                }} 
              />
            </motion.div>

            {/* Detailed Descriptive Text - No Box, Floating Free */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              style={{
                flex: '1 1 500px',
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                justifyContent: 'center',
                padding: '0 20px' // Restore horizontal padding specifically for the text so it doesn't touch the edges
              }}
            >
              <h2 style={{ 
                color: '#fff', 
                fontSize: 'clamp(3rem, 8vw, 5rem)', 
                margin: '0', 
                textShadow: '0 0 30px rgba(0,240,255,0.6)', 
                letterSpacing: '1px',
                lineHeight: 1
              }}>
                About Me
              </h2>
              <div style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, #00f0ff, transparent)' }}></div>
              
              <p style={{ 
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                color: '#E0E0E0', 
                lineHeight: '1.8', 
                margin: '0',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
              }}>
                I am a passionate Software Developer and Designer. I blend aesthetics with performance, building applications that not only work flawlessly but look breathtaking. Technology for me is deeply connected to solving human problems and bringing visions to life through clean architecture and beautiful interfaces.
              </p>
              <p style={{ 
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                color: '#B0B0B0', 
                lineHeight: '1.8', 
                margin: '0',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
              }}>
                Through years of dedicated experience ranging from mobile app structural architecture to designing high-end websites, my mission remains unchanged: crafting digital experiences that perform swiftly on any device, leave a lasting visual impact, and inspire users globally. Let's create something extraordinary together.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
