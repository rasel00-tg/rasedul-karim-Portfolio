import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Palette, 
  ArrowLeft,
  Home as HomeIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';

const DesignProjectsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'design_projects' }, '');
    const handlePopState = () => {
      if (onClose) onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return (
    <FirestoreStreamBuilder collectionName={COLLECTIONS.DESIGN_PROJECTS || 'design_projects'}>
      {() => (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#EEF3FD] to-[#E6EEFC] dark:from-[#0B101B] dark:via-[#0F172A] dark:to-[#0B1324] relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              minHeight: '100vh',
              background: isDark
                ? 'linear-gradient(135deg, #0B101B 0%, #0F172A 50%, #0B1324 100%)'
                : 'linear-gradient(135deg, #F5F8FF 0%, #EEF3FD 50%, #E6EEFC 100%)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Right Sleek Corner Close (✕) Button */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 30
              }}
            >
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm active:scale-95 transition-all text-sm font-bold z-20 cursor-pointer"
                title={isBangla ? 'বন্ধ করুন' : 'Close'}
              >
                <X size={17} strokeWidth={2.4} />
              </button>
            </div>

            {/* Top Left Back Button */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 30
              }}
            >
              <button
                onClick={onClose}
                aria-label="Back to Home"
                className="w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm active:scale-95 transition-all text-sm font-bold z-20 cursor-pointer"
                title={isBangla ? 'হোমে ফিরে যান' : 'Back'}
              >
                <ArrowLeft size={17} strokeWidth={2.4} />
              </button>
            </div>

            {/* Ambient Background Orbs & Frosted Glass Layers */}
            {/* Right Glowing Blue Sphere */}
            <div
              className="absolute top-24 -right-10 w-44 h-44 sm:w-60 sm:h-60 bg-gradient-to-tr from-[#1D68FF] to-[#4F95FF] rounded-full blur-xs opacity-90 shadow-[0_10px_35px_rgba(29,104,255,0.4)] pointer-events-none"
              style={{
                position: 'absolute',
                top: '10%',
                right: '-30px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1D68FF 0%, #4F95FF 100%)',
                opacity: isDark ? 0.75 : 0.9,
                boxShadow: '0 10px 45px rgba(29, 104, 255, 0.45), 0 0 70px rgba(79, 149, 255, 0.35)',
                pointerEvents: 'none',
                filter: 'blur(3px)'
              }}
            />

            {/* Left Accent Blue Sphere */}
            <div
              className="absolute top-[50%] -left-12 w-28 h-28 sm:w-40 sm:h-40 bg-[#2563EB] rounded-full blur-xs opacity-85 shadow-[0_8px_30px_rgba(37,99,235,0.35)] pointer-events-none"
              style={{
                position: 'absolute',
                top: '50%',
                left: '-40px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: '#2563EB',
                opacity: isDark ? 0.7 : 0.85,
                boxShadow: '0 8px 35px rgba(37, 99, 235, 0.4), 0 0 50px rgba(37, 99, 235, 0.3)',
                pointerEvents: 'none',
                filter: 'blur(2px)'
              }}
            />

            {/* Overlapping Translucent Frosted Glass Bubble (Right) */}
            <div
              className="backdrop-blur-2xl border border-white/60 bg-white/20 rounded-full pointer-events-none"
              style={{
                position: 'absolute',
                top: '6%',
                right: '4%',
                width: '310px',
                height: '310px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.65)',
                pointerEvents: 'none'
              }}
            />

            {/* Overlapping Translucent Frosted Glass Bubble (Left) */}
            <div
              className="backdrop-blur-2xl border border-white/60 bg-white/20 rounded-full pointer-events-none"
              style={{
                position: 'absolute',
                bottom: '8%',
                left: '3%',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.65)',
                pointerEvents: 'none'
              }}
            />

            {/* 1. Central Frosted Glass Notice Card Frame (Solid Visible Glass Card) */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[360px] sm:max-w-md mx-auto p-6 sm:p-8 rounded-[28px] text-center flex flex-col items-center relative z-10"
              style={{
                width: '100%',
                maxWidth: '380px',
                margin: '0 auto',
                padding: '28px 24px',
                borderRadius: '28px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10,
                background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: isDark
                  ? '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 30px rgba(29, 104, 255, 0.15)'
                  : '0 15px 35px rgba(29, 104, 255, 0.12), 0 0 20px rgba(255, 255, 255, 0.8)',
                boxSizing: 'border-box'
              }}
            >
              {/* 2. Colorful Animated Floating Icon (Vibrant Animated Icon Box) */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-bounce"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #1D68FF 0%, #00D2FF 100%)',
                  boxShadow: '0 10px 25px rgba(29, 104, 255, 0.35)'
                }}
              >
                <Palette 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    color: '#FFFFFF' 
                  }} 
                  strokeWidth={2.4} 
                />
              </div>

              {/* 3. Under Maintenance Badge */}
              <span
                style={{
                  background: '#FFF3CD',
                  color: '#B7791F',
                  border: '1px solid #FFEBAA',
                  padding: '4px 14px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}
              >
                ● {isBangla ? 'আপডেট চলমান' : 'Under Maintenance'}
              </span>

              {/* Page Title */}
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  marginBottom: '8px',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                }}
              >
                {isBangla ? 'ডিজাইন প্রজেক্টস' : 'Design Projects'}
              </h2>

              {/* Notice Message */}
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDark ? '#CBD5E1' : '#334155',
                  lineHeight: '1.6',
                  maxWidth: '300px',
                  margin: '0 auto',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}
              >
                এই ফিচারটি সাময়িক বন্ধ আছে, আপডেট সম্পন্ন হলে পূনরায় সচল হবে
              </p>

              {/* 4. Premium Vibrant Blue "Back to Home" Button */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px 20px',
                  background: 'linear-gradient(90deg, #1D68FF 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(29, 104, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}
              >
                <HomeIcon size={16} color="#FFFFFF" />
                <span>← {isBangla ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </FirestoreStreamBuilder>
  );
};

export default DesignProjectsModal;
