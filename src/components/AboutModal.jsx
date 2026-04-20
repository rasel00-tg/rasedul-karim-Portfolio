import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, GraduationCap, School, CheckCircle2, Rocket, Monitor, Palette, Briefcase } from 'lucide-react';

const InfoSection = ({ title, icon: Icon, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
      <Icon size={28} color="#00f0ff" />
      <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#fff', textShadow: '0 0 15px rgba(0,240,255,0.4)', letterSpacing: '1px' }}>
        {title}
      </h3>
    </div>
    <div style={{ paddingLeft: '45px' }}>
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
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          style={{
            width: '100%',
            maxWidth: '1400px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
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

          {/* 1. TOP SECTION: Massive Profile Image */}
          <div style={{ position: 'relative', width: '100%', textAlign: 'center', paddingBottom: '50px' }}>
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                style={{ position: 'relative', display: 'inline-block', width: '100%' }}
             >
                {/* Neon Ring / Aura behind image */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '90%', height: '90%', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,240,255,0.3) 0%, transparent 70%)',
                  filter: 'blur(80px)', zIndex: 0
                }}></div>
                
                <img 
                  src="/aboutpic.png" 
                  alt="Rasedul Karim" 
                  style={{ 
                    width: '100%', maxWidth: '100vw', height: 'auto', 
                    maxHeight: '90vh', objectFit: 'contain', 
                    position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.2))'
                  }} 
                />
             </motion.div>
          </div>

          {/* 2. RESUME CONTENT GRID */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '80px', 
            padding: '40px 60px 100px 60px',
            position: 'relative',
            zIndex: 2
          }}>
            
            {/* Left Side: Name, Title, Summary, Education, Courses */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Name Section */}
              <h1 style={{ 
                fontSize: 'clamp(3rem, 10vw, 6rem)', color: '#fff', margin: '0 0 10px 0', 
                fontWeight: '900', letterSpacing: '-2px', lineHeight: 0.9,
                textShadow: '0 0 40px rgba(0,240,255,0.5)'
              }}>
                RASEDUL KARIM
              </h1>
              <h2 style={{ fontSize: '1.5rem', color: '#00f0ff', margin: '0 0 30px 0', fontWeight: '400', letterSpacing: '2px', opacity: 0.9 }}>
                SOFTWARE AND WEB DEVELOPER & PHOTO EDITOR
              </h2>
              
              <div style={{ width: '100px', height: '4px', background: '#00f0ff', marginBottom: '30px' }}></div>
              
              {/* Career Summary */}
              <p style={{ color: '#E0E0E0', fontSize: '1.2rem', lineHeight: 1.8, textAlign: 'justify', marginBottom: '60px', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                I am a seasoned Software and Web Developer & Photo Editor with a deep passion for creating clean, efficient code and stunning visuals. My dedication lies in developing robust web solutions and high-quality designs that meet client needs and enhance user experience.
              </p>

              {/* Education Section */}
              <InfoSection title="Education" icon={GraduationCap}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#B0B0B0', fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#00f0ff" style={{ marginTop: '5px' }} />
                    <span>Supia Nuria Dhakil Madrasah</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <School size={18} color="#00f0ff" style={{ marginTop: '5px' }} />
                    <span>Teknaf Model Pailot High School (School)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <GraduationCap size={18} color="#00f0ff" style={{ marginTop: '5px' }} />
                    <span>Teknaf Degree College (College)</span>
                  </div>
                </div>
              </InfoSection>

              {/* Courses Section */}
              <InfoSection title="Courses" icon={Briefcase}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#B0B0B0', fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Rocket size={18} color="#00f0ff" style={{ marginTop: '5px' }} />
                    <div>
                      <span style={{ color: '#fff' }}>Programming Hero Specialized Learning</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#888' }}>from programminghero.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Monitor size={18} color="#00f0ff" style={{ marginTop: '5px' }} />
                    <div>
                      <span style={{ color: '#fff' }}>Web Development & Competitive Programming</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#888' }}>from phitron.io</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Palette size={18} color="#00f0ff" style={{ marginTop: '5px' }} />
                    <div>
                      <span style={{ color: '#fff' }}>Photo Editing & Digital Art Mastery</span>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#888' }}>Self-taught Excellence</p>
                    </div>
                  </div>
                </div>
              </InfoSection>
            </motion.div>

            {/* Right Side: Contact Floating Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ position: 'sticky', top: '100px', height: 'fit-content' }}
            >
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '30px',
                padding: '40px',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
              }}>
                <h3 style={{ margin: 0, color: '#00f0ff', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                  Contact Information
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderRadius: '15px' }}>
                    <Mail size={24} color="#00f0ff" />
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Email</p>
                    <p style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>rasedul.karim.dev@gmail.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderRadius: '15px' }}>
                    <Phone size={24} color="#00f0ff" />
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Phone</p>
                    <p style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>+8801871176267</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderRadius: '15px' }}>
                    <MapPin size={24} color="#00f0ff" />
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Address</p>
                    <p style={{ margin: 0, color: '#fff', fontSize: '1rem', lineHeight: '1.4' }}>
                      Natun Pollan Para, Teknaf, Cox's Bazar-4760
                    </p>
                  </div>
                </div>
                
                {/* Aesthetic decorative element */}
                <div style={{ 
                  marginTop: '20px', width: '100%', height: '100px', 
                  background: 'url(/profile.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center',
                  borderRadius: '20px', opacity: 0.3, filter: 'grayscale(1) brightness(0.5)'
                }}></div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
