import React, { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const BentoGridSection = ({ 
  onOpenProjects,
  onOpenAbout, 
  onOpenDream, 
  onOpenSkill, 
  onOpenReview, 
  onOpenSubscribe 
}) => {
  const { isBangla, t } = useLanguage();
  const { isDark } = useTheme();

  // 6 Pure Visual Slides (Rotating 100% Full-Cover Showcase Banners)
  const [currentSlide, setCurrentSlide] = useState(0);
  const showcaseImages = [
    '/about.png',
    '/add1.png',
    '/add2.png',
    '/app1.png',
    '/app2.png',
    '/profile.jpeg'
  ];

  const featureIcons = [
    '/see project.png',
    '/design project.png',
    '/upcoming project.png',
    '/favorite.png',
    '/deal and discount.png'
  ];

  // Pre-caching Pipeline for Zero-Lag Instant Image Transitions & Icon Rendering
  useEffect(() => {
    [...showcaseImages, ...featureIcons].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 2-Second Auto-Rotation Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [showcaseImages.length]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -30) {
      setCurrentSlide((prev) => (prev + 1) % showcaseImages.length);
    } else if (info.offset.x > 30) {
      setCurrentSlide((prev) => (prev - 1 + showcaseImages.length) % showcaseImages.length);
    }
  };

  return (
    <section 
      id="bento-grid"
      style={{
        width: '100%',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 2
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
                loading="eager"
                decoding="async"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                  transform: 'translateZ(0)' 
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
          {/* CARD 2: Design Project (Left - Electric Cyan #00838F) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 }}
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAbout}
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
            {/* Left: Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
              textAlign: 'left',
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15
              }}>
                {t('bento.designProjectTitle', 'Design Project')}
              </h4>
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
                {t('bento.designProjectSub', 'Watch & Explore')}
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
                loading="eager"
                decoding="async"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                  transform: 'translateZ(0)' 
                }} 
              />
            </div>
          </motion.div>

          {/* CARD 3: Upcoming Project (Right - Royal Purple #6A1B9A) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDream}
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
            {/* Left: Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
              textAlign: 'left',
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15
              }}>
                {t('bento.upcomingProjectTitle', 'Upcoming Project')}
              </h4>
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
                {t('bento.upcomingProjectSub', 'In Development')}
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
                loading="eager"
                decoding="async"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                  transform: 'translateZ(0)' 
                }} 
              />
            </div>
          </motion.div>
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
          {/* CARD 4: Favorite (Left - Golden Amber #F57F17) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSkill}
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
            {/* Left: Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
              textAlign: 'left',
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15
              }}>
                {t('bento.favoriteTitle', 'Favorite')}
              </h4>
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
                {t('bento.favoriteSub', 'My Favorite Tools')}
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
                loading="eager"
                decoding="async"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                  transform: 'translateZ(0)' 
                }} 
              />
            </div>
          </motion.div>

          {/* CARD 5: Deals & Discounts (Right - Emerald Neon Green #00695C) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenReview}
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
            {/* Left: Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
              textAlign: 'left',
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15
              }}>
                {t('bento.dealsTitle', 'Deals & Discounts')}
              </h4>
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
                {t('bento.dealsSub', 'Exclusive Offers')}
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
                loading="eager"
                decoding="async"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                  transform: 'translateZ(0)' 
                }} 
              />
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 6: FULL-WIDTH CRIMSON ROSE NEWSLETTER STRIP (#C2185B) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          whileHover={{ scale: 1.012, y: -1 }}
          whileTap={{ scale: 0.985 }}
          onClick={onOpenSubscribe}
          style={{
            width: '100%',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #C2185B 0%, #D81B60 100%)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 4px 16px rgba(194, 24, 91, 0.3)',
            padding: '0 14px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {/* Left: Text */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            flex: 1,
            textAlign: 'left',
            fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
          }}>
            <h4 style={{
              margin: 0,
              fontSize: '0.80rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15
            }}>
              {t('bento.newsletterTitle', 'Join My Newsletter')}
            </h4>
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
              {t('bento.newsletterSub', 'Stay updated')}
            </p>
          </div>

          {/* Right: Icon & Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            marginLeft: '8px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Mail size={14} strokeWidth={2.4} />
            </div>
            <ChevronRight size={15} strokeWidth={2.4} color="#FFFFFF" />
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* CARD 7: ENLARGED 100% PURE FULL-COVER 6-IMAGE AUTO-CAROUSEL BANNER (172px) */}
        {/* ========================================================================= */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
          marginTop: '2px'
        }}>
          <motion.div
            className="bento-carousel-box"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            onClick={onOpenAbout}
            style={{
              width: '100%',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              border: '1.5px solid rgba(0, 0, 0, 0.08)',
              background: '#0D1117',
              position: 'relative',
              cursor: 'pointer',
              touchAction: 'pan-y',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform, opacity'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                drag="x"
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
                  willChange: 'transform, opacity'
                }}
              >
                <img 
                  src={showcaseImages[currentSlide]} 
                  alt="Showcase Banner"
                  loading="eager"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                  onError={(e) => {
                    if (e.target.src.includes('/add1.png') || e.target.src.includes('/add2.png') || e.target.src.includes('/app1.png') || e.target.src.includes('/app2.png')) {
                      e.target.src = '/about.png';
                    } else {
                      e.target.src = '/profile.jpeg';
                    }
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Minimal Sleek Pagination Dot Indicators (No numbers, no text) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '2px 0'
          }}>
            {showcaseImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  height: '5px',
                  width: currentSlide === idx ? '24px' : '6px',
                  borderRadius: '3px',
                  background: currentSlide === idx 
                    ? 'linear-gradient(90deg, #FF6B35 0%, #F97316 100%)' 
                    : isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentSlide === idx ? '0 0 8px rgba(255, 107, 53, 0.8)' : 'none'
                }}
                title={`Slide ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGridSection;
