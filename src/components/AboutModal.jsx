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
  ExternalLink
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
        background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        borderRadius: '22px',
        padding: '24px 22px',
        boxShadow: isDark ? '0 15px 35px rgba(0, 0, 0, 0.4)' : '0 10px 25px rgba(0, 0, 0, 0.06)',
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
          width: '38px',
          height: '38px',
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
            fontSize: '1.08rem',
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
              fontSize: '0.74rem',
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
          background: isDark ? 'rgba(5, 8, 16, 0.96)' : 'rgba(240, 246, 252, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0'
        }}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            width: '100%',
            maxWidth: '820px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '36px 18px 80px 18px'
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
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', 
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </motion.button>

          {/* 1. Hero Profile Card */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '26px',
            marginTop: '8px'
          }}>
            {/* Glowing Avatar Portrait loading strictly from public/about.png */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'relative',
                width: 'clamp(140px, 32vw, 190px)',
                height: 'clamp(140px, 32vw, 190px)',
                borderRadius: '50%',
                padding: '4px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #00e676 50%, #ff007f 100%)',
                boxShadow: isDark 
                  ? '0 0 45px rgba(0, 240, 255, 0.45), 0 0 20px rgba(0, 230, 118, 0.35)' 
                  : '0 10px 30px rgba(0, 119, 182, 0.25)',
                marginBottom: '18px'
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

            {/* Name & Title */}
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.7rem, 5.5vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '1px',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              lineHeight: 1.15,
              textShadow: isDark ? '0 0 20px rgba(0, 240, 255, 0.35)' : 'none'
            }}>
              {isBangla ? 'রাশেদুল করিম' : 'Rasedul Karim'}
            </h1>

            <div style={{
              fontSize: 'clamp(0.88rem, 2.6vw, 1rem)',
              color: 'var(--primary-color)',
              fontWeight: 700,
              letterSpacing: '0.6px',
              marginBottom: '8px',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
            }}>
              {isBangla ? 'সফটওয়্যার ও ওয়েব ডেভেলপার | ফটো এডিটর | ডিজিটাল ক্রিয়েটর' : 'Software & Web Developer | Photo Editor | Digital Creator'}
            </div>

            {/* Location Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              padding: '5px 14px',
              borderRadius: '20px',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--card-border)',
              marginBottom: '18px',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
            }}>
              <MapPin size={14} color="#FF1744" />
              <span>{isBangla ? 'নতুন পল্লান পাড়া, টেকনাফ, কক্সবাজার, বাংলাদেশ' : "Natun Pollan Para, Teknaf, Cox's Bazar, Bangladesh"}</span>
            </div>

            {/* Quick Contact Chips Row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '620px'
            }}>
              <a
                href="mailto:rasedul.karim.dev@gmail.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 119, 182, 0.08)',
                  border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 119, 182, 0.25)'}`,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Mail size={14} color="#00f0ff" />
                <span>rasedul.karim.dev@gmail.com</span>
              </a>

              <a
                href="tel:+8801871176267"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(0, 230, 118, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                  border: `1px solid ${isDark ? 'rgba(0, 230, 118, 0.25)' : 'rgba(34, 197, 94, 0.25)'}`,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Phone size={14} color="#00E676" />
                <span>+8801871176267</span>
              </a>
            </div>
          </div>

          {/* 2. Structured Information Cards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '100%'
          }}>

            {/* Card 1: Professional Career & Media Roles */}
            <SectionCard 
              title={isBangla ? 'কর্মজীবন ও অভিজ্ঞতা' : 'Professional Career & Media Roles'} 
              subtitle={isBangla ? 'পেশাগত ভূমিকা ও ডিজিটাল প্রশাসন' : 'Work Experience & Digital Administration'} 
              icon={Briefcase} 
              color="#00f0ff"
              isBangla={isBangla}
            >
              {/* Primary Profession: MFS Employee */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: isDark ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 119, 182, 0.05)',
                border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 119, 182, 0.2)'}`
              }}>
                <Building2 size={20} color="#00f0ff" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isBangla ? 'কর্মী • মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS)' : 'Employee • Mobile Financial Services (MFS)'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: '2px' }}>
                    {isBangla ? 'একটি বেসরকারি মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস প্রতিষ্ঠান' : 'Private Mobile Financial Services Company'}
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {isBangla 
                      ? 'একটি স্বনামধন্য বেসরকারি মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS) প্রতিষ্ঠানে সক্রিয়ভাবে কর্মরত, যেখানে আর্থিক লেনদেনের মসৃণতা ও প্রাতিষ্ঠানিক উৎকর্ষ নিশ্চিত করা হয়।'
                      : 'Serving as an active employee at a renowned private Mobile Financial Services (MFS) institution, ensuring smooth financial transactions, operational excellence, and customer support.'
                    }
                  </p>
                </div>
              </div>

              {/* Media & Community Administration: Naf Vision & Naf Sports */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {isBangla ? 'মিডিয়া ও কমিউনিটি প্রশাসন:' : 'Media & Community Administration:'}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '10px'
                }}>
                  {/* Naf Vision */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <Tv size={18} color="#00f0ff" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Naf Vision
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                        {isBangla ? 'প্রধান ভিজ্যুয়াল ডিজাইনার ও এডমিন' : 'Lead Visual Designer & Administrator'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {isBangla ? 'টেকনাফের শীর্ষস্থানীয় স্থানীয় সংবাদ ও মিডিয়া প্ল্যাটফর্ম।' : 'Prominent local news and media platform of Teknaf.'}
                      </div>
                    </div>
                  </div>

                  {/* Naf Sports */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--card-border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <Trophy size={18} color="#00E676" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Naf Sports
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#00E676', fontWeight: 600 }}>
                        {isBangla ? 'প্রধান ভিজ্যুয়াল ডিজাইনার ও এডমিন' : 'Lead Visual Designer & Administrator'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {isBangla ? 'টেকনাফের প্রধান ক্রীড়া সংবাদ ও টুর্নামেন্ট মিডিয়া হাব।' : 'Premier sports news and tournament media hub of Teknaf.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Independent Tech & Design Practice */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--card-border)'
              }}>
                <Code2 size={20} color="#00E676" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isBangla ? 'স্বাধীন সফটওয়্যার ডেভেলপমেন্ট ও ডিজিটাল ভিজ্যুয়াল আর্ট' : 'Independent Software Development & Digital Visual Art'}
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {isBangla 
                      ? 'ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপস (Flutter/Dart), ফুল-স্ট্যাক ওয়েব প্ল্যাটফর্ম (React, Node, Firebase), এবং নিখুঁত ফটো এডিটিং ও ভিজ্যুয়াল ব্র্যান্ডিং তৈরি করা।'
                      : 'Crafting cross-platform mobile apps (Flutter/Dart), full-stack web platforms (React, Node, Firebase), and high-precision digital photo editing and visual branding.'
                    }
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Card 2: Family Background */}
            <SectionCard 
              title={isBangla ? 'পারিবারিক পরিচয়' : 'Family Background'} 
              subtitle={isBangla ? 'ঐতিহ্য ও পারিবারিক মূল্যবোধ' : 'Heritage & Family Values'} 
              icon={Home} 
              color="#FFAA00"
              isBangla={isBangla}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px'
              }}>
                {/* Father Info */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
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
                  borderRadius: '12px',
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
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 170, 0, 0.05)' : 'rgba(255, 170, 0, 0.05)',
                border: `1px solid ${isDark ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 170, 0, 0.2)'}`,
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

            {/* Card 3: Education */}
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
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--card-border)'
                }}>
                  <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'সুফিয়া নূরিয়া দাখিল মাদ্রাসা' : 'Supia Nuria Dhakil Madrasah'}
                    </div>
                  </div>
                </div>

                {/* 2. Teknaf Model Pilot High School */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--card-border)'
                }}>
                  <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'টেকনাফ মডেল পাইলট উচ্চ বিদ্যালয়' : 'Teknaf Model Pailot High School'}
                    </div>
                  </div>
                </div>

                {/* 3. Teknaf Degree College */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--card-border)'
                }}>
                  <CheckCircle2 size={18} color="#00E676" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'টেকনাফ ডিগ্রি কলেজ' : 'Teknaf Degree College'}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Card 4: Courses & Certifications */}
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
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--card-border)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'প্রোগ্রামিং হিরো বিশেষায়িত লার্নিং' : 'Programming Hero Specialized Learning'}
                    </div>
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
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--card-border)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'ওয়েব ডেভেলপমেন্ট ও কম্পিটিটিভ প্রোগ্রামিং' : 'Web Dev & Competitive Programming'}
                    </div>
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
                  borderRadius: '12px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--card-border)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isBangla ? 'ফটো এডিটিং ও ডিজিটাল আর্ট দক্ষতা' : 'Photo Editing & Digital Art Mastery'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#FFAA00', fontWeight: 600 }}>
                    {isBangla ? 'স্ব-উদ্যোগে অর্জিত দক্ষতা' : 'Self-taught Excellence'}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Card 5: Vision & Community Mission */}
            <SectionCard 
              title={isBangla ? 'ভিশন ও সামাজিক অঙ্গীকার' : 'Vision & Community Mission'} 
              subtitle={isBangla ? 'মূল দর্শন ও উদ্দেশ্য' : 'Guiding Philosophy & Purpose'} 
              icon={HeartHandshake} 
              color="#FF1744"
              isBangla={isBangla}
            >
              {/* Quote Highlight */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '16px',
                background: isDark ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 23, 68, 0.05)',
                border: '1px solid rgba(255, 23, 68, 0.25)',
                fontSize: '1rem',
                fontStyle: 'italic',
                fontWeight: 700,
                color: '#FF1744',
                textAlign: 'center',
                boxShadow: isDark ? '0 0 25px rgba(255, 23, 68, 0.15)' : 'none'
              }}>
                {isBangla 
                  ? '“সরলতা, সততা এবং মানবিক সহমর্মিতার সাথে সর্বদা মানুষের সেবা করাই আমার অঙ্গীকার।”'
                  : '"Always serve humanity through simplicity, honesty, and persistent empathy."'
                }
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)'
                }}>
                  {isBangla 
                    ? 'আমার মূল দর্শন সাধারণ জীবনযাপন, সৎ প্রচেষ্টা এবং মানবকল্যাণে সক্রিয় ভূমিকা পালনের ওপর প্রতিষ্ঠিত। প্রযুক্তি মানুষের জীবনযাত্রাকে সহজ করার একটি শক্তিশালী মাধ্যম।'
                    : 'My core philosophy is rooted in simple living, honest dedication, and actively serving humanity. I believe technology is a transformative tool designed to empower individuals and solve real-world problems.'
                  }
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)'
                }}>
                  {isBangla 
                    ? 'আমার স্বপ্ন সফটওয়্যার ইঞ্জিনিয়ারিং ও ডিজিটাল মিডিয়ার মাধ্যমে টেকনাফ ও নতুন পল্লান পাড়ার মানুষের জীবনমান উন্নয়নে কার্যকর অবদান রাখা।'
                    : 'My primary mission is to leverage software engineering, digital design, and media connectivity to uplift the local community of Natun Pollan Para, Teknaf and contribute meaningfully to society.'
                  }
                </p>
              </div>
            </SectionCard>

          </div>

          {/* Bottom Close / Dismiss Action */}
          <div style={{ marginTop: '30px', width: '100%', maxWidth: '320px' }}>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 240, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
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
