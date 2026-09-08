import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Monitor, 
  Sparkles, 
  Heart, 
  Code2, 
  Briefcase, 
  Users, 
  Home, 
  Zap, 
  Compass, 
  Award,
  CheckCircle2,
  Building2,
  Palette,
  Layers,
  HeartHandshake,
  Tv,
  Trophy,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SectionCard = ({ title, subtitle, icon: Icon, color = '#00f0ff', isBangla = false, children }) => {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        background: isDark ? 'rgba(13, 20, 36, 0.76)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 119, 182, 0.25)'}`,
        borderRadius: '24px',
        padding: '24px 22px',
        boxShadow: isDark 
          ? '0 12px 35px -10px rgba(0, 0, 0, 0.65), 0 0 25px rgba(0, 240, 255, 0.12)' 
          : '0 10px 30px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative gradient accent stripe */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: `linear-gradient(180deg, ${color}, transparent)`
      }} />

      {/* Header with icon & title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: isDark ? `${color}18` : `${color}12`,
          border: `1px solid ${color}45`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          boxShadow: `0 0 16px ${color}30`,
          flexShrink: 0
        }}>
          <Icon size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif",
            fontWeight: 800,
            letterSpacing: '0.6px',
            color: 'var(--text-primary)',
            lineHeight: 1.2
          }}>
            {title}
          </h3>
          {subtitle && (
            <span style={{
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginTop: '2px',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
            }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit' }}>
        {children}
      </div>
    </motion.div>
  );
};

const AboutModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla, t } = useLanguage();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          background: isDark 
            ? 'radial-gradient(circle at 18% 18%, rgba(0, 240, 255, 0.22) 0%, transparent 40%), radial-gradient(circle at 82% 82%, rgba(139, 92, 246, 0.26) 0%, transparent 45%), radial-gradient(circle at 50% 25%, rgba(236, 72, 153, 0.16) 0%, transparent 45%), radial-gradient(circle at 45% 75%, rgba(14, 165, 233, 0.18) 0%, transparent 50%), #070B14'
            : 'radial-gradient(circle at 20% 20%, rgba(0, 180, 216, 0.18) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.18) 0%, transparent 45%), #F0F4F8',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0'
        }}
      >
        {/* Dynamic Cyber Aurora Ambient Background Orbs */}
        <div style={{
          position: 'fixed',
          top: '-12%',
          left: '-5%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.24) 0%, transparent 70%)',
          filter: 'blur(75px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'fixed',
          bottom: '-12%',
          right: '-5%',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.28) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'fixed',
          top: '40%',
          right: '20%',
          width: '440px',
          height: '440px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.16) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Main Content Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            width: '100%',
            maxWidth: '1180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '36px 20px 80px 20px',
            zIndex: 1
          }}
        >
          {/* Top Floating Close Button */}
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed', 
              top: '20px', 
              right: '20px', 
              background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)', 
              border: '1px solid var(--card-border)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              borderRadius: '50%', 
              width: '42px', 
              height: '42px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 100000,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(12px)'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </motion.button>

          {/* Header Title Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '24px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'var(--primary-color)',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <Sparkles size={15} />
            <span>{isBangla ? 'ব্যক্তিগত ও পেশাগত পরিচিতি' : 'About & Professional Profile'}</span>
          </div>

          {/* 2-Column Responsive Dashboard Grid */}
          <div className="about-dashboard-grid">

            {/* LEFT COLUMN: Sticky Profile Bio Card & Vision Quote */}
            <div className="about-profile-sticky" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Profile Card */}
              <div style={{
                width: '100%',
                background: isDark ? 'rgba(13, 20, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.28)' : 'rgba(0, 119, 182, 0.28)'}`,
                borderRadius: '24px',
                padding: '28px 22px',
                boxShadow: isDark 
                  ? '0 15px 40px -10px rgba(0, 0, 0, 0.65), 0 0 25px rgba(0, 240, 255, 0.12)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                {/* Glowing Avatar Portrait with Subtle Pulse */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'relative',
                    width: 'clamp(130px, 28vw, 160px)',
                    height: 'clamp(130px, 28vw, 160px)',
                    borderRadius: '50%',
                    padding: '4px',
                    background: 'linear-gradient(135deg, #00f0ff 0%, #00e676 50%, #ff007f 100%)',
                    boxShadow: isDark 
                      ? '0 0 35px rgba(0, 240, 255, 0.5), 0 0 18px rgba(0, 230, 118, 0.35)' 
                      : '0 10px 30px rgba(0, 119, 182, 0.25)',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#0D1117'
                  }}>
                    <img 
                      src="/about.png" 
                      alt="Rasedul Karim" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }} 
                    />
                  </div>
                </motion.div>

                {/* Name */}
                <h1 style={{
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                  fontSize: 'clamp(1.5rem, 4vw, 1.85rem)',
                  fontWeight: 800,
                  letterSpacing: '0.6px',
                  color: 'var(--text-primary)',
                  margin: '0 0 8px 0',
                  lineHeight: 1.2,
                  textShadow: isDark ? '0 0 16px rgba(0, 240, 255, 0.3)' : 'none'
                }}>
                  {isBangla ? 'রাশেদুল করিম' : 'Rasedul Karim'}
                </h1>

                {/* Tagline Glass Pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00F0FF'
                  }}>
                    {isBangla ? 'সফটওয়্যার ও ওয়েব ডেভেলপার' : 'Software & Web Developer'}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(0, 230, 118, 0.08)',
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                    color: '#00E676'
                  }}>
                    {isBangla ? 'ফটো এডিটর' : 'Photo Editor'}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(255, 0, 127, 0.08)',
                    border: '1px solid rgba(255, 0, 127, 0.3)',
                    color: '#FF007F'
                  }}>
                    {isBangla ? 'ডিজিটাল ক্রিয়েটর' : 'Digital Creator'}
                  </span>
                </div>

                {/* Location Pill */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid var(--card-border)',
                  marginBottom: '18px',
                  fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
                }}>
                  <MapPin size={13} color="#FF1744" />
                  <span>{isBangla ? 'নতুন পল্লান পাড়া, টেকনাফ, কক্সবাজার' : "Natun Pollan Para, Teknaf, Cox's Bazar"}</span>
                </div>

                {/* Interactive Contact Buttons */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%'
                }}>
                  <motion.a
                    href="mailto:rasedul.karim.dev@gmail.com"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      background: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 119, 182, 0.08)',
                      border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 119, 182, 0.3)'}`,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Mail size={15} color="#00f0ff" />
                    <span>rasedul.karim.dev@gmail.com</span>
                  </motion.a>

                  <motion.a
                    href="tel:+8801871176267"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      background: isDark ? 'rgba(0, 230, 118, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                      border: `1px solid ${isDark ? 'rgba(0, 230, 118, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Phone size={15} color="#00E676" />
                    <span>+8801871176267</span>
                  </motion.a>
                </div>
              </div>

              {/* Vision Quote Card */}
              <div style={{
                width: '100%',
                background: isDark ? 'rgba(255, 23, 68, 0.06)' : 'rgba(255, 23, 68, 0.04)',
                border: '1px solid rgba(255, 23, 68, 0.25)',
                borderRadius: '20px',
                padding: '18px 18px',
                textAlign: 'center',
                boxShadow: isDark ? '0 8px 25px rgba(255, 23, 68, 0.1)' : 'none'
              }}>
                <div style={{
                  fontSize: '0.94rem',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: '#FF1744',
                  lineHeight: 1.4,
                  marginBottom: '6px'
                }}>
                  {isBangla 
                    ? '“সরলতা, সততা এবং মানবিক সহমর্মিতার সাথে সর্বদা মানুষের সেবা করাই আমার অঙ্গীকার।”'
                    : '"Always serve humanity through simplicity, honesty, and persistent empathy."'
                  }
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  — Rasedul Karim
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Career Timeline & Detail Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Card 1: Professional Career & Media Roles (Timeline Architecture) */}
              <SectionCard 
                title={isBangla ? 'পেশাগত ভূমিকা ও ক্যারিয়ার টাইমলাইন' : 'Career Timeline & Media Roles'} 
                subtitle={isBangla ? 'পেশাগত অভিজ্ঞতা ও ডিজিটাল প্রশাসন' : 'Professional Experience & Digital Administration'} 
                icon={Briefcase} 
                color="#00f0ff"
                isBangla={isBangla}
              >
                <div className="about-timeline-track">
                  
                  {/* Timeline Node 1: MFS Employee */}
                  <div className="about-timeline-item">
                    <div className="about-timeline-dot" style={{ background: 'rgba(0, 240, 255, 0.2)', border: '1.5px solid #00F0FF' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F0FF' }} />
                    </div>
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 119, 182, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 119, 182, 0.25)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {isBangla ? 'কর্মী • মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS)' : 'Employee • Mobile Financial Services (MFS)'}
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'rgba(0, 230, 118, 0.15)',
                          border: '1px solid rgba(0, 230, 118, 0.4)',
                          color: '#00E676'
                        }}>
                          {isBangla ? 'সক্রিয় পেশা' : 'Active Role'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: '3px' }}>
                        {isBangla ? 'একটি বেসরকারি মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস প্রতিষ্ঠান' : 'Private Mobile Financial Services Institution'}
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        {isBangla 
                          ? 'একটি স্বনামধন্য বেসরকারি মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS) প্রতিষ্ঠানে সক্রিয়ভাবে কর্মরত, যেখানে আর্থিক লেনদেনের মসৃণতা ও প্রাতিষ্ঠানিক উৎকর্ষ নিশ্চিত করা হয়।'
                          : 'Serving as an active employee at a renowned private Mobile Financial Services (MFS) institution, ensuring smooth financial transactions, operational excellence, and customer support.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Timeline Node 2: Naf Vision */}
                  <div className="about-timeline-item">
                    <div className="about-timeline-dot" style={{ background: 'rgba(0, 240, 255, 0.2)', border: '1.5px solid #00F0FF' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F0FF' }} />
                    </div>
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid var(--card-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Tv size={16} color="#00f0ff" />
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Naf Vision</span>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00F0FF'
                        }}>
                          {isBangla ? 'মিডিয়া ও সংবাদ' : 'News & Media'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: '3px' }}>
                        {isBangla ? 'প্রধান ভিজ্যুয়াল ডিজাইনার ও এডমিন' : 'Lead Visual Designer & Administrator'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {isBangla ? 'টেকনাফের শীর্ষস্থানীয় স্থানীয় সংবাদ ও মিডিয়া প্ল্যাটফর্ম।' : 'Prominent local news and media platform of Teknaf.'}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node 3: Naf Sports */}
                  <div className="about-timeline-item">
                    <div className="about-timeline-dot" style={{ background: 'rgba(0, 230, 118, 0.2)', border: '1.5px solid #00E676' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E676' }} />
                    </div>
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid var(--card-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Trophy size={16} color="#00E676" />
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Naf Sports</span>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          background: 'rgba(0, 230, 118, 0.1)',
                          border: '1px solid rgba(0, 230, 118, 0.3)',
                          color: '#00E676'
                        }}>
                          {isBangla ? 'ক্রীড়া প্রশাসন' : 'Sports Hub'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#00E676', fontWeight: 600, marginTop: '3px' }}>
                        {isBangla ? 'প্রধান ভিজ্যুয়াল ডিজাইনার ও এডমিন' : 'Lead Visual Designer & Administrator'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {isBangla ? 'টেকনাফের প্রধান ক্রীড়া সংবাদ ও টুর্নামেন্ট মিডিয়া হাব।' : 'Premier sports news and tournament media hub of Teknaf.'}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node 4: Independent Tech & Design */}
                  <div className="about-timeline-item">
                    <div className="about-timeline-dot" style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1.5px solid #A855F7' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} />
                    </div>
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.04)',
                      border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.25)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Code2 size={16} color="#A855F7" />
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {isBangla ? 'স্বাধীন সফটওয়্যার ও ভিজ্যুয়াল আর্ট' : 'Independent Software & Visual Art'}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.35)',
                          color: '#A855F7'
                        }}>
                          Full-Stack & Mobile
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        {isBangla 
                          ? 'ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপস (Flutter/Dart), ফুল-স্ট্যাক ওয়েব প্ল্যাটফর্ম (React, Node, Firebase), এবং নিখুঁত ফটো এডিটিং ও ভিজ্যুয়াল ব্র্যান্ডিং তৈরি করা।'
                          : 'Crafting cross-platform mobile apps (Flutter/Dart), full-stack web platforms (React, Node, Firebase), and high-precision digital photo editing and visual branding.'
                        }
                      </p>
                    </div>
                  </div>

                </div>
              </SectionCard>

              {/* Card 2: Education */}
              <SectionCard 
                title={isBangla ? 'শিক্ষাগত যোগ্যতা' : 'Education'} 
                subtitle={isBangla ? 'প্রাতিষ্ঠানিক শিক্ষা ও একাডেমি' : 'Academic Background & Institutions'} 
                icon={GraduationCap} 
                color="#00E676"
                isBangla={isBangla}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* 1. Supia Nuria Dhakil Madrasah */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'সুফিয়া নূরিয়া দাখিল মাদ্রাসা' : 'Supia Nuria Dhakil Madrasah'}
                    </div>
                  </div>

                  {/* 2. Teknaf Model Pilot High School */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'টেকনাফ মডেল পাইলট উচ্চ বিদ্যালয়' : 'Teknaf Model Pailot High School'}
                    </div>
                  </div>

                  {/* 3. Teknaf Degree College */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'টেকনাফ ডিগ্রি কলেজ' : 'Teknaf Degree College'}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Card 3: Courses & Certifications */}
              <SectionCard 
                title={isBangla ? 'কোর্স ও প্রশিক্ষণ' : 'Courses & Certifications'} 
                subtitle={isBangla ? 'বিশেষায়িত প্রশিক্ষণ ও দক্ষতা' : 'Specialized Training & Mastery'} 
                icon={Monitor} 
                color="#FFAA00"
                isBangla={isBangla}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* 1. Programming Hero */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'প্রোগ্রামিং হিরো বিশেষায়িত লার্নিং' : 'Programming Hero Specialized Learning'}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      programminghero.com
                    </span>
                  </div>

                  {/* 2. Phitron */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'ওয়েব ডেভেলপমেন্ট ও কম্পিটিটিভ প্রোগ্রামিং' : 'Web Dev & Competitive Programming'}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      phitron.io
                    </span>
                  </div>

                  {/* 3. Photo Editing */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'ফটো এডিটিং ও ডিজিটাল আর্ট দক্ষতা' : 'Photo Editing & Digital Art Mastery'}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#FFAA00', fontWeight: 600 }}>
                      {isBangla ? 'স্ব-উদ্যোগে অর্জিত দক্ষতা' : 'Self-taught Excellence'}
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* Card 4: Family Background */}
              <SectionCard 
                title={isBangla ? 'পারিবারিক পরিচয়' : 'Family Background'} 
                subtitle={isBangla ? 'ঐতিহ্য ও পারিবারিক মূল্যবোধ' : 'Heritage & Family Values'} 
                icon={Home} 
                color="#FFAA00"
                isBangla={isBangla}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  {/* Father Info */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: '#FFAA00', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isBangla ? 'পিতা' : 'Father'}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '3px' }}>
                      {isBangla ? 'ব্যবসায়ী' : 'Businessman'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {isBangla ? 'সৎ ব্যবসা এবং সামাজিক নীতি ও মূল্যবোধে নিবেদিতপ্রাণ।' : 'Dedicated to honest business and community ethics.'}
                    </div>
                  </div>

                  {/* Mother Info */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: '#FF007F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isBangla ? 'মাতা' : 'Mother'}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '3px' }}>
                      {isBangla ? 'গৃহিণী' : 'Homemaker'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {isBangla ? 'পরিবারের স্নেহ, মমতা ও নৈতিক মূল্যবোধের মূল উৎস।' : 'The core source of care, moral values, and compassion.'}
                    </div>
                  </div>
                </div>

                {/* Siblings */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: isDark ? 'rgba(255, 170, 0, 0.05)' : 'rgba(255, 170, 0, 0.04)',
                  border: `1px solid ${isDark ? 'rgba(255, 170, 0, 0.25)' : 'rgba(255, 170, 0, 0.25)'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <Users size={20} color="#FFAA00" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {isBangla ? 'পরিবার: দুই ভাই ও দুই বোন' : 'Siblings: Two Brothers & Two Sisters'}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {isBangla 
                        ? 'পারস্পরিক শ্রদ্ধা, ভালোবাসা এবং যৌথ স্বপ্নের ওপর ভিত্তি করে গড়ে ওঠা সুন্দর পরিবেশে একসাথে বড় হওয়া।'
                        : 'Raised together in a warm, loving, and supportive environment built on mutual respect and shared dreams.'
                      }
                    </p>
                  </div>
                </div>
              </SectionCard>

            </div>

          </div>

          {/* Bottom Close Action Button */}
          <div style={{ marginTop: '36px', width: '100%', maxWidth: '320px' }}>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 25px rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
              }}
            >
              <span>{isBangla ? 'সম্পন্ন / পোর্টফোলিও দেখুন' : 'Done / Explore Portfolio'}</span>
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
