import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Sparkles, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Wrench,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';

const FavoriteToolsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'favorite_tools' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  const categories = [
    { id: 'All', labelEn: 'All Tools', labelBn: 'সকল টুলস' },
    { id: 'Design', labelEn: 'Design', labelBn: 'ডিজাইন' },
    { id: 'Coding', labelEn: 'Coding', labelBn: 'কোডিং' },
    { id: 'Productivity', labelEn: 'Productivity', labelBn: 'প্রোডাক্টিভিটি' }
  ];

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
            border: '1.5px solid rgba(245, 127, 23, 0.4)',
            boxShadow: '0 25px 60px rgba(245, 127, 23, 0.35), 0 0 40px rgba(255, 179, 0, 0.15)',
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
            background: isDark ? 'rgba(245, 127, 23, 0.12)' : 'rgba(245, 127, 23, 0.06)'
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
                background: 'linear-gradient(135deg, #F57F17 0%, #FF8F00 100%)',
                boxShadow: '0 4px 18px rgba(245, 127, 23, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img 
                  src="/favorite.png" 
                  alt="Favorite" 
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
                    {isBangla ? 'ফেভারিট টুলস ও রিসোর্স লাইব্রেরি' : 'Favorite Tools & Resource Library'}
                  </h2>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(255, 179, 0, 0.15)',
                    border: '1px solid rgba(255, 179, 0, 0.35)',
                    color: '#FFB300',
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
                    ? 'আমার প্রতিদিনের নির্ভরযোগ্য সফটওয়্যার, কোডিং ও ক্রিয়েটিভ টুলস' 
                    : 'Personal curated stack of daily design, engineering & productivity essentials'}
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
            <FirestoreStreamBuilder collectionName={COLLECTIONS.FAVORITE_TOOLS}>
              {({ data, loading }) => {
                const tools = data || [];
                const filteredTools = activeCategory === 'All' 
                  ? tools 
                  : tools.filter(t => t.category?.toLowerCase() === activeCategory.toLowerCase());

                return (
                  <>
                    {/* Category Filter Pills & Counter */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {categories.map((cat) => {
                          const isActive = activeCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setActiveCategory(cat.id)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '12px',
                                border: `1px solid ${isActive ? '#FF8F00' : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                background: isActive 
                                  ? 'linear-gradient(135deg, #F57F17 0%, #FF8F00 100%)' 
                                  : isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                                color: isActive ? '#FFFFFF' : isDark ? '#CBD5E1' : '#475569',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                              }}
                            >
                              {isBangla ? cat.labelBn : cat.labelEn}
                            </button>
                          );
                        })}
                      </div>

                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#F57F17',
                        fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                      }}>
                        {isBangla ? `${filteredTools.length} টি টুলস প্রদর্শিত` : `${filteredTools.length} Tools Available`}
                      </span>
                    </div>

                    {/* Tools Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                      gap: '20px'
                    }}>
                      {filteredTools.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -3, scale: 1.015 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            borderRadius: '18px',
                            background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(248, 250, 252, 0.95)',
                            border: `1px solid ${isDark ? 'rgba(255, 179, 0, 0.2)' : 'rgba(245, 127, 23, 0.18)'}`,
                            padding: '16px',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            {/* Top row: Thumbnail & Category Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: '#0b1329',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 179, 0, 0.3)'
                              }}>
                                <img 
                                  src={item.thumbnailUrl || '/favorite.png'} 
                                  alt={item.name}
                                  onError={(e) => { e.target.src = '/favorite.png'; }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '8px',
                                  background: 'rgba(245, 127, 23, 0.15)',
                                  color: '#FF8F00',
                                  fontSize: '0.68rem',
                                  fontWeight: 800
                                }}>
                                  {item.category || 'General'}
                                </span>
                                {item.rating && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FFB300', fontSize: '0.74rem', fontWeight: 800 }}>
                                    <Star size={12} fill="#FFB300" />
                                    <span>{item.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h3 style={{
                              margin: '0 0 4px 0',
                              fontSize: '1.02rem',
                              fontWeight: 800,
                              color: isDark ? '#FFFFFF' : '#0F172A',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                            }}>
                              {item.name || item.title}
                            </h3>

                            <p style={{
                              margin: '0 0 14px 0',
                              fontSize: '0.78rem',
                              lineHeight: 1.45,
                              color: isDark ? '#94A3B8' : '#64748B',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                            }}>
                              {item.description || item.note || 'Essential curated professional software.'}
                            </p>
                          </div>

                          {item.officialUrl && (
                            <a
                              href={item.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #F57F17 0%, #FF8F00 100%)',
                                color: '#FFFFFF',
                                textDecoration: 'none',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                boxShadow: '0 3px 10px rgba(245, 127, 23, 0.3)',
                                transition: 'all 0.2s ease',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                              }}
                            >
                              <span>{isBangla ? 'অফিশিয়াল সাইট' : 'Visit Official Website'}</span>
                              <ExternalLink size={13} />
                            </a>
                          )}
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

export default FavoriteToolsModal;
