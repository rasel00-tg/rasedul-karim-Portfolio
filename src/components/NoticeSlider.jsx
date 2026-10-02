import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';

const DRAG_BUFFER = 40;
const notices = [
  '/add1.png',
  '/add2.png',
  '/add3.png',
  '/add4.png'
];

const NoticeSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef(null);

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= -DRAG_BUFFER && currentIndex < notices.length - 1) {
      setCurrentIndex((pv) => pv + 1);
    } else if (x >= DRAG_BUFFER && currentIndex > 0) {
      setCurrentIndex((pv) => pv - 1);
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? notices.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === notices.length - 1 ? 0 : prev + 1));
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === notices.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      width: '100%',
      padding: '20px 5% 40px 5%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    }}>
      {/* Notice Header */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '15px',
        color: 'var(--primary-color)',
        fontSize: '0.9rem',
        fontWeight: '700',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(0, 240, 255, 0.4)'
      }}>
        <Bell size={18} />
        <span>LATEST NOTICE</span>
      </div>

      {/* Main Carousel Wrapper */}
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '1000px',
          overflow: 'hidden',
          borderRadius: '18px',
          boxShadow: 'var(--card-shadow)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          position: 'relative',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          willChange: 'transform' // Zero-lag optimization on low-RAM devices
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          animate={{ translateX: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', mass: 0.5, stiffness: 120, damping: 22 }}
          onDragEnd={onDragEnd}
          style={{
            x: dragX,
            display: 'flex',
            cursor: 'grab',
            aspectRatio: '5120 / 2232',
            width: '100%',
            willChange: 'transform'
          }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {notices.map((src, index) => (
            <div
              key={index}
              style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#0b001a'
              }}
            >
              <img 
                src={src} 
                alt={`Notice banner ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div style="color: #64748B; padding: 20px; font-size: 0.9rem; text-align: center;">Notice Image ${index + 1} (${src})</div>`;
                }}
              />
            </div>
          ))}
        </motion.div>

        {/* Left & Right Nav Arrows for Desktop / Quick Tap */}
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(11, 0, 26, 0.65)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 3
          }}
          aria-label="Previous Notice"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(11, 0, 26, 0.65)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 3
          }}
          aria-label="Next Notice"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {notices.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: currentIndex === index ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              border: 'none',
              background: currentIndex === index ? '#00f0ff' : 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: currentIndex === index ? '0 0 10px #00f0ff' : 'none'
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NoticeSlider;
