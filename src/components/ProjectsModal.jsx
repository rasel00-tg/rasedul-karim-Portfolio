import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import ProjectsSection from './ProjectsSection';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ProjectsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '12px',
          boxSizing: 'border-box'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '860px',
            maxHeight: '92vh',
            background: isDark ? 'linear-gradient(145deg, #0F172A 0%, #131E2E 100%)' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 119, 182, 0.2)'}`,
            borderRadius: '24px',
            boxShadow: isDark 
              ? '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.15)' 
              : '0 20px 50px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Top Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(248, 250, 252, 0.8)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.35)'
              }}>
                <Globe size={18} strokeWidth={2.4} />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                }}>
                  {isBangla ? 'প্রজেক্ট ও পোর্টফোলিও শোকেস' : 'Projects & Portfolio Showcase'}
                </h3>
                <p style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)'
                }}>
                  {isBangla ? 'লাইভ ওয়েব ও মোবাইল অ্যাপ্লিকেশন' : 'Live Web & Mobile Applications'}
                </p>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Close"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Scrollable Project Content Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 24px 16px'
          }}>
            <ProjectsSection />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectsModal;
