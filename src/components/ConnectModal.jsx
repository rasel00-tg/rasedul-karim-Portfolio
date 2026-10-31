import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkle,
  Copy,
  Check,
  Handshake,
  Network,
  ArrowLeft
} from 'lucide-react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { sendWelcomeEmail } from '../services/subscriptionService';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';

export default function ConnectModal({ isOpen, onClose, onOpenProjects, onOpenDeals }) {
  const { isBangla } = useLanguage();
  const { isDark } = useTheme();

  // Core Auth & Modal States
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [viewMode, setViewMode] = useState('auth'); // 'auth' | 'onboarding' | 'profile'
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'github' | 'signout' | 'onboarding' | null
  const [errorMessage, setErrorMessage] = useState(null);
  const [unauthorizedDomainInfo, setUnauthorizedDomainInfo] = useState(null);
  const [domainCopied, setDomainCopied] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Onboarding Form State (Step 2)
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    age: '',
    referralSource: 'Facebook',
    customReferral: ''
  });
  const [onboardingErrors, setOnboardingErrors] = useState({});

  // Referral Options as per requirement: Facebook, Instagram, Google Search, Other
  const referralOptions = [
    { id: 'Facebook', label: 'Facebook', color: '#1877F2' },
    { id: 'Instagram', label: 'Instagram', color: '#E4405F' },
    { id: 'Google Search', label: 'Google Search', color: '#34A853' },
    { id: 'Other', label: isBangla ? 'অন্যান্য (Other)' : 'Other', color: '#8B5CF6' }
  ];

  // Helper to show temporary toast
  const triggerToast = (msg, duration = 3500) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), duration);
  };

  // Check user record in Firestore 'users' collection
  const checkUserStatus = async (user) => {
    if (!user) {
      setViewMode('auth');
      setProfileData(null);
      setCheckingAuth(false);
      return;
    }

    setCheckingAuth(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data()?.onboardingCompleted) {
        // Step 3: Existing connected user
        setProfileData(userDocSnap.data());
        setViewMode('profile');
      } else {
        // Step 2: New user onboarding
        setOnboardingData({
          name: user.displayName || '',
          age: '',
          referralSource: 'Facebook',
          customReferral: ''
        });
        setViewMode('onboarding');
      }
    } catch (err) {
      console.warn('Notice reading users collection in Firestore:', err.message);
      // Fallback: If network issue occurs, show profile with available auth user info
      setProfileData({
        name: user.displayName || 'Friend',
        email: user.email || '',
        photoURL: user.photoURL || '',
        onboardingCompleted: true
      });
      setViewMode('profile');
    } finally {
      setCheckingAuth(false);
    }
  };

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (isOpen) {
        checkUserStatus(user);
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  // Re-check status whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setUnauthorizedDomainInfo(null);
      setDomainCopied(false);
      setOnboardingErrors({});
      if (auth.currentUser) {
        checkUserStatus(auth.currentUser);
      } else {
        setViewMode('auth');
        setCheckingAuth(false);
      }
    }
  }, [isOpen]);

  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auth Error Interpreter with Dedicated Unauthorized Domain Diagnostics
  const getAuthErrorDetails = (err, provider = 'Google') => {
    const code = err?.code || '';
    const rawMsg = err?.message || '';
    const currentDomain = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';

    if (
      code === 'auth/unauthorized-domain' ||
      rawMsg.toLowerCase().includes('unauthorized domain') ||
      rawMsg.toLowerCase().includes('unauthorized-domain')
    ) {
      return {
        isUnauthorizedDomain: true,
        domain: currentDomain,
        message: isBangla
          ? `বর্তমান ডোমেইনটি (${currentDomain}) ফায়ারবেসে অনুমোদিত (Authorized) নয়। সাইন-ইন সচল করতে এই ডোমেইনটি ফায়ারবেসে যুক্ত করা প্রয়োজন।`
          : `This domain (${currentDomain}) is not authorized for OAuth operations. It must be added to Firebase Authorized Domains.`,
        developerHint: isBangla
          ? `Firebase Console > Authentication > Settings > Authorized Domains-এ '${currentDomain}' যুক্ত করুন।`
          : `Go to Firebase Console > Authentication > Settings > Authorized Domains and add '${currentDomain}'.`
      };
    }

    if (code === 'auth/popup-blocked') {
      return {
        isUnauthorizedDomain: false,
        message: isBangla
          ? 'ব্রাউজারে সাইন-ইন পপ-আপ ব্লক করা রয়েছে। অনুগ্রহ করে পপ-আপ অনুমোদন (Allow) করুন।'
          : 'Sign-in pop-up was blocked by your browser. Please allow pop-ups for this site.'
      };
    }

    if (code === 'auth/network-request-failed') {
      return {
        isUnauthorizedDomain: false,
        message: isBangla
          ? 'নেটওয়ার্ক সংযোগ ত্রুটি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।'
          : 'Network request failed. Please check your internet connection.'
      };
    }

    if (code === 'auth/operation-not-allowed') {
      return {
        isUnauthorizedDomain: false,
        message: isBangla
          ? `${provider} সাইন-ইন মেথডটি ফায়ারবেস কনসোলে সক্রিয় (Enabled) করা নেই।`
          : `${provider} sign-in provider is not enabled in Firebase Console.`
      };
    }

    return {
      isUnauthorizedDomain: false,
      message: isBangla
        ? `${provider} সাইন-ইন সম্পন্ন করা যায়নি (${code || 'ত্রুটি'})। অনুগ্রহ করে আবার চেষ্টা করুন।`
        : (rawMsg || `${provider} sign-in failed. Please try again.`)
    };
  };

  // 1. Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    setErrorMessage(null);
    setUnauthorizedDomainInfo(null);
    setDomainCopied(false);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        await checkUserStatus(user);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('Auth Error [Google]:', err);
        const errorDetails = getAuthErrorDetails(err, 'Google');
        if (errorDetails.isUnauthorizedDomain) {
          setUnauthorizedDomainInfo(errorDetails);
          setErrorMessage(null);
        } else {
          setErrorMessage(errorDetails.message);
        }
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  // 2. Handle GitHub Sign-in
  const handleGithubSignIn = async () => {
    setLoadingProvider('github');
    setErrorMessage(null);
    setUnauthorizedDomainInfo(null);
    setDomainCopied(false);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      if (user) {
        await checkUserStatus(user);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('Auth Error [GitHub]:', err);
        const errorDetails = getAuthErrorDetails(err, 'GitHub');
        if (errorDetails.isUnauthorizedDomain) {
          setUnauthorizedDomainInfo(errorDetails);
          setErrorMessage(null);
        } else {
          setErrorMessage(errorDetails.message);
        }
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  // Safe Fallback for Unauthorized Domain or Offline / Local Dev
  const handleGuestFallback = () => {
    const randomGuestId = 'guest_' + Math.random().toString(36).substring(2, 10);
    const fallbackUser = {
      uid: randomGuestId,
      displayName: isBangla ? 'অতিথি মেম্বার' : 'Guest Member',
      email: '',
      photoURL: '',
      isGuest: true,
      providerData: [{ providerId: 'guest' }]
    };
    setCurrentUser(fallbackUser);
    setOnboardingData({
      name: fallbackUser.displayName,
      age: '24',
      referralSource: 'Direct Visit',
      customReferral: ''
    });
    setUnauthorizedDomainInfo(null);
    setErrorMessage(null);
    setViewMode('onboarding');
  };

  // 3. Handle Onboarding Form Submit
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!onboardingData.name.trim()) {
      errors.name = isBangla ? 'আপনার পূর্ণ নাম লিখুন' : 'Full name is required';
    }
    if (!onboardingData.age.toString().trim()) {
      errors.age = isBangla ? 'আপনার বয়স লিখুন' : 'Age is required';
    } else {
      const ageNum = parseInt(onboardingData.age, 10);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
        errors.age = isBangla ? 'সঠিক বয়স প্রদান করুন (৫-১২০)' : 'Please provide a valid age';
      }
    }

    if (Object.keys(errors).length > 0) {
      setOnboardingErrors(errors);
      return;
    }

    setOnboardingErrors({});
    setLoadingProvider('onboarding');

    try {
      const user = currentUser || auth.currentUser;
      if (!user) throw new Error('User not found. Please log in again.');

      const finalReferral = onboardingData.referralSource === 'Other' && onboardingData.customReferral.trim()
        ? onboardingData.customReferral.trim()
        : onboardingData.referralSource;

      const profilePayload = {
        uid: user.uid,
        name: onboardingData.name.trim(),
        displayName: onboardingData.name.trim(),
        email: user.email || '',
        photoURL: user.photoURL || '',
        age: onboardingData.age.toString().trim(),
        referralSource: finalReferral,
        provider: user.providerData?.[0]?.providerId || 'google.com',
        onboardingCompleted: true,
        createdAt: serverTimestamp(),
        lastConnectedAt: serverTimestamp()
      };

      // 1. Save to Firestore 'users' collection
      await setDoc(doc(db, 'users', user.uid), profilePayload, { merge: true });

      // 2. Also keep 'subscribers' collection synced
      try {
        await setDoc(doc(db, 'subscribers', user.email || user.uid), profilePayload, { merge: true });
      } catch (subErr) {
        console.warn('Subscribers sync note:', subErr);
      }

      // 3. Send Personalized Welcome / Thank You Email via Backend API
      if (user.email) {
        sendWelcomeEmail({
          email: user.email,
          name: onboardingData.name.trim(),
          age: onboardingData.age.toString().trim(),
          referralSource: finalReferral
        }).catch((emailErr) => console.warn('Welcome email notice:', emailErr));
      }

      setProfileData(profilePayload);
      setViewMode('profile');
      triggerToast(isBangla ? '🎉 স্বাগতম! আপনার প্রোফাইল তৈরি হয়েছে এবং ওয়েলকাম ইমেইল পাঠানো হয়েছে।' : '🎉 Welcome! Your profile is ready and a confirmation email has been sent.');
    } catch (err) {
      console.error('Onboarding submit error:', err);
      setErrorMessage(err.message || 'Failed to complete profile onboarding.');
    } finally {
      setLoadingProvider(null);
    }
  };

  // 4. Handle Disconnect / Sign Out
  const handleSignOut = async () => {
    setLoadingProvider('signout');
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      setCurrentUser(null);
      setProfileData(null);
      setViewMode('auth');
      triggerToast(isBangla ? 'সফলভাবে ডিসকানেক্ট করা হয়েছে।' : 'Disconnected successfully.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign out.');
    } finally {
      setLoadingProvider(null);
    }
  };

  // 5. Explore Projects & Deals Action
  const handleExploreProjects = () => {
    onClose();
    if (onOpenProjects) {
      onOpenProjects();
    } else if (onOpenDeals) {
      onOpenDeals();
    } else {
      window.dispatchEvent(new CustomEvent('open-projects-modal'));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="w-full min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#EEF3FD] to-[#E6EEFC] dark:from-[#0B101B] dark:via-[#0F172A] dark:to-[#0B1324] flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg, #0B101B 0%, #0F172A 50%, #0B1324 100%)'
            : 'linear-gradient(135deg, #F5F8FF 0%, #EEF3FD 50%, #E6EEFC 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
        onClick={onClose}
      >
        {/* Ambient Background Vivid Blue Orbs & Translucent Glass Bubbles */}
        {/* 1. Glowing Blue Sphere (Top-Right) */}
        <div
          className="w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-tr from-[#1D68FF] to-[#4F95FF] rounded-full blur-xs opacity-90 shadow-[0_10px_35px_rgba(29,104,255,0.4)] pointer-events-none"
          style={{
            position: 'absolute',
            top: '10%',
            right: '12%',
            width: '224px',
            height: '224px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1D68FF 0%, #4F95FF 100%)',
            opacity: isDark ? 0.8 : 0.9,
            boxShadow: '0 10px 45px rgba(29, 104, 255, 0.45), 0 0 70px rgba(79, 149, 255, 0.35)',
            pointerEvents: 'none',
            filter: 'blur(3px)'
          }}
        />

        {/* 2. Accent Blue Ball (Bottom-Left) */}
        <div
          className="w-28 h-28 sm:w-36 sm:h-36 bg-[#2563EB] rounded-full blur-xs opacity-85 shadow-[0_8px_30px_rgba(37,99,235,0.35)] pointer-events-none"
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '10%',
            width: '144px',
            height: '144px',
            borderRadius: '50%',
            background: '#2563EB',
            opacity: isDark ? 0.75 : 0.85,
            boxShadow: '0 8px 35px rgba(37, 99, 235, 0.4), 0 0 50px rgba(37, 99, 235, 0.3)',
            pointerEvents: 'none',
            filter: 'blur(2px)'
          }}
        />

        {/* 3. Overlapping Translucent Frosted Glass Bubble (Top-Right) */}
        <div
          className="backdrop-blur-2xl border border-white/60 bg-white/20 rounded-full pointer-events-none"
          style={{
            position: 'absolute',
            top: '4%',
            right: '7%',
            width: '290px',
            height: '290px',
            borderRadius: '50%',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.65)',
            pointerEvents: 'none'
          }}
        />

        {/* 4. Overlapping Translucent Frosted Glass Bubble (Bottom-Left) */}
        <div
          className="backdrop-blur-2xl border border-white/60 bg-white/20 rounded-full pointer-events-none"
          style={{
            position: 'absolute',
            bottom: '6%',
            left: '7%',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.65)',
            pointerEvents: 'none'
          }}
        />

        {/* Central Premium Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/90 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl text-center relative z-10"
          style={{
            width: '100%',
            maxWidth: '448px',
            background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.9)',
            borderRadius: '32px',
            padding: '36px 26px 28px 26px',
            textAlign: 'center',
            boxShadow: isDark
              ? '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(29, 104, 255, 0.2)'
              : '0 25px 60px rgba(29, 104, 255, 0.15), 0 10px 30px rgba(0, 0, 0, 0.06)',
            position: 'relative',
            zIndex: 10,
            maxHeight: '92vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Top Navigation Back to Home Button */}
          <button
            onClick={onClose}
            aria-label={isBangla ? 'হোমপেজে ফিরুন' : 'Back to Homepage'}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '6px 12px',
              borderRadius: '16px',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
              color: isDark ? '#E2E8F0' : '#334155',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
              fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1D68FF';
              e.currentTarget.style.borderColor = '#1D68FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDark ? '#E2E8F0' : '#334155';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)';
            }}
          >
            <ArrowLeft size={14} />
            <span>{isBangla ? 'হোম' : 'Home'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close Modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
              color: isDark ? '#94A3B8' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDark ? '#94A3B8' : '#64748B';
              e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
            }}
          >
            <X size={16} />
          </button>

          {/* Success Notification Toast */}
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#10B981',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successToast}</span>
            </motion.div>
          )}

          {/* Dedicated Unauthorized Domain Developer Guidance Alert (Compact & Non-Blocking) */}
          {unauthorizedDomainInfo && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                border: '1.5px solid rgba(245, 158, 11, 0.35)',
                color: '#FBBF24',
                fontSize: '0.80rem',
                marginBottom: '14px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
                  <strong style={{ color: '#FCD34D', fontSize: '0.82rem', fontWeight: 800 }}>
                    {isBangla ? 'ডোমেন অনুমোদন সংক্রান্ত নোটিশ' : 'Domain Authorization Notice'}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setUnauthorizedDomainInfo(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isDark ? '#94A3B8' : '#64748B',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={isBangla ? 'বন্ধ করুন' : 'Dismiss'}
                >
                  <X size={15} />
                </button>
              </div>

              <p style={{ margin: 0, color: isDark ? '#FDE68A' : '#92400E', fontSize: '0.78rem', lineHeight: 1.45 }}>
                {unauthorizedDomainInfo.message}
              </p>

              {/* Host Tag, Copy Button & Guest Fallback Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                paddingTop: '4px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#00F0FF',
                    fontSize: '0.75rem',
                    background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 240, 255, 0.25)'
                  }}>
                    {unauthorizedDomainInfo.domain}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(unauthorizedDomainInfo.domain);
                        setDomainCopied(true);
                        setTimeout(() => setDomainCopied(false), 2000);
                      }
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      background: domainCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      border: `1px solid ${domainCopied ? '#10B981' : '#F59E0B'}`,
                      color: domainCopied ? '#10B981' : '#FBBF24',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {domainCopied ? (
                      <>
                        <Check size={11} />
                        <span>{isBangla ? 'কপি হয়েছে' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>{isBangla ? 'কপি' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGuestFallback}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '7px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.18) 0%, rgba(16, 185, 129, 0.2) 100%)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    color: '#00F0FF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{isBangla ? 'গেস্ট হিসেবে সরাসরি প্রবেশ' : 'Continue as Guest'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Notification Toast */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#EF4444',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Checking Auth State Loader */}
          {checkingAuth && (
            <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#1D68FF' }} />
              <span style={{ fontSize: '0.84rem', color: '#94A3B8' }}>
                {isBangla ? 'কানেকশন চেক করা হচ্ছে...' : 'Verifying connection state...'}
              </span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: AUTH STATE (User NOT logged in)                    */}
          {/* ========================================================= */}
          {!checkingAuth && viewMode === 'auth' && (
            <div>
              {/* Realistic Animated Gradient Network / Handshake Vector Icon with Soft Breathing Pulse */}
              <div
                style={{
                  position: 'relative',
                  width: '76px',
                  height: '76px',
                  margin: '6px auto 16px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  className="animate-pulse"
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '28px',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(29, 104, 255, 0.25) 55%, transparent 75%)',
                    pointerEvents: 'none'
                  }}
                />
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, #1D68FF 0%, #0284C7 50%, #00F0FF 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 28px rgba(29, 104, 255, 0.42), inset 0 2px 4px rgba(255, 255, 255, 0.45)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Handshake size={36} color="#FFFFFF" strokeWidth={2.2} />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2
                style={{
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  margin: '0 0 6px 0',
                  lineHeight: 1.2
                }}
              >
                {isBangla ? 'কানেক্ট করুন' : 'Connect with Me'}
              </h2>
              <p
                style={{
                  fontSize: '0.84rem',
                  color: isDark ? '#94A3B8' : '#64748B',
                  lineHeight: 1.5,
                  margin: '0 0 22px 0',
                  padding: '0 8px',
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                }}
              >
                {isBangla
                  ? 'নিচের অফিসিয়াল প্ল্যাটফর্মের মাধ্যমে সরাসরি ১-ক্লিকে নিরাপদে কানেক্ট করুন।'
                  : 'Choose your preferred provider for secure 1-click authentication.'}
              </p>

              {/* Providers: Google & GitHub */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Continue with Google */}
                <motion.button
                  whileHover={!loadingProvider ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loadingProvider ? { scale: 0.98 } : {}}
                  onClick={handleGoogleSignIn}
                  disabled={!!loadingProvider}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    color: '#1F2937',
                    border: '1.5px solid rgba(0, 0, 0, 0.12)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: loadingProvider ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                  }}
                >
                  {loadingProvider === 'google' ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#4285F4' }} />
                      <span style={{ color: '#4285F4' }}>
                        {isBangla ? 'গুগলে কানেক্ট করা হচ্ছে...' : 'Connecting with Google...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </motion.button>

                {/* 2. Continue with GitHub */}
                <motion.button
                  whileHover={!loadingProvider ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loadingProvider ? { scale: 0.98 } : {}}
                  onClick={handleGithubSignIn}
                  disabled={!!loadingProvider}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: '16px',
                    background: isDark ? '#161B22' : '#24292F',
                    color: '#FFFFFF',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid #1B1F23',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: loadingProvider ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s ease',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                  }}
                >
                  {loadingProvider === 'github' ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#FFFFFF' }} />
                      <span>{isBangla ? 'গিটহাবে কানেক্ট করা হচ্ছে...' : 'Connecting with GitHub...'}</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF" style={{ flexShrink: 0 }}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Continue with GitHub</span>
                    </>
                  )}
                </motion.button>

                {/* 3. Safe Direct Guest Connect Option */}
                <button
                  type="button"
                  onClick={handleGuestFallback}
                  disabled={!!loadingProvider}
                  style={{
                    marginTop: '4px',
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '16px',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    color: isDark ? '#94A3B8' : '#475569',
                    border: isDark ? '1px dashed rgba(255, 255, 255, 0.16)' : '1px dashed rgba(0, 0, 0, 0.16)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1D68FF';
                    e.currentTarget.style.color = '#1D68FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)';
                    e.currentTarget.style.color = isDark ? '#94A3B8' : '#475569';
                  }}
                >
                  <Sparkles size={15} />
                  <span>{isBangla ? 'অথবা সরাসরি গেস্ট (Guest) হিসেবে প্রবেশ করুন' : 'Or Continue Directly as Guest'}</span>
                </button>
              </div>

              {/* Privacy Footnote */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '12px',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                  fontSize: '0.74rem',
                  color: isDark ? '#64748B' : '#94A3B8',
                  lineHeight: 1.4,
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                }}
              >
                🔒 {isBangla ? '১০০% নিরাপদ ও সুরক্ষিত সংযোগ। কোনো ওটিপি বা পাসওয়ার্ড টাইপ করার প্রয়োজন নেই।' : 'Fast, private & 100% secure. Zero password or OTP required.'}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: NEW USER ONBOARDING FORM                           */}
          {/* ========================================================= */}
          {!checkingAuth && viewMode === 'onboarding' && (
            <div>
              {/* Realistic Animated Gradient Network / Handshake Vector Icon */}
              <div
                style={{
                  position: 'relative',
                  width: '72px',
                  height: '72px',
                  margin: '4px auto 14px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  className="animate-pulse"
                  style={{
                    position: 'absolute',
                    inset: '-6px',
                    borderRadius: '26px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(0, 240, 255, 0.25) 55%, transparent 75%)',
                    pointerEvents: 'none'
                  }}
                />
                <div
                  style={{
                    width: '66px',
                    height: '66px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #10B981 0%, #00F0FF 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 24px rgba(16, 185, 129, 0.35)',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Handshake size={32} color="#FFFFFF" strokeWidth={2.2} />
                </div>
              </div>

              <h3
                style={{
                  fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  margin: '0 0 6px 0'
                }}
              >
                {isBangla ? 'স্বাগতম! পরিচয় সম্পন্ন করুন' : 'Welcome! Complete Your Profile'}
              </h3>
              <p
                style={{
                  fontSize: '0.80rem',
                  color: isDark ? '#94A3B8' : '#64748B',
                  lineHeight: 1.4,
                  margin: '0 0 18px 0'
                }}
              >
                {isBangla
                  ? 'আমার নেটওয়ার্কে আপনাকে স্বাগতম। এক নজরে আপনার সংক্ষিপ্ত তথ্য দিন।'
                  : 'Glad to connect with you. Please share a few quick details.'}
              </p>

              <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                {/* 1. Full Name (Prepopulated from Google/GitHub, Editable) */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: onboardingErrors.name ? '#EF4444' : (isDark ? '#CBD5E1' : '#334155'), fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    {isBangla ? 'আপনার পূর্ণ নাম (Full Name) *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={onboardingData.name}
                    onChange={(e) => {
                      setOnboardingData((prev) => ({ ...prev, name: e.target.value }));
                      if (onboardingErrors.name) setOnboardingErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder={isBangla ? 'আপনার নাম লিখুন...' : 'Enter your full name...'}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      border: onboardingErrors.name ? '1.5px solid #EF4444' : (isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.12)'),
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {onboardingErrors.name && (
                    <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {onboardingErrors.name}
                    </span>
                  )}
                </div>

                {/* 2. Age Input Field */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: onboardingErrors.age ? '#EF4444' : (isDark ? '#CBD5E1' : '#334155'), fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    {isBangla ? 'বয়স (Age) *' : 'Age *'}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={onboardingData.age}
                    onChange={(e) => {
                      setOnboardingData((prev) => ({ ...prev, age: e.target.value }));
                      if (onboardingErrors.age) setOnboardingErrors((prev) => ({ ...prev, age: '' }));
                    }}
                    placeholder={isBangla ? 'যেমন: ২৪' : 'e.g. 24'}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      border: onboardingErrors.age ? '1.5px solid #EF4444' : (isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.12)'),
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {onboardingErrors.age && (
                    <span style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> {onboardingErrors.age}
                    </span>
                  )}
                </div>

                {/* 3. Where did you hear about me? (Radio / Cards) */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: isDark ? '#CBD5E1' : '#334155', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    {isBangla ? 'কোথা থেকে এসেছেন? (Where did you hear about me?) *' : 'Where did you hear about me? *'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {referralOptions.map((opt) => {
                      const isSelected = onboardingData.referralSource === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setOnboardingData((prev) => ({ ...prev, referralSource: opt.id }))}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: isSelected
                              ? (isDark ? 'rgba(29, 104, 255, 0.2)' : 'rgba(29, 104, 255, 0.12)')
                              : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                            border: isSelected
                              ? (isDark ? '1.5px solid #1D68FF' : '1.5px solid #1D68FF')
                              : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="radio"
                            name="referralSource"
                            checked={isSelected}
                            onChange={() => setOnboardingData((prev) => ({ ...prev, referralSource: opt.id }))}
                            style={{ accentColor: '#1D68FF', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? (isDark ? '#FFFFFF' : '#1D68FF') : (isDark ? '#94A3B8' : '#64748B') }}>
                            {opt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Optional Custom Input for 'Other' */}
                  {onboardingData.referralSource === 'Other' && (
                    <input
                      type="text"
                      value={onboardingData.customReferral}
                      onChange={(e) => setOnboardingData((prev) => ({ ...prev, customReferral: e.target.value }))}
                      placeholder={isBangla ? 'নির্দিষ্ট উৎস লিখুন (যেমন: বন্ধু, ইভেন্ট)...' : 'Specify source (e.g. Friend, Event)...'}
                      style={{
                        width: '100%',
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.12)',
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>

                {/* Submit Onboarding Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loadingProvider === 'onboarding'}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '13px 18px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: loadingProvider === 'onboarding' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  {loadingProvider === 'onboarding' ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{isBangla ? 'তথ্য সেভ হচ্ছে...' : 'Saving profile...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isBangla ? 'যুক্ত হোন (Join Network)' : 'Join My Network'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: CONNECTED PREMIUM PROFILE MODAL (Connected View)   */}
          {/* ========================================================= */}
          {!checkingAuth && viewMode === 'profile' && (
            <FirestoreStreamBuilder collectionName="users">
              {({ data: liveUsers }) => {
                const liveProfile = liveUsers?.find((u) => u.uid === currentUser?.uid || u.id === currentUser?.uid) || profileData || {};
                const displayName = liveProfile.name || liveProfile.displayName || currentUser?.displayName || 'Connected User';
                const email = liveProfile.email || currentUser?.email || '';
                const photoURL = liveProfile.photoURL || currentUser?.photoURL;
                const referral = liveProfile.referralSource;

                return (
                  <div>
                    {/* 1. Realistic Animated Gradient Network / Handshake Vector Icon with Soft Breathing Pulse */}
                    <div
                      style={{
                        position: 'relative',
                        width: '76px',
                        height: '76px',
                        margin: '6px auto 14px auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div
                        className="animate-pulse"
                        style={{
                          position: 'absolute',
                          inset: '-8px',
                          borderRadius: '28px',
                          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(29, 104, 255, 0.25) 55%, transparent 75%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '22px',
                          background: 'linear-gradient(135deg, #1D68FF 0%, #0284C7 50%, #00F0FF 100%)',
                          border: '2px solid rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 12px 28px rgba(29, 104, 255, 0.42), inset 0 2px 4px rgba(255, 255, 255, 0.45)',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        <Handshake size={36} color="#FFFFFF" strokeWidth={2.2} />
                      </div>
                    </div>

                    <h2
                      style={{
                        fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        margin: '0 0 4px 0',
                        lineHeight: 1.2
                      }}
                    >
                      {isBangla ? 'ধন্যবাদ সাথে থাকার জন্য!' : 'Welcome to My Network!'}
                    </h2>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: isDark ? '#94A3B8' : '#64748B',
                        margin: '0 0 18px 0',
                        fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                      }}
                    >
                      {isBangla ? 'আপনি সফলভাবে আমার প্রফেশনাল নেটওয়ার্কে সংযুক্ত আছেন।' : 'You are officially connected to my professional network.'}
                    </p>

                    {/* 2. Large & Clear User Avatar & Centered Profile Details */}
                    <div
                      style={{
                        background: isDark
                          ? 'radial-gradient(circle at top, rgba(29, 104, 255, 0.12), rgba(255, 255, 255, 0.03))'
                          : 'radial-gradient(circle at top, rgba(29, 104, 255, 0.08), rgba(0, 0, 0, 0.02))',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(29, 104, 255, 0.18)',
                        borderRadius: '24px',
                        padding: '20px 18px 16px 18px',
                        marginBottom: '18px',
                        textAlign: 'center'
                      }}
                    >
                      {/* Large User Profile Avatar */}
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt={displayName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 border-sky-400/80 shadow-lg object-cover mb-3 block"
                          style={{
                            width: '88px',
                            height: '88px',
                            borderRadius: '50%',
                            margin: '0 auto 12px auto',
                            border: '4px solid rgba(56, 189, 248, 0.85)',
                            boxShadow: '0 8px 24px rgba(56, 189, 248, 0.35)',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 border-sky-400/80 shadow-lg object-cover mb-3 flex items-center justify-center"
                          style={{
                            width: '88px',
                            height: '88px',
                            borderRadius: '50%',
                            margin: '0 auto 12px auto',
                            border: '4px solid rgba(56, 189, 248, 0.85)',
                            background: 'linear-gradient(135deg, #1D68FF 0%, #00F0FF 100%)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '2.2rem',
                            boxShadow: '0 8px 24px rgba(56, 189, 248, 0.35)'
                          }}
                        >
                          {(displayName || 'U')[0].toUpperCase()}
                        </div>
                      )}

                      {/* Centered Name with Verification Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: isDark ? '#FFFFFF' : '#0F172A',
                            lineHeight: 1.2,
                            maxWidth: '280px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {displayName}
                        </h3>
                        <ShieldCheck size={20} color="#10B981" style={{ flexShrink: 0 }} />
                      </div>

                      {/* Centered Email */}
                      <div
                        style={{
                          fontSize: '0.84rem',
                          color: isDark ? '#94A3B8' : '#64748B',
                          marginBottom: '10px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {email}
                      </div>

                      {/* Centered Live Status Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#10B981',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                          {isBangla ? 'লাইভ কানেক্টেড' : 'Live Connected'}
                        </span>

                        {referral && (
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              background: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.35)',
                              color: '#8B5CF6',
                              fontSize: '0.74rem',
                              fontWeight: 600
                            }}
                          >
                            via {referral}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Action Section: Full-Width Vibrant Blue Gradient Button */}
                    <div
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(29, 104, 255, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)'
                          : 'linear-gradient(135deg, rgba(29, 104, 255, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)',
                        border: isDark ? '1px dashed rgba(29, 104, 255, 0.35)' : '1px dashed rgba(29, 104, 255, 0.35)',
                        borderRadius: '20px',
                        padding: '16px',
                        marginBottom: '16px',
                        textAlign: 'center'
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 12px 0',
                          fontSize: '0.82rem',
                          color: isDark ? '#E2E8F0' : '#1E293B',
                          lineHeight: 1.5,
                          fontWeight: 600,
                          fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                        }}
                      >
                        ✨ {isBangla
                          ? 'আমার সাম্প্রতিক প্রজেক্ট ও বিশেষ অফারসমূহ দেখতে নিচে ক্লিক করুন।'
                          : 'Stay tuned to explore my latest creations, exclusive deals & updates.'}
                      </p>

                      {/* Full-Width Vibrant Blue Gradient Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExploreProjects}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          background: 'linear-gradient(135deg, #1D68FF 0%, #2563EB 50%, #0284C7 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.94rem',
                          borderRadius: '16px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 8px 24px rgba(29, 104, 255, 0.35)',
                          transition: 'all 0.2s ease',
                          fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                        }}
                      >
                        <Layers size={18} />
                        <span>{isBangla ? 'প্রজেক্ট ও অফারসমূহ দেখুন' : 'Explore Projects & Deals'}</span>
                        <ArrowRight size={16} />
                      </motion.button>
                    </div>

                    {/* 4. Logout Control: Clean Disconnect / Sign Out Text Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      disabled={loadingProvider === 'signout'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isDark ? '#F87171' : '#DC2626',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        padding: '8px 16px',
                        cursor: loadingProvider === 'signout' ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        margin: '0 auto',
                        borderRadius: '10px',
                        transition: 'all 0.15s ease',
                        fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {loadingProvider === 'signout' ? (
                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>
                          <LogOut size={15} />
                          <span>{isBangla ? 'ডিসকানেক্ট / সাইন আউট' : 'Disconnect / Sign Out'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                );
              }}
            </FirestoreStreamBuilder>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
