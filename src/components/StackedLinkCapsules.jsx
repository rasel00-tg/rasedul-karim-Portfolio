import React, { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, 
  ChevronRight, 
  Palette, 
  Code2, 
  Star, 
  Sparkles, 
  Mail, 
  Download, 
  Gift, 
  Tag, 
  ShoppingBag, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  Zap,
  Play,
  X,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS } from '../services/featuresService';

const SponsorCarouselView = memo(({
  banners,
  currentItem,
  safeIndex,
  onSelectSlide,
  onOpenDetail,
  selectedBanner,
  onCloseDetail,
  isDark,
  isBangla
}) => {
  const bannerCount = banners.length || 1;

  // 3-Second Auto-Rotation Timer
  useEffect(() => {
    if (bannerCount <= 1) return;
    const timer = setInterval(() => {
      onSelectSlide((prev) => (prev + 1) % bannerCount);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerCount, onSelectSlide]);

  const [loadedMap, setLoadedMap] = useState({});
  const isCurrentImageLoaded = !!(currentItem?.imageUrl && loadedMap[currentItem.imageUrl]);

  // Pre-caching Pipeline into Memory & Preload link tags
  useEffect(() => {
    banners.forEach((b) => {
      if (b?.imageUrl) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          setLoadedMap((prev) => ({ ...prev, [b.imageUrl]: true }));
        };
        img.src = b.imageUrl;
        if (!document.querySelector(`link[href="${b.imageUrl}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = b.imageUrl;
          link.fetchPriority = 'high';
          document.head.appendChild(link);
        }
      }
    });
  }, [banners]);

  const handleDragEnd = useCallback((event, info) => {
    if (info.offset.x < -30) {
      onSelectSlide((prev) => (prev + 1) % bannerCount);
    } else if (info.offset.x > 30) {
      onSelectSlide((prev) => (prev - 1 + bannerCount) % bannerCount);
    }
  }, [bannerCount, onSelectSlide]);

  return (
    <>
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        marginTop: '4px',
        paddingBottom: 'max(8rem, calc(80px + env(safe-area-inset-bottom, 32px)))'
      }}>
        {/* PURE VISUAL CARD: Strictly NO hints, NO labels, NO click text */}
        <motion.div
          className="w-full aspect-[16/7] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-800/50 relative cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.22 }}
          onClick={() => onOpenDetail(currentItem)}
          style={{
            width: '100%',
            aspectRatio: '16 / 7',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            border: isDark ? '1.5px solid rgba(255, 255, 255, 0.08)' : '1.5px solid rgba(0, 0, 0, 0.08)',
            position: 'relative',
            cursor: 'pointer',
            touchAction: 'pan-y',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform, opacity'
          }}
        >
          {/* Frosted Shimmer Skeleton Placeholder while loading */}
          {!isCurrentImageLoaded && (
            <div className="absolute inset-0 w-full h-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-2xl z-0" />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem?.id || safeIndex}
              drag="x"
              dragDirectionLock={true}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.98, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform, opacity',
                zIndex: 1
              }}
            >
              <img 
                src={currentItem?.imageUrl || '/about.png'} 
                alt="Showcase Banner"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onLoad={() => {
                  if (currentItem?.imageUrl) {
                    setLoadedMap((prev) => ({ ...prev, [currentItem.imageUrl]: true }));
                  }
                }}
                className="w-full h-full object-cover object-top block transition-opacity duration-300"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                  pointerEvents: 'none',
                  opacity: isCurrentImageLoaded ? 1 : 0.85
                }}
                onError={(e) => {
                  e.target.src = '/about.png';
                  if (currentItem?.imageUrl) {
                    setLoadedMap((prev) => ({ ...prev, [currentItem.imageUrl]: true }));
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Minimal Sleek Pagination Dot Indicators (Up to 7 dots) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          padding: '2px 0'
        }}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSlide(idx)}
              style={{
                height: '5px',
                width: safeIndex === idx ? '24px' : '6px',
                borderRadius: '3px',
                background: safeIndex === idx 
                  ? 'linear-gradient(90deg, #FF6B35 0%, #F97316 100%)' 
                  : isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: safeIndex === idx ? '0 0 8px rgba(255, 107, 53, 0.8)' : 'none'
              }}
              title={`Slide ${idx + 1}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* DEDICATED SPONSOR HIDDEN CAPTION & DETAIL VIEW MODAL */}
      {typeof document !== 'undefined' && selectedBanner && createPortal(
        <AnimatePresence>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999999,
              background: 'rgba(3, 7, 18, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box'
            }}
            onClick={onCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                background: isDark 
                  ? 'linear-gradient(145deg, #0F172A 0%, #030712 100%)' 
                  : '#FFFFFF',
                borderRadius: '24px',
                border: `1.5px solid ${isDark ? 'rgba(255, 107, 0, 0.35)' : 'rgba(255, 107, 0, 0.25)'}`,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 35px rgba(255, 107, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onCloseDetail}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}`,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title={isBangla ? 'ফিরে যান' : 'Back'}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                    }}>
                      {isBangla ? 'স্পন্সর পোস্ট ও বিস্তারিত' : 'Sponsor Showcase & Details'}
                    </h4>
                    <span style={{ fontSize: '0.68rem', color: '#FF6B00', fontWeight: 700 }}>
                      {isBangla ? 'ভেরিফাইড স্পন্সর পার্টনার' : 'Verified Sponsor Partner'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCloseDetail}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    border: 'none',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div style={{
                padding: '20px',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {/* Large Display Image */}
                <div style={{
                  width: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#0B0F19',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  maxHeight: '46vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={selectedBanner.imageUrl} 
                    alt={selectedBanner.title || 'Sponsor Banner'}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      maxHeight: '46vh',
                      objectFit: 'contain',
                      display: 'block',
                      aspectRatio: '16 / 9'
                    }}
                  />
                </div>

                {/* Title & Caption */}
                {selectedBanner.title && (
                  <div>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                      lineHeight: 1.3
                    }}>
                      {selectedBanner.title}
                    </h3>
                    {selectedBanner.createdAt && (
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        {new Date(selectedBanner.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                )}

                {/* Detailed Description */}
                <div style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    color: isDark ? '#E2E8F0' : '#334155',
                    whiteSpace: 'pre-line',
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                  }}>
                    {selectedBanner.description || (isBangla ? 'কোনো বিস্তারিত বিবরণ প্রদান করা হয়নি।' : 'No description provided.')}
                  </p>
                </div>

                {/* Bottom Return Action */}
                <button
                  type="button"
                  onClick={onCloseDetail}
                  style={{
                    marginTop: '6px',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF6B00 0%, #F57F17 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.90rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(255, 107, 0, 0.35)',
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>{isBangla ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Home'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
});
SponsorCarouselView.displayName = 'SponsorCarouselView';

const SponsorBannerCarousel = ({ isDark, isBangla }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState(null);

  return (
    <FirestoreStreamBuilder collectionName={COLLECTIONS.SPONSOR_BANNERS}>
      {({ data }) => {
        const banners = (data || [])
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 7);

        // When no active sponsor posters exist in Firestore, do not render any dummy banners
        if (banners.length === 0) {
          return null;
        }

        const bannerCount = banners.length;
        const safeIndex = currentSlide % bannerCount;
        const currentItem = banners[safeIndex] || banners[0];

        return (
          <SponsorCarouselView
            banners={banners}
            currentItem={currentItem}
            safeIndex={safeIndex}
            onSelectSlide={setCurrentSlide}
            onOpenDetail={setSelectedBanner}
            selectedBanner={selectedBanner}
            onCloseDetail={() => setSelectedBanner(null)}
            isDark={isDark}
            isBangla={isBangla}
          />
        );
      }}
    </FirestoreStreamBuilder>
  );
};

const BentoGridSection = ({ 
  onOpenProjects,
  onOpenAbout, 
  onOpenDream, 
  onOpenSkill, 
  onOpenReview, 
  onOpenSubscribe,
  onOpenDesign,
  onOpenUpcoming,
  onOpenFavorite,
  onOpenDeals
}) => {
  const { isBangla, t } = useLanguage();
  const { isDark } = useTheme();

  const featureIcons = [
    '/see project.png',
    '/design project.png',
    '/upcoming project.png',
    '/favorite.png',
    '/deal and discount.png'
  ];

  // Pre-caching Pipeline for Icons
  useEffect(() => {
    featureIcons.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <section 
      id="bento-grid"
      className="pb-32"
      style={{
        width: '100%',
        margin: '0',
        padding: '0 0 max(7rem, env(safe-area-inset-bottom, 28px)) 0',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 2
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
        width: '100%'
      }}>
        {/* ========================================================================= */}
        {/* CARD 1: FULL-WIDTH SUNSET CORAL-ORANGE HERO BANNER (See Project #FF5722) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.012, y: -1 }}
          whileTap={{ scale: 0.985 }}
          onClick={onOpenProjects || onOpenAbout}
          style={{
            width: '100%',
            height: '68px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
            boxShadow: '0 6px 20px rgba(255, 87, 34, 0.35), 0 2px 6px rgba(0, 0, 0, 0.08)',
            padding: '0 14px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.28)'
          }}
        >
          {/* Left Info: Headline & Subtitle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            flex: 1,
            textAlign: 'left',
            fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: isBangla ? '0' : '0.3px',
              lineHeight: 1.2
            }}>
              {t('bento.seeProjectTitle', 'See Project')}
            </h3>
            <p style={{
              margin: '2px 0 0 0',
              fontSize: '0.70rem',
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: 500,
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {t('bento.seeProjectSub', 'Fresh Works & Showcase')}
            </p>
          </div>

          {/* Right Action: Max Hero Circular Action Badge & Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
            marginLeft: '10px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              minWidth: '48px',
              minHeight: '48px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/see project.png" 
                alt="See Project" 
                loading="lazy"
                decoding="async"
                width="48"
                height="48"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                  transform: 'translateZ(0)',
                  aspectRatio: '1 / 1'
                }} 
              />
            </div>
            <ChevronRight size={19} strokeWidth={2.5} color="#FFFFFF" style={{ marginRight: '2px' }} />
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* CARDS 2 & 3: 2-COLUMN GRID - ELECTRIC CYAN & ROYAL PURPLE */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          width: '100%'
        }}>
          {/* CARD 2: Design Project (Left - Electric Cyan #00838F) - Real-time Synced */}
          <FirestoreStreamBuilder collectionName={COLLECTIONS.DESIGN_PROJECTS}>
            {({ data }) => {
              const designs = data || [];
              const activeCount = designs.filter(d => d.status !== 'Draft').length;
              const latestDesign = designs[0];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 }}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDesign || onOpenAbout}
                  style={{
                    height: '68px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00838F 0%, #0097A7 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(0, 131, 143, 0.32)',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left: Text & Real-time Live Badge */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1.15
                      }}>
                        {t('bento.designProjectTitle', 'Design Project')}
                      </h4>
                      {activeCount > 0 && (
                        <span style={{
                          padding: '1px 5px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          color: '#FFFFFF'
                        }}>
                          {activeCount}
                        </span>
                      )}
                    </div>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {latestDesign?.title 
                        ? (isBangla ? `${activeCount} টি সক্রিয় ডিজাইন` : `${latestDesign.title}`) 
                        : t('bento.designProjectSub', 'Watch & Explore')}
                    </p>
                  </div>

                  {/* Right: Circular Icon Badge */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    minHeight: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: '6px'
                  }}>
                    <img 
                      src="/design project.png" 
                      alt="Design Project" 
                      loading="lazy"
                      decoding="async"
                      width="48"
                      height="48"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%',
                        display: 'block',
                        transform: 'translateZ(0)',
                        aspectRatio: '1 / 1'
                      }} 
                    />
                  </div>
                </motion.div>
              );
            }}
          </FirestoreStreamBuilder>

          {/* CARD 3: Upcoming Project (Right - Royal Purple #6A1B9A) - Real-time Synced */}
          <FirestoreStreamBuilder collectionName={COLLECTIONS.UPCOMING_PROJECTS}>
            {({ data }) => {
              const upcoming = data || [];
              const latestUpcoming = upcoming[0];
              const progressVal = latestUpcoming?.progress ? parseInt(latestUpcoming.progress, 10) : 75;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 }}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenUpcoming || onOpenDream}
                  style={{
                    height: '68px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6A1B9A 0%, #7B1FA2 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(106, 27, 154, 0.35)',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left: Text & Real-time Progress Indicator */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1.15
                      }}>
                        {t('bento.upcomingProjectTitle', 'Upcoming Project')}
                      </h4>
                      <span style={{
                        padding: '1px 5px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.25)',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        color: '#FFFFFF'
                      }}>
                        {progressVal}%
                      </span>
                    </div>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {latestUpcoming?.title || latestUpcoming?.name || t('bento.upcomingProjectSub', 'In Development')}
                    </p>
                  </div>

                  {/* Right: Circular Icon Badge */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    minHeight: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: '6px'
                  }}>
                    <img 
                      src="/upcoming project.png" 
                      alt="Upcoming Project" 
                      loading="lazy"
                      decoding="async"
                      width="48"
                      height="48"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%',
                        display: 'block',
                        transform: 'translateZ(0)',
                        aspectRatio: '1 / 1'
                      }} 
                    />
                  </div>
                </motion.div>
              );
            }}
          </FirestoreStreamBuilder>
        </div>

        {/* ========================================================================= */}
        {/* CARDS 4 & 5: 2-COLUMN GRID - GOLDEN AMBER & EMERALD GREEN */}
        {/* ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          width: '100%'
        }}>
          {/* CARD 4: Favorite (Left - Golden Amber #F57F17) - Real-time Synced */}
          <FirestoreStreamBuilder collectionName={COLLECTIONS.FAVORITE_TOOLS}>
            {({ data }) => {
              const tools = data || [];
              const latestTool = tools[0];

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.12 }}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenFavorite || onOpenSkill}
                  style={{
                    height: '68px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #F57F17 0%, #FF8F00 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 4px 16px rgba(245, 127, 23, 0.32)',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left: Text & Real-time Count */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1.15
                      }}>
                        {t('bento.favoriteTitle', 'Favorite')}
                      </h4>
                      {tools.length > 0 && (
                        <span style={{
                          padding: '1px 5px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          color: '#FFFFFF'
                        }}>
                          {tools.length}
                        </span>
                      )}
                    </div>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.92)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {latestTool?.name 
                        ? (isBangla ? `${tools.length} টি প্রিয় টুলস` : `${latestTool.name} & more`) 
                        : t('bento.favoriteSub', 'My Favorite Tools')}
                    </p>
                  </div>

                  {/* Right: Circular Icon Badge */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    minHeight: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: '6px'
                  }}>
                    <img 
                      src="/favorite.png" 
                      alt="Favorite" 
                      loading="lazy"
                      decoding="async"
                      width="48"
                      height="48"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%',
                        display: 'block',
                        transform: 'translateZ(0)',
                        aspectRatio: '1 / 1'
                      }} 
                    />
                  </div>
                </motion.div>
              );
            }}
          </FirestoreStreamBuilder>

          {/* CARD 5: Deals & Discounts (Right - Emerald Neon Green #00695C) - Real-time Synced */}
          <FirestoreStreamBuilder collectionName={COLLECTIONS.DEALS_DISCOUNTS}>
            {({ data }) => {
              const allDeals = data || [];
              const deals = allDeals.filter(deal => {
                if (!deal) return false;
                if (deal.isActive === false) return false;
                if (deal.isLimited && deal.expiryDate) {
                  const expTime = new Date(deal.expiryDate).getTime();
                  if (!isNaN(expTime) && expTime < Date.now()) {
                    return false; // Auto-expired!
                  }
                }
                return true;
              });
              const latestDeal = deals[0];
              const discountPill = latestDeal?.discountPercent || latestDeal?.discountCode || (isBangla ? 'অফার' : 'Deal');

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenDeals || onOpenReview}
                  style={{
                    height: '68px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00695C 0%, #00796B 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(0, 105, 92, 0.32)',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left: Text & Real-time Discount Tag */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1.15
                      }}>
                        {t('bento.dealsTitle', 'Deals & Discounts')}
                      </h4>
                      <span style={{
                        padding: '1px 5px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.25)',
                        fontSize: '0.56rem',
                        fontWeight: 900,
                        color: '#FFFFFF'
                      }}>
                        {discountPill}
                      </span>
                    </div>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontWeight: 500,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {latestDeal?.title || t('bento.dealsSub', 'Exclusive Offers')}
                    </p>
                  </div>

                  {/* Right: Circular Icon Badge */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    minHeight: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: '6px'
                  }}>
                    <img 
                      src="/deal and discount.png" 
                      alt="Deals & Discounts" 
                      loading="lazy"
                      decoding="async"
                      width="48"
                      height="48"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '50%',
                        display: 'block',
                        transform: 'translateZ(0)',
                        aspectRatio: '1 / 1'
                      }} 
                    />
                  </div>
                </motion.div>
              );
            }}
          </FirestoreStreamBuilder>
        </div>

        {/* SPONSOR BANNER AUTO-CAROUSEL (PULLED UP DIRECTLY UNDER CARD 4 & 5) */}

        {/* ========================================================================= */}
        {/* CARD 7: ENLARGED 100% PURE FULL-COVER 7-BANNER AUTO-CAROUSEL (FIFO) */}
        {/* ========================================================================= */}
        <div className="mt-2.5 sm:mt-3 w-full" style={{ marginTop: '10px', width: '100%' }}>
          <SponsorBannerCarousel isDark={isDark} isBangla={isBangla} />
        </div>

        {/* Bottom Safety Spacer for mobile gesture bar / home button */}
        <div 
          className="pb-32 w-full shrink-0"
          style={{ 
            height: 'max(7rem, env(safe-area-inset-bottom, 28px))',
            minHeight: '112px',
            paddingBottom: 'max(7rem, env(safe-area-inset-bottom, 28px))',
            pointerEvents: 'none' 
          }} 
          aria-hidden="true" 
        />
      </div>
    </section>
  );
};

export default memo(BentoGridSection);
