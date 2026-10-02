import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Palette, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  FolderGit2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';

const DesignProjectsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'design_projects' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 10, 24, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '1550px',
            height: '94vh',
            maxHeight: '94vh',
            borderRadius: '24px',
            background: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            border: '1.5px solid rgba(0, 131, 143, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 131, 143, 0.35), 0 0 40px rgba(0, 240, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Header Bar */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? 'rgba(0, 131, 143, 0.12)' : 'rgba(0, 131, 143, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
                title={isBangla ? 'হোমবারে ফিরে যান' : 'Back to Home'}
                aria-label="Back"
              >
                <ArrowLeft size={17} />
              </button>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00838F 0%, #0097A7 100%)',
                boxShadow: '0 4px 18px rgba(0, 131, 143, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/design project.png" 
                  alt="Design Project" 
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    {isBangla ? 'ডিজাইন প্রজেক্ট শোকেস' : 'Design Project Showcase'}
                  </h2>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.35)',
                    color: '#00F0FF',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}>
                    LIVE SYNC
                  </span>
                </div>
                <p style={{
                  margin: '3px 0 0 0',
                  fontSize: '0.78rem',
                  color: isDark ? '#94A3B8' : '#64748B',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {isBangla 
                    ? 'ইউআই/ইউএক্স, ব্র্যান্ডিং ও আধুনিক ক্রিয়েটিভ ডিজাইনের লাইভ কালেকশন' 
                    : 'Curated UI/UX, branding, and interactive digital design prototypes'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                border: 'none',
                color: isDark ? '#FFFFFF' : '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Real-Time Firestore Stream Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <FirestoreStreamBuilder collectionName={COLLECTIONS.DESIGN_PROJECTS}>
              {({ data, loading }) => {
                const designs = data || [];
                const activeDesigns = designs.filter(d => d.status !== 'Draft');

                return (
                  <>
                    {/* Live Counter & Metrics Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '12px 18px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(0, 131, 143, 0.08)' : 'rgba(0, 131, 143, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(0, 131, 143, 0.25)' : 'rgba(0, 131, 143, 0.15)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#00F0FF" />
                        <span style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: isDark ? '#E2E8F0' : '#1E293B',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}>
                          {isBangla ? `মোট প্রজেক্ট: ${activeDesigns.length} টি সক্রিয়` : `Total: ${activeDesigns.length} Active Designs`}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.74rem',
                        color: '#00838F',
                        fontWeight: 800,
                        letterSpacing: '0.5px'
                      }}>
                        ⚡ Real-time Firestore Stream
                      </span>
                    </div>

                    {/* Designs Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '22px'
                    }}>
                      {activeDesigns.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -4, scale: 1.015 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            borderRadius: '18px',
                            background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(248, 250, 252, 0.9)',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Preview Image */}
                          <div style={{
                            width: '100%',
                            height: '150px',
                            position: 'relative',
                            background: '#0b1329',
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={item.imageUrl || '/app1.png'} 
                              alt={item.title}
                              onError={(e) => { e.target.src = '/app1.png'; }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                            {item.category && (
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                padding: '3px 8px',
                                borderRadius: '8px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(6px)',
                                color: '#00F0FF',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}>
                                {item.category}
                              </div>
                            )}
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: item.status === 'Draft' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)',
                              color: '#FFFFFF',
                              fontSize: '0.66rem',
                              fontWeight: 800
                            }}>
                              {item.status || 'Active'}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            justifyContent: 'space-between'
                          }}>
                            <div>
                              <h3 style={{
                                margin: '0 0 6px 0',
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                              }}>
                                {item.title}
                              </h3>
                              <p style={{
                                margin: '0 0 14px 0',
                                fontSize: '0.78rem',
                                lineHeight: 1.45,
                                color: isDark ? '#94A3B8' : '#64748B',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                              }}>
                                {item.subtitle || item.description}
                              </p>
                            </div>

                            {item.projectUrl ? (
                              <a
                                href={item.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '9px 14px',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #00838F 0%, #0097A7 100%)',
                                  color: '#FFFFFF',
                                  textDecoration: 'none',
                                  fontSize: '0.78rem',
                                  fontWeight: 800,
                                  boxShadow: '0 4px 14px rgba(0, 131, 143, 0.35)',
                                  transition: 'all 0.2s ease',
                                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                                }}
                              >
                                <span>{isBangla ? 'প্রজেক্ট লিংক দেখুন' : 'Explore Project (Behance / Figma)'}</span>
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              <div style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                color: isDark ? '#94A3B8' : '#64748B',
                                fontSize: '0.74rem',
                                textAlign: 'center',
                                fontWeight: 700
                              }}>
                                {isBangla ? 'প্রিভিউ মোড' : 'Preview Showcase'}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                );
              }}
            </FirestoreStreamBuilder>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DesignProjectsModal;
