import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Mail, 
  Sparkles,
  Users,
  Award,
  Clock,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  listenReviews, 
  submitReview, 
  calculateReviewStats, 
  getEmailCooldownStatus 
} from '../services/reviewService';

// Reference Image 2: Curved Header Flash Status Modal Component
const FlashStatusModal = ({ isOpen, type, title, message, buttonText, onClose, isBangla, isDark }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const headerBg = isSuccess 
    ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' 
    : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
  const buttonBg = isSuccess ? '#22C55E' : '#EF4444';
  const buttonHoverBg = isSuccess ? '#16A34A' : '#DC2626';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100002,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '380px',
            background: isDark ? '#0F172A' : '#FFFFFF',
            borderRadius: '26px',
            overflow: 'hidden',
            boxShadow: isDark 
              ? '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.5)' 
              : '0 20px 50px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Top Curved Decorative Header with Paper-Plane */}
          <div style={{
            width: '100%',
            height: '140px',
            background: headerBg,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomLeftRadius: '50% 28px',
            borderBottomRightRadius: '50% 28px',
            boxShadow: isSuccess 
              ? '0 10px 25px rgba(34, 197, 94, 0.4)' 
              : '0 10px 25px rgba(239, 68, 68, 0.4)'
          }}>
            {/* Paper-Plane Graphic with Motion Trails (Image 2 style) */}
            <div style={{ position: 'relative' }}>
              <svg width="76" height="76" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dotted motion trail */}
                <path 
                  d="M3 17 C 5 14, 8 15, 11 11" 
                  stroke="rgba(255, 255, 255, 0.5)" 
                  strokeWidth="1.8" 
                  strokeDasharray="2 3" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M5 20 C 8 18, 12 17, 14 13" 
                  stroke="rgba(255, 255, 255, 0.35)" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 3" 
                  strokeLinecap="round" 
                />
                {/* Main Paper Plane */}
                <path 
                  d="M21.5 2.5L10 14L4 9.5L21.5 2.5Z" 
                  fill="#FFFFFF" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.2" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M21.5 2.5L14.5 20L10 14L21.5 2.5Z" 
                  fill="rgba(255, 255, 255, 0.88)" 
                  stroke="#FFFFFF" 
                  strokeWidth="1.2" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '26px 28px 30px 28px', width: '100%', boxSizing: 'border-box' }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: isDark ? '#F8FAFC' : '#0F172A',
              letterSpacing: isBangla ? '0' : '0.5px',
              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
            }}>
              {title}
            </h3>

            <p style={{
              margin: '0 0 24px 0',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: isDark ? '#94A3B8' : '#475569',
              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
            }}>
              {message}
            </p>

            {/* Action Rounded Button */}
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: buttonHoverBg }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              style={{
                width: '100%',
                padding: '13px 24px',
                borderRadius: '50px',
                background: buttonBg,
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.96rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: isSuccess 
                  ? '0 6px 20px rgba(34, 197, 94, 0.45)' 
                  : '0 6px 20px rgba(239, 68, 68, 0.45)',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit',
                transition: 'background-color 0.2s ease'
              }}
            >
              {buttonText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ReviewModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, feedbackCount: 0, averageRating: '5.0' });
  
  // Form State - Empty Star default (rating = 0)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Notification Modal State (Image 2 style)
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'cooldown' | 'error'
    title: '',
    message: '',
    buttonText: ''
  });

  // Real-time Firestore Stream
  useEffect(() => {
    const unsubscribe = listenReviews((updatedList) => {
      setReviews(updatedList);
      setStats(calculateReviewStats(updatedList));
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // Format timestamp to "09 Sep 2026, 01:15 AM"
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Star Selection Validation
    if (!rating || rating === 0) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: isBangla ? 'রেটিং দিন' : 'Rating Required',
        message: isBangla 
          ? 'অনুগ্রহ করে কমপক্ষে ১ থেকে ৫ এর মধ্যে একটি স্টার রেটিং নির্বাচন করুন।' 
          : 'Please select a star rating between 1 and 5 before submitting.',
        buttonText: isBangla ? 'ঠিক আছে' : 'Okay!'
      });
      return;
    }

    if (!name.trim()) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: isBangla ? 'নাম প্রদান করুন' : 'Name Required',
        message: isBangla ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.',
        buttonText: isBangla ? 'ঠিক আছে' : 'Okay!'
      });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: isBangla ? 'সঠিক ইমেইল দিন' : 'Valid Email Required',
        message: isBangla ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.',
        buttonText: isBangla ? 'ঠিক আছে' : 'Okay!'
      });
      return;
    }

    // 15-Day Cooldown Check
    const cooldown = getEmailCooldownStatus(email.trim());
    if (cooldown.isBlocked) {
      setStatusModal({
        isOpen: true,
        type: 'cooldown',
        title: isBangla ? 'অপেক্ষা করুন' : 'COOLDOWN NOTICE!',
        message: isBangla
          ? 'আপনি এই ইমেইল দিয়ে ইতিমধ্যে একটি মতামত দিয়েছেন। পরবর্তী রিভিউ জমা দিতে অনুগ্রহ করে ১৫ দিন অপেক্ষা করুন।'
          : 'You have already submitted feedback with this email. Please wait 15 days before submitting another review.',
        buttonText: isBangla ? 'ঠিক আছে' : 'Okay!'
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        name,
        email,
        rating,
        feedback: feedback ? feedback.trim() : ''
      });

      // Show Green Success Flash Modal (Image 2 style)
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: isBangla ? 'সফল হয়েছে!' : 'SUCCESS!',
        message: isBangla
          ? 'আপনার মূল্যবান মতামত সফলভাবে সংরক্ষিত হয়েছে। ধন্যবাদ আমাদের সাথে থাকার জন্য।'
          : 'Your valuable feedback has been successfully saved. Thank you for being with us.',
        buttonText: isBangla ? 'ধন্যবাদ' : 'Thanks!'
      });

      // Reset Form to Clean Default
      setName('');
      setEmail('');
      setFeedback('');
      setRating(0);
      setHoverRating(0);
    } catch (err) {
      if (err.message === 'cooldown_active') {
        setStatusModal({
          isOpen: true,
          type: 'cooldown',
          title: isBangla ? 'অপেক্ষা করুন' : 'COOLDOWN NOTICE!',
          message: isBangla
            ? 'আপনি এই ইমেইল দিয়ে ইতিমধ্যে একটি মতামত দিয়েছেন। পরবর্তী রিভিউ জমা দিতে অনুগ্রহ করে ১৫ দিন অপেক্ষা করুন।'
            : 'You have already submitted feedback with this email. Please wait 15 days before submitting another review.',
          buttonText: isBangla ? 'ঠিক আছে' : 'Okay!'
        });
      } else {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: isBangla ? 'ত্রুটি' : 'ERROR!',
          message: isBangla 
            ? 'রিভিউ জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' 
            : 'Failed to submit feedback. Please check your network and try again.',
          buttonText: isBangla ? 'ঠিক আছে' : 'Okay!'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

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
            ? 'radial-gradient(circle at 18% 18%, rgba(245, 158, 11, 0.14) 0%, transparent 40%), radial-gradient(circle at 82% 82%, rgba(139, 92, 246, 0.18) 0%, transparent 45%), #070B14'
            : 'radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 45%), #F8FAFC',
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
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            width: '100%',
            maxWidth: '1100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '24px 16px 60px 16px',
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
              top: '16px',
              right: '16px',
              background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100000,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(12px)'
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </motion.button>

          {/* 1. COMPACT HORIZONTAL MINI-STATS ROW (Ultra-Thin Sleek Micro Cards) */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '18px',
            marginTop: '8px'
          }}>
            {/* Average Rating Mini Pill */}
            <div style={{
              flex: 1,
              height: '44px',
              background: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
                flexShrink: 0
              }}>
                <Star size={15} fill="#F59E0B" />
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {stats.averageRating} <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>/ 5.0</span>
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                  {isBangla ? 'গড় রেটিং' : 'Avg Rating'}
                </div>
              </div>
            </div>

            {/* Total Reviews Mini Pill */}
            <div style={{
              flex: 1,
              height: '44px',
              background: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FBBF24',
                flexShrink: 0
              }}>
                <Award size={15} />
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {stats.totalReviews}
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                  {isBangla ? 'মোট রিভিউ' : 'Total'}
                </div>
              </div>
            </div>

            {/* Detailed Feedbacks Mini Pill */}
            <div style={{
              flex: 1,
              height: '44px',
              background: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
                flexShrink: 0
              }}>
                <MessageSquare size={14} />
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {stats.feedbackCount}
                </div>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                  {isBangla ? 'মতামত' : 'Feedback'}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop 2-Column Split View: Left Form (5 cols), Right Live Feed (7 cols) */}
          <div className="review-split-grid" style={{ width: '100%', marginBottom: '20px' }}>
            {/* 2. SUBMISSION FORM CARD (Vibrant Amber & Gold Theme - Instant Viewport Fit) */}
            <div style={{
              width: '100%',
              background: isDark ? 'rgba(15, 23, 42, 0.92)' : '#FFFFFF',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '22px',
              padding: '22px 20px 24px 20px',
              boxShadow: isDark 
                ? '0 15px 45px rgba(0, 0, 0, 0.65), 0 0 28px -4px rgba(245, 158, 11, 0.2)' 
                : '0 12px 35px rgba(245, 158, 11, 0.12)',
              marginBottom: '20px'
            }}>
              {/* Form Title & Clean Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{
                  margin: '0 0 4px 0',
                  fontSize: 'clamp(1.35rem, 3.2vw, 1.65rem)',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                }}>
                {isBangla ? 'আপনার মতামত দিন' : 'Submit Feedback'}
              </h2>
              <p style={{
                margin: 0,
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
              }}>
                {isBangla 
                  ? 'আপনার মূল্যবান অভিজ্ঞতা ও মতামত আমাদের আরও উন্নত হতে সাহায্য করবে।' 
                  : 'Your feedback and genuine rating help us improve and grow.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Star Rating Selector (Empty by default, Vibrant Golden Glow on Select) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        aria-label={`Rate ${star} star`}
                      >
                        <Star 
                          size={30} 
                          fill={isFilled ? '#FBBF24' : 'none'} 
                          stroke={isFilled ? '#F59E0B' : (isDark ? 'rgba(245, 158, 11, 0.35)' : '#CBD5E1')}
                          strokeWidth={isFilled ? 2 : 1.8}
                          style={{
                            filter: isFilled ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.65))' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
                <div style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  color: rating > 0 ? '#F59E0B' : 'var(--text-muted)',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {rating > 0 
                    ? `${rating} / 5 ${isBangla ? 'স্টার নির্বাচিত' : 'Stars Selected'}` 
                    : (isBangla ? '★ রেটিং নির্বাচন করতে তারকায় ক্লিক করুন' : '★ Click stars to rate')}
                </div>
              </div>

              {/* Full Name Input Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  marginBottom: '5px',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {isBangla ? 'পুরো নাম' : 'Full Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBangla ? 'আপনার পুরো নাম লিখুন' : 'Full Name'}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '12px',
                      background: isDark ? 'rgba(245, 158, 11, 0.04)' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.35)'}`,
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                    }}
                  />
                  <User size={16} color="#F59E0B" style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.9 }} />
                </div>
              </div>

              {/* Email Address Input Field */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  marginBottom: '5px',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {isBangla ? 'ইমেইল' : 'Email'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isBangla ? 'আপনার ইমেইল ঠিকানা' : 'Email Address'}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '12px',
                      background: isDark ? 'rgba(245, 158, 11, 0.04)' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.35)'}`,
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                    }}
                  />
                  <Mail size={16} color="#F59E0B" style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.9 }} />
                </div>
              </div>

              {/* Detailed Message Textarea (Unconditionally unlocked & open by default) */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  marginBottom: '5px',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {isBangla ? 'আপনার বার্তা / মতামত' : 'Your Message'}
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={isBangla ? 'আপনার মূল্যবান মতামত লিখুন...' : 'Your Message'}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(245, 158, 11, 0.04)' : '#F8FAFC',
                    border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.35)'}`,
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Full-Width Vibrant Amber/Gold Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 22px rgba(245, 158, 11, 0.42)',
                  opacity: submitting ? 0.75 : 1,
                  marginTop: '4px',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {submitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                <span>{submitting ? (isBangla ? 'জমা হচ্ছে...' : 'Submitting...') : (isBangla ? 'জমা দিন' : 'Submit')}</span>
              </motion.button>
            </form>
          </div>

          {/* 3. REAL-TIME REVIEWS FEED (Firestore Streamed Feed) */}
          <div style={{ width: '100%' }}>
            <h3 style={{
              margin: '0 0 14px 0',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
            }}>
              <MessageSquare size={17} color="#F59E0B" />
              <span>{isBangla ? 'লাইভ রিভিউ ফিড' : 'Live Community Reviews Feed'}</span>
              <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700 }}>
                ({reviews.length})
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {reviews.map((rev, index) => (
                <motion.div
                  key={rev.id || `rev-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.2)'}`,
                    borderRadius: '16px',
                    padding: '14px 16px',
                    boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.3)' : '0 3px 12px rgba(245, 158, 11, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px'
                  }}
                >
                  {/* Top Bar: Stars + Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= (rev.rating || 5) ? '#F59E0B' : 'none'}
                          stroke={s <= (rev.rating || 5) ? '#F59E0B' : isDark ? '#475569' : '#CBD5E1'}
                        />
                      ))}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)'
                    }}>
                      <Clock size={11} />
                      <span>{formatTimestamp(rev.timestamp)}</span>
                    </div>
                  </div>

                  {/* Comment Feedback (if any) */}
                  {rev.feedback && (
                    <p style={{
                      margin: '2px 0 3px 0',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                    }}>
                      {rev.feedback}
                    </p>
                  )}

                  {/* Author & Masked Email */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
                    paddingTop: '6px',
                    marginTop: '2px'
                  }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      color: 'var(--text-primary)',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                    }}>
                      {rev.name}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      color: '#F59E0B',
                      fontFamily: 'monospace',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.08)'
                    }}>
                      {rev.maskedEmail || rev.email}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

          {/* Bottom Close Button */}
          <div style={{ marginTop: '28px', width: '100%', maxWidth: '220px' }}>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: '26px',
                background: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(241, 245, 249, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
              }}
            >
              <span>{isBangla ? 'বন্ধ করুন' : 'Close'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 4. FLASH STATUS MODAL (Reference Image 2 Style: Curved Top Header with Paper-Plane) */}
        <FlashStatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          buttonText={statusModal.buttonText}
          onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
          isBangla={isBangla}
          isDark={isDark}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
