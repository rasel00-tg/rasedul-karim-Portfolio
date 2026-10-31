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
  Sparkle,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';
import ToolDetail from './ToolDetail';

const FavoriteToolsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('AI Tools');
  const [selectedTool, setSelectedTool] = useState(null);

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'favorite_tools' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  // Categories as strictly required: AI Tools, Editing Apps, Design
  const categories = [
    { id: 'AI Tools', labelEn: 'AI Tools', labelBn: 'এআই টুলস' },
    { id: 'Editing Apps', labelEn: 'Editing Apps', labelBn: 'এডিটিং অ্যাপস' },
    { id: 'Design', labelEn: 'Design', labelBn: 'ডিজাইন' }
  ];

  if (selectedTool) {
    return (
      <ToolDetail
        tool={selectedTool}
        onBack={() => setSelectedTool(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#EEF3FD] to-[#E6EEFC] dark:from-[#0B101B] dark:via-[#0F172A] dark:to-[#0B1324] relative flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg, #0B101B 0%, #0F172A 50%, #0B1324 100%)'
            : 'linear-gradient(135deg, #F5F8FF 0%, #EEF3FD 50%, #E6EEFC 100%)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
          padding: '16px'
        }}
      >
        {/* Ambient Floating Blue Spheres & Frosted Glass Layer */}
        {/* Right Glowing Blue Sphere */}
        <div
          className="w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-tr from-[#1D68FF] to-[#4F95FF] rounded-full blur-xs opacity-90 shadow-[0_10px_35px_rgba(29,104,255,0.4)] pointer-events-none"
          style={{
            position: 'absolute',
            top: '8%',
            right: '8%',
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

        {/* Left Accent Blue Ball */}
        <div
          className="w-28 h-28 sm:w-36 sm:h-36 bg-[#2563EB] rounded-full blur-xs opacity-85 shadow-[0_8px_30px_rgba(37,99,235,0.35)] pointer-events-none"
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '6%',
            width: '150px',
            height: '150px',
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
            top: '4%',
            right: '5%',
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
            bottom: '6%',
            left: '4%',
            width: '230px',
            height: '230px',
            borderRadius: '50%',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.65)',
            pointerEvents: 'none'
          }}
        />

        {/* Central Content Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '20px',
              background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.82)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 8px 24px rgba(29, 104, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              {/* Blue Tool Wrench Icon */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1D68FF 0%, #00F0FF 100%)',
                  boxShadow: '0 4px 16px rgba(29, 104, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Wrench size={20} color="#FFFFFF" strokeWidth={2.2} />
              </div>

              {/* Title & Subtitle */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '1.18rem',
                      fontWeight: 900,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                      lineHeight: 1.2
                    }}
                  >
                    {isBangla ? 'ফেভারিট টুলস ও রিসোর্স লাইব্রেরি' : 'Favourite Tools & Resources Library'}
                  </h1>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(29, 104, 255, 0.12)',
                      border: '1px solid rgba(29, 104, 255, 0.3)',
                      color: '#1D68FF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}
                  >
                    LIVE SYNC
                  </span>
                </div>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.76rem',
                    color: isDark ? '#94A3B8' : '#64748B',
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                  }}
                >
                  {isBangla 
                    ? 'আমার প্রতিদিনের নির্ভরযোগ্য এআই, এডিটিং ও ডিজাইন টুলসের সংগ্রহশালা' 
                    : 'Personal curated stack of daily AI, editing apps & design essentials'}
                </p>
              </div>
            </div>

            {/* Sleek Corner Close (✕) Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-xs active:scale-90 transition-all text-sm font-bold shrink-0"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(226, 232, 240, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#94A3B8' : '#64748B',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#EF4444';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isDark ? '#94A3B8' : '#64748B';
                e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : '1px solid rgba(226, 232, 240, 0.85)';
              }}
              title={isBangla ? 'বন্ধ করুন' : 'Close'}
            >
              <X size={15} strokeWidth={2.4} />
            </button>
          </div>

          {/* Real-Time Firestore Stream Content */}
          <FirestoreStreamBuilder collectionName={COLLECTIONS.FAVORITE_TOOLS}>
            {({ data, loading }) => {
              const tools = data || [];
              const filteredTools = tools.filter(t => {
                const itemCat = (t.category || '').toLowerCase();
                const targetCat = activeCategory.toLowerCase();
                if (targetCat === 'ai tools') {
                  return itemCat.includes('ai') || itemCat.includes('artificial');
                }
                if (targetCat === 'editing apps') {
                  return itemCat.includes('edit') || itemCat.includes('video') || itemCat.includes('photo') || itemCat.includes('media');
                }
                if (targetCat === 'design') {
                  return itemCat.includes('design') || itemCat.includes('ui') || itemCat.includes('ux') || itemCat.includes('art');
                }
                return itemCat === targetCat;
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Category Filter Pills Bar Pulled Upward */}
                  <div
                    className="flex items-center justify-between flex-wrap gap-2 py-1.5 px-3 sm:px-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-xs mt-1.5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      padding: '6px 14px',
                      marginTop: '2px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.85)',
                      boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.25)' : '0 4px 16px rgba(29, 104, 255, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm'
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-white/50 hover:bg-white/90'
                            }`}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: isActive
                                ? '1px solid #2563EB'
                                : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.7)'),
                              background: isActive
                                ? 'linear-gradient(135deg, #2563EB 0%, #0ea5e9 100%)'
                                : (isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.65)'),
                              color: isActive ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#475569'),
                              boxShadow: isActive ? '0 3px 12px rgba(37, 99, 235, 0.35)' : 'none',
                              transition: 'all 0.15s ease',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                            }}
                          >
                            <span>{isBangla ? cat.labelBn : cat.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>

                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#2563EB',
                        fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                      }}
                    >
                      {isBangla ? `${filteredTools.length} টি টুলস সক্রিয়` : `${filteredTools.length} Tools Active`}
                    </span>
                  </div>

                  {/* Tools Responsive Grid Layout (Mobile 2/3 cols, Desktop 4/5 cols) */}
                  <div className="tools-library-grid pb-32" style={{ paddingBottom: '128px' }}>
                    {filteredTools.map((item) => {
                      const whyLoveText = item.whyLove || item.whyPrefer || item.description || item.note;
                      const hasHighlight = !!whyLoveText;

                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -4, scale: 1.015 }}
                          transition={{ duration: 0.2 }}
                          className="bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-blue-400/50 transition-all flex flex-col justify-between"
                          style={{
                            background: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.85)',
                            borderRadius: '20px',
                            padding: '16px',
                            boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(29, 104, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div>
                            {/* App/Tool Logo or Thumbnail: Circular Premium Frame */}
                            <div
                              className="w-14 h-14 rounded-full mx-auto p-1 bg-white/90 border border-blue-100 shadow-sm object-cover"
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                margin: '0 auto 10px auto',
                                padding: '3px',
                                background: isDark ? 'rgba(15, 23, 42, 0.9)' : '#FFFFFF',
                                border: '2px solid rgba(29, 104, 255, 0.35)',
                                boxShadow: '0 4px 14px rgba(29, 104, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              <img 
                                src={item.thumbnailUrl || '/favorite.png'} 
                                alt={item.name || item.title}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => { e.target.src = '/favorite.png'; }}
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            </div>

                            {/* Category Pill Tag */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  background: 'rgba(29, 104, 255, 0.12)',
                                  color: '#1D68FF',
                                  fontSize: '0.68rem',
                                  fontWeight: 800
                                }}
                              >
                                {item.category || activeCategory}
                              </span>
                              {item.rating && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E0B', fontSize: '0.72rem', fontWeight: 800 }}>
                                  <Star size={11} fill="#F59E0B" />
                                  <span>{item.rating}</span>
                                </div>
                              )}
                            </div>

                            {/* Tool Name: Bold Heading */}
                            <h3
                              style={{
                                margin: '0 0 6px 0',
                                fontSize: '1.02rem',
                                fontWeight: 800,
                                textAlign: 'center',
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                              }}
                            >
                              {item.name || item.title}
                            </h3>

                            {/* Why I Love This Special Highlight Box */}
                            {hasHighlight && (
                              <div
                                className="bg-blue-50/80 dark:bg-slate-800/80 rounded-xl p-2 text-[11px] text-blue-900 dark:text-blue-200 border border-blue-200/50 mt-2"
                                style={{
                                  background: isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(239, 246, 255, 0.85)',
                                  border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(191, 219, 254, 0.7)',
                                  borderRadius: '12px',
                                  padding: '8px 10px',
                                  fontSize: '0.72rem',
                                  lineHeight: 1.45,
                                  color: isDark ? '#BFDBFE' : '#1E3A8A',
                                  marginTop: '8px',
                                  textAlign: 'left'
                                }}
                              >
                                <span style={{ fontWeight: 800, color: '#2563EB', display: 'block', marginBottom: '2px' }}>
                                  🎯 Why I Love This:
                                </span>
                                <span
                                  className="line-clamp-2"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {whyLoveText}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedTool(item)}
                                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '2px 0 0 0',
                                    cursor: 'pointer',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: isDark ? '#38BDF8' : '#2563EB',
                                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                                  }}
                                >
                                  <span>{isBangla ? 'বিস্তারিত' : 'View Details'}</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            )}

                            {!hasHighlight && (
                              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedTool(item)}
                                  className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: isDark ? '#38BDF8' : '#2563EB',
                                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                                  }}
                                >
                                  <span>{isBangla ? 'বিস্তারিত' : 'View Details'}</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Open Tool Action Button */}
                          {item.officialUrl ? (
                            <a
                              href={item.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '9px 12px',
                                marginTop: '12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #1D68FF 0%, #2563EB 100%)',
                                color: '#FFFFFF',
                                textDecoration: 'none',
                                fontSize: '0.80rem',
                                fontWeight: 800,
                                boxShadow: '0 4px 14px rgba(29, 104, 255, 0.3)',
                                transition: 'all 0.2s ease',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                              }}
                            >
                              <span>{isBangla ? 'টুলটি ওপেন করুন' : 'Open Tool'}</span>
                              <ExternalLink size={13} />
                            </a>
                          ) : (
                            <div style={{ height: '8px' }} />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  {/* Bottom Clearance Spacer for Smooth Unhindered Mobile & Desktop Scrolling */}
                  <div className="h-28 sm:h-32 w-full shrink-0" style={{ minHeight: '112px' }} />
                </div>
              );
            }}
          </FirestoreStreamBuilder>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FavoriteToolsModal;
