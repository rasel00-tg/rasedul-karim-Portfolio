import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Sparkles, ShieldAlert, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MaintenanceScreen({ onOpenAdmin }) {
  const { isDark } = useTheme();

  // Prevent background scrolling and user interaction with underlying page
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      id="maintenance-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#050B14' : '#F8FAFC',
        backgroundImage: isDark
          ? 'radial-gradient(ellipse at 50% 40%, rgba(15, 23, 42, 0.95) 0%, #050B14 100%), url("/cyber_grid_bg.svg")'
          : 'radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #E2E8F0 100%), url("/light_theme_bg.svg")',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        fontFamily: "'LiAdorNoirrit', 'Anek Bangla', -apple-system, sans-serif",
      }}
    >
      {/* Centered Maintenance Notice Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isDark ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '28px',
          boxShadow: isDark
            ? '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.12)'
            : '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 30px rgba(16, 185, 129, 0.08)',
          padding: '44px 32px 36px 32px',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Animated Top Pulse Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: isDark
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)',
            }}>
              <Wrench size={32} strokeWidth={2.2} />
            </div>

            {/* Glowing Status Dot */}
            <span style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              backgroundColor: '#10B981',
              border: `2px solid ${isDark ? '#0F172A' : '#FFFFFF'}`,
              borderRadius: '50%',
              boxShadow: '0 0 10px #10B981',
            }} />
          </div>
        </div>

        {/* Status Pill Indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '9999px',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#10B981',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '16px',
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
          <span>রক্ষণাবেক্ষণ প্রক্রিয়া সক্রিয়</span>
        </div>

        {/* 1. Main Heading */}
        <h1 style={{
          fontSize: 'clamp(1.65rem, 4vw, 2.2rem)',
          fontWeight: 800,
          margin: '0 0 16px 0',
          letterSpacing: '-0.3px',
          background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.3
        }}>
          ওয়েবসাইট আপডেট চলছে
        </h1>

        {/* 2. Notice Body Paragraphs */}
        <p style={{
          fontSize: '1.08rem',
          fontWeight: 600,
          color: isDark ? '#E2E8F0' : '#1E293B',
          margin: '0 0 10px 0',
          lineHeight: 1.75
        }}>
          বর্তমানে ওয়েবসাইটের কিছু আপডেট ও উন্নয়নমূলক কাজ চলছে।
        </p>

        <p style={{
          fontSize: '0.98rem',
          fontWeight: 500,
          color: isDark ? '#94A3B8' : '#64748B',
          margin: '0 0 24px 0',
          lineHeight: 1.75
        }}>
          আপডেট সম্পন্ন হলে ওয়েবসাইটের সকল কার্যক্রম স্বাভাবিকভাবে চালু থাকবে।
        </p>

        {/* Subtle Elegant Glow Divider */}
        <div style={{
          width: '70px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
          margin: '0 auto 24px auto'
        }} />

        {/* 3. Closing Line Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 24px',
          borderRadius: '9999px',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
          border: '1.2px solid rgba(16, 185, 129, 0.35)',
          color: '#10B981',
          fontSize: '0.96rem',
          fontWeight: 700,
          boxShadow: isDark ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'none'
        }}>
          <Sparkles size={16} />
          <span>শীঘ্রই আবার দেখা হবে।</span>
        </div>

        {/* Discrete Admin Access Link (in case admin needs to log in) */}
        {onOpenAdmin && (
          <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9' }}>
            <button
              onClick={onOpenAdmin}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#00F0FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'; }}
              title="Admin Access"
            >
              <Lock size={12} />
              <span>এডমিন এক্সেস</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
