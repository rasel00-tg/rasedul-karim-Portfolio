import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Rocket, 
  Calendar, 
  GitBranch, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';

const UpcomingProjectsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'upcoming_projects' }, '');
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
            border: '1.5px solid rgba(106, 27, 154, 0.4)',
            boxShadow: '0 25px 60px rgba(106, 27, 154, 0.35), 0 0 40px rgba(168, 85, 247, 0.15)',
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
            background: isDark ? 'rgba(106, 27, 154, 0.12)' : 'rgba(106, 27, 154, 0.06)'
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
                background: 'linear-gradient(135deg, #6A1B9A 0%, #7B1FA2 100%)',
                boxShadow: '0 4px 18px rgba(106, 27, 154, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/upcoming project.png" 
                  alt="Upcoming Project" 
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
                    {isBangla ? 'আপকামিং প্রজেক্ট ও ভবিষ্যৎ পাইপলাইন' : 'Upcoming Projects & Pipeline'}
                  </h2>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(192, 132, 252, 0.15)',
                    border: '1px solid rgba(192, 132, 252, 0.35)',
                    color: '#C084FC',
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
                    ? 'চলমান ও ভবিষ্যৎ সফটওয়্যার সিস্টেম, ডেভেলপমেন্ট স্টেজ ও সম্ভাব্য রিলিজ' 
                    : 'Active systems under development, milestone stages & target releases'}
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
            <FirestoreStreamBuilder collectionName={COLLECTIONS.UPCOMING_PROJECTS}>
              {({ data, loading }) => {
                const projects = data || [];

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
                      background: isDark ? 'rgba(106, 27, 154, 0.08)' : 'rgba(106, 27, 154, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(106, 27, 154, 0.25)' : 'rgba(106, 27, 154, 0.15)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Rocket size={16} color="#C084FC" />
                        <span style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: isDark ? '#E2E8F0' : '#1E293B',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}>
                          {isBangla ? `মোট আসন্ন প্রজেক্ট: ${projects.length} টি পাইপলাইনে` : `Pipeline: ${projects.length} Upcoming Releases`}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.74rem',
                        color: '#A855F7',
                        fontWeight: 800,
                        letterSpacing: '0.5px'
                      }}>
                        ⚡ Real-time Firestore Stream
                      </span>
                    </div>

                    {/* Upcoming Projects Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
                      {projects.map((item) => {
                        const progressVal = Math.min(100, Math.max(0, parseInt(item.progress || '0', 10)));
                        return (
                          <motion.div
                            key={item.id}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              padding: '20px',
                              borderRadius: '20px',
                              background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(248, 250, 252, 0.95)',
                              border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(106, 27, 154, 0.15)'}`,
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '14px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <h3 style={{
                                    margin: 0,
                                    fontSize: '1.05rem',
                                    fontWeight: 800,
                                    color: isDark ? '#FFFFFF' : '#0F172A',
                                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                                  }}>
                                    {item.title || item.name}
                                  </h3>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    color: '#C084FC',
                                    fontSize: '0.68rem',
                                    fontWeight: 800
                                  }}>
                                    {item.status || 'In Development'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '0.74rem' }}>
                                  <Calendar size={13} color="#C084FC" />
                                  <span>{isBangla ? 'রিলিজ লক্ষ্য:' : 'Target Release:'} <strong>{item.releaseDate || 'TBD'}</strong></span>
                                </div>
                              </div>

                              {/* Action Links */}
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {(item.demoUrl || item.githubUrl) && (
                                  <a
                                    href={item.demoUrl || item.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '7px 12px',
                                      borderRadius: '10px',
                                      background: 'rgba(168, 85, 247, 0.15)',
                                      border: '1px solid rgba(168, 85, 247, 0.35)',
                                      color: isDark ? '#E2E8F0' : '#1E293B',
                                      textDecoration: 'none',
                                      fontSize: '0.76rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    <GitBranch size={14} />
                                    <span>Preview / Repo</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>

                            <p style={{
                              margin: 0,
                              fontSize: '0.82rem',
                              lineHeight: 1.5,
                              color: isDark ? '#94A3B8' : '#475569',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                            }}>
                              {item.description}
                            </p>

                            {/* Development Progress Bar */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.74rem', color: isDark ? '#CBD5E1' : '#475569', fontWeight: 700 }}>
                                  {isBangla ? 'ডেভেলপমেন্ট অগ্রগতি:' : 'Development Stage / Progress:'}
                                </span>
                                <span style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  color: '#C084FC',
                                  fontFamily: "'Space Grotesk', sans-serif"
                                }}>
                                  {progressVal}%
                                </span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                borderRadius: '10px',
                                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                                overflow: 'hidden'
                              }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressVal}%` }}
                                  transition={{ duration: 0.85, ease: 'easeOut' }}
                                  style={{
                                    height: '100%',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(90deg, #6A1B9A 0%, #C084FC 100%)',
                                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                                  }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
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

export default UpcomingProjectsModal;
