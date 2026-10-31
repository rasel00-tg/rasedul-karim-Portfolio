import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, X, ExternalLink, Star, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';

const ToolDetailView = ({ tool, onBack, onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();

  const title = tool?.name || tool?.title || 'Tool Details';
  const category = tool?.category || 'General';
  const rating = tool?.rating || '5.0';
  const logoUrl = tool?.thumbnailUrl || '/favorite.png';
  const officialUrl = tool?.officialUrl || tool?.url || '#';
  const fullText = tool?.whyLove || tool?.whyPrefer || tool?.description || tool?.note || '';

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col relative z-10 pb-32"
      style={{
        width: '100%',
        maxWidth: '896px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        paddingBottom: '128px'
      }}
    >
      {/* Top Navigation Bar: Back & Close Buttons */}
      <div
        className="flex items-center justify-between w-full mb-4 sm:mb-6"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          width: '100%'
        }}
      >
        <button
          onClick={onBack}
          aria-label="Back to Tools Library"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white shadow-sm active:scale-95 transition-all cursor-pointer"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          title={isBangla ? 'লাইব্রেরিতে ফিরে যান' : 'Back to Library'}
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>

        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#2563EB',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
          }}
        >
          {isBangla ? 'টুলস বিস্তারিত বিবরণ' : 'Tool Specification'}
        </span>

        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-red-500 dark:hover:text-red-400 shadow-sm active:scale-95 transition-all cursor-pointer"
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            title={isBangla ? 'বন্ধ করুন' : 'Close'}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        ) : (
          <div style={{ width: '40px' }} />
        )}
      </div>

      {/* Side-by-Side Content Layout on Desktop (md:flex md:flex-row md:items-start md:gap-8 max-w-4xl mx-auto w-full) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full flex flex-col md:flex md:flex-row md:items-start md:gap-8"
      >
        {/* Left Column (বামপাশে): Fixed Compact Icon, Name, Badges & Action */}
        <div
          className="w-full md:w-72 md:shrink-0 flex flex-col items-center md:items-start text-center md:text-left bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/90 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl"
          style={{
            boxSizing: 'border-box'
          }}
        >
          {/* Strictly Hardcoded Icon Frame: Mobile w-16 h-16, Desktop max w-24 h-24 */}
          <div
            className="w-16 h-16 md:w-24 md:h-24 max-w-[96px] max-h-[96px] shrink-0 rounded-2xl md:rounded-3xl p-2 bg-white/95 dark:bg-slate-800/95 border-2 border-blue-200/60 dark:border-blue-500/30 shadow-md flex items-center justify-center overflow-hidden mb-3.5 mx-auto md:mx-0"
            style={{
              width: '80px',
              height: '80px',
              maxWidth: '96px',
              maxHeight: '96px',
              minWidth: '64px',
              minHeight: '64px',
              flexShrink: 0
            }}
          >
            <img
              src={logoUrl}
              alt={title}
              className="max-w-full max-h-full object-contain shrink-0"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
              onError={(e) => { e.target.src = '/favorite.png'; }}
            />
          </div>

          {/* Tool Name */}
          <h1
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2"
            style={{
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
            }}
          >
            {title}
          </h1>

          {/* Badges Container */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(29, 104, 255, 0.12)',
                border: '1px solid rgba(29, 104, 255, 0.3)',
                color: '#1D68FF',
                fontSize: '0.74rem',
                fontWeight: 800
              }}
            >
              {category}
            </span>

            {rating && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(254, 243, 199, 0.9)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#D97706',
                  fontSize: '0.74rem',
                  fontWeight: 800
                }}
              >
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <span>{rating}</span>
              </div>
            )}

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={11} />
              <span>{isBangla ? 'ভেরিফাইড' : 'Verified'}</span>
            </div>
          </div>

          {/* Official Website Action Button (Left side on Desktop) */}
          {officialUrl && officialUrl !== '#' && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-5 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-98 transition-all"
              style={{
                textDecoration: 'none',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
              }}
            >
              <span>{isBangla ? 'অফিসিয়াল ওয়েবসাইট ↗' : 'Official Website ↗'}</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Right Column (ডানপাশে): Full Narrative in Frosted Glass Reading Box */}
        <div
          className="flex-1 bg-white/70 dark:bg-slate-800/70 p-6 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100 backdrop-blur-2xl border border-white/80 dark:border-white/10 w-full mt-4 md:mt-0 flex flex-col justify-between"
          style={{
            boxSizing: 'border-box'
          }}
        >
          <div>
            {/* Box Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '12px',
                marginBottom: '16px',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.9)'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🎯</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: isDark ? '#F1F5F9' : '#0F172A',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}
              >
                {isBangla ? 'কেন এটি আমার পছন্দের / ব্যবহারের কারণ' : 'Why I Love & Prefer This Tool'}
              </h2>
            </div>

            {/* Full Detailed Narrative */}
            <div
              className="leading-relaxed text-sm sm:text-base text-slate-800 dark:text-slate-100"
              style={{
                whiteSpace: 'pre-line',
                lineHeight: 1.85,
                fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
              }}
            >
              {fullText || (isBangla 
                ? 'এই টুলটি ব্যক্তিগত কাজের গতি ও ক্রিয়েটিভিটি বহুগুণ বাড়িয়ে দেয়।' 
                : 'This tool significantly accelerates productivity and creative workflow.')}
            </div>
          </div>

          {/* Mobile Direct Link at bottom of text */}
          {officialUrl && officialUrl !== '#' && (
            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/50 md:hidden text-center">
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md active:scale-98 transition-all"
                style={{
                  textDecoration: 'none',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}
              >
                <span>{isBangla ? 'অফিসিয়াল ওয়েবসাইটে যান ↗' : 'Open Official Tool ↗'}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </motion.div>

      {/* Extra Bottom Clearance Spacer for Touch and Desktop Scrolling */}
      <div className="h-32 w-full shrink-0" style={{ minHeight: '128px' }} />
    </div>
  );
};

const ToolDetail = ({ tool, toolId, onBack, onClose }) => {
  const { isDark } = useTheme();

  // PopScope / Browser Back Interception to return to Tools Library
  useEffect(() => {
    window.history.pushState({ modal: 'tool_detail' }, '');
    const handlePopState = () => {
      if (onBack) onBack();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack]);

  return (
    <div
      className="w-full min-h-screen relative flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8"
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
        zIndex: 100000,
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
          top: '6%',
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
          bottom: '10%',
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
          top: '3%',
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
          bottom: '5%',
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

      {/* If tool object is passed directly, render immediately */}
      {tool ? (
        <ToolDetailView tool={tool} onBack={onBack} onClose={onClose} />
      ) : toolId ? (
        /* Otherwise retrieve from Firestore StreamBuilder */
        <FirestoreStreamBuilder collectionName={COLLECTIONS.FAVORITE_TOOLS}>
          {({ data }) => {
            const foundTool = (data || []).find((item) => item.id === toolId);
            return (
              <ToolDetailView
                tool={foundTool || { name: 'Tool Not Found', whyLove: 'No details available.' }}
                onBack={onBack}
                onClose={onClose}
              />
            );
          }}
        </FirestoreStreamBuilder>
      ) : (
        <ToolDetailView tool={{}} onBack={onBack} onClose={onClose} />
      )}
    </div>
  );
};

export default ToolDetail;
