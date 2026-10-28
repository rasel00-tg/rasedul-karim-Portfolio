import React, { useState, useEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Mail, 
  Bell, 
  Check, 
  Copy, 
  Eye, 
  X, 
  ShieldAlert, 
  AlertCircle, 
  AlertTriangle,
  ExternalLink, 
  Globe, 
  FileText, 
  Users, 
  CheckCircle2, 
  Loader2, 
  Sun,
  Moon,
  Menu,
  Sparkles,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { recordUniqueVisit } from '../services/visitorService';
import { subscribeEmail, sendSubscriptionOtp, isEmailSubscribed } from '../services/subscriptionService';
import BentoGridSection from './StackedLinkCapsules';
import ConnectModal from './ConnectModal';

const CleanAmbientBackdrop = React.memo(({ isDark }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', transform: 'translateZ(0)' }}>
      {/* Top-Left Ambient Flare */}
      <motion.div
        animate={{ 
          x: [-10, 20, -10],
          y: [-10, 25, -10],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-60px',
          left: '-50px',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(147, 51, 234, 0.12) 50%, transparent 75%)' 
            : 'radial-gradient(circle, rgba(0, 180, 255, 0.32) 0%, rgba(56, 189, 248, 0.12) 50%, transparent 75%)',
          filter: 'blur(45px)',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />

      {/* Top-Right Ambient Flare */}
      <motion.div
        animate={{ 
          x: [15, -15, 15],
          y: [0, -20, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: isDark 
            ? 'radial-gradient(circle, rgba(0, 240, 255, 0.22) 0%, rgba(14, 74, 89, 0.08) 55%, transparent 75%)' 
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(186, 230, 253, 0.1) 55%, transparent 75%)',
          filter: 'blur(40px)',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />

      {/* Center-Bottom Luminous Horizon Glow */}
      <div style={{
        position: 'absolute',
        bottom: '-90px',
        left: '15%',
        right: '15%',
        height: '260px',
        borderRadius: '50%',
        background: isDark 
          ? 'radial-gradient(ellipse at bottom, rgba(192, 132, 252, 0.38) 0%, rgba(168, 85, 247, 0.18) 45%, transparent 75%)' 
          : 'radial-gradient(ellipse at bottom, rgba(0, 180, 255, 0.38) 0%, rgba(125, 211, 252, 0.18) 45%, transparent 75%)',
        filter: 'blur(45px)',
        transform: 'translateZ(0)'
      }} />
    </div>
  );
});
CleanAmbientBackdrop.displayName = 'CleanAmbientBackdrop';

const HeroSection = ({ 
  isDreamOpen, 
  onOpenProjects,
  onOpenAbout, 
  onOpenDream, 
  onOpenSkill, 
  onOpenReview, 
  onOpenQR,
  onOpenDrawer,
  onOpenDesign,
  onOpenUpcoming,
  onOpenFavorite,
  onOpenDeals,
  isSubscribeOpen: propIsSubscribeOpen,
  setIsSubscribeOpen: propSetIsSubscribeOpen
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { isBangla, t } = useLanguage();
  const [localIsSubscribeOpen, setLocalIsSubscribeOpen] = useState(false);
  const isSubscribeOpen = propIsSubscribeOpen !== undefined ? propIsSubscribeOpen : localIsSubscribeOpen;
  const setIsSubscribeOpen = propSetIsSubscribeOpen || setLocalIsSubscribeOpen;

  const [subEmailInput, setSubEmailInput] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subResult, setSubResult] = useState(null); // { success: boolean, alreadySubscribed?: boolean, message: string }
  const [subStep, setSubStep] = useState('email'); // 'email' | 'otp' | 'success' | 'alreadySubscribed'
  const [subOtpCode, setSubOtpCode] = useState('');
  const [enteredSubOtp, setEnteredSubOtp] = useState('');
  const [subOtpError, setSubOtpError] = useState(null);
  const [subOtpTimer, setSubOtpTimer] = useState(300);
  const [subOtpSending, setSubOtpSending] = useState(false);
  const [subOtpVerifying, setSubOtpVerifying] = useState(false);

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isPolicyDetailOpen, setIsPolicyDetailOpen] = useState(false);
  const [hasAgreedPolicy, setHasAgreedPolicy] = useState(false);
  const [policyLanguage, setPolicyLanguage] = useState('en');

  // Subscription OTP Countdown Timer (5 Minutes)
  useEffect(() => {
    let interval = null;
    if (isSubscribeOpen && subStep === 'otp' && subOtpTimer > 0) {
      interval = setInterval(() => {
        setSubOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubscribeOpen, subStep, subOtpTimer]);

  // Instant Zero-Lag Asset Pre-caching Pipeline
  useEffect(() => {
    const assetSources = ['/profile.jpeg', '/about.png', '/add1.png', '/add2.png', '/app1.png', '/app2.png'];
    assetSources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Initialize unique visit tracking
  useEffect(() => {
    recordUniqueVisit();
  }, []);

  const handleSubscribeSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = (subEmailInput || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setSubResult({
        success: false,
        message: isBangla ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.'
      });
      return;
    }

    setSubLoading(true);
    setSubResult(null);

    try {
      // ১. ইমেইলটি ইতোপূর্বে সাবস্ক্রাইব করা আছে কিনা যাচাই
      const already = await isEmailSubscribed(cleanEmail);
      if (already) {
        setSubLoading(false);
        setSubStep('alreadySubscribed');
        return;
      }

      // ২. ৬-ডিজিটের র‍্যান্ডম ওটিপি তৈরি
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSubOtpCode(randomOtp);
      setEnteredSubOtp('');
      setSubOtpError(null);
      setSubOtpTimer(300);

      // ৩. ব্যাকএন্ড Gmail SMTP-এর মাধ্যমে ওটিপি কোড পাঠানো
      const dispatchRes = await sendSubscriptionOtp(cleanEmail, randomOtp);
      setSubLoading(false);

      if (dispatchRes && dispatchRes.success) {
        setSubStep('otp');
      } else {
        setSubResult({
          success: false,
          message: dispatchRes?.message || (isBangla 
            ? 'ইমেইলে ওটিপি পাঠানো সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।' 
            : 'Could not send verification OTP. Please try again later.')
        });
      }
    } catch (err) {
      setSubLoading(false);
      setSubResult({
        success: false,
        message: isBangla ? 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। নেটওয়ার্ক চেক করুন।' : 'Connection error. Please check your network.'
      });
    }
  };

  const handleResendSubOtp = async () => {
    const cleanEmail = (subEmailInput || '').trim().toLowerCase();
    if (!cleanEmail) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSubOtpCode(newOtp);
    setEnteredSubOtp('');
    setSubOtpError(null);
    setSubOtpTimer(300);
    setSubOtpSending(true);
    try {
      const resendRes = await sendSubscriptionOtp(cleanEmail, newOtp);
      if (!resendRes?.success) {
        setSubOtpError(resendRes?.message || (isBangla ? 'ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে।' : 'Failed to resend OTP.'));
      }
    } catch (err) {
      console.warn('Resend sub OTP error:', err);
      setSubOtpError(isBangla ? 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।' : 'Server connection failed.');
    } finally {
      setSubOtpSending(false);
    }
  };

  const handleVerifySubOtpAndComplete = async (e) => {
    if (e) e.preventDefault();
    setSubOtpError(null);

    const cleanInput = (enteredSubOtp || '').trim();
    if (!cleanInput) {
      setSubOtpError(isBangla ? '৬ ডিজিটের ওটিপি কোডটি লিখুন।' : 'Please enter the 6-digit OTP code.');
      return;
    }

    if (cleanInput !== subOtpCode.trim()) {
      setSubOtpError(isBangla ? 'ভুল ওটিপি কোড! অনুগ্রহ করে আপনার ইনবক্স চেক করে সঠিক কোডটি দিন।' : 'Invalid OTP code! Please check your inbox and enter the correct code.');
      return;
    }

    setSubOtpVerifying(true);
    try {
      const cleanEmail = (subEmailInput || '').trim().toLowerCase();
      // ওটিপি যাচাই সফল হলে তবেই ফায়ারস্টোরের subscribers কালেকশনে নিবন্ধিত হবে
      await subscribeEmail(cleanEmail, { isVerified: true, verifiedMethod: 'gmail_smtp_otp' });
      localStorage.setItem('subscriber_deal_email', cleanEmail);
      setSubStep('success');
    } catch (err) {
      setSubOtpError(err?.message || (isBangla ? 'সাবস্ক্রিপশন সম্পন্ন করতে সমস্যা হয়েছে।' : 'Failed to complete subscription.'));
    } finally {
      setSubOtpVerifying(false);
    }
  };

  const handleCloseSubscribeModal = () => {
    setIsSubscribeOpen(false);
    setSubResult(null);
    setSubEmailInput('');
    setSubStep('email');
    setEnteredSubOtp('');
    setSubOtpError(null);
  };

  const handleOpenGoogleChat = () => {
    window.open('https://chat.google.com/dm/rasedul.karim.connect@gmail.com', '_blank', 'noopener,noreferrer');
    setIsWarningOpen(false);
    setIsPolicyDetailOpen(false);
  };

  const socialLinks = [
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1CiNH7Gnt6/',
      borderColor: '#1877F2',
      glow: '0 0 10px rgba(24, 119, 242, 0.5)',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: 'https://wa.me/8801871176267',
      borderColor: '#25D366',
      glow: '0 0 10px rgba(37, 211, 102, 0.5)',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="#25D366">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      url: 'https://t.me/rasedulkarim',
      borderColor: '#229ED9',
      glow: '0 0 10px rgba(34, 158, 217, 0.5)',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="#229ED9">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.34-.635.34l.213-3.053 5.56-5.023c.24-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.894z"/>
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/@its.rasel.bro143?feature=shared',
      borderColor: '#FF0000',
      glow: '0 0 10px rgba(255, 0, 0, 0.5)',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/rasedulkarim.00?stkn=MWZ3ZHZiYm15dW12cA==',
      borderColor: '#E4405F',
      glow: '0 0 10px rgba(228, 64, 95, 0.5)',
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="#E4405F">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      id: 'twitter',
      name: 'Twitter (X)',
      url: 'https://x.com/rasedulkarim0',
      borderColor: '#F8FAFC',
      glow: '0 0 10px rgba(248, 250, 252, 0.4)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isDark ? '#FFFFFF' : '#000000'}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
  ];

  return (
    <section 
      id="hero" 
      className="min-h-screen w-full flex flex-col"
      style={{ 
        width: '100%',
        margin: '0',
        padding: '0',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 2,
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
      {/* Clean Ambient Floating 3D Backdrop */}
      <CleanAmbientBackdrop isDark={isDark} />

      {/* Main Single-Screen Responsive Container */}
      <div className="hero-responsive-container">
        
        {/* Top Header Action Bar: Mobile Only (Desktop uses top pinned navbar) */}
        <div className="hero-mobile-header-bar">
          {/* Left: Sun / Moon Mode Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--card-border)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>

          {/* Right: Hamburger Drawer Menu Button */}
          <motion.button
            onClick={onOpenDrawer}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
            }}
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu size={18} />
          </motion.button>
        </div>

        {/* 2-Column Split Bento Grid: Left Profile Hub (Col Span 5), Right Feature Bento & Carousel (Col Span 7) */}
        <div className="hero-bento-desktop-layout">
          {/* LEFT HUB: Profile, Verified Name, Dual Action Buttons, Counters & Social Media */}
          <div className="hero-left-hub">
            {/* Circular Avatar (Responsive: 118px Mobile -> 150px Desktop) */}
            <motion.div
              className="hero-profile-avatar-wrapper"
              whileHover={{ scale: 1.03 }}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #0E4A59 100%)',
                boxShadow: isDark 
                  ? '0 8px 32px rgba(255, 107, 53, 0.4), 0 0 24px rgba(14, 74, 89, 0.35)' 
                  : '0 8px 24px rgba(0, 0, 0, 0.12), 0 0 18px rgba(255, 107, 53, 0.25)',
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
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width="150"
                  height="150"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '1 / 1' }}
                  onError={(e) => {
                    if (e.target.src.includes('/about.png')) {
                      e.target.src = '/profile.jpeg';
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Name & Decoupled Verified Badge (Responsive Typography 11.5px mobile to 27px desktop & 30px Rosette Badge) */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}>
              <h1 
                className="hero-profile-name"
                style={{
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: isBangla ? '0' : '0.3px'
                }}
              >
                {t('hero.name', isBangla ? 'রাশেদুল করিম' : 'Rasedul Karim')}
              </h1>

              {/* Rotating Rosette Verified Badge (Responsive Enlarged Rosette Badge) */}
              <div 
                className="hero-verified-badge"
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={t('hero.verified', 'Verified Profile')}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M 12.00 1.50 A 2.95 2.95 0 0 1 16.02 2.30 A 2.95 2.95 0 0 1 19.42 4.58 A 2.95 2.95 0 0 1 21.70 7.98 A 2.95 2.95 0 0 1 22.50 12.00 A 2.95 2.95 0 0 1 21.70 16.02 A 2.95 2.95 0 0 1 19.42 19.42 A 2.95 2.95 0 0 1 16.02 21.70 A 2.95 2.95 0 0 1 12.00 22.50 A 2.95 2.95 0 0 1 7.98 21.70 A 2.95 2.95 0 0 1 4.58 19.42 A 2.95 2.95 0 0 1 2.30 16.02 A 2.95 2.95 0 0 1 1.50 12.00 A 2.95 2.95 0 0 1 2.30 7.98 A 2.95 2.95 0 0 1 4.58 4.58 A 2.95 2.95 0 0 1 7.98 2.30 A 2.95 2.95 0 0 1 12.00 1.50 Z" 
                      fill="#FF1744" 
                    />
                  </svg>
                </motion.div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path d="M8.2 12.3L10.8 14.9L16.2 9.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* RESTORED: [ Chat in Mail ] & [ Connect ] Dual Action Buttons */}
            <div className="hero-action-buttons-row">
              {/* Button 1: Chat in Mail (High Contrast Surface) */}
              <motion.button
                onClick={() => setIsWarningOpen(true)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="hero-action-btn"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1.5px solid rgba(0, 180, 255, 0.35)',
                  color: isDark ? '#FFFFFF' : '#0A192F',
                  boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0, 160, 255, 0.12)',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                }}
              >
                <Mail size={16} color={isDark ? 'var(--primary-color)' : '#00B4D8'} />
                <span style={{ fontWeight: 800 }}>{t('hero.chatInMail', 'Chat in Mail')}</span>
              </motion.button>

              {/* Button 2: Connect (Google & GitHub 1-Click Auth) */}
              <motion.button
                onClick={() => setIsSubscribeOpen(true)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="hero-action-btn"
                style={{
                  background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.45)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                }}
                title={isBangla ? 'কানেক্ট করুন' : 'Connect'}
              >
                <Sparkles size={16} color="#FFFFFF" />
                <span style={{ fontWeight: 800 }}>{isBangla ? 'কানেক্ট' : 'Connect'}</span>
              </motion.button>
            </div>


            {/* Enlarged Social Icons Row (Responsive 38px -> 44px on Desktop) */}
            <div className="hero-social-links-row">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="hero-social-badge"
                  style={{
                    background: isDark ? 'rgba(13, 17, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                    border: `1.5px solid ${item.borderColor}`,
                    boxShadow: item.glow,
                  }}
                  title={item.name}
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </div>

        {/* RIGHT HUB: 6 Feature Bento Tabs & 6-Slide Auto-Scrolling Carousel */}
        <div className="hero-right-hub">
          <BentoGridSection
            onOpenProjects={onOpenProjects}
            onOpenAbout={onOpenAbout}
            onOpenDream={onOpenDream}
            onOpenSkill={onOpenSkill}
            onOpenReview={onOpenReview}
            onOpenSubscribe={() => setIsSubscribeOpen(true)}
            onOpenDesign={onOpenDesign}
            onOpenUpcoming={onOpenUpcoming}
            onOpenFavorite={onOpenFavorite}
            onOpenDeals={onOpenDeals}
          />
        </div>
      </div>
    </div>

      {/* 5. Warning Policy Agreement Modal Dialog (Rendered via Portal to Document Body with z-index 999999) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isWarningOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999999,
                padding: '16px',
                boxSizing: 'border-box'
              }}
              onClick={() => setIsWarningOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 25 }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  background: isDark ? 'linear-gradient(145deg, #111827 0%, #161B22 100%)' : '#FFFFFF',
                  border: isDark ? '1.5px solid rgba(0, 229, 255, 0.35)' : '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '28px',
                  padding: '30px 24px 24px 24px',
                  textAlign: 'center',
                  boxShadow: isDark 
                    ? '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 229, 255, 0.2)' 
                    : '0 20px 50px rgba(0, 0, 0, 0.18)',
                  position: 'relative',
                  maxHeight: '92vh',
                  overflowY: 'auto'
                }}
              >
                {/* Top-Right Clean Rounded Close Button */}
                <motion.button
                  onClick={() => setIsWarningOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  aria-label="Close modal"
                >
                  <X size={16} />
                </motion.button>

                {/* Modern Digital Header Illustration Composition (Envelope + Security Badge + Floating Particles) */}
                <div style={{
                  position: 'relative',
                  width: '76px',
                  height: '76px',
                  margin: '0 auto 18px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Outer Glowing Circle Backdrop */}
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        '0 0 20px rgba(0, 229, 255, 0.25)',
                        '0 0 35px rgba(0, 229, 255, 0.45)',
                        '0 0 20px rgba(0, 229, 255, 0.25)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: isDark 
                        ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)' 
                        : 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(0, 119, 182, 0.1) 100%)',
                      border: '1.5px solid rgba(0, 229, 255, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <Mail size={34} color="#00E5FF" />

                    {/* Corner Security Shield Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#111827',
                      border: '1.5px solid #FF1744',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(255, 23, 68, 0.5)'
                    }}>
                      <ShieldAlert size={14} color="#FF1744" />
                    </div>
                  </motion.div>
                </div>

                {/* Primary Bold Headline */}
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '0.3px',
                  color: 'var(--text-primary)',
                  margin: '0 0 8px 0',
                  lineHeight: 1.2
                }}>
                  Communication Policy Notice
                </h3>

                {/* Subtext & Guidelines */}
                <p style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  margin: '0 0 16px 0',
                  padding: '0 6px',
                  fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
                }}>
                  {isBangla 
                    ? 'বিজ্ঞপ্তি: সরাসরি চ্যাটে যাওয়ার আগে অনুগ্রহ করে আমাদের যোগাযোগ ও মেসেজিং নীতিমালা পর্যালোচনা করুন।'
                    : 'Notice: Please review our Communication & Messaging Policy before proceeding to direct chat.'}
                </p>

                {/* Slim Hyperlink Pill for Full Policy */}
                <div style={{ marginBottom: '20px' }}>
                  <motion.button
                    onClick={() => {
                      setIsWarningOpen(false);
                      setIsPolicyDetailOpen(true);
                    }}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: isDark ? 'rgba(0, 229, 255, 0.08)' : 'rgba(0, 119, 182, 0.08)',
                      border: '1px solid rgba(0, 229, 255, 0.35)',
                      color: 'var(--primary-color)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: '20px',
                      padding: '7px 16px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 10px rgba(0, 229, 255, 0.1)',
                      fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
                    }}
                  >
                    <FileText size={14} /> 
                    <span>Read Full Policy / সম্পূর্ণ নীতিমালা পড়ুন</span>
                  </motion.button>
                </div>

                {/* Consent Checkbox Box */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '0.84rem',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '20px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: hasAgreedPolicy 
                    ? (isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 119, 182, 0.08)')
                    : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'),
                  border: hasAgreedPolicy 
                    ? '1.5px solid rgba(0, 229, 255, 0.55)' 
                    : '1px solid var(--card-border)',
                  boxShadow: hasAgreedPolicy ? '0 0 15px rgba(0, 229, 255, 0.18)' : 'none',
                  transition: 'all 0.25s ease',
                  fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
                }}>
                  <input 
                    type="checkbox"
                    checked={hasAgreedPolicy}
                    onChange={(e) => setHasAgreedPolicy(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#00E5FF'
                    }}
                  />
                  <span>
                    {isBangla 
                      ? 'আমি সতর্কবার্তা ও নীতিমালা পড়েছি এবং সম্মত আছি।' 
                      : 'I have read and agree to the Warning Policy.'}
                  </span>
                </label>

                {/* Full-Width Rounded Capsule Proceed Button */}
                <motion.button
                  onClick={handleOpenGoogleChat}
                  disabled={!hasAgreedPolicy}
                  whileHover={hasAgreedPolicy ? { scale: 1.02, y: -2 } : {}}
                  whileTap={hasAgreedPolicy ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: '30px',
                    background: hasAgreedPolicy 
                      ? 'linear-gradient(135deg, #00F0FF 0%, #00E676 100%)' 
                      : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'),
                    border: 'none',
                    color: hasAgreedPolicy ? '#000000' : 'var(--text-secondary)',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    letterSpacing: '0.4px',
                    cursor: hasAgreedPolicy ? 'pointer' : 'not-allowed',
                    opacity: hasAgreedPolicy ? 1 : 0.45,
                    boxShadow: hasAgreedPolicy ? '0 6px 25px rgba(0, 240, 255, 0.45)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.25s ease',
                    fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif"
                  }}
                >
                  <span>Proceed to Google Chat</span>
                  <ExternalLink size={16} strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 6. Dedicated Bilingual Policy Modal (Rendered via Portal to Document Body with z-index 999999) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isPolicyDetailOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.88)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999999,
                padding: '16px',
                boxSizing: 'border-box'
              }}
              onClick={() => setIsPolicyDetailOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(255, 23, 68, 0.35)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
                  position: 'relative',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                {/* Header with Language Switcher */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--card-border)',
                  paddingBottom: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} color="#FF1744" />
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Communication Policy
                    </span>
                  </div>

                  {/* Language Toggle Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    borderRadius: '20px',
                    padding: '2px',
                    border: '1px solid var(--card-border)'
                  }}>
                    <button
                      onClick={() => setPolicyLanguage('en')}
                      style={{
                        background: policyLanguage === 'en' ? 'var(--primary-color)' : 'transparent',
                        color: policyLanguage === 'en' ? '#000000' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setPolicyLanguage('bn')}
                      style={{
                        background: policyLanguage === 'bn' ? 'var(--primary-color)' : 'transparent',
                        color: policyLanguage === 'bn' ? '#000000' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>

                {/* Policy Body Content */}
                {policyLanguage === 'en' ? (
                  <div style={{ textAlign: 'left', lineHeight: 1.6, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <h4 style={{ color: '#FF1744', margin: '0 0 8px 0', fontSize: '0.96rem', fontWeight: 800 }}>
                      Official Messaging Guidelines:
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                      Strictly professional inquiries only. Any spam, unsolicited promotional messages, unsolicited requests, or irrelevant communication will result in an immediate and permanent block. Please respect professional boundaries and do not initiate contact without a valid work-related purpose.
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'left', lineHeight: 1.65, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <h4 style={{ color: '#FF1744', margin: '0 0 8px 0', fontSize: '0.96rem', fontWeight: 800 }}>
                      অফিসিয়াল যোগাযোগ নীতিমালা:
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                      শুধুমাত্র পেশাগত ও প্রয়োজনীয় বিষয়ে যোগাযোগের জন্য অনুরোধ করা হচ্ছে। কেউ অপ্রয়োজনীয় বার্তা, স্প্যাম বা অযথা মেসেজ রিকোয়েস্ট পাঠালে তাকে কোনো প্রকার পূর্ব নোটিশ ছাড়াই সরাসরি ও স্থায়ীভাবে ব্লক করা হবে। অনুগ্রহ করে সময়ের মূল্য বজায় রাখুন এবং সুনির্দিষ্ট কারণ ছাড়া বার্তা পাঠানো থেকে বিরত থাকুন।
                    </p>
                  </div>
                )}

                {/* Modal Confirmation Action */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <motion.button
                    onClick={() => {
                      setHasAgreedPolicy(true);
                      setIsPolicyDetailOpen(false);
                      setIsWarningOpen(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '30px',
                      background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
                      border: 'none',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
                    }}
                  >
                    {policyLanguage === 'en' ? 'I Agree & Return' : 'আমি একমত ও ফিরে যান'}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 7. 1-Click Google & GitHub Connect Modal Dialog */}
      <ConnectModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        onOpenProjects={onOpenProjects}
        onOpenDeals={onOpenDeals}
      />
    </section>
  );
};

export default memo(HeroSection);
