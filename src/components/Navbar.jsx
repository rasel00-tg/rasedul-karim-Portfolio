import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Zap, 
  Target, 
  Settings, 
  Sun, 
  Moon, 
  QrCode,
  Sparkles,
  ChevronRight,
  Globe,
  Check,
  Star,
  SlidersHorizontal
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ onOpenDream, onOpenAbout, onOpenAdmin, onOpenQR, onOpenSkill, onOpenReview }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('ABOUT');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const { isBangla, language, setLanguage, languagesList, t } = useLanguage();

  // Secret Admin hotkey: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdmin && onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdmin]);

  // Primary 5 Top-Level Menu Items in Specific Order
  const mainNavItems = [
    {
      id: 'ABOUT',
      label: isBangla ? 'সম্পর্কে' : 'ABOUT',
      sublabel: isBangla ? 'প্রোফাইল ও পরিচিতি' : 'Biography & Journey',
      icon: <User size={19} />,
      color: '#00E5FF', // Electric Cyan
      bgTint: 'rgba(0, 229, 255, 0.08)',
      borderTint: 'rgba(0, 229, 255, 0.25)',
      glowShadow: '0 4px 20px rgba(0, 229, 255, 0.15)',
      action: () => {
        setActiveItem('ABOUT');
        setIsDrawerOpen(false);
        setIsDesktopSettingsOpen(false);
        onOpenAbout && onOpenAbout();
      }
    },
    {
      id: 'SKILL',
      label: isBangla ? 'দক্ষতা' : 'SKILL',
      sublabel: isBangla ? 'টেকনিক্যাল দক্ষতা' : 'Technical Expertise',
      icon: <Zap size={19} />,
      color: '#10B981', // Vibrant Emerald
      bgTint: 'rgba(16, 185, 129, 0.08)',
      borderTint: 'rgba(16, 185, 129, 0.25)',
      glowShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
      action: () => {
        setActiveItem('SKILL');
        setIsDrawerOpen(false);
        setIsDesktopSettingsOpen(false);
        onOpenSkill ? onOpenSkill() : (() => {
          const el = document.getElementById('skills');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        })();
      }
    },
    {
      id: 'DREAM',
      label: isBangla ? 'স্বপ্ন' : 'DREAM',
      sublabel: isBangla ? 'উন্নয়ন ও ভবিষ্যৎ লক্ষ্য' : 'Vision & Future Goals',
      icon: <Target size={19} />,
      color: '#A855F7', // Neon Purple / Violet
      bgTint: 'rgba(168, 85, 247, 0.08)',
      borderTint: 'rgba(168, 85, 247, 0.25)',
      glowShadow: '0 4px 20px rgba(168, 85, 247, 0.15)',
      action: () => {
        setActiveItem('DREAM');
        setIsDrawerOpen(false);
        setIsDesktopSettingsOpen(false);
        onOpenDream && onOpenDream();
      }
    },
    {
      id: 'REVIEWS',
      label: isBangla ? 'রেটিং ও রিভিউ' : 'REVIEWS',
      sublabel: isBangla ? 'গ্রাহক মূল্যায়ন ও ফিডব্যাক' : 'Ratings & Feedback',
      icon: <Star size={19} fill="#F59E0B" />,
      color: '#F59E0B', // Vibrant Amber / Gold
      bgTint: 'rgba(245, 158, 11, 0.1)',
      borderTint: 'rgba(245, 158, 11, 0.35)',
      glowShadow: '0 4px 22px rgba(245, 158, 11, 0.25)',
      action: () => {
        setActiveItem('REVIEWS');
        setIsDrawerOpen(false);
        setIsDesktopSettingsOpen(false);
        onOpenReview && onOpenReview();
      }
    },
    {
      id: 'SETTING',
      label: isBangla ? 'সেটিংস' : 'SETTINGS',
      sublabel: isBangla ? 'কন্ট্রোল ও সেটিংস' : 'Preferences & Setup',
      icon: <Settings size={19} />,
      color: '#FF7A00', // Sunset Orange
      bgTint: 'rgba(255, 122, 0, 0.08)',
      borderTint: 'rgba(255, 122, 0, 0.25)',
      glowShadow: '0 4px 20px rgba(255, 122, 0, 0.15)',
      action: () => {
        setActiveItem('SETTING');
        setIsSettingsOpen(!isSettingsOpen);
        setIsDesktopSettingsOpen(!isDesktopSettingsOpen);
      }
    }
  ];

  return (
    <>
      {/* Pinned Desktop Top Navigation Bar (>= 1024px) */}
      <header
        className="desktop-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: isDark ? 'rgba(13, 17, 23, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 119, 182, 0.2)'}`,
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.45)' : '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Left: Brand Identity Logo & Name with Live Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: '2px',
            background: 'linear-gradient(135deg, #00F0FF 0%, #00E676 50%, #FF007F 100%)',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src="/logo.png" 
              alt="RASHED Logo" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                if (e.target.src.includes('/logo.png')) {
                  e.target.src = '/about.png';
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 900,
              letterSpacing: '2px',
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              RASHED
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--primary-color)',
              letterSpacing: '0.3px',
              fontWeight: 700,
              marginTop: '2px',
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
            }}>
              {new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }).format(new Date())}
            </span>
          </div>
        </div>

        {/* Center: 5 Permanent Colorful Menu Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          {mainNavItems.map((item) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <motion.button
                onClick={item.action}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: activeItem === item.id ? item.bgTint : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${activeItem === item.id ? item.borderTint : 'rgba(255, 255, 255, 0.08)'}`,
                  boxShadow: activeItem === item.id ? item.glowShadow : 'none',
                  color: activeItem === item.id ? item.color : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: isBangla ? '0' : '0.5px',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif",
                  transition: 'all 0.25s ease'
                }}
              >
                <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>

              {/* Desktop Settings Dropdown (Only Discreet "Control" Gateway) */}
              {item.id === 'SETTING' && isDesktopSettingsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  background: isDark ? '#0D1117' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '14px',
                  padding: '6px',
                  minWidth: '150px',
                  boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.7)' : '0 8px 25px rgba(0, 0, 0, 0.12)',
                  zIndex: 1001
                }}>
                  <button
                    onClick={() => {
                      setIsDesktopSettingsOpen(false);
                      onOpenAdmin && onOpenAdmin();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: isDark ? '#94A3B8' : '#64748B',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isDark ? '#94A3B8' : '#64748B';
                    }}
                  >
                    <SlidersHorizontal size={15} color="#94A3B8" />
                    <span>{isBangla ? 'কন্ট্রোল' : 'Control'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Language Selector, QR Code & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switch Button */}
          <motion.button
            onClick={() => setIsLanguageModalOpen(true)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '20px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <Globe size={16} />
            <span>{isBangla ? 'বাংলা' : 'English'}</span>
          </motion.button>

          {/* QR Code Button */}
          <motion.button
            onClick={onOpenQR}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--capsule-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="QR Code"
          >
            <QrCode size={18} />
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--capsule-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </header>

      {/* Top Floating Corner Controls (Mobile < 1024px) */}
      <div 
        className="mobile-navbar-controls"
        style={{
          position: 'fixed',
          top: '14px',
          left: '14px',
          right: '14px',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        {/* Top-Left: Minimalist Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.12, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            pointerEvents: 'auto',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--card-border)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s ease'
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* Top-Right: Sleek Floating Menu Button */}
        <motion.button
          onClick={() => {
            setIsDrawerOpen(true);
            setIsSettingsOpen(false);
          }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          style={{
            pointerEvents: 'auto',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--card-border)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s ease'
          }}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </motion.button>
      </div>

      {/* Multi-Language Selection Popup Modal */}
      <AnimatePresence>
        {isLanguageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsLanguageModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.78)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 100005,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '440px',
                background: isDark ? '#161B22' : '#FFFFFF',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: isDark 
                  ? '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.25)' 
                  : '0 20px 50px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00F0FF'
                  }}>
                    <Globe size={19} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      color: 'var(--text-primary)'
                    }}>
                      {t('nav.languageTitle', 'Language Selection')}
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Select Language • ভাষা নির্বাচন করুন
                    </span>
                  </div>
                </div>

                {/* Top-Right Close Button */}
                <motion.button
                  onClick={() => setIsLanguageModalOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  aria-label="Close Language Modal"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* 4 Language Option Tiles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {languagesList.map((lang) => {
                  const isSelected = language === lang.id;
                  return (
                    <motion.button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        setIsLanguageModalOpen(false);
                        setIsDrawerOpen(false);
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: isSelected 
                          ? (isDark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 119, 182, 0.1)')
                          : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'),
                        border: isSelected 
                          ? '1px solid rgba(0, 240, 255, 0.5)' 
                          : '1px solid var(--card-border)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 15px rgba(0, 240, 255, 0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.35rem' }}>{lang.flag}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{
                            fontSize: '0.94rem',
                            fontWeight: 800,
                            color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                            fontFamily: lang.font || 'inherit'
                          }}>
                            {lang.nativeName}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {lang.name} {lang.isDefault && '• (Default)'}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00F0FF 0%, #00E676 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000000'
                        }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Minimalist Sidebar Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsDrawerOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99998
              }}
            />

            {/* Sidebar Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: 'min(320px, 85vw)',
                height: '100vh',
                background: isDark ? '#0D1117' : '#FFFFFF',
                borderLeft: isDark ? '1.5px solid rgba(0, 229, 255, 0.4)' : '1.5px solid rgba(0, 229, 255, 0.25)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isDark 
                  ? '-15px 0 50px rgba(0, 0, 0, 0.95), -1px 0 15px rgba(0, 240, 255, 0.2)' 
                  : '-10px 0 40px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
              }}
            >
              {/* 1. Header with Brand Identity Logo, "RASHED" & Live English Date/Day */}
              <div style={{
                padding: '22px 20px 14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`
              }}>
                {/* Brand Logo & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Circular Glowing Logo Container with Public Asset */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: 'linear-gradient(135deg, #00F0FF 0%, #00E676 50%, #FF007F 100%)',
                    boxShadow: '0 0 16px rgba(0, 240, 255, 0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <img 
                      src="/logo.png" 
                      alt="RASHED Logo" 
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        if (e.target.src.includes('/logo.png')) {
                          e.target.src = '/about.png';
                        } else {
                          e.target.style.display = 'none';
                          if (e.target.parentNode) {
                            e.target.parentNode.innerHTML = '<span style="font-weight:900;color:#000;font-size:1.1rem;font-family:Space Grotesk">R</span>';
                          }
                        }
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      letterSpacing: '1.8px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.1
                    }}>
                      RASHED
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      color: 'var(--primary-color)',
                      letterSpacing: '0.3px',
                      fontWeight: 700,
                      marginTop: '3px',
                      fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                    }}>
                      {new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }).format(new Date())}
                    </span>
                  </div>
                </div>

                {/* Subtle Rounded Square Close Button */}
                <motion.button
                  onClick={() => setIsDrawerOpen(false)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  aria-label="Close Navigation Drawer"
                >
                  <X size={17} />
                </motion.button>
              </div>

              {/* 2. Sleek Minimal Language Selector Trigger Pill ("Select Language") */}
              <div style={{ padding: '14px 20px 10px 20px' }}>
                <motion.button
                  onClick={() => setIsLanguageModalOpen(true)}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(0, 229, 255, 0.06)' : 'rgba(0, 119, 182, 0.06)',
                    border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.25)' : 'rgba(0, 119, 182, 0.25)'}`,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 229, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} color="var(--primary-color)" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, letterSpacing: '0.3px', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                      {isBangla ? 'ভাষা পরিবর্তন করুন' : 'Select Language'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>▾</span>
                </motion.button>
              </div>

              {/* 3. Structured Navigation Menu Items (5 Items in Exact Order) */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '4px 16px 12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '9px'
              }}>
                {/* Category Header Tag */}
                <div style={{
                  padding: '2px 6px 4px 6px',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase'
                }}>
                  {isBangla ? 'মেনু নেভিগেশন' : 'Navigation Tabs'}
                </div>

                {/* 5 Distinctly Styled Colorful Menu Cards */}
                {mainNavItems.map((item) => {
                  const isActive = activeItem === item.id;
                  return (
                    <div key={item.id}>
                      <motion.button
                        onClick={item.action}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          background: isDark ? item.bgTint : `${item.bgTint}`,
                          border: `1px solid ${isActive ? item.color : item.borderTint}`,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.25s ease',
                          boxShadow: isActive ? item.glowShadow : (isDark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.04)')
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Glowing Icon Badge */}
                          <div style={{ 
                            color: item.color,
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: isDark ? `${item.color}18` : `${item.color}14`,
                            border: `1px solid ${item.color}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 12px ${item.color}25`,
                            flexShrink: 0
                          }}>
                            {item.icon}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              letterSpacing: isBangla ? '0' : '0.8px',
                              color: isActive ? item.color : 'var(--text-primary)',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                            }}>
                              {item.label}
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-secondary)',
                              marginTop: '2px',
                              fontWeight: 500,
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                            }}>
                              {item.sublabel}
                            </span>
                          </div>
                        </div>

                        {item.id === 'SETTING' && (
                          <ChevronRight 
                            size={16} 
                            color={item.color}
                            style={{
                              transform: isSettingsOpen ? 'rotate(90deg)' : 'none',
                              transition: 'transform 0.2s',
                              opacity: 0.85
                            }} 
                          />
                        )}
                      </motion.button>

                      {/* Clean Discreet Sub-Menu for SETTING (Only Subtle "Control" Option) */}
                      {item.id === 'SETTING' && isSettingsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            padding: '6px 8px 4px 34px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          {/* Discreet Gateway for Admin / Control */}
                          <motion.button
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setIsDrawerOpen(false);
                              setIsSettingsOpen(false);
                              onOpenAdmin && onOpenAdmin();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '9px 12px',
                              borderRadius: '10px',
                              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                              color: isDark ? '#94A3B8' : '#64748B',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <SlidersHorizontal size={14} color="#94A3B8" />
                              <span>{isBangla ? 'কন্ট্রোল' : 'Control'}</span>
                            </div>
                            <span style={{ fontSize: '0.64rem', color: '#64748B' }}>•</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 4. Service Quote Footer (Clean Inspiring Typography) */}
              <div style={{
                padding: '18px 20px',
                borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--primary-color)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                }}>
                  <Sparkles size={13} />
                  <span>{isBangla ? 'মূল দর্শন' : 'Guiding Philosophy'}</span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.94rem',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  letterSpacing: '0.4px',
                  color: isDark ? '#E2E8F0' : '#334155',
                  textShadow: isDark ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                }}>
                  {isBangla ? '“সর্বদা মানুষের সেবা করুন।”' : '"Always serve humanity."'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
