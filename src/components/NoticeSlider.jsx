import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const DRAG_BUFFER = 50;
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
      padding: '40px 5%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2 // Sit above canvas but under modals
    }}>
      <h3 style={{ 
        color: '#00f0ff', 
        fontSize: '1.2rem', 
        marginBottom: '20px', 
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(0,240,255,0.4)'
      }}>
        Latest Notice
      </h3>

      <div 
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '1200px', // Restrict max width
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0,240,255,0.2)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          animate={{ translateX: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', mass: 0.5, stiffness: 100, damping: 20 }}
          onDragEnd={onDragEnd}
          className="notice-drag-container"
          style={{
            x: dragX,
            display: 'flex',
            cursor: 'grab',
            aspectRatio: '5120 / 2232',
            width: '100%'
          }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {notices.map((src, index) => (
            <motion.div
              key={index}
              style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <img 
                src={src} 
                alt={`Notice ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // High res coverage
                  pointerEvents: 'none' // Prevent dragging image as ghost
                }}
                onError={(e) => {
                  e.target.style.display = 'none'; // Auto hide if image 4/3 doesn't exist
                  e.target.parentElement.innerHTML = `<div style="color: #555; text-align: center;">Waiting for ${src}</div>`;
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        {notices.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: currentIndex === index ? '30px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              background: currentIndex === index ? '#00f0ff' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: currentIndex === index ? '0 0 10px #00f0ff' : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NoticeSlider;
