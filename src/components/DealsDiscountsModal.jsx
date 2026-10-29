import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Gift, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2,
  Clock, 
  Sparkles, 
  Tag,
  Percent,
  ArrowLeft,
  Lock,
  Unlock,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  DollarSign,
  Calculator,
  User,
  Phone,
  MapPin,
  Info,
  LogIn,
  MessageSquare,
  KeyRound,
  UserCheck,
  Package,
  Search,
  Smartphone,
  SlidersHorizontal,
  Printer,
  Download,
  FileText,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS, checkCouponRedemption, recordCouponRedemption } from '../services/featuresService';
import { isEmailSubscribed, subscribeEmail } from '../services/subscriptionService';
import { db, auth, initFirebase, firebaseConfig } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendStyledOrderEmail, generateHtmlInvoice, sendOrderReceiptViaBackend } from '../services/emailOrderService';
import ConnectModal from './ConnectModal';

const DealsDiscountsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(null);

  // Global verified subscriber email from localStorage
  const [activeUserEmail, setActiveUserEmail] = useState(() => {
    return localStorage.getItem('subscriber_deal_email') || '';
  });

  // Authentication & Connect Flow States
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [pendingClaimDeal, setPendingClaimDeal] = useState(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackEmail, setTrackEmail] = useState('');
  const [orderCode, setOrderCode] = useState('');

  // Interactive Claim & Checkout Modal Drawer State
  const [selectedDealForClaim, setSelectedDealForClaim] = useState(null);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [showEmailInfoModal, setShowEmailInfoModal] = useState(false);
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutBasePrice] = useState(5000); // Standard base package rate in BDT (৳)
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponErrorMsg, setCouponErrorMsg] = useState(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [sharedDealId, setSharedDealId] = useState(null);
  const [shareToastMsg, setShareToastMsg] = useState(null);

  // Guest Order Intercept Verification Modal State
  const [isGuestInterceptOpen, setIsGuestInterceptOpen] = useState(false);
  const [guestInterceptEmail, setGuestInterceptEmail] = useState('');
  const [guestInterceptPhone, setGuestInterceptPhone] = useState('01');
  const [guestInterceptError, setGuestInterceptError] = useState(null);
  const [orderConfirmationAlert, setOrderConfirmationAlert] = useState(null);
  const [receiptCopied, setReceiptCopied] = useState(false);

  // Guest Order History Finder Modal / Search View States
  const [isGuestSearchOpen, setIsGuestSearchOpen] = useState(false);
  const [guestSearchCategory, setGuestSearchCategory] = useState('phone'); // 'phone' | 'email'
  const [guestSearchInput, setGuestSearchInput] = useState('01');
  const [guestSearchSubmittedQuery, setGuestSearchSubmittedQuery] = useState(null); // { category, query }
  const [guestSearchInputError, setGuestSearchInputError] = useState(null);

  // Modern Shipment & Delivery Tracking States
  const [trackingSearchTerm, setTrackingSearchTerm] = useState('');
  const [trackingStatusFilter, setTrackingStatusFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState(null);
  const [alreadyClaimedDiscount, setAlreadyClaimedDiscount] = useState(false);

  // Background scroll lock when any Modal is active
  useEffect(() => {
    const isAnyModalActive = Boolean(
      selectedDealForClaim || 
      isTrackModalOpen || 
      selectedShipmentDetail || 
      orderConfirmationAlert || 
      isGuestInterceptOpen
    );
    if (isAnyModalActive && typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedDealForClaim, isTrackModalOpen, selectedShipmentDetail, orderConfirmationAlert, isGuestInterceptOpen]);

  // Phone number normalizer for accurate query matching across +88, 01, and formatted strings
  const normalizePhone = (num) => {
    if (!num) return '';
    return String(num).replace(/[\s\-\+\(\)]/g, '').replace(/^88/, '');
  };

  // Real-time Auth listener for Google & GitHub authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (user.email) {
          setActiveUserEmail(user.email);
          setCheckoutEmail(user.email);
          setTrackEmail(user.email);
        }
        if (user.displayName) {
          setCheckoutName((prev) => prev || user.displayName);
        }
        // If user logged in specifically after clicking Claim Offer, proceed to open claim modal
        if (pendingClaimDeal) {
          const dealToClaim = pendingClaimDeal;
          setPendingClaimDeal(null);
          setIsConnectModalOpen(false);
          handleOpenClaimModal(dealToClaim, user);
        }
      } else {
        setCheckoutEmail('');
        setTrackEmail('');
      }
    });
    return () => unsubscribe();
  }, [pendingClaimDeal]);

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'deals_discounts' }, '');
    const handlePopState = () => {
      if (selectedShipmentDetail) {
        setSelectedShipmentDetail(null);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else if (isGuestInterceptOpen) {
        setIsGuestInterceptOpen(false);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else if (isGuestSearchOpen) {
        setIsGuestSearchOpen(false);
        setGuestSearchSubmittedQuery(null);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else if (isTrackModalOpen) {
        setIsTrackModalOpen(false);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else if (isConnectModalOpen) {
        setIsConnectModalOpen(false);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else if (selectedDealForClaim) {
        setSelectedDealForClaim(null);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else {
        onClose();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose, selectedDealForClaim, isTrackModalOpen, isConnectModalOpen, isGuestInterceptOpen, isGuestSearchOpen, selectedShipmentDetail]);

  // Copy coupon code to clipboard with visual feedback
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Native Social Media Web Share API with Safe Manual User-Gesture Validation & Clipboard Fallback
  const handleShareDeal = async (e, deal) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (!deal) return;

    const rawRate = deal?.discountPercentage || deal?.discountPercent || '75%';
    const match = String(rawRate).match(/(\d+)/);
    const discountText = match ? match[1] : '75';
    const dealTitle = deal.title || (isBangla ? 'এক্সক্লুসিভ অফার ও ডিল' : 'Exclusive Deal & Discount');

    const shareData = {
      title: dealTitle,
      text: isBangla 
        ? `🔥 ${dealTitle} - পাচ্ছেন ${discountText}% ছাড়! অফারটি দ্রুত ক্লেইম করুন:` 
        : `🔥 ${dealTitle} - Get ${discountText}% OFF! Claim this exclusive deal now:`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      // Only invoke native share if explicitly supported, canShare returns true, and from direct user tap
      if (
        typeof navigator !== 'undefined' && 
        typeof navigator.share === 'function' && 
        typeof navigator.canShare === 'function' && 
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        setSharedDealId(deal.id);
        setTimeout(() => setSharedDealId(null), 2500);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setSharedDealId(deal.id);
        setShareToastMsg(isBangla ? '✓ লিংক ও অফারের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!' : '✓ Deal link and offer copied to clipboard!');
        setTimeout(() => {
          setSharedDealId(null);
          setShareToastMsg(null);
        }, 3000);
      }
    } catch (error) {
      if (error && error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
        console.warn('Share intent notice:', error.message);
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            setSharedDealId(deal.id);
            setShareToastMsg(isBangla ? '✓ লিংক ক্লিপবোর্ডে কপি করা হয়েছে!' : '✓ Deal link copied to clipboard!');
            setTimeout(() => {
              setSharedDealId(null);
              setShareToastMsg(null);
            }, 3000);
          }
        } catch (_) {}
      }
    }
  };

  // Helper to parse numerical discount percentage
  const parseDiscountRate = (deal) => {
    const rawRate = deal?.discountPercentage || deal?.discountPercent || '20%';
    const match = String(rawRate).match(/(\d+)/);
    return match ? Math.min(100, Math.max(1, parseInt(match[1], 10))) : 20;
  };

  // Dynamic Pricing Calculation (in BDT ৳)
  const calculatePricing = (deal, applyDiscount = false) => {
    const base = deal?.originalPrice ? Number(deal.originalPrice) : checkoutBasePrice;
    const rate = parseDiscountRate(deal);
    if (!applyDiscount) {
      return {
        rate: 0,
        rateFormatted: '0%',
        basePrice: Math.round(base).toString(),
        discountAmount: '0',
        finalPrice: Math.round(base).toString(),
        isDiscounted: false
      };
    }
    const discountAmount = Math.round((base * rate) / 100);
    const finalPrice = Math.max(0, Math.round(base - discountAmount));
    return {
      rate,
      rateFormatted: `${rate}%`,
      basePrice: Math.round(base).toString(),
      discountAmount: discountAmount.toString(),
      finalPrice: finalPrice.toString(),
      isDiscounted: true
    };
  };

  // Handle Claim Offer Button Click (Directly opens claim & checkout modal, supporting guest checkout)
  const handleClaimButtonClick = (deal) => {
    if (!deal) return;
    handleOpenClaimModal(deal, currentUser);
  };

  // Open Claim Checkout Modal with Clean Visual Hierarchy & Strict Single-Discount-Per-Account Validation
  const handleOpenClaimModal = async (deal, user = currentUser) => {
    setSelectedDealForClaim(deal);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setCouponErrorMsg(null);
    setCouponSuccessMsg(null);
    setShowEmailInfoModal(false);
    setIsCouponApplied(false);
    setAppliedCouponCode('');
    setAlreadyClaimedDiscount(false);

    // Auto-generate fresh unique order code (e.g. ORD-92841)
    const newOrderCode = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    setOrderCode(newOrderCode);

    // Auto-fill user email & name ONLY if user is authenticated/logged-in
    if (user?.email) {
      setCheckoutEmail(user.email);
      setIsEmailVerified(true);
    } else {
      setCheckoutEmail('');
      setIsEmailVerified(false);
    }
    if (user?.displayName) {
      setCheckoutName((prev) => prev || user.displayName);
    } else if (!user) {
      setCheckoutName('');
    }

    // Never expose secret coupon code in the text input box
    setCheckoutCouponCode('');

    // STRICT SINGLE-DISCOUNT-PER-ACCOUNT VALIDATION
    const dealCoupon = (deal?.couponCode || deal?.discountCode || '').trim();

    if (user?.email) {
      const currentUserEmail = user.email.trim().toLowerCase();
      const currentPostId = deal?.id || '';
      const currentTitle = (deal?.title || '').trim().toLowerCase();

      let alreadyConfirmedDiscount = false;
      try {
        const ordersRef = collection(db, 'deal_orders');
        // Query deal_orders where email matches currentUserEmail
        const qOrders = query(ordersRef, where('email', '==', currentUserEmail));
        const snap = await getDocs(qOrders);
        snap.forEach((docSnap) => {
          const ord = docSnap.data();
          const matchesPost = (ord.postId && ord.postId === currentPostId) ||
                              (ord.dealId && ord.dealId === currentPostId) ||
                              (ord.dealTitle && ord.dealTitle.trim().toLowerCase() === currentTitle);
          const isConfirmed = ord.status === 'confirmed' ||
                              ord.status === 'accepted' ||
                              ord.discountApplied === true ||
                              ord.claimed === true;
          if (matchesPost && isConfirmed) {
            alreadyConfirmedDiscount = true;
          }
        });

        // Also check clientEmail in case order used clientEmail
        if (!alreadyConfirmedDiscount) {
          const qClient = query(ordersRef, where('clientEmail', '==', currentUserEmail));
          const snapClient = await getDocs(qClient);
          snapClient.forEach((docSnap) => {
            const ord = docSnap.data();
            const matchesPost = (ord.postId && ord.postId === currentPostId) ||
                                (ord.dealId && ord.dealId === currentPostId) ||
                                (ord.dealTitle && ord.dealTitle.trim().toLowerCase() === currentTitle);
            const isConfirmed = ord.status === 'confirmed' ||
                                ord.status === 'accepted' ||
                                ord.discountApplied === true ||
                                ord.claimed === true;
            if (matchesPost && isConfirmed) {
              alreadyConfirmedDiscount = true;
            }
          });
        }
      } catch (err) {
        console.warn('Error verifying previous confirmed discount record:', err);
      }

      if (alreadyConfirmedDiscount) {
        // STRICT RULE 1: If database has previous confirmed record, STRICTLY BLOCK discount & force regular price
        setAlreadyClaimedDiscount(true);
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setCouponErrorMsg("You have already claimed the discount for this deal. Regular price applies.");
      } else if (!dealCoupon) {
        // STRICT RULE 2: If post has no active coupon, NO discount is applied
        setAlreadyClaimedDiscount(false);
        setIsCouponApplied(false);
        setAppliedCouponCode('');
      } else {
        // STRICT RULE 3: Post has active coupon, user logged in, and user has NOT claimed discount before
        setAlreadyClaimedDiscount(false);
        setIsCouponApplied(true);
        setAppliedCouponCode(dealCoupon);
        const rate = parseDiscountRate(deal);
        setCouponSuccessMsg(
          isBangla 
            ? `✓ স্পেশাল ডিল ডিসকাউন্ট স্বয়ংক্রিয়ভাবে সক্রিয় হয়েছে (${rate}% ছাড় প্রযোজ্য)` 
            : `✓ Special deal discount auto-applied (${rate}% OFF)`
        );
      }
    } else {
      // User is not logged in: regular price applies unless user connects
      setAlreadyClaimedDiscount(false);
      setIsCouponApplied(false);
      setAppliedCouponCode('');
    }
  };

  // Direct Mail Client Trigger with Clean & Beautiful Invoice Format
  const sendEmailPayload = (
    coupon, 
    price, 
    userEmail = checkoutEmail, 
    deal = selectedDealForClaim, 
    name = checkoutName, 
    message = checkoutMessage
  ) => {
    const activeDeal = deal || {};
    const dealTitle = activeDeal.title || 'Exclusive Deal';
    const clientName = (name || '').trim() || (isBangla ? 'গ্রাহকের নাম উল্লেখ করা হয়নি' : 'Not provided');
    const isCouponActive = coupon && coupon !== 'NO_COUPON' && coupon !== 'প্রযোজ্য নয়' && coupon !== 'None';
    const couponCodeText = isCouponActive ? coupon : (isBangla ? 'ব্যবহার করা হয়নি' : 'Not applied');
    const appliedDiscountText = isCouponActive 
      ? (activeDeal.discountPercent || '75% OFF') 
      : (isBangla ? 'প্রযোজ্য নয়' : 'Not Applicable');

    const baseRateNum = activeDeal?.originalPrice ? Number(activeDeal.originalPrice) : checkoutBasePrice;
    const baseRateFormatted = `৳${Math.round(baseRateNum)} BDT`;
    const finalPrice = typeof price === 'number' 
      ? `৳${Math.round(price)} BDT` 
      : (String(price).startsWith('৳') 
          ? (String(price).includes('BDT') ? String(price) : `${price} BDT`) 
          : `৳${price} BDT`);

    const projectScope = (message || '').trim() || (isBangla ? 'কোনো বিশেষ রিকোয়ারমেন্ট উল্লেখ করা হয়নি।' : 'No special requirement mentioned.');

    // Format current date and time cleanly
    const now = new Date();
    const orderTimestamp = now.toLocaleString(isBangla ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const recipient = "rasedul.karim00@gmail.com";
    const subject = encodeURIComponent(`Order Claim: ${dealTitle} - ${clientName}`);
    const emailBodyText = 
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `      🌟 EXCLUSIVE DEAL CLAIM ORDER\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📌 প্রজেক্ট ও অফারের বিবরণ:\n` +
      `• প্রজেক্টের নাম: ${dealTitle}\n` +
      `• প্যাকেজ রেট: ${baseRateFormatted}\n` +
      `• ছাড়ের পরিমাণ: ${appliedDiscountText}\n` +
      `• চূড়ান্ত পরিশোধযোগ্য মূল্য: ${finalPrice}\n\n` +
      `👤 গ্রাহকের তথ্য:\n` +
      `• নাম: ${clientName}\n` +
      `• ইমেইল: ${userEmail || 'client@example.com'}\n` +
      `• কুপন কোড: ${couponCodeText}\n\n` +
      `📝 গ্রাহকের বার্তা / রিকোয়ারমেন্ট:\n` +
      `${projectScope}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `অর্ডার প্রেরণের সময়: ${orderTimestamp}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    const body = encodeURIComponent(emailBodyText);

    // নিরাপদ লিঙ্ক ক্লিক মেথড যাতে ব্রাউজার ক্র্যাশ বা ফাঁকা না হয়
    const mailtoLink = document.createElement("a");
    mailtoLink.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    mailtoLink.target = "_self";
    document.body.appendChild(mailtoLink);
    mailtoLink.click();
    setTimeout(() => {
      try {
        document.body.removeChild(mailtoLink);
      } catch {}
    }, 150);
  };

  // Account Coupon Eligibility & Single-Use Check in deal_orders collection
  const checkAndApplyCouponForUser = async (codeToApply, deal = selectedDealForClaim, userEmail = (currentUser?.email || checkoutEmail)) => {
    setCouponErrorMsg(null);
    setCouponSuccessMsg(null);

    const typedCode = (codeToApply || checkoutCouponCode || '').trim().toUpperCase();
    if (!typedCode) {
      setCouponErrorMsg(isBangla ? 'কুপন কোড লিখুন (ঐচ্ছিক)।' : 'Please enter a coupon code (optional).');
      return;
    }

    // 1. Account connection is required to apply coupons
    if (!currentUser && !userEmail) {
      setIsCouponApplied(false);
      setAppliedCouponCode('');
      setCouponErrorMsg(
        isBangla 
          ? 'কুপন বা বিশেষ ছাড় পেতে অনুগ্রহ করে একাউন্ট কানেক্ট করুন।' 
          : 'Please connect your account to be eligible for coupon codes.'
      );
      return;
    }

    const cleanEmail = (currentUser?.email || userEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setIsCouponApplied(false);
      setAppliedCouponCode('');
      setCouponErrorMsg(
        isBangla 
          ? 'কুপন ভ্যালিডেশনের জন্য সঠিক ইমেইল আইডি দিন।' 
          : 'A valid email is required to verify coupon eligibility.'
      );
      return;
    }

    setCouponChecking(true);

    try {
      const activeDeal = deal || selectedDealForClaim || {};
      const currentPostId = activeDeal?.id || '';
      const currentTitle = (activeDeal?.title || '').trim().toLowerCase();
      const expectedCode = (activeDeal.couponCode || activeDeal.discountCode || '').trim().toUpperCase();

      if (!expectedCode) {
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setCouponErrorMsg(
          isBangla 
            ? 'এই ডিল বা পোস্টের জন্য কোনো কুপন প্রযোজ্য নয়।' 
            : 'No active coupon available for this deal.'
        );
        return;
      }

      if (typedCode !== expectedCode) {
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setCouponErrorMsg(
          isBangla 
            ? 'ভুল কুপন কোড! অফারের সঠিক কোডটি দিন।' 
            : 'Invalid coupon code! Please enter the correct code for this offer.'
        );
        return;
      }

      // Check Firestore deal_orders collection to see if user has already claimed this offer successfully
      let alreadyClaimed = false;
      try {
        const ordersRef = collection(db, 'deal_orders');
        // Query by email
        const qOrders = query(ordersRef, where('email', '==', cleanEmail));
        const orderSnap = await getDocs(qOrders);
        orderSnap.forEach((docSnap) => {
          const ord = docSnap.data();
          const matchesDeal = (ord.postId && ord.postId === currentPostId) ||
                              (ord.dealId && ord.dealId === currentPostId) || 
                              (ord.dealTitle && ord.dealTitle.trim().toLowerCase() === currentTitle);
          const isConfirmed = ord.claimed === true || 
                              ord.status === 'accepted' || 
                              ord.status === 'confirmed' || 
                              ord.discountApplied === true;
          if (matchesDeal && isConfirmed) {
            alreadyClaimed = true;
          }
        });

        // Also query by clientEmail
        if (!alreadyClaimed) {
          const qClient = query(ordersRef, where('clientEmail', '==', cleanEmail));
          const clientSnap = await getDocs(qClient);
          clientSnap.forEach((docSnap) => {
            const ord = docSnap.data();
            const matchesDeal = (ord.postId && ord.postId === currentPostId) ||
                                (ord.dealId && ord.dealId === currentPostId) || 
                                (ord.dealTitle && ord.dealTitle.trim().toLowerCase() === currentTitle);
            const isConfirmed = ord.claimed === true || 
                                ord.status === 'accepted' || 
                                ord.status === 'confirmed' || 
                                ord.discountApplied === true;
            if (matchesDeal && isConfirmed) {
              alreadyClaimed = true;
            }
          });
        }
      } catch (err) {
        console.warn('Error querying deal_orders for coupon eligibility:', err);
      }

      if (alreadyClaimed) {
        setAlreadyClaimedDiscount(true);
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setCouponErrorMsg("You have already claimed the discount for this deal. Regular price applies.");
        return;
      }

      // Eligible! Apply coupon
      setAlreadyClaimedDiscount(false);
      setCheckoutCouponCode(typedCode);
      setIsCouponApplied(true);
      setAppliedCouponCode(typedCode);
      const rate = parseDiscountRate(activeDeal);
      setCouponSuccessMsg(
        isBangla 
          ? `✓ কুপন কোড (${typedCode}) সফলভাবে কার্যকর হয়েছে! (${rate}% ছাড় প্রযোজ্য)` 
          : `✓ Coupon code (${typedCode}) applied successfully! (${rate}% discount active)`
      );
    } catch (err) {
      setIsCouponApplied(false);
      setAppliedCouponCode('');
      setCouponErrorMsg(err.message || (isBangla ? 'কুপন যাচাই ব্যর্থ হয়েছে।' : 'Coupon verification failed.'));
    } finally {
      setCouponChecking(false);
    }
  };

  // Submit Order Claim with Full Customer Details & Lifecycle Status
  const handleConfirmOrderClaim = async (e, options = {}) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    setCheckoutError(null);

    const userName = (checkoutName || '').trim();
    const userPhone = (options?.overridePhone || checkoutPhone || '').trim();
    const userAddress = (checkoutAddress || '').trim();
    const userEmail = (options?.overrideEmail || checkoutEmail || '').trim().toLowerCase();
    const isGuest = options?.isGuest !== undefined ? options.isGuest : !currentUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate Required Customer Fields
    if (!userName) {
      setCheckoutError(isBangla ? 'আপনার পূর্ণ নাম লিখুন (আবশ্যক)।' : 'Please enter your full name (required).');
      return;
    }
    if (!userPhone) {
      setCheckoutError(isBangla ? 'আপনার মোবাইল নাম্বার প্রদান করুন (আবশ্যক)।' : 'Please enter your phone number (required).');
      return;
    }
    if (!userAddress) {
      setCheckoutError(isBangla ? 'আপনার সম্পূর্ণ ঠিকানা প্রদান করুন (আবশ্যক)।' : 'Please enter your address (required).');
      return;
    }

    // Optional email validation if provided
    if (userEmail && !emailRegex.test(userEmail)) {
      setCheckoutError(isBangla ? 'অনুগ্রহ করে সঠিক ইমেইল আইডি দিন।' : 'Please enter a valid email address.');
      return;
    }

    // If coupon is applied, user must have an email provided (either logged in or guest verified)
    if (isCouponApplied && appliedCouponCode && !currentUser && !userEmail) {
      setCheckoutError(
        isBangla 
          ? 'কুপন কোড বা বিশেষ ছাড় পেতে ইমেইল ও একাউন্ট ভেরিফাই করুন।' 
          : 'Please provide an email or connect account to be eligible for coupon codes.'
      );
      return;
    }

    setCheckoutSubmitting(true);

    const activeDeal = selectedDealForClaim || {};
    const activeCode = isCouponApplied && appliedCouponCode ? appliedCouponCode : null;
    const pricing = calculatePricing(activeDeal, !!activeCode);

    try {
      // Re-verify eligibility if coupon is applied
      if (activeCode && (currentUser?.email || userEmail)) {
        const verifyEmail = (currentUser?.email || userEmail).toLowerCase();
        const currentPostId = activeDeal?.id || '';
        const currentTitle = (activeDeal?.title || '').trim().toLowerCase();
        let alreadyClaimed = false;
        try {
          let firestoreDb = db;
          if (!firestoreDb) {
            const fb = await initFirebase();
            firestoreDb = fb?.db;
          }
          if (firestoreDb) {
            const ordersRef = collection(firestoreDb, 'deal_orders');
            const qOrders = query(ordersRef, where('email', '==', verifyEmail));
            const orderSnap = await getDocs(qOrders);
            orderSnap.forEach((docSnap) => {
              const ord = docSnap.data();
              const matchesDeal = (ord.postId && ord.postId === currentPostId) || 
                                  (ord.dealId && ord.dealId === currentPostId) || 
                                  (ord.dealTitle && ord.dealTitle.trim().toLowerCase() === currentTitle);
              const isConfirmed = ord.claimed === true || 
                                  ord.status === 'accepted' || 
                                  ord.status === 'confirmed' || 
                                  ord.discountApplied === true;
              if (matchesDeal && isConfirmed) {
                alreadyClaimed = true;
              }
            });

            if (!alreadyClaimed) {
              const qClient = query(ordersRef, where('clientEmail', '==', verifyEmail));
              const clientSnap = await getDocs(qClient);
              clientSnap.forEach((docSnap) => {
                const ord = docSnap.data();
                const matchesDeal = (ord.postId && ord.postId === currentPostId) || 
                                    (ord.dealId && ord.dealId === currentPostId) || 
                                    (ord.dealTitle && ord.dealTitle.trim().toLowerCase() === currentTitle);
                const isConfirmed = ord.claimed === true || 
                                    ord.status === 'accepted' || 
                                    ord.status === 'confirmed' || 
                                    ord.discountApplied === true;
                if (matchesDeal && isConfirmed) {
                  alreadyClaimed = true;
                }
              });
            }
          }
        } catch (err) {
          console.warn('Coupon verification notice:', err);
        }

        if (alreadyClaimed) {
          setIsCouponApplied(false);
          setAppliedCouponCode('');
          setCheckoutError(
            isBangla 
              ? 'আপনি ইতিমধ্যে এই ডিলের জন্য ছাড় গ্রহণ করেছেন। নিয়মিত মূল্য প্রযোজ্য হবে।' 
              : 'You have already claimed the discount for this deal. Regular price applies.'
          );
          setCheckoutSubmitting(false);
          return;
        }
      }

      const finalOrderCode = orderCode || ("ORD-" + Math.floor(10000 + Math.random() * 90000));
      const orderDate = new Date().toLocaleString(isBangla ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const hasCoupon = !!activeCode;

      const basePriceNum = Number(pricing?.basePrice) || 0;
      const finalPriceNum = Number(pricing?.finalPrice) || 0;
      const cleanCoupon = activeCode ? String(activeCode).trim() : null;
      const cleanEmail = String(userEmail || currentUser?.email || 'guest@noemail.com').trim();
      const cleanName = String(userName || 'Customer').trim();
      const cleanPhone = String(userPhone || '').trim();
      const cleanAddress = String(userAddress || '').trim();
      const cleanNotes = String(checkoutMessage || '').trim();
      const cleanDealId = String(activeDeal?.id || activeDeal?._firestoreDocId || '');
      const cleanDealTitle = String(activeDeal?.title || activeDeal?.name || (isBangla ? 'এক্সক্লুসিভ ডিল প্রজেক্ট' : 'Exclusive Deal Project')).trim();

      const orderUserId = currentUser?.uid ? String(currentUser.uid) : "guest";
      const isGuestUser = Boolean(!currentUser || isGuest || orderUserId === "guest");

      // Sanitized object with exact fallbacks to ensure ZERO undefined values
      const orderRecord = {
        // 1. Required exact keys from user prompt
        dealId: cleanDealId,
        dealTitle: cleanDealTitle,
        customerName: cleanName,
        phone: cleanPhone,
        customerAddress: cleanAddress,
        email: cleanEmail,
        regularPrice: basePriceNum,
        finalPrice: finalPriceNum,
        couponApplied: cleanCoupon || null,
        notes: cleanNotes,
        status: 'pending',
        createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),

        // User & Guest identification
        userId: orderUserId,
        isGuest: isGuestUser,

        // 2. Compatibility & System Tracking Keys (for AdminModal, invoices, & notifications)
        postId: cleanDealId,
        orderId: String(finalOrderCode),
        orderCode: String(finalOrderCode),
        orderDate: String(orderDate),
        clientName: cleanName,
        name: cleanName,
        clientPhone: cleanPhone,
        whatsapp: cleanPhone,
        clientAddress: cleanAddress,
        address: cleanAddress,
        clientEmail: cleanEmail,
        originalPrice: `৳${basePriceNum} BDT`,
        finalPriceFormatted: `৳${finalPriceNum} BDT`,
        discountPercentage: String(pricing?.rate || '0'),
        discountPercent: `${pricing?.rate || 0}% OFF`,
        discountAmount: `৳${pricing?.discountAmount || 0} BDT`,
        hasCoupon: Boolean(cleanCoupon),
        couponCode: cleanCoupon || null,
        discountApplied: Boolean(isCouponApplied && cleanCoupon),
        dealThumbnail: String(activeDeal?.bannerUrl || activeDeal?.imagePath || '/add1.png'),
        message: cleanNotes || (isBangla ? 'কোনো বিশেষ রিকোয়ারমেন্ট উল্লেখ করা হয়নি।' : 'No special requirement mentioned.'),
        claimed: false,
        redeemedAt: new Date().toISOString()
      };

      // Strict purge of any undefined fields to prevent Firestore serialization exceptions
      Object.keys(orderRecord).forEach((k) => {
        if (orderRecord[k] === undefined) {
          orderRecord[k] = null;
        }
      });

      // 1. Direct Persistent Save to Firestore 'deal_orders'
      let savedDocId = null;
      try {
        let firestoreDb = db;
        if (!firestoreDb) {
          const fb = await initFirebase();
          firestoreDb = fb?.db;
        }
        if (firestoreDb) {
          const docRef = await addDoc(collection(firestoreDb, 'deal_orders'), orderRecord);
          savedDocId = docRef?.id;
          console.log('Order successfully saved to Firestore deal_orders with ID:', savedDocId);
        } else {
          throw new Error('Firestore database instance is not available');
        }
      } catch (dbErr) {
        console.error('Error saving order to Firestore deal_orders collection:', dbErr);
        // Resilient REST API fallback
        try {
          const restFields = {};
          Object.keys(orderRecord).forEach((k) => {
            const v = orderRecord[k];
            if (v === null || v === undefined) {
              restFields[k] = { nullValue: null };
            } else if (typeof v === 'boolean') {
              restFields[k] = { booleanValue: v };
            } else if (typeof v === 'number') {
              restFields[k] = { integerValue: String(v) };
            } else if (k === 'createdAt' && typeof v === 'object') {
              restFields[k] = { timestampValue: new Date().toISOString() };
            } else {
              restFields[k] = { stringValue: String(v) };
            }
          });
          const restRes = await fetch(
            `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/deal_orders`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fields: restFields })
            }
          );
          if (restRes.ok) {
            console.log('Deal order successfully saved via Firestore REST fallback');
            savedDocId = finalOrderCode;
          } else {
            const errText = await restRes.text();
            console.error('Firestore REST save error response:', errText);
          }
        } catch (restErr) {
          console.error('Firestore REST fallback write error:', restErr);
        }
      }

      if (!savedDocId) {
        throw new Error(isBangla ? 'ডাটাবেসে অর্ডার সেভ হতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।' : 'Failed to save order to database. Please check your connection and try again.');
      }

      // Store in localStorage for guest order tracking
      if (userEmail) {
        localStorage.setItem('subscriber_deal_email', userEmail);
        setActiveUserEmail(userEmail);
      }
      if (userPhone) {
        localStorage.setItem('subscriber_deal_phone', userPhone);
      }

      // Background email dispatches (non-blocking)
      sendOrderReceiptViaBackend({
        customerEmail: userEmail || 'guest@example.com',
        customerName: userName,
        dealTitle: activeDeal.title || 'Exclusive Deal Project',
        finalPrice: pricing.finalPrice,
        couponCode: activeCode || (isBangla ? 'ব্যবহার করা হয়নি' : 'Not applied'),
        message: `${checkoutMessage.trim() || ''}\nPhone: ${userPhone}\nAddress: ${userAddress}`,
        htmlInvoice: generateHtmlInvoice(orderRecord)
      }).catch((e) => console.warn('Backend Gmail SMTP dispatch notice:', e));

      sendStyledOrderEmail({
        activeDeal,
        isCouponApplied: !!activeCode,
        enteredCoupon: activeCode,
        userName,
        userEmail: userEmail || 'guest@example.com',
        userMessage: `Phone: ${userPhone} | Address: ${userAddress} | Note: ${checkoutMessage.trim()}`,
        pricing
      }).catch((e) => console.warn('EmailJS cloud dispatch notice:', e));

      // Close Intercept Modal and Checkout Window, and Reset Form
      setIsGuestInterceptOpen(false);
      setSelectedDealForClaim(null);
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutEmail('');
      setCheckoutCouponCode('');
      setCheckoutMessage('');
      setIsCouponApplied(false);
      setAppliedCouponCode('');
      setCheckoutError(null);
      setCheckoutSuccess(null);

      // Trigger Confirmation Receipt Modal
      setOrderConfirmationAlert({
        orderCode: finalOrderCode,
        orderDate: String(orderDate),
        dealTitle: cleanDealTitle,
        dealThumbnail: String(activeDeal?.bannerUrl || activeDeal?.imagePath || '/add1.png'),
        clientName: cleanName,
        customerName: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        email: cleanEmail,
        regularPrice: basePriceNum,
        finalPrice: finalPriceNum,
        couponApplied: cleanCoupon || null,
        hasCoupon: Boolean(cleanCoupon),
        couponCode: cleanCoupon || null,
        discountAmount: pricing?.discountAmount || 0,
        rate: pricing?.rate || 0,
        notes: cleanNotes,
        status: 'pending',
        isGuest: isGuestUser
      });
    } catch (err) {
      console.error('Order submission error:', err);
      setCheckoutError(err.message || (isBangla ? 'অর্ডার প্রসেস করতে ব্যর্থ হয়েছে।' : 'Failed to process order claim.'));
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Close Checkout Modal only when user explicitly finishes invoice inspection or cancels
  const handleCloseCheckoutModal = () => {
    setSelectedDealForClaim(null);
    setCheckoutSuccess(null);
    setCheckoutError(null);
    setIsGuestInterceptOpen(false);
  };

  // Direct Order Submission Handler - Intercepts unauthenticated guest checkouts
  const handleFinalSubmit = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (checkoutSubmitting) return;
    setCheckoutError(null);

    const userName = (checkoutName || '').trim();
    const userPhone = (checkoutPhone || '').trim();
    const userAddress = (checkoutAddress || '').trim();

    // 1. Mandatory customer fields validation with friendly warnings
    if (!userName) {
      setCheckoutError(isBangla ? 'আপনার পূর্ণ নাম লিখুন (আবশ্যক)।' : 'Please enter your full name (required).');
      return;
    }
    if (!userPhone) {
      setCheckoutError(isBangla ? 'আপনার মোবাইল নাম্বার প্রদান করুন (আবশ্যক)।' : 'Please enter your phone number (required).');
      return;
    }
    if (!userAddress) {
      setCheckoutError(isBangla ? 'আপনার সম্পূর্ণ ঠিকানা প্রদান করুন (আবশ্যক)।' : 'Please enter your address (required).');
      return;
    }

    // 2. Unauthenticated / Guest or Logged-in users proceed directly without blocking for auth.currentUser
    await handleConfirmOrderClaim(e, {
      overrideEmail: checkoutEmail ? checkoutEmail.trim() : '',
      overridePhone: userPhone,
      isGuest: !currentUser
    });
  };
  const handleFinalOrderDispatch = handleFinalSubmit;
  const handleSendOrderEmail = handleFinalSubmit;

  // Confirm and submit order from Guest Intercept Modal
  const handleConfirmGuestIntercept = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (checkoutSubmitting) return;
    setGuestInterceptError(null);

    const email = (guestInterceptEmail || '').trim().toLowerCase();
    const phone = (guestInterceptPhone || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate Mandatory Email
    if (!email || !emailRegex.test(email)) {
      setGuestInterceptError(
        isBangla 
          ? 'অনুগ্রহ করে একটি সঠিক ও সক্রিয় ইমেইল অ্যাড্রেস প্রদান করুন।' 
          : 'Please enter a valid active email address.'
      );
      return;
    }

    // Validate Mandatory WhatsApp Number (starts with 01, 11 digits)
    const cleanDigits = phone.replace(/[\s\-\+\(\)]/g, '').replace(/^88/, '');
    if (!cleanDigits.startsWith('01') || cleanDigits.length !== 11) {
      setGuestInterceptError(
        isBangla 
          ? 'অনুগ্রহ করে প্রিফিক্স 01 সহ সঠিক ১১ ডিজিটের হোয়াটসঅ্যাপ নাম্বার (যেমন: 01XXXXXXXXX) দিন।' 
          : 'Please enter a valid 11-digit WhatsApp/mobile number starting with 01 (e.g. 01XXXXXXXXX).'
      );
      return;
    }

    // Update parent states
    setCheckoutEmail(email);
    setCheckoutPhone(cleanDigits);

    // Proceed to claim
    await handleConfirmOrderClaim(null, {
      overrideEmail: email,
      overridePhone: cleanDigits,
      isGuest: true
    });
  };

  // Execute Guest Order History Search Query
  const handleExecuteGuestSearch = () => {
    setGuestSearchInputError(null);
    const query = (guestSearchInput || '').trim();

    if (guestSearchCategory === 'phone') {
      const cleanDigits = normalizePhone(query);
      if (!cleanDigits || cleanDigits.length < 5) {
        setGuestSearchInputError(
          isBangla 
            ? 'অনুগ্রহ করে সঠিক মোবাইল বা হোয়াটসঅ্যাপ নাম্বার প্রদান করুন।' 
            : 'Please enter a valid mobile or WhatsApp number.'
        );
        return;
      }
      setGuestSearchSubmittedQuery({ category: 'phone', query: cleanDigits });
    } else {
      let cleanEmail = query.toLowerCase();
      if (cleanEmail && cleanEmail.includes('@') && !cleanEmail.includes('.')) {
        cleanEmail = cleanEmail + '.com';
        setGuestSearchInput(cleanEmail);
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        setGuestSearchInputError(
          isBangla 
            ? 'অনুগ্রহ করে সঠিক ইমেইল আইডি (যেমন: user@gmail.com) প্রদান করুন।' 
            : 'Please enter a valid email address.'
        );
        return;
      }
      setGuestSearchSubmittedQuery({ category: 'email', query: cleanEmail });
    }
  };

  // Filter helper for tracking orders (Search & Status)
  const filterOrders = (ordersList) => {
    return (ordersList || []).filter((order) => {
      // 1. Status Filter
      const status = (order.status || 'pending').toLowerCase();
      const isAccepted = status === 'accepted' || status === 'confirmed';
      const isCancelled = status === 'cancelled';
      const isPending = !isAccepted && !isCancelled;

      if (trackingStatusFilter === 'pending' && !isPending) return false;
      if (trackingStatusFilter === 'confirmed' && !isAccepted) return false;
      if (trackingStatusFilter === 'cancelled' && !isCancelled) return false;

      // 2. Search Term Filter (Tracking ID / Order Code / Item Title / Address / Phone)
      if (trackingSearchTerm.trim()) {
        const q = trackingSearchTerm.trim().toLowerCase();
        const code = (order.orderCode || order.orderId || '').toLowerCase();
        const title = (order.dealTitle || '').toLowerCase();
        const address = (order.clientAddress || order.address || '').toLowerCase();
        const phone = (order.clientPhone || order.phone || order.whatsapp || '').toLowerCase();
        const matches = code.includes(q) || title.includes(q) || address.includes(q) || phone.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  };

  // Render Modern Delivery-Tracking Card (Modern Delivery/Shipment Card Style)
  const renderDeliveryTrackingCard = (order) => {
    const status = (order.status || 'pending').toLowerCase();
    const isAccepted = status === 'accepted' || status === 'confirmed';
    const isCancelled = status === 'cancelled';
    const isPending = !isAccepted && !isCancelled;

    const trackingId = order.orderCode || order.orderId || 'ORD-92841-XYZ';
    const thumbUrl = order.dealThumbnail || order.bannerUrl || order.imagePath || '/add1.png';
    const address = order.clientAddress || order.address || (isBangla ? 'ঠিকানা প্রযোজ্য নয় / ডিজিটাল ডেলিভারি' : 'Digital Delivery / Address not specified');
    const dealTitle = order.dealTitle || (isBangla ? 'এক্সক্লুসিভ অফার ও ডিল' : 'Exclusive Deal Project');
    const orderDate = order.orderDate || (order.timestamp ? new Date(order.timestamp).toLocaleString(isBangla ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Oct 27, 2026 • 10:00 PM');

    return (
      <div
        key={order.id || order.orderId || trackingId}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        style={{
          background: isDark ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.75) 100%)' : '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* TOP SECTION (Header Row) */}
        <div style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #F1F5F9',
          background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(248, 250, 252, 0.65)'
        }}>
          {/* Left: Subtitle TRACKING ID & bold monospace code */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isDark ? '#94A3B8' : '#64748B'
            }}>
              TRACKING ID
            </span>
            <span style={{
              fontFamily: "'Space Grotesk', monospace",
              fontWeight: 800,
              fontSize: '0.98rem',
              color: isDark ? '#F1F5F9' : '#0F172A',
              letterSpacing: '0.5px'
            }}>
              {trackingId}
            </span>
          </div>

          {/* Right: Rounded pill badge for status */}
          <div>
            {isPending && (
              <span className="rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                <span>PENDING / IN TRANSIT</span>
              </span>
            )}
            {isAccepted && (
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span>CONFIRMED / DELIVERED</span>
              </span>
            )}
            {isCancelled && (
              <span className="rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span>CANCELLED</span>
              </span>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION (Route / Address Details) */}
        <div style={{
          padding: '16px 18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}>
          {/* Location / Route Marker: Blue dot -> Dashed line -> Pin */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '3px',
            width: '18px',
            flexShrink: 0
          }}>
            <div style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#3B82F6',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.7)'
            }} />
            <div style={{
              width: '2px',
              height: '32px',
              borderLeft: '2px dashed #93C5FD',
              margin: '3px 0'
            }} />
            <MapPin size={13} color="#10B981" />
          </div>

          {/* Route Content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#3B82F6',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {isBangla ? 'আইটেম / প্রজেক্ট' : 'Item / Project'}
              </div>
              <div style={{
                fontWeight: 800,
                fontSize: '0.94rem',
                color: isDark ? '#FFFFFF' : '#0F172A',
                lineHeight: 1.3
              }}>
                {dealTitle}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#10B981',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Destination / Address
              </div>
              <div style={{
                fontSize: '0.82rem',
                color: isDark ? '#CBD5E1' : '#475569',
                lineHeight: 1.35
              }}>
                {address}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '2px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 900,
                color: '#10B981',
                fontFamily: "'Space Grotesk', monospace",
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                ৳{order.finalPrice} BDT
              </span>
              {order.isGuest && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  color: '#00F0FF',
                  fontWeight: 700,
                  border: '1px solid rgba(0, 240, 255, 0.3)'
                }}>
                  {isBangla ? 'গেস্ট অর্ডার' : 'Guest Order'}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div style={{
            width: '62px',
            height: '62px',
            borderRadius: '12px',
            overflow: 'hidden',
            flexShrink: 0,
            background: isDark ? '#091124' : '#E2E8F0',
            border: '1.5px solid rgba(16, 185, 129, 0.3)'
          }}>
            <img
              src={thumbUrl}
              alt={dealTitle}
              loading="lazy"
              decoding="async"
              onError={(e) => { e.target.src = '/add1.png'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '1 / 1' }}
            />
          </div>
        </div>

        {/* BOTTOM SECTION (Footer Row) */}
        <div style={{
          padding: '12px 18px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          background: isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(248, 250, 252, 0.45)'
        }}>
          {/* Left: Delivered Date / Order Date */}
          <div style={{
            fontSize: '0.76rem',
            color: isDark ? '#94A3B8' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={13} style={{ flexShrink: 0, color: '#3B82F6' }} />
            <span>
              <strong>{isAccepted ? 'Delivered Date' : 'Order Date'}:</strong> {orderDate}
            </span>
          </div>

          {/* Right: Action Button Track ⛶ / Details > */}
          <button
            type="button"
            onClick={() => setSelectedShipmentDetail(order)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284C7 0%, #00F0FF 100%)',
              color: '#020617',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 240, 255, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Track ⛶</span>
          </button>
        </div>
      </div>
    );
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
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '100%',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: isDark 
            ? 'radial-gradient(circle at top, #0f172a 0%, #030712 100%)' 
            : 'radial-gradient(circle at top, #F8FAFC 0%, #E2E8F0 100%)',
          color: isDark ? '#FFFFFF' : '#0F172A',
          zIndex: 9999,
          boxSizing: 'border-box'
        }}
      >
        {/* 1. TOP HEADER BAR: Back Arrow (Left), Exclusive Deals & Discounts (Center/Left), Close X (Right) */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: '12px 20px',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          flexShrink: 0,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Left: Dedicated Circular 38px Back Arrow Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'}`,
              color: isDark ? '#FFFFFF' : '#0F172A',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
            title={isBangla ? 'হোমবারে ফিরে যান' : 'Back to Home'}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Center / Left Section: Icon Badge + Title & Subtitle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-start'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 0 15px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/deal and discount.png" 
                alt="Deals & Discounts" 
                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1.05rem, 3.2vw, 1.35rem)',
                fontWeight: 900,
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                letterSpacing: '0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isBangla ? 'বিশেষ ডিল ও এক্সক্লুসিভ ডিসকাউন্ট' : 'Exclusive Deals & Discounts'}
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: 'clamp(0.70rem, 2vw, 0.78rem)',
                color: isDark ? '#94A3B8' : '#64748B',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isBangla 
                  ? 'ভেরিফাইড প্রোমো কোড, স্পেশাল বান্ডেল অফার ও প্রজেক্ট ডিসকাউন্ট সুবিধা' 
                  : 'Verified promo codes, special bundle offers & premium project discount perks'}
              </p>
            </div>
          </div>

          {/* Right Action Buttons: Compact Colorful Tracking Button + Close (X) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Compact Colorful Order Tracking Button */}
            <button
              type="button"
              onClick={(e) => {
                if (e) {
                  if (typeof e.preventDefault === 'function') e.preventDefault();
                  if (typeof e.stopPropagation === 'function') e.stopPropagation();
                }
                if (currentUser?.email) {
                  setTrackEmail(currentUser.email);
                }
                setIsTrackModalOpen(true);
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.22) 100%)',
                border: '1.5px solid rgba(16, 185, 129, 0.55)',
                color: isDark ? '#34D399' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.35), 0 0 8px rgba(6, 182, 212, 0.25)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              title={isBangla ? 'আমার অর্ডার ও ডিল ট্র্যাকিং' : 'My Orders & Deal Tracking'}
              aria-label="Track Orders"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.55), 0 0 12px rgba(6, 182, 212, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.35), 0 0 8px rgba(6, 182, 212, 0.25)';
              }}
            >
              <Package size={18} />
              {currentUser && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: `2px solid ${isDark ? '#0F172A' : '#FFFFFF'}`,
                  boxShadow: '0 0 6px #10B981'
                }} />
              )}
            </button>

            {/* Circular 38px Close (X) Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
                color: isDark ? '#FFFFFF' : '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
              title={isBangla ? 'বন্ধ করুন' : 'Close'}
              aria-label="Close"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.color = isDark ? '#FFFFFF' : '#0F172A';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* EXPANSIVE FULL-SCREEN CANVAS CONTENT (No Overflow, Responsive Grid) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          maxWidth: '100%',
          padding: '16px 16px calc(100px + env(safe-area-inset-bottom, 24px)) 16px',
          boxSizing: 'border-box'
        }}>
          <FirestoreStreamBuilder collectionName={COLLECTIONS.DEALS_DISCOUNTS}>
            {({ data }) => {
              const allDeals = data || [];
              const deals = allDeals.filter(deal => {
                if (!deal) return false;
                if (deal.isActive === false) return false;
                if (deal.isLimited && deal.expiryDate) {
                  const expTime = new Date(deal.expiryDate).getTime();
                  if (!isNaN(expTime) && expTime < Date.now()) {
                    return false; // Auto-expired limited time offer!
                  }
                }
                return true;
              });

              // Calculate deal with highest discount percentage
              const topDiscountRate = deals.reduce((max, d) => {
                const r = parseDiscountRate(d);
                return r > max ? r : max;
              }, 0);
              const topDealId = deals.find(d => parseDiscountRate(d) === topDiscountRate && topDiscountRate > 0)?.id;

              return (
                <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', boxSizing: 'border-box' }}>
                  {/* Dedicated Prominent "Shipment & Order History" Action Banner */}
                  <div style={{
                    width: '100%',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    borderRadius: '16px',
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.12) 100%)' 
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                    border: `1.5px solid ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        flexShrink: 0
                      }}>
                        <Package size={20} />
                      </div>
                      <div>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '0.98rem', 
                          fontWeight: 800, 
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}>
                          {isBangla ? 'শিপমেন্ট ও অর্ডার হিস্ট্রি (Shipment & Order History)' : 'Shipment & Order History'}
                        </h4>
                        <p style={{ 
                          margin: '2px 0 0 0', 
                          fontSize: '0.78rem', 
                          color: isDark ? '#94A3B8' : '#64748B',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}>
                          {isBangla ? 'আপনার চলমান ডেলিভারি ও পূর্ববর্তী অর্ডারের লাইভ ট্র্যাকিং স্ট্যাটাস দেখুন' : 'Track active shipments and view your previous claimed orders'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        if (e) {
                          if (typeof e.preventDefault === 'function') e.preventDefault();
                          if (typeof e.stopPropagation === 'function') e.stopPropagation();
                        }
                        if (currentUser?.email) {
                          setTrackEmail(currentUser.email);
                        }
                        setIsTrackModalOpen(true);
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                        transition: 'all 0.2s ease',
                        fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                      }}
                    >
                      <Package size={16} />
                      <span>{isBangla ? 'অর্ডার হিস্ট্রি দেখুন' : 'View Order History'}</span>
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                    gap: '24px',
                    width: '100%',
                    paddingBottom: '24px',
                    boxSizing: 'border-box'
                  }}>
                  {deals && deals.length > 0 ? (
                    deals.map((item, idx) => {
                      if (!item) return null;
                      const isRecommended = item.id === topDealId && topDiscountRate > 0;
                      return (
                        <motion.div
                          key={item.id || idx}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.22 }}
                        style={{
                          borderRadius: '20px',
                          background: isDark 
                            ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%)' 
                            : '#FFFFFF',
                          border: isRecommended
                            ? '2px solid #FF6B00'
                            : `1.5px solid ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 105, 92, 0.22)'}`,
                          overflow: 'hidden',
                          boxShadow: isRecommended
                            ? (isDark 
                                ? '0 10px 35px rgba(255, 107, 0, 0.28), 0 0 20px rgba(255, 69, 0, 0.2)' 
                                : '0 10px 35px rgba(255, 107, 0, 0.25)')
                            : (isDark 
                                ? '0 8px 32px rgba(34, 197, 94, 0.15), 0 0 20px rgba(16, 185, 129, 0.08)' 
                                : '0 8px 32px rgba(0, 105, 92, 0.12)'),
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          position: 'relative'
                        }}
                      >
                        {/* Dynamic "🔥 Recommended / Popular Deal" Badge for highest discount */}
                        {isRecommended && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            zIndex: 15,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #FF3D00 0%, #FF8F00 100%)',
                            color: '#FFFFFF',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            letterSpacing: '0.4px',
                            boxShadow: '0 4px 16px rgba(255, 61, 0, 0.5), 0 0 10px rgba(255, 143, 0, 0.4)',
                            border: '1.5px solid rgba(255, 255, 255, 0.4)',
                            textTransform: 'uppercase'
                          }}>
                            <span>🔥 {isBangla ? 'সর্বোচ্চ ছাড় / জনপ্রিয় ডিল' : 'Recommended Deal'}</span>
                          </div>
                        )}
                        {/* High-Resolution Full-Width Banner Image (Clean Showcase, No Overlays) */}
                        <div style={{
                          width: '100%',
                          maxWidth: '100%',
                          height: '210px',
                          position: 'relative',
                          background: '#0b1329',
                          overflow: 'hidden',
                          borderRadius: '18px 18px 0 0'
                        }}>
                          <img 
                            src={item.bannerUrl || (item.imagePath ? (item.imagePath.startsWith('/') ? item.imagePath : '/' + item.imagePath) : '/add1.png')} 
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.target.src = '/add1.png'; }}
                            style={{ width: '100%', maxWidth: '100%', height: '100%', objectFit: 'cover', aspectRatio: '16 / 9' }}
                          />
                        </div>

                        {/* Card Details & Action Form */}
                        <div style={{
                          padding: '20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          justifyContent: 'space-between',
                          gap: '16px'
                        }}>
                          <div>
                            {/* Badges Relocated Outside Showcase Image: Left (Exclusive Offer) & Right (Discount %) */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '12px',
                              gap: '8px'
                            }}>
                              {/* Left: Exclusive Offer Chip */}
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                borderRadius: '10px',
                                background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 105, 92, 0.08)',
                                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 105, 92, 0.25)'}`,
                                color: '#10B981',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                <Sparkles size={12} color="#10B981" />
                                <span>{isBangla ? 'Exclusive Offer' : 'Exclusive Offer'}</span>
                              </div>

                              {/* Right: Discount Percentage Badge */}
                              {(item.discountPercent || item.discountPercentage || item.discountCode || item.couponCode) && (
                                <div style={{
                                  padding: '5px 14px',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                  color: '#FFFFFF',
                                  fontSize: '0.82rem',
                                  fontWeight: 900,
                                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
                                  letterSpacing: '0.5px'
                                }}>
                                  {item.discountPercent || (item.discountPercentage ? `${item.discountPercentage}% OFF` : (item.discountCode || item.couponCode))}
                                </div>
                              )}
                            </div>

                            <h3 style={{
                              margin: '0 0 8px 0',
                              fontSize: '1.2rem',
                              fontWeight: 800,
                              color: isDark ? '#FFFFFF' : '#0F172A',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif",
                              lineHeight: 1.3
                            }}>
                              {item.title}
                            </h3>
                            <p style={{
                              margin: 0,
                              fontSize: '0.84rem',
                              lineHeight: 1.5,
                              color: isDark ? '#94A3B8' : '#64748B',
                              fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                            }}>
                              {item.description}
                            </p>

                            {/* Expiration Date Pill (Clean metadata outside image) */}
                            {(item.expiryDate || item.validUntil) && (
                              <div style={{
                                marginTop: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '0.74rem',
                                color: isDark ? '#94A3B8' : '#64748B',
                                fontWeight: 600
                              }}>
                                <Clock size={13} color="#10B981" />
                                <span>{isBangla ? 'মেয়াদ:' : 'Valid until:'} {item.expiryDate || item.validUntil}</span>
                              </div>
                            )}
                          </div>



                          {/* Large Glowing "Claim Offer" Action Button */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => {
                                if (e) {
                                  if (typeof e.preventDefault === 'function') e.preventDefault();
                                  if (typeof e.stopPropagation === 'function') e.stopPropagation();
                                }
                                handleClaimButtonClick(item);
                              }}
                              style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '13px 20px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #06B6D4 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '0.94rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                boxShadow: '0 6px 24px rgba(16, 185, 129, 0.45), 0 0 20px rgba(6, 182, 212, 0.3)',
                                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                              }}
                            >
                              <Gift size={18} />
                              <span>{isBangla ? 'Claim Offer / ক্লেইম করুন' : 'Claim Offer / Redeem Now'}</span>
                            </motion.button>

                            {/* Native Social Media Share Button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => handleShareDeal(e, item)}
                              style={{
                                padding: '13px 16px',
                                borderRadius: '14px',
                                background: sharedDealId === item.id 
                                  ? 'rgba(16, 185, 129, 0.25)' 
                                  : (isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 105, 92, 0.08)'),
                                border: `1.5px solid ${sharedDealId === item.id ? '#10B981' : (isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 105, 92, 0.25)')}`,
                                color: sharedDealId === item.id ? '#10B981' : (isDark ? '#34D399' : '#059669'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)'
                              }}
                              title={isBangla ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share on Social Media'}
                              aria-label="Share Deal"
                            >
                              {sharedDealId === item.id ? (
                                <Check size={18} color="#10B981" />
                              ) : (
                                <Share2 size={18} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '48px 20px',
                    color: isDark ? '#94A3B8' : '#64748B',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '16px',
                    border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                  }}>
                    <Tag size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                      {isBangla ? 'বর্তমানে কোনো সক্রিয় ডিল পাওয়া যায়নি' : 'No active deals available right now'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>
                      {isBangla ? 'অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেক করুন।' : 'Please check back soon for exciting bundle offers.'}
                    </p>
                  </div>
                )}
                  </div>
                </div>
              );
            }}
          </FirestoreStreamBuilder>
        </div>

        {/* DYNAMIC CHECKOUT DRAWER / MODAL: Claim Offer & Checkout (Decoupled to document.body) */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {selectedDealForClaim && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] h-screen h-[100dvh] w-full bg-white dark:bg-[#0b101b] flex flex-col pointer-events-auto"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100vh',
                  height: '100dvh',
                  zIndex: 999999,
                  pointerEvents: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: isDark ? '#0b101b' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#0F172A'
                }}
              >
                {/* 1. TOP HEADER: Explicit Title & Clean Close (X) Button */}
                <div 
                  className="flex-shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-inherit sticky top-0 z-30"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: isDark ? '#0b101b' : '#FFFFFF',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                      flexShrink: 0
                    }}>
                      <Calculator size={18} />
                    </div>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                      }}>
                        {checkoutSuccess 
                          ? (isBangla ? 'ডিজিটাল রসিদ ও ইনভয়েস' : 'Digital Receipt & Invoice') 
                          : 'Claim Offer & Checkout'}
                      </h3>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        {checkoutSuccess 
                          ? (isBangla ? 'অর্ডারটি সফলভাবে জমা হয়েছে এবং অনুমোদনের অপেক্ষায় রয়েছে' : 'Order submitted & pending admin approval') 
                          : (isBangla ? 'তথ্য পূরণ করে অফারটি ক্লেইম করুন' : 'Fill details below to complete your checkout')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      if (e) {
                        if (typeof e.preventDefault === 'function') e.preventDefault();
                        if (typeof e.stopPropagation === 'function') e.stopPropagation();
                      }
                      handleCloseCheckoutModal();
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    title={isBangla ? 'বন্ধ করুন' : 'Close'}
                  >
                    <X size={17} />
                  </button>
                </div>

              {/* 2. Scrollable Body */}
              <div 
                className="flex-1 w-full overflow-y-auto px-4 py-4 space-y-4 -webkit-overflow-scrolling-touch"
                style={{
                  flex: 1,
                  width: '100%',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  paddingBottom: 'max(6rem, calc(80px + env(safe-area-inset-bottom, 24px)))'
                }}
              >
                  {/* Digital Invoice Success Screen */}
                  {checkoutSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: isDark ? '#0F172A' : '#FFFFFF',
                        border: `1.5px solid ${isDark ? 'rgba(20, 184, 166, 0.4)' : 'rgba(13, 148, 136, 0.3)'}`,
                        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Branding */}
                      <div style={{
                        padding: '16px 20px',
                        background: isDark ? '#091124' : '#F8FAFC',
                        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '1.5px', color: '#14B8A6', textTransform: 'uppercase' }}>
                            RASEDUL KARIM
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.5px' }}>
                            PORTFOLIO & DIGITAL SOLUTIONS
                          </div>
                        </div>
                        {/* Live Lifecycle Status Badge: PENDING */}
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1.5px solid #F59E0B',
                          color: '#FBBF24',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <Clock size={13} />
                          {isBangla ? 'পেন্ডিং (Pending Approval)' : 'Pending Approval'}
                        </span>
                      </div>

                      {/* Hero Notice */}
                      <div style={{
                        padding: '18px 20px',
                        background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                        textAlign: 'center',
                        color: '#FFFFFF'
                      }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🎉</div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF' }}>
                          {isBangla ? 'অর্ডার সফলভাবে জমা হয়েছে!' : 'Order Placed Successfully!'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#E6FFFA' }}>
                          {isBangla 
                            ? 'আপনার অর্ডারটি পেন্ডিং হিসেবে জমা হয়েছে। অ্যাডমিন কনফার্ম করলে অফারটি চূড়ান্তভাবে সক্রিয় হবে।' 
                            : 'Your order is recorded as pending. Offer benefits will lock upon admin confirmation.'}
                        </p>
                      </div>

                      {/* Order Code & Date */}
                      <div style={{
                        padding: '12px 20px',
                        background: isDark ? '#111E38' : '#F8FAFC',
                        borderBottom: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: '#94A3B8'
                      }}>
                        <div>
                          {isBangla ? 'অর্ডার কোড:' : 'Order Code:'}{' '}
                          <strong style={{ color: '#00F0FF', fontFamily: "'Space Grotesk', monospace" }}>
                            #{checkoutSuccess.orderCode || checkoutSuccess.orderId}
                          </strong>
                        </div>
                        <div>
                          {isBangla ? 'তারিখ:' : 'Date:'}{' '}
                          <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{checkoutSuccess.orderDate}</strong>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#22D3EE', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {isBangla ? '📋 প্রজেক্ট ও প্রাইসিং বিবরণ' : '📋 Deal & Pricing Summary'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '8px', borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}` }}>
                            <div>
                              <div style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '0.92rem' }}>
                                {checkoutSuccess.dealTitle}
                              </div>
                              {checkoutSuccess.hasCoupon && checkoutSuccess.couponCode && (
                                <div style={{ fontSize: '0.74rem', color: '#14B8A6', marginTop: '2px' }}>
                                  {isBangla ? 'অফার / ছাড়:' : 'Offer / Discount:'}{' '}
                                  <strong>
                                    {checkoutSuccess.couponCode === 'SPECIAL_DEAL_DISCOUNT'
                                      ? (isBangla ? 'বিশেষ অফার ডিসকাউন্ট' : 'Special Deal Discount')
                                      : checkoutSuccess.couponCode}
                                  </strong>
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', fontFamily: "'Space Grotesk', monospace" }}>
                                {checkoutSuccess.hasCoupon ? checkoutSuccess.originalPrice : `৳${checkoutSuccess.finalPrice} BDT`}
                              </div>
                            </div>
                          </div>

                          {checkoutSuccess.hasCoupon && (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94A3B8' }}>
                                <span>{isBangla ? 'রেগুলার মূল্য:' : 'Regular Price:'}</span>
                                <span style={{ fontFamily: "'Space Grotesk', monospace" }}>{checkoutSuccess.originalPrice}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
                                <span>{isBangla ? `প্রযোজ্য ছাড় (${checkoutSuccess.discountPercentage}%):` : `Applied Discount (${checkoutSuccess.discountPercentage}%):`}</span>
                                <span style={{ fontFamily: "'Space Grotesk', monospace" }}>-{checkoutSuccess.discountAmount}</span>
                              </div>
                            </>
                          )}

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '8px',
                            borderTop: `1.5px solid ${isDark ? 'rgba(20, 184, 166, 0.4)' : 'rgba(13, 148, 136, 0.3)'}`,
                            fontSize: '0.98rem',
                            fontWeight: 900,
                            color: isDark ? '#FFFFFF' : '#0F172A'
                          }}>
                            <span>{isBangla ? 'পরিশোধযোগ্য মূল্য:' : 'Payable Amount:'}</span>
                            <span style={{ color: '#10B981', fontSize: '1.25rem', fontFamily: "'Space Grotesk', monospace" }}>
                              ৳{checkoutSuccess.finalPrice} BDT
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details Box */}
                      <div style={{ padding: '0 20px 16px' }}>
                        <div style={{
                          background: isDark ? '#111E38' : '#F8FAFC',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                          fontSize: '0.78rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px'
                        }}>
                          <div style={{ fontWeight: 800, color: '#22D3EE', marginBottom: '2px' }}>
                            {isBangla ? '👤 গ্রাহকের তথ্য' : '👤 Customer Information'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>{isBangla ? 'নাম:' : 'Name:'}</span>
                            <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>{checkoutSuccess.clientName}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>{isBangla ? 'মোবাইল:' : 'Phone:'}</span>
                            <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 700, fontFamily: "'Space Grotesk', monospace" }}>{checkoutSuccess.clientPhone}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>{isBangla ? 'ঠিকানা:' : 'Address:'}</span>
                            <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>{checkoutSuccess.clientAddress}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                            <span>{isBangla ? 'ইমেইল:' : 'Email:'}</span>
                            <span style={{ color: '#10B981', fontWeight: 700, fontFamily: "'Space Grotesk', monospace" }}>{checkoutSuccess.clientEmail}</span>
                          </div>
                          {checkoutSuccess.message && (
                            <div style={{ color: '#94A3B8', borderTop: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`, paddingTop: '5px', marginTop: '2px' }}>
                              <span>{isBangla ? 'নোট / বার্তা:' : 'Note:'}</span>{' '}
                              <span style={{ color: isDark ? '#E2E8F0' : '#334155' }}>{checkoutSuccess.message}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Close button */}
                      <div style={{ padding: '0 20px 20px' }}>
                        <button
                          type="button"
                          onClick={handleCloseCheckoutModal}
                          style={{
                            width: '100%',
                            minHeight: '48px',
                            padding: '12px 20px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            border: '1.5px solid rgba(52, 211, 153, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={18} />
                          <span>{isBangla ? '✓ সম্পন্ন করুন (Done)' : 'Done / Close'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* Clean Step-by-Step Checkout Form */
                    <form onSubmit={(e) => { if (e) { e.preventDefault(); e.stopPropagation(); } handleFinalSubmit(e); }} noValidate className="space-y-4 pb-28" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '7rem' }}>
                      {/* 2. PRODUCT PREVIEW CARD */}
                      {(() => {
                        const hasEffectiveCoupon = isCouponApplied && !!appliedCouponCode;
                        const pricing = calculatePricing(selectedDealForClaim, hasEffectiveCoupon);
                        return (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px 14px',
                            borderRadius: '16px',
                            background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                            border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                          }}>
                            {/* Product Image / Banner on left */}
                            <div style={{
                              width: '76px',
                              height: '76px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              background: isDark ? '#0F172A' : '#E2E8F0',
                              border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                              <img
                                src={selectedDealForClaim?.bannerUrl || '/add1.png'}
                                alt="Product banner"
                                loading="lazy"
                                decoding="async"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '1 / 1' }}
                              />
                            </div>

                            {/* Details beside image */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '0.98rem',
                                fontWeight: 800,
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                lineHeight: '1.3'
                              }}>
                                {selectedDealForClaim?.title || (isBangla ? 'এক্সক্লুসিভ অফার' : 'Exclusive Deal')}
                              </h4>

                              {/* Discount badge */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(16, 185, 129, 0.18)',
                                  color: '#10B981',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Sparkles size={11} />
                                  {selectedDealForClaim?.discountPercent || (selectedDealForClaim?.discountPercentage ? `${selectedDealForClaim.discountPercentage}% OFF` : 'Special Discount')}
                                </span>

                                {hasEffectiveCoupon && (
                                  <span style={{
                                    fontSize: '0.70rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(0, 240, 255, 0.15)',
                                    color: '#00F0FF',
                                    border: '1px solid rgba(0, 240, 255, 0.3)'
                                  }}>
                                    ✓ {appliedCouponCode === 'SPECIAL_DEAL_DISCOUNT' 
                                        ? (isBangla ? 'বিশেষ অফার ছাড় সক্রিয়' : 'Special Deal Discount Applied') 
                                        : `${isBangla ? 'কুপন সক্রিয়' : 'Coupon Applied'}: ${appliedCouponCode}`}
                                  </span>
                                )}
                              </div>

                              {/* Pricing Section: Regular Price & Discounted Price side by side in clear fonts */}
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {hasEffectiveCoupon ? (
                                  <>
                                    <span style={{
                                      fontSize: '0.80rem',
                                      color: '#94A3B8',
                                      textDecoration: 'line-through',
                                      fontFamily: "'Space Grotesk', monospace"
                                    }}>
                                      ৳{pricing.basePrice}
                                    </span>
                                    <span style={{
                                      fontSize: '1.15rem',
                                      fontWeight: 900,
                                      color: '#10B981',
                                      fontFamily: "'Space Grotesk', monospace"
                                    }}>
                                      ৳{pricing.finalPrice} BDT
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span style={{
                                      fontSize: '1.1rem',
                                      fontWeight: 900,
                                      color: isDark ? '#FFFFFF' : '#0F172A',
                                      fontFamily: "'Space Grotesk', monospace"
                                    }}>
                                      ৳{pricing.basePrice} BDT
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                      ({isBangla ? 'রেগুলার মূল্য' : 'Regular Price'})
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 3. CUSTOMER INFORMATION FIELDS */}
                      <div style={{
                        padding: '14px 16px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          color: '#22D3EE',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <User size={15} />
                          <span>{isBangla ? 'গ্রাহকের তথ্য (Customer Details)' : 'Customer Information'}</span>
                        </div>

                        {/* Full Name Field (Required) */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontWeight: 600 }}>
                            <span>{isBangla ? 'নাম (Full Name) *' : 'Full Name *'}</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              required
                              value={checkoutName}
                              onChange={(e) => setCheckoutName(e.target.value)}
                              placeholder={isBangla ? 'আপনার পূর্ণ নাম লিখুন...' : 'Enter your full name...'}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                paddingLeft: '36px',
                                borderRadius: '10px',
                                background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                                border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                fontSize: '0.84rem',
                                boxSizing: 'border-box',
                                outline: 'none'
                              }}
                            />
                            <User size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          </div>
                        </div>

                        {/* Phone Number Field (Required) */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontWeight: 600 }}>
                            <span>{isBangla ? 'মোবাইল নাম্বার (Phone Number) *' : 'Phone Number *'}</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="tel"
                              required
                              value={checkoutPhone}
                              onChange={(e) => setCheckoutPhone(e.target.value)}
                              placeholder={isBangla ? '01XXXXXXXXX' : '+880 1XXXXXXXXX'}
                              className="w-full font-mono text-base tracking-normal leading-normal"
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                paddingLeft: '36px',
                                borderRadius: '10px',
                                background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                                border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                fontSize: '1rem',
                                lineHeight: '1.5',
                                boxSizing: 'border-box',
                                outline: 'none'
                              }}
                            />
                            <Phone size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          </div>
                        </div>

                        {/* Address Field (Required) */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontWeight: 600 }}>
                            <span>{isBangla ? 'ঠিকানা (Address) *' : 'Address *'}</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              required
                              value={checkoutAddress}
                              onChange={(e) => setCheckoutAddress(e.target.value)}
                              placeholder={isBangla ? 'রোড, বাড়ি/এরিয়া, জেলা...' : 'House, Road, City/Area...'}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                paddingLeft: '36px',
                                borderRadius: '10px',
                                background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                                border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                color: isDark ? '#FFFFFF' : '#0F172A',
                                fontSize: '0.84rem',
                                boxSizing: 'border-box',
                                outline: 'none'
                              }}
                            />
                            <MapPin size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          </div>
                        </div>

                        {/* 4. EMAIL & AUTHENTICATION STATUS (With Guest Checkout & Info Icon) */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <label style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                              <Mail size={14} />
                              <span>{isBangla ? 'ইমেইল ঠিকানা (Email Address)' : 'Email Address'}</span>
                            </label>

                            {/* Info icon (ℹ️) triggering Info Modal/Tooltip */}
                            <button
                              type="button"
                              onClick={() => setShowEmailInfoModal((prev) => !prev)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: showEmailInfoModal ? '#00F0FF' : '#94A3B8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.72rem',
                                padding: '2px 4px',
                                borderRadius: '6px'
                              }}
                              title="Account benefits info"
                            >
                              <Info size={14} color="#00F0FF" />
                              <span style={{ color: '#00F0FF', fontWeight: 700 }}>{isBangla ? 'সুবিধা দেখুন' : 'Info'}</span>
                            </button>
                          </div>

                          {/* Email Info Modal / Tooltip */}
                          <AnimatePresence>
                            {showEmailInfoModal && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                  marginBottom: '8px',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  background: isDark ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0, 105, 92, 0.08)',
                                  border: '1px solid rgba(0, 240, 255, 0.35)',
                                  color: isDark ? '#E2E8F0' : '#0F172A',
                                  fontSize: '0.78rem',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px'
                                }}
                              >
                                <Info size={16} color="#00F0FF" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ flex: 1, lineHeight: '1.4' }}>
                                  <strong>{isBangla ? 'অ্যাকাউন্ট ভেরিফিকেশন সুবিধা:' : 'Account Benefit:'}</strong>{' '}
                                  "If you are connected with an account, you will be eligible for coupon codes and exclusive discounts."
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowEmailInfoModal(false)}
                                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                                >
                                  <X size={14} />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Email Field rendering based on login status */}
                          {currentUser?.email ? (
                            /* Logged-in state: auto-filled, read-only, connected badge */
                            <div>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type="email"
                                  readOnly
                                  value={currentUser.email}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    paddingLeft: '36px',
                                    paddingRight: '36px',
                                    borderRadius: '10px',
                                    background: isDark ? 'rgba(0, 0, 0, 0.45)' : '#F1F5F9',
                                    border: '1.5px solid #10B981',
                                    color: isDark ? '#FFFFFF' : '#0F172A',
                                    fontSize: '0.84rem',
                                    fontFamily: "'Space Grotesk', monospace",
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                  }}
                                />
                                <Mail size={15} color="#10B981" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <CheckCircle2 size={16} color="#10B981" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                              </div>
                              <div style={{
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.70rem',
                                color: '#10B981',
                                fontWeight: 700
                              }}>
                                <CheckCircle2 size={12} />
                                <span>{isBangla ? 'কানেক্টেড একাউন্ট (কুপন ও ছাড়ের জন্য উপযুক্ত)' : 'Connected Account (Eligible for coupons & discounts)'}</span>
                              </div>
                            </div>
                          ) : (
                            /* Guest Checkout state: editable, guest note, connect button */
                            <div>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type="email"
                                  value={checkoutEmail}
                                  onChange={(e) => {
                                    setCheckoutEmail(e.target.value);
                                    if (isCouponApplied) {
                                      setIsCouponApplied(false);
                                      setAppliedCouponCode('');
                                    }
                                  }}
                                  placeholder={isBangla ? 'ইমেইল ঠিকানা লিখুন (ঐচ্ছিক / Optional)...' : 'Enter email address (optional)...'}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    paddingLeft: '36px',
                                    borderRadius: '10px',
                                    background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                                    border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                    color: isDark ? '#FFFFFF' : '#0F172A',
                                    fontSize: '0.84rem',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                  }}
                                />
                                <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                              </div>

                              {/* Guest checkout note & Connect account action */}
                              <div style={{
                                marginTop: '6px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F1F5F9',
                                border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{ fontSize: '0.72rem', color: isDark ? '#94A3B8' : '#64748B', lineHeight: '1.3' }}>
                                  {isBangla 
                                    ? '💡 লগইন ছাড়া অর্ডার করতে পারেন, তবে কুপন বা বিশেষ ছাড় পেতে একাউন্ট কানেক্ট করুন।' 
                                    : '💡 Guest checkout allowed! Connect your account to unlock coupon discounts.'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsConnectModalOpen(true)}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: 'rgba(0, 240, 255, 0.15)',
                                    border: '1px solid #00F0FF',
                                    color: '#00F0FF',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    flexShrink: 0
                                  }}
                                >
                                  <LogIn size={12} />
                                  <span>{isBangla ? 'একাউন্ট কানেক্ট করুন' : 'Connect Account'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 5. OPTIONAL COUPON CODE & SINGLE-USE ELIGIBILITY CHECK */}
                      <div style={{
                        padding: '14px 16px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
                        border: isCouponApplied
                          ? '1.5px solid #10B981'
                          : `1.5px dashed ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 105, 92, 0.3)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={15} color="#10B981" />
                            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                              {isBangla ? 'কুপন কোড (Optional Coupon)' : 'Coupon Code (Optional)'}
                            </span>
                          </div>

                          {isCouponApplied && (
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#10B981',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={12} />
                              {appliedCouponCode === 'SPECIAL_DEAL_DISCOUNT'
                                ? (isBangla ? 'বিশেষ ছাড় কার্যকর' : 'Special Discount Active')
                                : (isBangla ? 'কুপন কার্যকর' : 'Coupon Applied')}
                            </span>
                          )}
                        </div>

                        {/* Input & Action Row */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={checkoutCouponCode}
                            onChange={(e) => {
                              setCheckoutCouponCode(e.target.value.toUpperCase());
                              if (isCouponApplied) {
                                setIsCouponApplied(false);
                                setAppliedCouponCode('');
                                setCouponSuccessMsg(null);
                              }
                            }}
                            placeholder={isBangla ? 'কুপন কোড লিখুন...' : 'ENTER COUPON...'}
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              borderRadius: '10px',
                              background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                              border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                              color: isDark ? '#FFFFFF' : '#0F172A',
                              fontSize: '0.84rem',
                              fontFamily: "'Space Grotesk', monospace",
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />

                          {isCouponApplied ? (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCouponApplied(false);
                                setAppliedCouponCode('');
                                setCouponSuccessMsg(null);
                                setCouponErrorMsg(null);
                              }}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1.5px solid rgba(239, 68, 68, 0.35)',
                                color: '#EF4444',
                                fontSize: '0.80rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <X size={14} />
                              <span>{isBangla ? 'রিমুভ' : 'Remove'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={couponChecking}
                              onClick={() => checkAndApplyCouponForUser(checkoutCouponCode, selectedDealForClaim)}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: couponChecking ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.35)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {couponChecking ? (
                                <span>{isBangla ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                              ) : (
                                <>
                                  <KeyRound size={14} />
                                  <span>{isBangla ? 'অ্যাপ্লাই' : 'Apply'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Success Message */}
                        {couponSuccessMsg && (
                          <div style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#10B981',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                            <span>{couponSuccessMsg}</span>
                          </div>
                        )}

                        {/* Error Message with Connect Button if login required */}
                        {couponErrorMsg && (
                          <div style={{
                            padding: '9px 12px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1.5px solid rgba(239, 68, 68, 0.35)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700 }}>
                              <AlertCircle size={14} style={{ flexShrink: 0 }} />
                              <span>{couponErrorMsg}</span>
                            </div>
                            {(couponErrorMsg.includes('কানেক্ট') || couponErrorMsg.includes('connect')) && !currentUser && (
                              <button
                                type="button"
                                onClick={() => setIsConnectModalOpen(true)}
                                style={{
                                  alignSelf: 'flex-start',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <LogIn size={12} />
                                <span>{isBangla ? 'এখনই একাউন্ট কানেক্ট করুন' : 'Connect Account Now'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 6. NOTES / SCOPE TEXTAREA */}
                      <div>
                        <label style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontWeight: 600 }}>
                          <MessageSquare size={13} />
                          <span>{isBangla ? 'সংক্ষিপ্ত মেসেজ / নোট (Notes - Optional)' : 'Brief Message / Notes (Optional)'}</span>
                        </label>
                        <textarea
                          rows={2}
                          value={checkoutMessage}
                          onChange={(e) => setCheckoutMessage(e.target.value)}
                          placeholder={isBangla ? 'প্রজেক্ট সম্পর্কিত কোনো বিশেষ নির্দেশনা বা নোট লিখুন...' : 'Write any specific note or instructions...'}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                            border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                            color: isDark ? '#FFFFFF' : '#0F172A',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Unique Order Code Badge */}
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(0, 240, 255, 0.06)' : 'rgba(0, 105, 92, 0.05)',
                        border: '1px dashed rgba(0, 240, 255, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.76rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Tag size={13} color="#00F0FF" />
                          <span style={{ color: '#94A3B8' }}>{isBangla ? 'অর্ডার ট্র্যাকিং কোড:' : 'Order Code:'}</span>
                          <span style={{ color: '#00F0FF', fontWeight: 800, fontFamily: "'Space Grotesk', monospace" }}>
                            {orderCode || 'ORD-92841'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                          {isBangla ? 'স্বয়ংক্রিয় জেনারেটেড' : 'Auto-generated'}
                        </span>
                      </div>

                      {/* Form Error Banner */}
                      {checkoutError && (
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1.5px solid #EF4444',
                          color: '#F87171',
                          fontSize: '0.80rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <AlertCircle size={16} style={{ flexShrink: 0 }} />
                          <span>{checkoutError}</span>
                        </div>
                      )}

                      {/* 7. PROMINENT SUBMIT BUTTON */}
                      <div style={{ paddingTop: '8px', marginTop: '4px' }}>
                        <button
                          type="submit"
                          disabled={checkoutSubmitting}
                          style={{
                            width: '100%',
                            minHeight: '52px',
                            padding: '14px 24px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            boxShadow: '0 10px 25px -4px rgba(5, 150, 105, 0.45), 0 0 15px rgba(16, 185, 129, 0.25)',
                            border: '1.5px solid rgba(52, 211, 153, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: checkoutSubmitting ? 'wait' : 'pointer',
                            opacity: checkoutSubmitting ? 0.75 : 1,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          {checkoutSubmitting ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              <span>{isBangla ? 'অর্ডার সাবমিট হচ্ছে...' : 'Submitting Order...'}</span>
                            </span>
                          ) : (
                            <>
                              <Send size={18} color="#FFFFFF" />
                              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>
                                {isBangla ? 'অর্ডার সাবমিট (Submit Order)' : 'Submit Order'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Generous Safe Bottom Space below Submit Button */}
                      <div className="h-28 w-full shrink-0" style={{ height: 'max(7rem, env(safe-area-inset-bottom, 28px))', minHeight: '96px', pointerEvents: 'none' }} aria-hidden="true" />
                    </form>
                  )}
                </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

        {/* GUEST ORDER INTERCEPT MODAL: Fixed Centered Overlay Verification Modal (createPortal to document.body) */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isGuestInterceptOpen && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
                style={{ zIndex: 9999999 }}
                onClick={() => setIsGuestInterceptOpen(false)}
              >
                <div
                  className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto text-left"
                  style={{
                    boxShadow: '0 25px 65px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.25)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Ambient Glow Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
                    style={{
                      background: 'linear-gradient(90deg, #F59E0B 0%, #10B981 50%, #00F0FF 100%)'
                    }}
                  />

                  {/* 1. Modal Header: Icon + Title + Close Button (✕) */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
                          border: '1.5px solid rgba(245, 158, 11, 0.5)',
                          boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <AlertCircle size={22} />
                      </div>
                      <div>
                        <h3 className="m-0 text-lg font-black text-white">
                          No Account Connected
                        </h3>
                        <span className="text-xs font-bold text-amber-400">
                          {isBangla ? 'গেস্ট অর্ডার নিশ্চিতকরণ ও যোগাযোগ তথ্য' : 'Guest Checkout Contact Verification'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGuestInterceptOpen(false)}
                      className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                      title={isBangla ? 'বন্ধ করুন' : 'Close'}
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* 2. Instruction Message Box */}
                  <div
                    className="mt-4 p-3.5 rounded-2xl flex items-start gap-3"
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1.5px solid rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Info size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="m-0 text-xs sm:text-[13px] leading-relaxed font-semibold text-amber-200">
                      {isBangla
                        ? 'আপনার এই মুহুর্তে একাউন্ট নেই, অর্ডার সংক্রান্ত তথ্য ও যোগাযোগের জন্য অবশ্যই একটি ইমেইল ও হোয়াটসঅ্যাপ নাম্বার দিন।'
                        : 'আপনার এই মুহুর্তে একাউন্ট নেই, অর্ডার সংক্রান্ত তথ্য ও যোগাযোগের জন্য অবশ্যই একটি ইমেইল ও হোয়াটসঅ্যাপ নাম্বার দিন।'}
                    </p>
                  </div>

                  {/* 3. Form: Email & WhatsApp Fields */}
                  <form onSubmit={(e) => { if (e) { e.preventDefault(); e.stopPropagation(); } handleConfirmGuestIntercept(e); }} noValidate className="mt-4 flex flex-col gap-3.5 text-left">
                    {/* Mandatory Email Field */}
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={14} className="text-cyan-400" />
                          <span>{isBangla ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</span>
                          <span className="text-red-400">*</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {isBangla ? 'ইনভয়েস পাঠানো হবে' : 'For invoice'}
                        </span>
                      </label>
                      <input
                        type="email"
                        value={guestInterceptEmail}
                        onChange={(e) => {
                          setGuestInterceptEmail(e.target.value);
                          if (guestInterceptError) setGuestInterceptError(null);
                        }}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all box-border bg-slate-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    {/* Mandatory WhatsApp Number Field */}
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Smartphone size={14} className="text-emerald-400" />
                          <span>{isBangla ? 'হোয়াটসঅ্যাপ / মোবাইল নম্বর' : 'WhatsApp / Mobile Number'}</span>
                          <span className="text-red-400">*</span>
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          {isBangla ? 'প্রিফিক্স 01 সহ ১১ ডিজিট' : '11-digits starting with 01'}
                        </span>
                      </label>
                      <div className="relative flex items-center">
                        <span
                          className="absolute left-3 text-xs font-black text-emerald-400 pointer-events-none select-none font-mono"
                        >
                          BD +88
                        </span>
                        <input
                          type="tel"
                          value={guestInterceptPhone}
                          onChange={(e) => {
                            setGuestInterceptPhone(e.target.value);
                            if (guestInterceptError) setGuestInterceptError(null);
                          }}
                          placeholder="01XXXXXXXXX"
                          className="w-full py-2.5 pr-3.5 pl-20 rounded-xl text-sm font-bold tracking-wide outline-none transition-all box-border bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 font-mono"
                        />
                      </div>
                    </div>

                    {/* Error Feedback */}
                    {guestInterceptError && (
                      <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{guestInterceptError}</span>
                      </div>
                    )}

                    {/* Action Buttons: Confirm & Cancel */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsGuestInterceptOpen(false)}
                        className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer text-center"
                      >
                        {isBangla ? 'বাতিল' : 'Cancel'}
                      </button>

                      <button
                        type="submit"
                        disabled={checkoutSubmitting}
                        className="w-full sm:w-2/3 min-h-[46px] py-2.5 px-5 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all outline-none cursor-pointer border-none shadow-lg disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #047857 100%)',
                          border: '1.5px solid rgba(52, 211, 153, 0.5)',
                          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        {checkoutSubmitting ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{isBangla ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing...'}</span>
                          </span>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="text-white" />
                            <span>{isBangla ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* PREMIUM DIGITAL ORDER CONFIRMATION RECEIPT MODAL */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {orderConfirmationAlert && (
              <div
                className="fixed inset-0 z-[99999999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
                onClick={() => {
                  setOrderConfirmationAlert(null);
                  handleCloseCheckoutModal();
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                  id="digital-order-receipt-printable"
                  className="relative w-full max-w-lg bg-[#0F172A] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-left my-auto text-white overflow-hidden max-h-[92vh] flex flex-col"
                  style={{
                    boxShadow: '0 25px 65px rgba(0, 0, 0, 0.85), 0 0 35px rgba(16, 185, 129, 0.22)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Ambient Glow Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

                  {/* Print Stylesheet */}
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #digital-order-receipt-printable,
                      #digital-order-receipt-printable * {
                        visibility: visible !important;
                      }
                      #digital-order-receipt-printable {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 24px !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                        border: 1px solid #cbd5e1 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        z-index: 99999999 !important;
                      }
                      .print-hide {
                        display: none !important;
                      }
                      .print-text-dark {
                        color: #0f172a !important;
                      }
                      .print-border-light {
                        border-color: #e2e8f0 !important;
                        background: #f8fafc !important;
                      }
                    }
                  `}</style>

                  {/* Close (X) Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderConfirmationAlert(null);
                      handleCloseCheckoutModal();
                    }}
                    className="print-hide absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer z-10"
                    title={isBangla ? 'বন্ধ করুন' : 'Close'}
                  >
                    <X size={18} />
                  </button>

                  <div className="overflow-y-auto pr-1 space-y-4 text-left custom-scrollbar">
                    {/* 1. Success Animation Header */}
                    <div className="text-center pt-2 pb-1">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/30 mb-3 animate-pulse">
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight m-0">
                        {isBangla ? 'অর্ডার সফল হয়েছে!' : 'Order Confirmed!'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 mb-0">
                        {isBangla
                          ? 'আপনার ডিজিটাল ডিল বুকিং সফলভাবে গ্রহণ করা হয়েছে।'
                          : 'Your exclusive deal booking has been successfully recorded.'}
                      </p>
                    </div>

                    {/* 2. Order Code & Date Bar with 1-Click Copy */}
                    <div className="bg-slate-800/60 border border-cyan-500/30 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2.5 print-border-light">
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 print-text-dark">
                          <Tag size={12} className="text-cyan-400" />
                          <span>{isBangla ? 'অর্ডার কোড ও সময়:' : 'Order Code & Timestamp:'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-black font-mono text-cyan-300 tracking-wider print-text-dark">
                            {orderConfirmationAlert.orderCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 print-text-dark">
                          <Clock size={11} />
                          <span>{orderConfirmationAlert.orderDate}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (orderConfirmationAlert?.orderCode) {
                            navigator.clipboard.writeText(orderConfirmationAlert.orderCode);
                            setReceiptCopied(true);
                            setTimeout(() => setReceiptCopied(false), 2000);
                          }
                        }}
                        className="print-hide px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      >
                        {receiptCopied ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-300">{isBangla ? 'কপি হয়েছে!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>{isBangla ? 'কপি কোড' : 'Copy Code'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 3. Customer Summary Card */}
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 print-border-light">
                      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                        <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 print-text-dark">
                          <User size={13} className="text-emerald-400" />
                          <span>{isBangla ? 'গ্রাহকের তথ্য (Customer Summary)' : 'Customer Summary'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                          orderConfirmationAlert.isGuest 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {orderConfirmationAlert.isGuest 
                            ? (isBangla ? 'গেস্ট চেকআউট' : 'Guest Checkout') 
                            : (isBangla ? 'কানেক্টেড ইউজার' : 'Member Checkout')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-start gap-2 text-slate-300 print-text-dark">
                          <span className="text-slate-400 font-medium shrink-0 print-text-dark">{isBangla ? 'নাম:' : 'Name:'}</span>
                          <span className="font-bold text-white truncate print-text-dark">{orderConfirmationAlert.customerName || orderConfirmationAlert.clientName}</span>
                        </div>

                        <div className="flex items-start gap-2 text-slate-300 print-text-dark">
                          <Phone size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-slate-400 font-medium shrink-0 print-text-dark">{isBangla ? 'মোবাইল/হোয়াটসঅ্যাপ:' : 'Phone:'}</span>
                          <span className="font-mono font-bold text-emerald-300 truncate print-text-dark">{orderConfirmationAlert.phone}</span>
                        </div>

                        <div className="flex items-start gap-2 text-slate-300 sm:col-span-2 print-text-dark">
                          <MapPin size={13} className="text-red-400 shrink-0 mt-0.5" />
                          <span className="text-slate-400 font-medium shrink-0 print-text-dark">{isBangla ? 'ঠিকানা:' : 'Address:'}</span>
                          <span className="text-slate-200 line-clamp-2 print-text-dark">{orderConfirmationAlert.address}</span>
                        </div>

                        {orderConfirmationAlert.email && orderConfirmationAlert.email !== 'guest@noemail.com' && (
                          <div className="flex items-start gap-2 text-slate-300 sm:col-span-2 print-text-dark">
                            <Mail size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                            <span className="text-slate-400 font-medium shrink-0 print-text-dark">{isBangla ? 'ইমেইল:' : 'Email:'}</span>
                            <span className="text-slate-200 truncate print-text-dark">{orderConfirmationAlert.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 4. Item & Payment Details */}
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-3.5 space-y-2.5 print-border-light">
                      <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700/50 pb-2 print-text-dark">
                        <Package size={13} className="text-emerald-400" />
                        <span>{isBangla ? 'আইটেম ও পেমেন্ট বিবরণ' : 'Item & Payment Details'}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {orderConfirmationAlert.dealThumbnail && (
                          <img
                            src={orderConfirmationAlert.dealThumbnail}
                            alt={orderConfirmationAlert.dealTitle}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            onError={(e) => { e.currentTarget.src = '/add1.png'; }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-white line-clamp-1 m-0 print-text-dark">
                            {orderConfirmationAlert.dealTitle}
                          </h5>
                          <span className="text-[11px] text-slate-400 print-text-dark">
                            {isBangla ? 'সার্ভিস / প্রজেক্ট ডিল প্যাকেজ' : 'Service / Project Deal Package'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400 print-text-dark">
                          <span>{isBangla ? 'মূল প্যাকেজ রেট:' : 'Regular Package Rate:'}</span>
                          <span className="font-mono text-slate-300 print-text-dark">৳{orderConfirmationAlert.regularPrice || 5000} BDT</span>
                        </div>

                        {orderConfirmationAlert.discountAmount > 0 ? (
                          <div className="flex justify-between text-emerald-400 font-semibold">
                            <span>{isBangla ? 'ছাড় / কুপন স্ট্যাটাস:' : 'Discount / Coupon Benefit:'}</span>
                            <span className="font-mono">-৳{orderConfirmationAlert.discountAmount} BDT {orderConfirmationAlert.rate ? `(${orderConfirmationAlert.rate}% OFF)` : ''}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-slate-500 text-[11px] print-text-dark">
                            <span>{isBangla ? 'ছাড় / কুপন স্ট্যাটাস:' : 'Coupon / Discount:'}</span>
                            <span>{isBangla ? 'নিয়মিত মূল্য প্রযোজ্য' : 'Regular Price (No coupon)'}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/60">
                          <span className="font-bold text-white text-sm print-text-dark">
                            {isBangla ? 'সর্বমোট প্রদেয় মূল্য:' : 'Total Payable Amount:'}
                          </span>
                          <span className="font-mono font-black text-lg sm:text-xl text-emerald-400">
                            ৳{orderConfirmationAlert.finalPrice} BDT
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-slate-400 text-xs font-semibold print-text-dark">{isBangla ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>{isBangla ? 'পেন্ডিং (Pending)' : 'Pending'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Important Guidance Note */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed print-border-light">
                      <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-300 mb-0.5 font-bold print-text-dark">
                          {isBangla ? 'গুরুত্বপূর্ণ নির্দেশনা:' : 'Important Notice:'}
                        </strong>
                        <span className="print-text-dark">
                          {isBangla
                            ? 'আপনার অর্ডারটি পর্যালোচনার জন্য পেন্ডিং রয়েছে। অর্ডার ট্র্যাক করতে এই অর্ডার কোড অথবা আপনার প্রদত্ত ইমেইল/নম্বর ব্যবহার করুন।'
                            : 'Your order is currently pending review. Please use this Order Code or your provided phone/email to track order progress.'}
                        </span>
                      </div>
                    </div>

                    {/* 6. Action Buttons */}
                    <div className="print-hide pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                        >
                          <Printer size={14} className="text-cyan-400" />
                          <span>{isBangla ? 'রিসিট প্রিন্ট / PDF' : 'Print / Save Receipt'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const text = `Order Code: ${orderConfirmationAlert.orderCode}\nDeal: ${orderConfirmationAlert.dealTitle}\nCustomer: ${orderConfirmationAlert.customerName || orderConfirmationAlert.clientName}\nPhone: ${orderConfirmationAlert.phone}\nTotal: ৳${orderConfirmationAlert.finalPrice} BDT\nStatus: Pending`;
                            navigator.clipboard.writeText(text);
                            setReceiptCopied(true);
                            setTimeout(() => setReceiptCopied(false), 2000);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                        >
                          <Copy size={14} className="text-emerald-400" />
                          <span>{receiptCopied ? (isBangla ? 'কপি হয়েছে!' : 'Copied!') : (isBangla ? 'কপি ট্র্যাকিং তথ্য' : 'Copy Tracking Info')}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setOrderConfirmationAlert(null);
                          handleCloseCheckoutModal();
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400/40 active:scale-98"
                      >
                        <CheckCircle2 size={16} />
                        <span>{isBangla ? 'সম্পন্ন / বন্ধ করুন' : 'Done / Close'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* USER ORDER TRACKING MODAL (Real-time FirestoreStreamBuilder, Decoupled to document.body) */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isTrackModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] h-screen h-[100dvh] w-full bg-white dark:bg-[#0b101b] flex flex-col pointer-events-auto"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100vh',
                  height: '100dvh',
                  zIndex: 999999,
                  pointerEvents: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: isDark ? '#0b101b' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#0F172A'
                }}
              >
                {/* Pinned Sticky Header Group: Title Bar + Search Bar & Filters */}
                <div 
                  className="flex-shrink-0 bg-inherit border-b border-gray-100 dark:border-gray-800 p-4 space-y-3 sticky top-0 z-30 flex flex-col"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    background: isDark ? '#0b101b' : '#FFFFFF',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    padding: '16px'
                  }}
                >
                  {/* Modal Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif"
                      }}>
                        {isBangla ? 'Shipment & Order History (শিপমেন্ট ও অর্ডার হিস্ট্রি)' : 'Shipment & Order History'}
                      </h3>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        {isBangla ? 'রিয়েলটাইম ডেলিভারি ট্র্যাকিং ও অর্ডার হিস্ট্রি' : 'Real-time delivery tracking & order records'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      if (e) {
                        if (typeof e.preventDefault === 'function') e.preventDefault();
                        if (typeof e.stopPropagation === 'function') e.stopPropagation();
                      }
                      setIsTrackModalOpen(false);
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'}`,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    title={isBangla ? 'বন্ধ করুন' : 'Close'}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Top Search Bar & Compact Filter Icon */}
                <div style={{
                  padding: '12px 24px',
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                  background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        value={trackingSearchTerm}
                        onChange={(e) => setTrackingSearchTerm(e.target.value)}
                        placeholder="Search Tracking ID / Order Code..."
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          borderRadius: '9999px',
                          background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                          border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      {trackingSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setTrackingSearchTerm('')}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Compact Filter Button */}
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isFilterDropdownOpen || trackingStatusFilter !== 'all'
                          ? 'linear-gradient(135deg, #0284C7 0%, #00F0FF 100%)'
                          : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF'),
                        border: `1.5px solid ${isFilterDropdownOpen || trackingStatusFilter !== 'all' ? '#00F0FF' : (isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1')}`,
                        color: isFilterDropdownOpen || trackingStatusFilter !== 'all' ? '#020617' : (isDark ? '#F1F5F9' : '#475569'),
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: isFilterDropdownOpen || trackingStatusFilter !== 'all' ? '0 2px 10px rgba(0, 240, 255, 0.3)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                      title={isBangla ? 'ফিল্টার অপশন' : 'Filter Options'}
                    >
                      <SlidersHorizontal size={18} />
                    </button>
                  </div>

                  {/* Filter Chips / Dropdown Row */}
                  {isFilterDropdownOpen && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      paddingTop: '2px'
                    }}>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700 }}>
                        {isBangla ? 'ফিল্টার:' : 'Filter:'}
                      </span>
                      {[
                        { id: 'all', label: isBangla ? 'সকল (All)' : 'All' },
                        { id: 'pending', label: isBangla ? 'পেন্ডিং / ইন ট্রানজিট' : 'Pending / In Transit' },
                        { id: 'confirmed', label: isBangla ? 'কনফার্মড / ডেলিভার্ড' : 'Confirmed / Delivered' },
                        { id: 'cancelled', label: isBangla ? 'বাতিল' : 'Cancelled' }
                      ].map((tab) => {
                        const isActive = trackingStatusFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setTrackingStatusFilter(tab.id)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              background: isActive
                                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                                : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0'),
                              color: isActive ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                              border: isActive ? '1px solid #10B981' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Content Body */}
              <div 
                className="flex-1 w-full overflow-y-auto px-4 py-3 space-y-4 -webkit-overflow-scrolling-touch"
                style={{
                  flex: 1,
                  width: '100%',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  paddingBottom: 'max(6rem, calc(80px + env(safe-area-inset-bottom, 24px)))'
                }}
              >
                  {/* GUEST ORDER HISTORY FINDER OR AUTHENTICATION GATE */}
                  {isGuestSearchOpen ? (
                    /* GUEST ORDER HISTORY FINDER VIEW (Category-based Phone & Email search) */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Sub-Header Return Bar */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsGuestSearchOpen(false);
                            setGuestSearchSubmittedQuery(null);
                            setGuestSearchInputError(null);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                            border: 'none',
                            color: isDark ? '#CBD5E1' : '#475569',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <ArrowLeft size={15} />
                          <span>{isBangla ? 'ফিরে যান' : 'Back'}</span>
                        </button>

                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#00F0FF',
                          background: 'rgba(0, 240, 255, 0.1)',
                          padding: '3px 12px',
                          borderRadius: '20px',
                          border: '1px solid rgba(0, 240, 255, 0.3)'
                        }}>
                          {isBangla ? 'গেস্ট হিস্ট্রি সার্চ' : 'Guest History Finder'}
                        </span>
                      </div>

                      {/* Search Control Box with 2 Category Tabs */}
                      <div style={{
                        padding: '16px',
                        borderRadius: '18px',
                        background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#F8FAFC',
                        border: `1.5px solid ${isDark ? 'rgba(0, 240, 255, 0.25)' : 'rgba(8, 145, 178, 0.25)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}>
                        {/* 2 Category Tabs */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          background: isDark ? 'rgba(2, 6, 23, 0.6)' : '#E2E8F0',
                          padding: '4px',
                          borderRadius: '14px'
                        }}>
                          {/* Category 1: WhatsApp / Mobile Number */}
                          <button
                            type="button"
                            onClick={() => {
                              setGuestSearchCategory('phone');
                              if (!guestSearchInput || guestSearchInput.includes('@') || !guestSearchInput.startsWith('01')) {
                                setGuestSearchInput('01');
                              }
                              setGuestSearchInputError(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: guestSearchCategory === 'phone'
                                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                                : 'transparent',
                              color: guestSearchCategory === 'phone' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: guestSearchCategory === 'phone' ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
                            }}
                          >
                            <Smartphone size={16} />
                            <span>{isBangla ? '১. হোয়াটসঅ্যাপ / মোবাইল' : '1. WhatsApp / Mobile'}</span>
                          </button>

                          {/* Category 2: Email Address */}
                          <button
                            type="button"
                            onClick={() => {
                              setGuestSearchCategory('email');
                              if (guestSearchInput === '01') {
                                setGuestSearchInput('');
                              }
                              setGuestSearchInputError(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: guestSearchCategory === 'email'
                                ? 'linear-gradient(135deg, #0891B2 0%, #00F0FF 100%)'
                                : 'transparent',
                              color: guestSearchCategory === 'email' ? (isDark ? '#020617' : '#FFFFFF') : (isDark ? '#94A3B8' : '#64748B'),
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: guestSearchCategory === 'email' ? '0 4px 12px rgba(0, 240, 255, 0.35)' : 'none'
                            }}
                          >
                            <Mail size={16} />
                            <span>{isBangla ? '২. ইমেইল অ্যাড্রেস' : '2. Email Address'}</span>
                          </button>
                        </div>

                        {/* Search Input Box with Default Prefills & Helpers */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                              {guestSearchCategory === 'phone' ? (
                                <>
                                  <span style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                    color: '#10B981',
                                    fontFamily: "'Space Grotesk', monospace",
                                    pointerEvents: 'none'
                                  }}>
                                    BD +88
                                  </span>
                                  <input
                                    type="tel"
                                    value={guestSearchInput}
                                    onChange={(e) => {
                                      setGuestSearchInput(e.target.value);
                                      if (guestSearchInputError) setGuestSearchInputError(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteGuestSearch()}
                                    placeholder="01XXXXXXXXX"
                                    style={{
                                      width: '100%',
                                      padding: '12px 14px 12px 76px',
                                      borderRadius: '12px',
                                      background: isDark ? 'rgba(2, 6, 23, 0.7)' : '#FFFFFF',
                                      border: `1.5px solid ${guestSearchInputError ? 'rgba(239, 68, 68, 0.5)' : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)')}`,
                                      color: isDark ? '#FFFFFF' : '#0F172A',
                                      fontSize: '0.92rem',
                                      fontWeight: 700,
                                      outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </>
                              ) : (
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type="email"
                                    value={guestSearchInput}
                                    onChange={(e) => {
                                      setGuestSearchInput(e.target.value);
                                      if (guestSearchInputError) setGuestSearchInputError(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteGuestSearch()}
                                    placeholder="example@gmail.com"
                                    style={{
                                      width: '100%',
                                      padding: '12px 64px 12px 14px',
                                      borderRadius: '12px',
                                      background: isDark ? 'rgba(2, 6, 23, 0.7)' : '#FFFFFF',
                                      border: `1.5px solid ${guestSearchInputError ? 'rgba(239, 68, 68, 0.5)' : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)')}`,
                                      color: isDark ? '#FFFFFF' : '#0F172A',
                                      fontSize: '0.92rem',
                                      fontWeight: 600,
                                      outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                  {/* Suffix Helper: .com button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!guestSearchInput.endsWith('.com')) {
                                        setGuestSearchInput((prev) => (prev ? prev.replace(/\.com.*$/, '') + '.com' : ''));
                                      }
                                    }}
                                    style={{
                                      position: 'absolute',
                                      right: '8px',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      background: isDark ? 'rgba(0, 240, 255, 0.15)' : 'rgba(8, 145, 178, 0.12)',
                                      border: '1px solid rgba(0, 240, 255, 0.35)',
                                      color: isDark ? '#00F0FF' : '#0891B2',
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                    title={isBangla ? '.com যোগ করুন' : 'Append .com'}
                                  >
                                    .com
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={handleExecuteGuestSearch}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 22px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                              }}
                            >
                              <Search size={16} />
                              <span>{isBangla ? 'অর্ডার খুঁজুন' : 'Search Orders'}</span>
                            </button>
                          </div>

                          {guestSearchInputError && (
                            <div style={{
                              fontSize: '0.78rem',
                              color: '#F87171',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '2px'
                            }}>
                              <AlertCircle size={14} />
                              <span>{guestSearchInputError}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Real-time Order Stream Builder for Guest Search Results */}
                      <FirestoreStreamBuilder collectionName="deal_orders" orderByField="createdAt" orderDirection="desc">
                        {({ data, loading }) => {
                          if (loading) {
                            return (
                              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94A3B8', fontSize: '0.84rem' }}>
                                {isBangla ? 'অর্ডার ডাটা লোড হচ্ছে...' : 'Loading order stream...'}
                              </div>
                            );
                          }

                          if (!guestSearchSubmittedQuery) {
                            return (
                              <div style={{
                                textAlign: 'center',
                                padding: '36px 20px',
                                borderRadius: '18px',
                                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                              }}>
                                <Search size={34} color="#00F0FF" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                                <h5 style={{ margin: '0 0 4px 0', color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '0.94rem', fontWeight: 800 }}>
                                  {isBangla ? 'ফোন বা ইমেইল দিয়ে সার্চ করুন' : 'Search by Phone or Email'}
                                </h5>
                                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.80rem' }}>
                                  {isBangla ? 'উপরে আপনার অর্ডার করার সময় ব্যবহৃত নাম্বার বা ইমেইল দিয়ে সার্চ বাটনে চাপুন।' : 'Enter the phone or email used during order placement and click search.'}
                                </p>
                              </div>
                            );
                          }

                          const allOrders = data || [];
                          const matchedOrders = allOrders.filter((order) => {
                            if (guestSearchSubmittedQuery.category === 'phone') {
                              const targetPhone = normalizePhone(guestSearchSubmittedQuery.query);
                              const orderPhone = normalizePhone(order.clientPhone || order.phone || order.whatsapp || '');
                              return targetPhone && orderPhone && (orderPhone === targetPhone || orderPhone.includes(targetPhone) || targetPhone.includes(orderPhone));
                            } else {
                              const targetEmail = (guestSearchSubmittedQuery.query || '').trim().toLowerCase();
                              const orderEmail = (order.clientEmail || order.email || '').trim().toLowerCase();
                              return targetEmail && orderEmail === targetEmail;
                            }
                          });

                          if (matchedOrders.length === 0) {
                            return (
                              <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                borderRadius: '18px',
                                background: isDark ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.03)',
                                border: `1px dashed ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                              }}>
                                <AlertCircle size={36} color="#EF4444" style={{ margin: '0 auto 10px auto' }} />
                                <h4 style={{ margin: '0 0 6px 0', color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '1rem', fontWeight: 800 }}>
                                  {isBangla ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No Orders Found'}
                                </h4>
                                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.82rem', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                                  {isBangla 
                                    ? 'আপনার দেওয়া তথ্যের সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক ফোন নাম্বার বা ইমেইল চেক করুন।' 
                                    : 'No orders matched your search criteria. Please check if your phone or email was entered correctly.'}
                                </p>
                              </div>
                            );
                          }

                          const filteredGuestOrders = filterOrders(matchedOrders);

                          if (filteredGuestOrders.length === 0) {
                            return (
                              <div style={{
                                textAlign: 'center',
                                padding: '36px 20px',
                                borderRadius: '18px',
                                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                              }}>
                                <Search size={32} color="#94A3B8" style={{ margin: '0 auto 10px auto' }} />
                                <h4 style={{ margin: '0 0 6px 0', color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '0.96rem', fontWeight: 800 }}>
                                  {isBangla ? 'ফিল্টারে কোনো অর্ডার পাওয়া যায়নি' : 'No Orders Match Your Filter'}
                                </h4>
                                <p style={{ margin: '0 0 12px 0', color: '#94A3B8', fontSize: '0.80rem' }}>
                                  {isBangla ? 'অন্য কোনো ট্র্যাকিং আইডি বা ফিল্টার নির্বাচন করুন।' : 'Try clearing your search query or selecting a different status filter.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTrackingSearchTerm('');
                                    setTrackingStatusFilter('all');
                                  }}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                                    border: 'none',
                                    color: isDark ? '#FFFFFF' : '#0F172A',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isBangla ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.78rem',
                                color: '#10B981',
                                fontWeight: 700
                              }}>
                                <span>
                                  {isBangla ? `মোট ${filteredGuestOrders.length}টি অর্ডার পাওয়া গেছে` : `Found ${filteredGuestOrders.length} matching shipment(s)`}
                                </span>
                                <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                                  {isBangla ? 'কুয়েরি: ' : 'Query: '}
                                  <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{guestSearchSubmittedQuery.query}</strong>
                                </span>
                              </div>

                              {filteredGuestOrders.map((order) => renderDeliveryTrackingCard(order))}
                              <div className="h-28 w-full shrink-0" style={{ height: 'max(7rem, env(safe-area-inset-bottom, 28px))', minHeight: '96px', pointerEvents: 'none' }} aria-hidden="true" />
                            </div>
                          );
                        }}
                      </FirestoreStreamBuilder>
                    </div>
                  ) : !currentUser ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '48px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      gap: '18px'
                    }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                        border: '2px solid rgba(239, 68, 68, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#EF4444',
                        boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)'
                      }}>
                        <Lock size={32} />
                      </div>

                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '1.2rem',
                          fontWeight: 900,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}>
                          {isBangla ? 'অ্যাকাউন্ট কানেকশন আবশ্যক' : 'Account Connection Required'}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '0.92rem',
                          lineHeight: 1.6,
                          color: isDark ? '#CBD5E1' : '#475569',
                          maxWidth: '420px',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}>
                          {isBangla ? 'আপনার অর্ডার হিস্ট্রি দেখতে অনুগ্রহ করে অ্যাকাউন্ট কানেক্ট করুন।' : 'Please connect your account to view your order history.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsTrackModalOpen(false);
                          setIsConnectModalOpen(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 28px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <LogIn size={16} />
                        <span>{isBangla ? 'অ্যাকাউন্ট কানেক্ট / লগইন করুন' : 'Connect Account / Sign-In'}</span>
                      </button>

                      {/* Secondary Action Button: Guest Order History Search */}
                      <div style={{
                        marginTop: '6px',
                        paddingTop: '16px',
                        borderTop: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                        width: '100%',
                        maxWidth: '380px',
                        textAlign: 'center'
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsGuestSearchOpen(true);
                            setGuestSearchCategory('phone');
                            setGuestSearchInput('01');
                            setGuestSearchSubmittedQuery(null);
                            setGuestSearchInputError(null);
                          }}
                          style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            borderRadius: '14px',
                            background: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(8, 145, 178, 0.08)',
                            border: '1.5px solid rgba(0, 240, 255, 0.4)',
                            color: isDark ? '#00F0FF' : '#0891B2',
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(0, 240, 255, 0.15)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Search size={16} />
                          <span>👉 {isBangla ? 'একাউন্ট ছাড়া নাম্বার বা ইমেইল দিয়ে হিস্ট্রি দেখুন' : 'Search History with Phone or Email'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Active Connected User Header Bar */}
                      <div style={{
                        padding: '12px 18px',
                        borderRadius: '14px',
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={16} color="#10B981" />
                          <span style={{ fontSize: '0.84rem', color: isDark ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>
                            {currentUser.email}
                          </span>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.74rem',
                          color: '#10B981',
                          fontWeight: 700
                        }}>
                          <CheckCircle2 size={13} />
                          <span>{isBangla ? 'ভেরিফাইড অ্যাকাউন্ট' : 'Connected Account'}</span>
                        </div>
                      </div>

                      {/* Real-time FirestoreStreamBuilder for deal_orders (Filtered by user) */}
                      <FirestoreStreamBuilder collectionName="deal_orders" orderByField="createdAt" orderDirection="desc">
                        {({ data, loading }) => {
                          if (loading) {
                            return (
                              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94A3B8', fontSize: '0.84rem' }}>
                                {isBangla ? 'অর্ডার লোড হচ্ছে...' : 'Loading orders...'}
                              </div>
                            );
                          }

                          const allOrders = data || [];
                          const targetEmail = currentUser.email.trim().toLowerCase();
                          const myOrders = allOrders.filter(o => (o.clientEmail || o.email || '').toLowerCase() === targetEmail);

                          if (myOrders.length === 0) {
                            return (
                              <div style={{
                                textAlign: 'center',
                                padding: '44px 20px',
                                borderRadius: '18px',
                                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                              }}>
                                <Clock size={38} color="#64748B" style={{ margin: '0 auto 12px auto' }} />
                                <h4 style={{ margin: '0 0 6px 0', color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '1rem', fontWeight: 800 }}>
                                  {isBangla ? 'কোনো অর্ডার রেকর্ড পাওয়া যায়নি' : 'No Order Records Found'}
                                </h4>
                                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.82rem' }}>
                                  {isBangla ? 'ডিল ক্লেইম করার পর আপনার অর্ডার এখানে রিয়েলটাইমে প্রদর্শিত হবে।' : 'Once you claim a deal, your orders will appear here live.'}
                                </p>
                                <div style={{ marginTop: '16px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsGuestSearchOpen(true);
                                      setGuestSearchCategory('phone');
                                      setGuestSearchInput('01');
                                      setGuestSearchSubmittedQuery(null);
                                      setGuestSearchInputError(null);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '9px 18px',
                                      borderRadius: '12px',
                                      background: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(8, 145, 178, 0.08)',
                                      border: '1.2px solid rgba(0, 240, 255, 0.35)',
                                      color: isDark ? '#00F0FF' : '#0891B2',
                                      fontSize: '0.82rem',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Search size={14} />
                                    <span>👉 {isBangla ? 'একাউন্ট ছাড়া নাম্বার বা ইমেইল দিয়ে হিস্ট্রি দেখুন' : 'Search History with Phone or Email'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          const filteredOrders = filterOrders(myOrders);

                          if (filteredOrders.length === 0) {
                            return (
                              <div style={{
                                textAlign: 'center',
                                padding: '36px 20px',
                                borderRadius: '18px',
                                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                border: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                              }}>
                                <Search size={32} color="#94A3B8" style={{ margin: '0 auto 10px auto' }} />
                                <h4 style={{ margin: '0 0 6px 0', color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '0.96rem', fontWeight: 800 }}>
                                  {isBangla ? 'ফিল্টারে কোনো অর্ডার পাওয়া যায়নি' : 'No Orders Match Your Filter'}
                                </h4>
                                <p style={{ margin: '0 0 12px 0', color: '#94A3B8', fontSize: '0.80rem' }}>
                                  {isBangla ? 'অন্য কোনো ট্র্যাকিং আইডি বা ফিল্টার নির্বাচন করুন।' : 'Try clearing your search query or selecting a different status filter.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTrackingSearchTerm('');
                                    setTrackingStatusFilter('all');
                                  }}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                                    border: 'none',
                                    color: isDark ? '#FFFFFF' : '#0F172A',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isBangla ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.78rem',
                                color: '#10B981',
                                fontWeight: 700
                              }}>
                                <span>
                                  {isBangla ? `মোট ${filteredOrders.length}টি অর্ডার পাওয়া গেছে` : `Showing ${filteredOrders.length} shipment(s)`}
                                </span>
                                {trackingSearchTerm && (
                                  <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                                    {isBangla ? 'সার্চ: ' : 'Search: '}
                                    <strong style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>{trackingSearchTerm}</strong>
                                  </span>
                                )}
                              </div>

                              {filteredOrders.map((order) => renderDeliveryTrackingCard(order))}

                              <div className="h-28 w-full shrink-0" style={{ height: 'max(7rem, env(safe-area-inset-bottom, 28px))', minHeight: '96px', pointerEvents: 'none' }} aria-hidden="true" />

                              {/* Option for connected users to also search unauthenticated guest orders */}
                              <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '14px', borderTop: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}` }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsGuestSearchOpen(true);
                                    setGuestSearchCategory('phone');
                                    setGuestSearchInput('01');
                                    setGuestSearchSubmittedQuery(null);
                                    setGuestSearchInputError(null);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '9px 18px',
                                    borderRadius: '12px',
                                    background: isDark ? 'rgba(0, 240, 255, 0.06)' : 'rgba(8, 145, 178, 0.06)',
                                    border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(8, 145, 178, 0.3)'}`,
                                    color: isDark ? '#00F0FF' : '#0891B2',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Search size={14} />
                                  <span>👉 {isBangla ? 'একাউন্ট ছাড়া নাম্বার বা ইমেইল দিয়ে হিস্ট্রি দেখুন' : 'Search History with Phone or Email'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        }}
                      </FirestoreStreamBuilder>
                    </>
                  )}
                </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

        {/* INTERACTIVE SHIPMENT & DELIVERY TIMELINE MODAL (Decoupled to document.body) */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {selectedShipmentDetail && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] h-screen h-[100dvh] w-full bg-slate-50 dark:bg-[#0b101b] flex flex-col overflow-hidden animate-in fade-in duration-200 pointer-events-auto"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100vh',
                  height: '100dvh',
                  zIndex: 999999,
                  pointerEvents: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: isDark ? '#0b101b' : '#F8FAFC',
                  color: isDark ? '#FFFFFF' : '#0F172A'
                }}
              >
                {/* 1. Header (Sticky Navbar) */}
                <div 
                  className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur sticky top-0 z-30"
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    background: isDark ? 'rgba(11, 16, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <Truck size={20} />
                    </div>
                    <div>
                      <span 
                        className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: isDark ? '#34D399' : '#059669',
                          display: 'block',
                          marginBottom: '2px'
                        }}
                      >
                        {isBangla ? 'লাইভ শিপমেন্ট ট্র্যাকিং' : 'Live Shipment Tracking'}
                      </span>
                      <h3 
                        className="text-lg font-bold text-gray-900 dark:text-white font-mono"
                        style={{
                          margin: 0,
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          fontFamily: "'Space Grotesk', monospace",
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          lineHeight: 1.2
                        }}
                      >
                        #{selectedShipmentDetail.orderCode || selectedShipmentDetail.orderId}
                      </h3>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setSelectedShipmentDetail(null)} 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isDark ? '#CBD5E1' : '#475569',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    title={isBangla ? 'বন্ধ করুন' : 'Close'}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Scrollable Body */}
                <div 
                  className="flex-1 w-full overflow-y-auto px-4 py-4 space-y-4 -webkit-overflow-scrolling-touch"
                  style={{
                    flex: 1,
                    width: '100%',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    padding: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div 
                    style={{
                      maxWidth: '720px',
                      width: '100%',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingBottom: '20px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Section 1: Order Status Banner */}
                    {(() => {
                      const status = (selectedShipmentDetail.status || 'pending').toLowerCase();
                      const isDelivered = status === 'confirmed' || status === 'accepted' || status === 'delivered';
                      const isCancelled = status === 'cancelled';

                      if (isCancelled) {
                        return (
                          <div 
                            className="rounded-2xl p-4 sm:p-5 border border-red-500/30 bg-red-500/10"
                            style={{
                              borderRadius: '16px',
                              padding: '18px 20px',
                              background: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                              border: '1.5px solid rgba(239, 68, 68, 0.35)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '14px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div 
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: '#EF4444',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                              }}
                            >
                              <AlertTriangle size={22} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <span 
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    padding: '3px 9px',
                                    borderRadius: '20px',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.35)'
                                  }}
                                >
                                  {isBangla ? 'অর্ডার বাতিল' : 'Order Cancelled'}
                                </span>
                                <span style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontFamily: 'monospace' }}>
                                  {selectedShipmentDetail.orderDate || selectedShipmentDetail.createdAt || 'N/A'}
                                </span>
                              </div>
                              <h4 style={{ margin: '4px 0 2px 0', fontSize: '1rem', fontWeight: 800, color: isDark ? '#FCA5A5' : '#B91C1C' }}>
                                {isBangla ? 'অর্ডার বাতিল করা হয়েছে' : 'Order Cancelled'}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.84rem', color: isDark ? '#F87171' : '#DC2626', lineHeight: 1.5 }}>
                                {isBangla ? 'এই অর্ডারটি অনুরোধক্রমে বা নীতিগত কারণে বাতিল অথবা স্থগিত করা হয়েছে।' : 'This order has been cancelled or terminated.'}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      if (isDelivered) {
                        return (
                          <div 
                            className="rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-emerald-500/10"
                            style={{
                              borderRadius: '16px',
                              padding: '18px 20px',
                              background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                              border: '1.5px solid rgba(16, 185, 129, 0.35)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '14px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div 
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: '#10B981',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                              }}
                            >
                              <CheckCircle2 size={22} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <span 
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    padding: '3px 9px',
                                    borderRadius: '20px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10B981',
                                    border: '1px solid rgba(16, 185, 129, 0.35)'
                                  }}
                                >
                                  {isBangla ? 'ডেলিভারি সম্পন্ন' : 'Delivered & Confirmed'}
                                </span>
                                <span style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontFamily: 'monospace' }}>
                                  {selectedShipmentDetail.orderDate || selectedShipmentDetail.createdAt || 'N/A'}
                                </span>
                              </div>
                              <h4 style={{ margin: '4px 0 2px 0', fontSize: '1rem', fontWeight: 800, color: isDark ? '#6EE7B7' : '#047857' }}>
                                {isBangla ? 'অর্ডার সফলভাবে ডেলিভার্ড' : 'Order Delivered & Verified'}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.84rem', color: isDark ? '#A7F3D0' : '#065F46', lineHeight: 1.5 }}>
                                {isBangla ? 'অর্ডারটি চূড়ান্তভাবে ডেলিভার ও ক্লায়েন্টের নিকট সফলভাবে হ্যান্ডওভার সম্পন্ন হয়েছে।' : 'The order has been finalized and delivered successfully to client.'}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Pending / In Transit
                      return (
                        <div 
                          className="rounded-2xl p-4 sm:p-5 border border-amber-500/30 bg-amber-500/10"
                          style={{
                            borderRadius: '16px',
                            padding: '18px 20px',
                            background: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
                            border: '1.5px solid rgba(245, 158, 11, 0.35)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '14px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div 
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              background: '#F59E0B',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                            }}
                          >
                            <Clock size={22} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span 
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  padding: '3px 9px',
                                  borderRadius: '20px',
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  color: '#D97706',
                                  border: '1px solid rgba(245, 158, 11, 0.35)'
                                }}
                              >
                                {status.toUpperCase()}
                              </span>
                              <span style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontFamily: 'monospace' }}>
                                {selectedShipmentDetail.orderDate || selectedShipmentDetail.createdAt || 'Active'}
                              </span>
                            </div>
                            <h4 style={{ margin: '4px 0 2px 0', fontSize: '1rem', fontWeight: 800, color: isDark ? '#FCD34D' : '#B45309' }}>
                              {isBangla ? 'প্রসেসিং ও শিপমেন্ট চলমান' : 'Processing & In Transit'}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: isDark ? '#FDE68A' : '#92400E', lineHeight: 1.5 }}>
                              {isBangla ? 'আপনার সার্ভিস প্যাকেজ দ্রুত তৈরি ও প্রসেস করা হচ্ছে।' : 'Your service package is being actively prepared and processed.'}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Section 2: Delivery Lifecycle Stepper (Vertical Clean Timeline) */}
                    {(() => {
                      const status = (selectedShipmentDetail.status || 'pending').toLowerCase();
                      const isDelivered = status === 'confirmed' || status === 'accepted' || status === 'delivered';
                      const isCancelled = status === 'cancelled';

                      const steps = [
                        {
                          id: 1,
                          title: isBangla ? '১. অর্ডার গ্রহণ (Order Placed)' : '1. Order Placed',
                          desc: isBangla ? 'সিস্টেমে অর্ডার সফলভাবে সংরক্ষিত ও ডাটাবেসে এন্ট্রি হয়েছে।' : 'Order successfully placed and logged in database.',
                          time: selectedShipmentDetail.orderDate || 'Verified',
                          state: 'completed'
                        },
                        {
                          id: 2,
                          title: isBangla ? '২. তথ্য যাচাই ও সিকিউরিটি চেক' : '2. Validation & Security Check',
                          desc: isBangla ? 'একক ডিসকাউন্ট ভাউচার ও ক্লায়েন্ট তথ্য সফলভাবে যাচাইকৃত।' : 'Single-discount policy and customer details verified.',
                          time: isBangla ? 'যাচাইকৃত' : 'Verified',
                          state: isCancelled ? 'cancelled' : 'completed'
                        },
                        {
                          id: 3,
                          title: isBangla ? '৩. প্রজেক্ট প্রসেসিং ও ট্রানজিট' : '3. Project Processing & Transit',
                          desc: isCancelled 
                            ? (isBangla ? 'অর্ডার স্থগিত বা বাতিল হওয়ার কারণে প্রসেসিং বন্ধ রয়েছে।' : 'Processing terminated due to order cancellation.')
                            : (isDelivered ? (isBangla ? 'প্রজেক্ট ডেভেলপমেন্ট ও আর্কিটেকচার সম্পন্ন।' : 'Project development and architecture finished.') : (isBangla ? 'কাস্টম প্যাকেজ প্রস্তুতকরণ ও কোডিং দ্রুত চলমান।' : 'Active development, design packaging & processing.')),
                          time: isDelivered ? (isBangla ? 'সম্পন্ন' : 'Completed') : (isCancelled ? (isBangla ? 'বাতিল' : 'Cancelled') : (isBangla ? 'চলমান' : 'In Progress')),
                          state: isCancelled ? 'cancelled' : (isDelivered ? 'completed' : 'active')
                        },
                        {
                          id: 4,
                          title: isBangla ? '৪. চূড়ান্ত ডেলিভারি (Final Delivery)' : '4. Final Delivery & Handover',
                          desc: isDelivered 
                            ? (isBangla ? 'লাইভ সোর্স কোড ও অ্যাক্সেস সফলভাবে ক্লায়েন্টকে অর্পণ করা হয়েছে।' : 'Production package & deliverables handed over successfully.')
                            : (isCancelled ? (isBangla ? 'অর্ডার বাতিল থাকায় ডেলিভারি কার্যকর নয়।' : 'Delivery void due to order cancellation.') : (isBangla ? 'চূড়ান্ত রিভিউ ও হ্যান্ডওভারের অপেক্ষায়।' : 'Awaiting final delivery signoff.')),
                          time: isDelivered ? (isBangla ? 'ডেলিভার্ড' : 'Delivered') : (isBangla ? 'অপেক্ষমান' : 'Pending'),
                          state: isDelivered ? 'completed' : (isCancelled ? 'cancelled' : 'pending')
                        }
                      ];

                      return (
                        <div 
                          style={{
                            borderRadius: '18px',
                            padding: '20px',
                            background: isDark ? '#0F172A' : '#FFFFFF',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                            boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 12px rgba(0, 0, 0, 0.04)',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10B981' }}>
                              {isBangla ? 'ডেলিভারি লাইফসাইকেল টাইমলাইন' : 'Delivery Progress Lifecycle'}
                            </span>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isDark ? '#94A3B8' : '#64748B' }}>
                              4-Stage Pipeline
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {steps.map((st, idx) => {
                              const isLast = idx === steps.length - 1;

                              let nodeBg = '#64748B';
                              let nodeBorder = '#64748B';
                              let nodeGlow = 'transparent';
                              let nodeIcon = <span style={{ fontSize: '12px', fontWeight: 800 }}>{st.id}</span>;
                              let lineBg = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
                              let tagBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
                              let tagColor = isDark ? '#94A3B8' : '#64748B';

                              if (st.state === 'completed') {
                                nodeBg = '#10B981';
                                nodeBorder = '#10B981';
                                nodeGlow = 'rgba(16, 185, 129, 0.4)';
                                nodeIcon = <Check size={16} strokeWidth={3} color="#FFFFFF" />;
                                lineBg = '#10B981';
                                tagBg = 'rgba(16, 185, 129, 0.12)';
                                tagColor = '#10B981';
                              } else if (st.state === 'active') {
                                nodeBg = '#F59E0B';
                                nodeBorder = '#F59E0B';
                                nodeGlow = 'rgba(245, 158, 11, 0.4)';
                                nodeIcon = <Clock size={16} strokeWidth={2.5} color="#FFFFFF" />;
                                tagBg = 'rgba(245, 158, 11, 0.15)';
                                tagColor = '#F59E0B';
                              } else if (st.state === 'cancelled') {
                                nodeBg = '#EF4444';
                                nodeBorder = '#EF4444';
                                nodeGlow = 'rgba(239, 68, 68, 0.4)';
                                nodeIcon = <X size={16} strokeWidth={3} color="#FFFFFF" />;
                                lineBg = '#EF4444';
                                tagBg = 'rgba(239, 68, 68, 0.12)';
                                tagColor = '#EF4444';
                              }

                              return (
                                <div key={st.id} style={{ display: 'flex', alignItems: 'stretch', gap: '14px', position: 'relative' }}>
                                  {/* Left node and connecting line */}
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                                    <div 
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: nodeBg,
                                        color: '#FFFFFF',
                                        boxShadow: `0 0 10px ${nodeGlow}`,
                                        border: `2px solid ${nodeBorder}`,
                                        flexShrink: 0,
                                        zIndex: 2
                                      }}
                                    >
                                      {nodeIcon}
                                    </div>
                                    {!isLast && (
                                      <div 
                                        style={{
                                          width: '2px',
                                          flex: 1,
                                          minHeight: '40px',
                                          background: lineBg,
                                          margin: '4px 0'
                                        }}
                                      />
                                    )}
                                  </div>

                                  {/* Right text details */}
                                  <div style={{ flex: 1, paddingBottom: isLast ? '0' : '22px', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                      <h5 
                                        style={{
                                          margin: 0,
                                          fontSize: '0.92rem',
                                          fontWeight: 800,
                                          color: isDark ? '#FFFFFF' : '#0F172A',
                                          lineHeight: 1.3
                                        }}
                                      >
                                        {st.title}
                                      </h5>
                                      <span 
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          fontFamily: 'monospace',
                                          padding: '2px 8px',
                                          borderRadius: '12px',
                                          background: tagBg,
                                          color: tagColor
                                        }}
                                      >
                                        {st.time}
                                      </span>
                                    </div>
                                    <p 
                                      style={{
                                        margin: '5px 0 0 0',
                                        fontSize: '0.78rem',
                                        color: isDark ? '#94A3B8' : '#64748B',
                                        lineHeight: 1.5
                                      }}
                                    >
                                      {st.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Section 3: Route & Address Card */}
                    <div 
                      style={{
                        borderRadius: '18px',
                        padding: '20px',
                        background: isDark ? '#0F172A' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 12px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10B981' }}>
                          {isBangla ? 'রুট ও ডেলিভারি বিবরণ' : 'Route & Delivery Details'}
                        </span>
                        <span style={{ fontSize: '11px', color: isDark ? '#94A3B8' : '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ShieldCheck size={14} color="#10B981" />
                          Encrypted Dispatch
                        </span>
                      </div>

                      {/* Origin -> Destination timeline visual */}
                      <div 
                        style={{
                          borderRadius: '14px',
                          padding: '16px',
                          background: isDark ? 'rgba(11, 16, 27, 0.7)' : '#F8FAFC',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Origin Hub */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div 
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#3B82F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#3B82F6', display: 'block' }}>
                              {isBangla ? 'প্রেরক কেন্দ্র (Origin)' : 'Origin Hub'}
                            </span>
                            <div style={{ fontSize: '0.90rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B', marginTop: '2px' }}>
                              Dhaka, Bangladesh (Developer Studio)
                            </div>
                          </div>
                        </div>

                        {/* Dotted connecting line */}
                        <div style={{ paddingLeft: '12px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '2px', height: '18px', borderLeft: '2px dashed #10B981' }} />
                        </div>

                        {/* Destination */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div 
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                          >
                            <MapPin size={15} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10B981', display: 'block' }}>
                              {isBangla ? 'গন্তব্য / ডেলিভারি ঠিকানা (Destination)' : 'Destination / Delivery Address'}
                            </span>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', marginTop: '2px', wordBreak: 'break-word' }}>
                              {selectedShipmentDetail.clientAddress || selectedShipmentDetail.address || (isBangla ? 'ডিজিটাল ডেলিভারি / রিমোট ডিপ্লয়মেন্ট' : 'Digital Delivery / Remote Deployment')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details Grid */}
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '10px'
                        }}
                      >
                        {/* Name */}
                        <div 
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(11, 16, 27, 0.6)' : '#F8FAFC',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <User size={16} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: isDark ? '#94A3B8' : '#64748B', display: 'block' }}>
                              {isBangla ? 'গ্রাহক' : 'Customer'}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedShipmentDetail.clientName || 'Valued Client'}
                            </span>
                          </div>
                        </div>

                        {/* Phone */}
                        <div 
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(11, 16, 27, 0.6)' : '#F8FAFC',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Phone size={16} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: isDark ? '#94A3B8' : '#64748B', display: 'block' }}>
                              {isBangla ? 'ফোন' : 'Phone'}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, fontFamily: 'monospace', color: isDark ? '#FFFFFF' : '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedShipmentDetail.clientPhone || selectedShipmentDetail.phone || selectedShipmentDetail.whatsapp || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Email */}
                        <div 
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(11, 16, 27, 0.6)' : '#F8FAFC',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Mail size={16} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: isDark ? '#94A3B8' : '#64748B', display: 'block' }}>
                              {isBangla ? 'ইমেইল' : 'Email'}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, fontFamily: 'monospace', color: isDark ? '#FFFFFF' : '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedShipmentDetail.clientEmail || selectedShipmentDetail.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Package & Payment Summary Card */}
                    <div 
                      style={{
                        borderRadius: '18px',
                        padding: '20px',
                        background: isDark ? 'rgba(16, 185, 129, 0.08)' : '#F0FDF4',
                        border: '1.5px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10B981' }}>
                          {isBangla ? 'প্যাকেজ ও পেমেন্ট রসিদ' : 'Package & Payment Summary'}
                        </span>
                        <span 
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <ShieldCheck size={12} />
                          Single Discount Verified
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <h4 
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: isDark ? '#FFFFFF' : '#0F172A',
                              lineHeight: 1.3
                            }}
                          >
                            {selectedShipmentDetail.dealTitle || selectedShipmentDetail.title || 'Benner design'}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                            <span 
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                                color: isDark ? '#CBD5E1' : '#475569'
                              }}
                            >
                              {selectedShipmentDetail.category || 'Graphics & Design'}
                            </span>
                            <span style={{ color: isDark ? '#64748B' : '#94A3B8' }}>•</span>
                            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: isDark ? '#94A3B8' : '#64748B' }}>
                              {selectedShipmentDetail.couponCode ? `Coupon: ${selectedShipmentDetail.couponCode}` : 'Standard / Fixed Rate'}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94A3B8' : '#64748B', display: 'block' }}>
                            {isBangla ? 'মোট প্রদেয় মূল্য' : 'Total Payable'}
                          </span>
                          <div 
                            style={{
                              fontSize: '1.85rem',
                              fontWeight: 900,
                              fontFamily: "'Space Grotesk', monospace",
                              color: '#10B981',
                              lineHeight: 1.1,
                              marginTop: '3px'
                            }}
                          >
                            ৳{selectedShipmentDetail.finalPrice || selectedShipmentDetail.amount || selectedShipmentDetail.price || '5000'}
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: '4px', color: isDark ? '#6EE7B7' : '#059669' }}>BDT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pinned Bottom Navbar with stylish full-width button */}
                <div 
                  className="p-4 bg-white/80 dark:bg-[#0b101b]/80 backdrop-blur border-t border-gray-100 dark:border-gray-800"
                  style={{
                    padding: '16px 20px',
                    background: isDark ? 'rgba(11, 16, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                    flexShrink: 0,
                    boxSizing: 'border-box',
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))'
                  }}
                >
                  <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
                    <button 
                      type="button"
                      onClick={() => setSelectedShipmentDetail(null)} 
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '1rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <ArrowLeft size={18} />
                      <span>{isBangla ? 'ট্র্যাকিং বন্ধ করে হিস্ট্রিতে ফিরুন' : 'Close Tracking & Back to History'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Connect Modal for sign-in / authentication */}
        <ConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => {
            setIsConnectModalOpen(false);
            setPendingClaimDeal(null);
          }}
        />

        {/* Floating Share Feedback Toast Notification */}
        <AnimatePresence>
          {shareToastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{
                position: 'fixed',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100000,
                background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
                color: '#FFFFFF',
                padding: '12px 22px',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)',
                border: '1.5px solid rgba(16, 185, 129, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.86rem',
                fontWeight: 800,
                maxWidth: '90vw',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            >
              <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0 }} />
              <span>{shareToastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default DealsDiscountsModal;
