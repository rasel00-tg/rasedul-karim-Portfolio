import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  LogOut,
  RefreshCw,
  Image as ImageIcon,
  Mail,
  Lock,
  Clock,
  SlidersHorizontal,
  Delete,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { createProject, updateProject, deleteProject } from '../services/adminService';
import { usePortfolioStream } from '../firebase/usePortfolioStream';
import { firebaseConfig } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import {
  getDeviceLockoutStatus,
  recordFailedAttempt,
  resetFailedAttempts,
  verifyPinAgainstFirestore,
  verifyCredentialsAgainstFirestore,
  registerActiveSession,
  listenActiveSession,
  clearActiveSession
} from '../services/adminAuthService';

const KEYPAD_BUTTONS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' }
];

const AdminModal = ({ onClose }) => {
  const { isBangla } = useLanguage();
  const { items: streamProjects } = usePortfolioStream();
  
  // Verification Step: 1 = Full-Screen iOS OTP PIN, 2 = Email/Password Credentials
  const [authStep, setAuthStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Step 1: 6-Digit PIN
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinShake, setPinShake] = useState(false);

  // Step 2: Email & Password
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [idToken, setIdToken] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Device Lockout State (5 failed attempts = 3 hours lockout)
  const [lockoutState, setLockoutState] = useState({
    isLocked: false,
    remainingFormatted: '00:00:00',
    remainingAttempts: 5
  });

  // Session conflict alert
  const [sessionConflictNotice, setSessionConflictNotice] = useState(null);

  // Project Form State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('apps');
  const [formDomain, setFormDomain] = useState('');
  const [formLiveUrl, setFormLiveUrl] = useState('');
  const [formGitHubUrl, setFormGitHubUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formTechnologies, setFormTechnologies] = useState('React, Tailwind, Vite');
  const [thumbnailMeta, setThumbnailMeta] = useState({ imageUrl: '', publicId: '' });
  const [oldThumbnailMeta, setOldThumbnailMeta] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // 1. Device Lockout Countdown Timer
  useEffect(() => {
    const updateLockout = () => {
      const status = getDeviceLockoutStatus();
      setLockoutState(status);
    };

    updateLockout();
    const interval = setInterval(updateLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Physical Keyboard Listener for Step 1 PIN Pad
  useEffect(() => {
    if (isAuthenticated || authStep !== 1 || lockoutState.isLocked) return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authStep, isAuthenticated, lockoutState.isLocked, pin]);

  // 3. Real-time Firestore Stream for Single Active Device Session
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = listenActiveSession(() => {
      // Invalidate current session because a newer session began on another device
      setIsAuthenticated(false);
      setIdToken(null);
      clearActiveSession();
      setAuthStep(1);
      setPin('');
      setSessionConflictNotice(
        isBangla
          ? 'অন্য কোনো ডিভাইসে নতুন সেশন শুরু হওয়ায় এই সেশনটি সমাপ্ত হয়েছে।'
          : 'Session terminated because a new session was initiated from another device.'
      );
    });

    return () => unsubscribe && unsubscribe();
  }, [isAuthenticated, isBangla]);

  // Step 1: Handle Dialpad Key Press
  const handleDigitPress = (digit) => {
    if (pin.length >= 6 || lockoutState.isLocked) return;
    const newPin = pin + digit;
    setPin(newPin);
    setPinError('');

    if (newPin.length === 6) {
      validatePinCode(newPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const handleClearPin = () => {
    setPin('');
    setPinError('');
  };

  // Validate 6-Digit PIN against Firestore 'control_auth/credentials'
  const validatePinCode = async (inputPin) => {
    const lockout = getDeviceLockoutStatus();
    if (lockout.isLocked) {
      setPinError(
        isBangla
          ? `অতিরিক্ত ভুল চেষ্টার কারণে এই ডিভাইসটি স্থগিত রয়েছে (${lockout.remainingFormatted} অবশিষ্ট)।`
          : `Device is locked due to failed attempts (${lockout.remainingFormatted} remaining).`
      );
      return;
    }

    const isPinCorrect = await verifyPinAgainstFirestore(inputPin);

    if (isPinCorrect) {
      // PIN Valid -> Advance to Step 2
      setPinError('');
      setAuthStep(2);
    } else {
      // PIN Invalid -> Record failed attempt & shake
      setPinShake(true);
      setTimeout(() => setPinShake(false), 500);
      setPin('');

      const rec = recordFailedAttempt();
      setLockoutState(getDeviceLockoutStatus());

      if (rec.isLocked) {
        setPinError(
          isBangla
            ? 'পরপর ৫ বার ভুল পিন দেওয়ায় এই ডিভাইসটি আগামী ৩ ঘণ্টার জন্য স্থগিত করা হয়েছে।'
            : 'Device has been suspended for 3 hours after 5 failed PIN attempts.'
        );
      } else {
        setPinError(
          isBangla
            ? `ভুল পিন কোড। বাকি প্রচেষ্টা: ${rec.remainingAttempts} বার।`
            : `Invalid PIN. Remaining attempts: ${rec.remainingAttempts}.`
        );
      }
    }
  };

  // Step 2: Handle Email & Password Authentication against Firestore & Firebase Auth
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError(isBangla ? 'অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন।' : 'Please enter email and password.');
      return;
    }

    setAuthLoading(true);

    try {
      // 1. Direct match check against Firestore 'control_auth/credentials'
      const firestoreCheck = await verifyCredentialsAgainstFirestore(authEmail.trim(), authPassword);

      // 2. Firebase REST Auth to obtain secure idToken for Cloudinary & Firestore security rules
      const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail.trim(),
          password: authPassword,
          returnSecureToken: true
        })
      });

      const data = await res.json();
      if (!res.ok && !firestoreCheck.isValid) {
        throw new Error(data.error?.message || 'Authentication failed. Please verify credentials.');
      }

      // Successful MFA: Reset local device failed attempts
      resetFailedAttempts();

      // Register Single Active Session in Firestore (control_auth/credentials)
      await registerActiveSession(authEmail.trim());

      setIdToken(data.idToken || 'token_verified');
      setIsAuthenticated(true);
      setStatusMessage({ 
        type: 'success', 
        text: isBangla ? 'সফলভাবে যাচাইকরণ সম্পন্ন হয়েছে।' : 'Security access verified successfully.' 
      });
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIdToken(null);
    clearActiveSession();
    setAuthStep(1);
    setPin('');
    setAuthEmail('');
    setAuthPassword('');
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedProjectId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('apps');
    setFormDomain('');
    setFormLiveUrl('');
    setFormGitHubUrl('');
    setFormDisplayOrder(1);
    setFormTechnologies('React, Tailwind, Vite');
    setThumbnailMeta({ imageUrl: '', publicId: '' });
    setOldThumbnailMeta(null);
    setScreenshots([]);
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const result = await uploadImageToCloudinary(file, idToken, 'portfolio_assets');
      setThumbnailMeta({
        imageUrl: result.imageUrl,
        publicId: result.publicId
      });
      setStatusMessage({ type: 'success', text: 'Thumbnail uploaded & optimized via Cloudinary (f_auto, q_auto)' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Upload notice: ${err.message}` });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleScreenshotsChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingScreenshots(true);
    try {
      const uploadedList = [];
      for (const file of files) {
        const result = await uploadImageToCloudinary(file, idToken, 'portfolio_screenshots');
        uploadedList.push({
          imageUrl: result.imageUrl,
          publicId: result.publicId
        });
      }
      setScreenshots((prev) => [...prev, ...uploadedList]);
      setStatusMessage({ type: 'success', text: `${uploadedList.length} screenshot(s) uploaded to Cloudinary` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Screenshot upload notice: ${err.message}` });
    } finally {
      setUploadingScreenshots(false);
    }
  };

  const handleRemoveScreenshot = (indexToRemove) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage(null);

    const projectPayload = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      domain: formDomain,
      liveUrl: formLiveUrl,
      gitHubUrl: formGitHubUrl,
      displayOrder: parseInt(formDisplayOrder, 10) || 0,
      technologies: formTechnologies.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail: thumbnailMeta,
      screenshots: screenshots,
      isFeatured: true
    };

    try {
      if (isEditing && selectedProjectId) {
        await updateProject(selectedProjectId, projectPayload, { thumbnail: oldThumbnailMeta }, idToken);
        setStatusMessage({ type: 'success', text: 'Project updated successfully with asset sync' });
      } else {
        await createProject(projectPayload, idToken);
        setStatusMessage({ type: 'success', text: 'New project published to Firestore' });
      }
      resetForm();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (p) => {
    setIsEditing(true);
    setSelectedProjectId(p.id);
    setFormTitle(p.title || '');
    setFormDescription(p.description || '');
    setFormCategory(p.category || 'apps');
    setFormDomain(p.domain || '');
    setFormLiveUrl(p.liveUrl || '');
    setFormGitHubUrl(p.gitHubUrl || '');
    setFormDisplayOrder(p.displayOrder || 1);
    setFormTechnologies((p.technologies || []).join(', '));
    setThumbnailMeta(p.thumbnail || { imageUrl: '', publicId: '' });
    setOldThumbnailMeta(p.thumbnail || null);
    setScreenshots(p.screenshots || []);
  };

  const handleDeleteClick = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.title}" and cascade-purge all its Cloudinary assets?`)) return;

    setActionLoading(true);
    try {
      await deleteProject(p.id, p, idToken);
      setStatusMessage({ type: 'success', text: `Project "${p.title}" & associated assets cascade-purged` });
      if (selectedProjectId === p.id) resetForm();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

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
          background: (!isAuthenticated && authStep === 1)
            ? 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F2 35%, #FDE4DC 75%, #FAD4C8 100%)'
            : 'rgba(5, 0, 15, 0.98)',
          backdropFilter: (!isAuthenticated && authStep === 1) ? 'none' : 'blur(30px)',
          WebkitBackdropFilter: (!isAuthenticated && authStep === 1) ? 'none' : 'blur(30px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: (!isAuthenticated && authStep === 1) ? 'space-between' : 'flex-start',
          alignItems: 'center',
          padding: (!isAuthenticated && authStep === 1) ? '20px 20px 28px 20px' : '24px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* ========================================================================= */}
        {/* STEP 1: FULL-SCREEN iOS OTP PIN VIEW (Matching Reference Image 2 Style)   */}
        {/* ========================================================================= */}
        {!isAuthenticated && authStep === 1 && (
          <div style={{
            width: '100%',
            maxWidth: '380px',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '0 auto',
            flex: 1
          }}>
            {/* Top Navigation Bar: Back / Close Arrow */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '8px',
              marginBottom: '16px'
            }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  color: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
                aria-label="Back / Close"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Middle Section: Title, Subtitle, 6 Masked Square Tiles & Continue Button */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              margin: 'auto 0'
            }}>
              {/* Main Headline (Image 2 style) */}
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: 'clamp(1.6rem, 5vw, 1.95rem)',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: isBangla ? '0' : '0.5px',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
              }}>
                {isBangla ? 'পিন কোড যাচাই করুন' : 'Enter Verification PIN'}
              </h1>

              {/* Subtitle */}
              <p style={{
                margin: '0 0 28px 0',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                color: '#64748B',
                maxWidth: '320px',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
              }}>
                {isBangla 
                  ? 'নিরাপত্তা নিশ্চিত করতে আপনার ৬ ডিজিটের পিন কোডটি প্রবেশ করান' 
                  : 'Please enter your 6-digit security PIN to proceed'}
              </p>

              {/* Device Lockout Notice (if active) */}
              {lockoutState.isLocked ? (
                <div style={{
                  width: '100%',
                  padding: '18px 16px',
                  borderRadius: '20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  color: '#DC2626',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <Clock size={32} color="#DC2626" />
                  <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                    {isBangla ? 'ডিভাইসটি সাময়িকভাবে স্থগিত' : 'Device Suspended'}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.5, color: '#991B1B', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                    {isBangla 
                      ? 'অতিরিক্ত ভুল চেষ্টার কারণে এই ডিভাইসটি সাময়িকভাবে ৩ ঘণ্টার জন্য স্থগিত করা হয়েছে।' 
                      : 'Due to too many failed attempts, this device is temporarily suspended for 3 hours.'}
                  </p>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    color: '#FFFFFF',
                    padding: '8px 20px',
                    borderRadius: '12px',
                    background: '#DC2626',
                    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.35)'
                  }}>
                    {lockoutState.remainingFormatted}
                  </div>
                </div>
              ) : (
                <>
                  {/* Error Notification */}
                  {pinError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#DC2626',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        marginBottom: '18px',
                        fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                      }}
                    >
                      {pinError}
                    </motion.div>
                  )}

                  {/* 6 Rounded Square OTP PIN Tiles (Concealed with Solid Bullets ●) */}
                  <motion.div
                    animate={pinShake ? { x: [-12, 12, -9, 9, -5, 5, 0] } : {}}
                    transition={{ duration: 0.45 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '26px',
                      width: '100%'
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const isFilled = index < pin.length;
                      const isCurrent = index === pin.length;
                      return (
                        <motion.div
                          key={index}
                          animate={{
                            scale: isFilled ? [1, 1.06, 1] : 1,
                            borderColor: isFilled 
                              ? '#0F172A' 
                              : isCurrent 
                                ? '#E11D48' 
                                : 'rgba(0, 0, 0, 0.12)'
                          }}
                          transition={{ duration: 0.2 }}
                          style={{
                            flex: 1,
                            maxWidth: '52px',
                            height: '58px',
                            borderRadius: '16px',
                            background: '#FFFFFF',
                            border: '1.5px solid rgba(0, 0, 0, 0.12)',
                            boxShadow: isFilled 
                              ? '0 6px 16px rgba(15, 23, 42, 0.12)' 
                              : '0 4px 12px rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {/* Concealed Bullet Dot Indicator (●) */}
                          {isFilled && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                              style={{
                                width: '13px',
                                height: '13px',
                                borderRadius: '50%',
                                background: '#0F172A',
                                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.3)'
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Continue Action Button (Image 2 style) */}
                  <motion.button
                    type="button"
                    disabled={pin.length < 6}
                    whileHover={pin.length === 6 ? { scale: 1.02 } : {}}
                    whileTap={pin.length === 6 ? { scale: 0.98 } : {}}
                    onClick={() => validatePinCode(pin)}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '50px',
                      background: pin.length === 6 
                        ? '#0F172A' 
                        : 'rgba(15, 23, 42, 0.2)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      cursor: pin.length === 6 ? 'pointer' : 'not-allowed',
                      boxShadow: pin.length === 6 ? '0 8px 25px rgba(15, 23, 42, 0.25)' : 'none',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit',
                      transition: 'all 0.2s ease',
                      marginBottom: '20px'
                    }}
                  >
                    {isBangla ? 'পরবর্তী' : 'Continue'}
                  </motion.button>
                </>
              )}
            </div>

            {/* Bottom Section: Full-Width iOS-Style Number Keypad (Matching Image 2) */}
            {!lockoutState.isLocked && (
              <div style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                paddingBottom: '8px'
              }}>
                {KEYPAD_BUTTONS.map(({ digit, letters }) => (
                  <motion.button
                    key={digit}
                    type="button"
                    whileTap={{ scale: 0.93, backgroundColor: '#FFFFFF' }}
                    onClick={() => handleDigitPress(digit)}
                    style={{
                      height: '56px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <span style={{
                      fontSize: '1.45rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      lineHeight: 1,
                      fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                    }}>
                      {digit}
                    </span>
                    {letters && (
                      <span style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: '#64748B',
                        letterSpacing: '1.2px',
                        marginTop: '2px'
                      }}>
                        {letters}
                      </span>
                    )}
                  </motion.button>
                ))}

                {/* Row 4: Clear Button (C), 0 Key, Backspace Key (⌫) */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={handleClearPin}
                  style={{
                    height: '56px',
                    borderRadius: '16px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                  }}
                >
                  {isBangla ? 'মুছুন' : 'Clear'}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.93, backgroundColor: '#FFFFFF' }}
                  onClick={() => handleDigitPress('0')}
                  style={{
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    lineHeight: 1,
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif"
                  }}>
                    0
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={handleBackspace}
                  style={{
                    height: '56px',
                    borderRadius: '16px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F172A',
                    cursor: 'pointer'
                  }}
                  title="Backspace"
                  aria-label="Backspace"
                >
                  <Delete size={22} color="#0F172A" />
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: GATED EMAIL & PASSWORD CREDENTIALS SCREEN                         */}
        {/* ========================================================================= */}
        {!isAuthenticated && authStep === 2 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '26px',
              padding: '28px 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 240, 255, 0.2)',
              position: 'relative',
              color: '#FFFFFF',
              margin: 'auto 0'
            }}
          >
            {/* Top Bar for Step 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setAuthStep(1);
                    setPin('');
                    setAuthError('');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Back to PIN"
                >
                  <ArrowLeft size={16} />
                </motion.button>

                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    {isBangla ? 'যাচাইকরণ সম্পন্ন করুন' : 'Complete Verification'}
                  </h2>
                  <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                    {isBangla ? 'আপনার ইমেইল ও পাসওয়ার্ড প্রদান করুন' : 'Enter your email and password'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {authError}
                </div>
              )}

              {/* Email Address Field */}
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  color: '#CBD5E1',
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 700,
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {isBangla ? 'ইমেইল' : 'Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={isBangla ? 'আপনার ইমেইল দিন' : 'Enter Email Address'}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontSize: '0.88rem'
                    }}
                  />
                  <Mail size={16} color="#00F0FF" style={{ position: 'absolute', left: '12px', top: '13px', opacity: 0.8 }} />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  color: '#CBD5E1',
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 700,
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}>
                  {isBangla ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={isBangla ? 'আপনার পাসওয়ার্ড দিন' : 'Enter Password'}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontSize: '0.88rem'
                    }}
                  />
                  <Lock size={16} color="#00F0FF" style={{ position: 'absolute', left: '12px', top: '13px', opacity: 0.8 }} />
                </div>
              </div>

              {/* Continue Action Button */}
              <motion.button
                type="submit"
                disabled={authLoading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  marginTop: '8px',
                  padding: '13px',
                  background: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
                  color: '#000000',
                  fontWeight: 900,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: authLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.94rem',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit',
                  boxShadow: '0 4px 20px rgba(0, 240, 255, 0.3)'
                }}
              >
                {authLoading ? <RefreshCw className="animate-spin" size={17} /> : <ShieldCheck size={17} />}
                <span>{authLoading ? (isBangla ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : (isBangla ? 'প্রবেশ করুন' : 'Continue')}</span>
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: AUTHENTICATED WORKSPACE (Project Management)                      */}
        {/* ========================================================================= */}
        {isAuthenticated && (
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            style={{
              width: '100%',
              maxWidth: '1000px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '24px',
              padding: '28px 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 240, 255, 0.2)',
              position: 'relative',
              color: '#FFFFFF'
            }}
          >
            {/* Top Bar for Authenticated View */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(0,240,255,0.1)',
                  border: '1px solid rgba(0,240,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f0ff'
                }}>
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                  }}>
                    {isBangla ? 'কন্ট্রোল ম্যানেজমেন্ট' : 'System Control'}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit' }}>
                    {isBangla ? 'লাইভ ডাটা ও প্রজেক্ট ম্যানেজমেন্ট' : 'Active Management Workspace'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255, 0, 127, 0.1)',
                    border: '1px solid rgba(255, 0, 127, 0.3)',
                    color: '#ff007f',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  <LogOut size={13} /> {isBangla ? 'লগআউট' : 'Logout'}
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Form & Live List Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              
              {/* Form Column */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isEditing ? <Edit3 size={17} /> : <Plus size={17} />}
                  <span>{isEditing ? 'Edit Project' : 'Add New Project'}</span>
                </h3>

                <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Project Title</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., FifaLive Score App"
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      >
                        <option value="apps">Apps</option>
                        <option value="web">Websites</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Display Order</label>
                      <input
                        type="number"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Domain / Tag</label>
                    <input
                      type="text"
                      value={formDomain}
                      onChange={(e) => setFormDomain(e.target.value)}
                      placeholder="e.g., fifalive.click"
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Live URL</label>
                    <input
                      type="url"
                      value={formLiveUrl}
                      onChange={(e) => setFormLiveUrl(e.target.value)}
                      placeholder="https://fifalive.click"
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Thumbnail Image Upload */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Thumbnail Image (Cloudinary Auto Optimization)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{
                        padding: '8px 16px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#00f0ff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem'
                      }}>
                        <Upload size={15} />
                        <span>{uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}</span>
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} style={{ display: 'none' }} />
                      </label>

                      {thumbnailMeta.imageUrl && (
                        <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                          ✓ Ready
                        </span>
                      )}
                    </div>

                    {thumbnailMeta.imageUrl && (
                      <div style={{ marginTop: '8px', width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #00f0ff' }}>
                        <img src={thumbnailMeta.imageUrl} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  {/* Screenshots Upload */}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Screenshots (Multiple Image Upload)
                    </label>
                    <label style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 0, 127, 0.1)',
                      border: '1px solid rgba(255, 0, 127, 0.3)',
                      borderRadius: '8px',
                      color: '#ff007f',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem'
                    }}>
                      <ImageIcon size={15} />
                      <span>{uploadingScreenshots ? 'Uploading Screenshots...' : 'Add Screenshots (Multiple)'}</span>
                      <input type="file" multiple accept="image/*" onChange={handleScreenshotsChange} style={{ display: 'none' }} />
                    </label>

                    {screenshots.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {screenshots.map((ss, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <img src={ss.imageUrl} alt={`Screenshot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => handleRemoveScreenshot(idx)}
                              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.75)', color: '#ff4444', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="submit"
                      disabled={actionLoading || uploadingThumbnail || uploadingScreenshots}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#00f0ff',
                        color: '#000',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {actionLoading ? 'Saving...' : (isEditing ? 'Update Project' : 'Publish Project')}
                    </button>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Live List Column */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={17} color="#00f0ff" />
                  <span>Existing Projects ({streamProjects?.length || 0})</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                  {(streamProjects || []).map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', background: '#0b1329', flexShrink: 0 }}>
                          <img src={p.thumbnail?.imageUrl || '/app1.png'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || 'Untitled'}</h4>
                          <span style={{ fontSize: '0.74rem', color: '#00f0ff' }}>{p.domain || p.category}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditClick(p)}
                          style={{ padding: '6px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0,240,255,0.3)', color: '#00f0ff', borderRadius: '6px', cursor: 'pointer' }}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
                          style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}
                          title="Cascade Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminModal;
