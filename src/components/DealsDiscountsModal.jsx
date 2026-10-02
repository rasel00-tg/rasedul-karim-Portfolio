import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS, checkCouponRedemption, recordCouponRedemption } from '../services/featuresService';
import { isEmailSubscribed, subscribeEmail } from '../services/subscriptionService';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const DealsDiscountsModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { isBangla } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(null);

  // Global verified subscriber email from localStorage
  const [activeUserEmail, setActiveUserEmail] = useState(() => {
    return localStorage.getItem('subscriber_deal_email') || '';
  });

  // Interactive Claim & Checkout Modal Drawer State
  const [selectedDealForClaim, setSelectedDealForClaim] = useState(null);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState(() => {
    return localStorage.getItem('subscriber_deal_email') || '';
  });
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
  const [showOrderToast, setShowOrderToast] = useState(false);
  const [sharedDealId, setSharedDealId] = useState(null);
  const [shareToastMsg, setShareToastMsg] = useState(null);

  // PopScope / Browser Back Interception to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'deals_discounts' }, '');
    const handlePopState = () => {
      if (selectedDealForClaim) {
        setSelectedDealForClaim(null);
        window.history.pushState({ modal: 'deals_discounts' }, '');
      } else {
        onClose();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose, selectedDealForClaim]);

  // Copy coupon code to clipboard with visual feedback
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Native Social Media Web Share API with Clipboard Fallback
  const handleShareDeal = async (deal) => {
    const rawRate = deal?.discountPercentage || deal?.discountPercent || '75%';
    const match = String(rawRate).match(/(\d+)/);
    const discountText = match ? match[1] : '75';
    const dealTitle = deal.title || (isBangla ? 'এক্সক্লুসিভ অফার ও ডিল' : 'Exclusive Deal & Discount');

    const shareData = {
      title: dealTitle,
      text: isBangla 
        ? `🔥 ${dealTitle} - পাচ্ছেন ${discountText}% ছাড়! অফারটি দ্রুত ক্লেইম করুন:` 
        : `🔥 ${dealTitle} - Get ${discountText}% OFF! Claim this exclusive deal now:`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setSharedDealId(deal.id);
        setTimeout(() => setSharedDealId(null), 2500);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setSharedDealId(deal.id);
        setShareToastMsg(isBangla ? '✓ লিংক ও অফারের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!' : '✓ Deal link and offer copied to clipboard!');
        setTimeout(() => {
          setSharedDealId(null);
          setShareToastMsg(null);
        }, 3000);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing deal:", error);
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

  // Open Claim Checkout Modal - default hidden coupon state & draft restoration
  const handleOpenClaimModal = (deal) => {
    setSelectedDealForClaim(deal);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    setCouponErrorMsg(null);
    setCouponSuccessMsg(null);
    setIsEmailVerified(false);
    setEmailChecking(false);
    setEmailFeedback(null);

    // Check if there is an existing draft to preserve form state
    try {
      const rawDraft = localStorage.getItem('checkout_pending_draft');
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.dealId === deal.id) {
          setCheckoutName(draft.name || '');
          setCheckoutEmail(draft.email || activeUserEmail || '');
          setCheckoutMessage(draft.message || '');
          setCheckoutCouponCode(''); // Default Hidden State (Empty input!)
          setIsCouponApplied(false);
          setAppliedCouponCode('');
          return;
        }
      }
    } catch {}

    setCheckoutCouponCode(''); // Default Hidden State: Starts completely empty (no auto-fill!)
    setIsCouponApplied(false);
    setAppliedCouponCode('');
    if (activeUserEmail) {
      setCheckoutEmail(activeUserEmail);
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

  // ১. ইমেইল ভেরিফিকেশন ও অটোমেটিক কুপন কোড লজিক
  // ১. ইমেইল ভেরিফিকেশন ও অটোমেটিক কুপন কোড লজিক (কঠোর ওয়ান-টাইম ও সাবস্ক্রিপশন গার্ড)
  const handleVerifyEmailAndAutoFill = async () => {
    setIsEmailVerified(false);
    setIsCouponApplied(false);
    setAppliedCouponCode('');
    setCouponSuccessMsg(null);
    setEmailFeedback(null);
    setCouponErrorMsg(null);

    const cleanEmail = (checkoutEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setIsEmailVerified(false);
      setEmailFeedback({
        type: 'error',
        message: isBangla ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please enter a valid email address.',
        needsSubscribe: false
      });
      return;
    }

    setEmailChecking(true);

    try {
      // ১. সাবস্ক্রিপশন চেক (Firestore subscribers কালেকশনে ইমেইল আছে কিনা)
      let isSub = false;
      try {
        const subQuery = query(collection(db, "subscribers"), where("email", "==", cleanEmail));
        const subSnap = await getDocs(subQuery);
        if (!subSnap.empty) {
          isSub = true;
        } else {
          const docSnap = await getDoc(doc(db, "subscribers", cleanEmail));
          if (docSnap.exists()) {
            isSub = true;
          }
        }
      } catch (subErr) {
        isSub = await isEmailSubscribed(cleanEmail);
      }

      if (!isSub) {
        setIsEmailVerified(false);
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setEmailFeedback({
          type: 'error',
          message: isBangla 
            ? 'এই ইমেইলটি সাবস্ক্রাইব করা নেই! আগে সাবস্ক্রাইব করুন।' 
            : 'This email is not subscribed! Please subscribe first.',
          needsSubscribe: true
        });
        return;
      }

      // ২. ওয়ান-টাইম চেক (coupon_redemptions কালেকশনে এই ডিল ও ইমেইলের পূর্ববর্তী রেকর্ড আছে কিনা)
      const activeDeal = selectedDealForClaim || {};
      const activeDealId = (activeDeal.id || '').trim();
      let alreadyRedeemed = false;

      try {
        if (activeDealId) {
          const redeemQuery = query(
            collection(db, "coupon_redemptions"),
            where("dealId", "==", activeDealId),
            where("email", "==", cleanEmail)
          );
          const redeemSnap = await getDocs(redeemQuery);
          if (!redeemSnap.empty) {
            alreadyRedeemed = true;
          }
        }
      } catch (redeemErr) {}

      if (!alreadyRedeemed) {
        const postCoupon = (activeDeal.couponCode || activeDeal.discountCode || 'RASEDUL75').trim().toUpperCase();
        const redemption = await checkCouponRedemption(cleanEmail, postCoupon, activeDealId);
        if (redemption.alreadyRedeemed) {
          alreadyRedeemed = true;
        }
      }

      if (alreadyRedeemed) {
        setIsEmailVerified(false); // কঠোরভাবে false রাখা হলো
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setEmailFeedback({
          type: 'error',
          message: isBangla 
            ? 'আপনি ইতোপূর্বে এই অফারের জন্য কুপন ব্যবহার করেছেন!' 
            : 'You have already redeemed a coupon for this deal!',
          needsSubscribe: false
        });
        return;
      }

      // ৩. সফল হলে: কেবল দুটি শর্তই সফল হলে isEmailVerified = true হবে
      const postCoupon = (activeDeal.couponCode || activeDeal.discountCode || 'RASEDUL75').trim().toUpperCase();
      setIsEmailVerified(true);
      setCheckoutCouponCode(postCoupon);
      setIsCouponApplied(true);
      setAppliedCouponCode(postCoupon);

      const rate = parseDiscountRate(activeDeal);
      setEmailFeedback({
        type: 'success',
        message: isBangla 
          ? `✓ ইমেইল সফলভাবে ভেরিফাইড! কুপন (${postCoupon}) স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে এবং ${rate}% ডিসকাউন্ট সক্রিয় হয়েছে।` 
          : `✓ Email verified! Coupon (${postCoupon}) auto-applied with ${rate}% discount.`,
        needsSubscribe: false
      });
      setCouponSuccessMsg(
        isBangla 
          ? `✓ কুপন কোড (${postCoupon}) কার্যকর হয়েছে!` 
          : `✓ Coupon code (${postCoupon}) active!`
      );
      localStorage.setItem('subscriber_deal_email', cleanEmail);
      setActiveUserEmail(cleanEmail);
    } catch (err) {
      setIsEmailVerified(false);
      setEmailFeedback({
        type: 'error',
        message: isBangla ? 'ভেরিফিকেশনে সমস্যা হয়েছে।' : 'Verification failed.',
        needsSubscribe: false
      });
    } finally {
      setEmailChecking(false);
    }
  };

  // ২. ম্যানুয়াল কুপন কোড টাইপ ও ভ্যালিডেশন লজিক
  const handleApplyCouponInsideModal = async () => {
    setCouponErrorMsg(null);
    setCouponSuccessMsg(null);

    const typedCode = (checkoutCouponCode || '').trim().toUpperCase();
    if (!typedCode) {
      setCouponErrorMsg(
        isBangla 
          ? 'কুপন কোড লিখুন (যদি থাকে)' 
          : 'Enter coupon code (optional)'
      );
      return;
    }

    const cleanEmail = (checkoutEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setCouponErrorMsg(
        isBangla 
          ? 'কুপন যাচাইয়ের জন্য অনুগ্রহ করে প্রথমে আপনার ইমেইল লিখুন।' 
          : 'Please enter your email first to verify coupon.'
      );
      return;
    }

    const postCoupon = (selectedDealForClaim?.discountCode || 'RASEDUL75').trim().toUpperCase();

    // ভুল কোড গার্ড: টাইপ করা কোডটি পোস্টের মূল কুপন কোডের সাথে না মিললে
    if (typedCode !== postCoupon) {
      setIsCouponApplied(false);
      setAppliedCouponCode('');
      setCouponErrorMsg(
        isBangla 
          ? 'ভুল কুপন কোড! দয়া করে সঠিক কোড দিন।' 
          : 'Invalid coupon code! Please enter a valid code.'
      );
      return;
    }

    // সঠিক কোড ও সাবস্ক্রিপশন চেক:
    setCouponChecking(true);

    try {
      const isSubscribed = await isEmailSubscribed(cleanEmail);
      if (!isSubscribed) {
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setIsEmailVerified(false);
        setCouponErrorMsg(
          isBangla 
            ? 'কুপনটি সঠিক, তবে আপনি এখনো সাবস্ক্রাইব করেননি! ডিসকাউন্ট পেতে আগে সাবস্ক্রাইব করুন।' 
            : 'Coupon is valid, but you have not subscribed yet! Please subscribe first to claim discount.'
        );
        return;
      }

      // এক পোস্টে একবার ব্যবহারের সুরক্ষা:
      const redemption = await checkCouponRedemption(cleanEmail, typedCode, selectedDealForClaim?.id);
      if (redemption.alreadyRedeemed) {
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setIsEmailVerified(false);
        setCouponErrorMsg(
          isBangla 
            ? 'আপনি ইতোপূর্বে এই অফারের জন্য কুপন ব্যবহার করেছেন!' 
            : 'You have already redeemed a coupon for this deal!'
        );
        return;
      }

      // সফল প্রয়োগ: কুপন কার্যকর ও ডিসকাউন্ট চালু
      setIsEmailVerified(true);
      setIsCouponApplied(true);
      setAppliedCouponCode(typedCode);
      const rate = parseDiscountRate(selectedDealForClaim);
      setCouponSuccessMsg(
        isBangla 
          ? `✓ কুপন কোড (${typedCode}) সফলভাবে কার্যকর হয়েছে! (${rate}% ছাড় প্রযোজ্য)` 
          : `✓ Coupon code (${typedCode}) applied successfully! (${rate}% discount active)`
      );
      localStorage.setItem('subscriber_deal_email', cleanEmail);
      setActiveUserEmail(cleanEmail);
    } catch (err) {
      setIsCouponApplied(false);
      setAppliedCouponCode('');
      setCouponErrorMsg(err.message || (isBangla ? 'কুপন যাচাই ব্যর্থ হয়েছে।' : 'Coupon verification failed.'));
    } finally {
      setCouponChecking(false);
    }
  };

  // State-Preserving Subscription Flow: Subscribes and immediately returns with form state intact
  const handleStatePreservedSubscribeAndRestore = async () => {
    const cleanEmail = (checkoutEmail || '').trim().toLowerCase();
    if (!cleanEmail) return;

    // ১. ফর্মের পূরণকৃত সমস্ত ফিল্ড (নাম, ইমেইল, মেসেজ) লোকাল স্টেটে সুরক্ষিত রাখা
    const preservedDraft = {
      dealId: selectedDealForClaim?.id,
      name: checkoutName,
      email: cleanEmail,
      couponCode: checkoutCouponCode,
      message: checkoutMessage
    };
    try {
      localStorage.setItem('checkout_pending_draft', JSON.stringify(preservedDraft));
    } catch {}

    setEmailChecking(true);
    setCouponChecking(true);
    setEmailFeedback(null);
    setCouponErrorMsg(null);

    try {
      // ২. ফায়ারস্টোরের subscribers কালেকশনে সাবস্ক্রিপশন সম্পন্ন
      await subscribeEmail(cleanEmail);
      localStorage.setItem('subscriber_deal_email', cleanEmail);
      setActiveUserEmail(cleanEmail);

      // ৩. পূর্বে পূরণ করা নাম ও ইমেইল অক্ষত অবস্থায় ফর্মে বসানো
      setCheckoutName(preservedDraft.name);
      setCheckoutEmail(preservedDraft.email);
      setCheckoutMessage(preservedDraft.message);

      // ৪. অটোমেটিক কুপন কোড বসানো ও ডিসকাউন্ট কার্যকর করা
      const postCoupon = (selectedDealForClaim?.discountCode || 'RASEDUL75').trim().toUpperCase();
      const redemption = await checkCouponRedemption(cleanEmail, postCoupon, selectedDealForClaim?.id);

      if (redemption.alreadyRedeemed) {
        setIsEmailVerified(false);
        setIsCouponApplied(false);
        setAppliedCouponCode('');
        setEmailFeedback({
          type: 'error',
          message: isBangla 
            ? 'আপনি ইতোপূর্বে এই অফারের জন্য কুপন ব্যবহার করেছেন!' 
            : 'You have already redeemed a coupon for this deal!',
          needsSubscribe: false
        });
      } else {
        setIsEmailVerified(true);
        setCheckoutCouponCode(postCoupon);
        setIsCouponApplied(true);
        setAppliedCouponCode(postCoupon);

        const rate = parseDiscountRate(selectedDealForClaim);
        setEmailFeedback({
          type: 'success',
          message: isBangla 
            ? `✓ সাবস্ক্রিপশন সফল! কুপন কোড (${postCoupon}) স্বয়ংক্রিয়ভাবে বসে গেছে এবং ${rate}% ডিসকাউন্ট চালু হয়েছে।` 
            : `✓ Subscribed successfully! Coupon (${postCoupon}) auto-filled and ${rate}% discount applied.`,
          needsSubscribe: false
        });
        setCouponSuccessMsg(
          isBangla 
            ? `✓ কুপন কোড (${postCoupon}) কার্যকর হয়েছে!` 
            : `✓ Coupon code (${postCoupon}) active!`
        );
      }
    } catch (err) {
      setEmailFeedback({
        type: 'error',
        message: err.message || (isBangla ? 'সাবস্ক্রিপশন ব্যর্থ হয়েছে।' : 'Subscription failed.'),
        needsSubscribe: false
      });
    } finally {
      setEmailChecking(false);
      setCouponChecking(false);
    }
  };

  // Submit Order Claim with Direct Email Client Redirection & One-Time Coupon Validation
  const handleConfirmOrderClaim = async (e) => {
    e?.preventDefault();
    setCheckoutError(null);

    const userName = (checkoutName || '').trim();
    const userEmail = (checkoutEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userName || !userEmail || !emailRegex.test(userEmail)) {
      setCheckoutError(
        isBangla 
          ? 'অনুগ্রহ করে আপনার নাম ও ইমেইল সঠিকভাবে পূরণ করুন।' 
          : 'Please enter your name and email correctly.'
      );
      return;
    }

    setCheckoutSubmitting(true);

    const activeDeal = selectedDealForClaim || {};
    const activeCode = isCouponApplied && appliedCouponCode ? appliedCouponCode : null;
    const pricing = calculatePricing(activeDeal, !!activeCode);
    const finalPayablePrice = `৳${pricing.finalPrice} BDT`;

    try {
      // যদি কুপন কার্যকর থাকে, ফায়ারস্টোরে ওয়ান-টাইম ট্র্যাকিং রেকর্ড করা হবে
      if (activeCode) {
        const isSubscribed = await isEmailSubscribed(userEmail);
        if (!isSubscribed) {
          setIsCouponApplied(false);
          setAppliedCouponCode('');
          setIsEmailVerified(false);
          setCheckoutError(
            isBangla 
              ? 'কুপনটি সঠিক, তবে আপনি এখনো সাবস্ক্রাইব করেননি! ডিসকাউন্ট পেতে আগে সাবস্ক্রাইব করুন।' 
              : 'Coupon is valid, but you have not subscribed yet! Please subscribe first to claim discount.'
          );
          setCheckoutSubmitting(false);
          return;
        }

        const redemptionCheck = await checkCouponRedemption(userEmail, activeCode, activeDeal.id);
        if (redemptionCheck.alreadyRedeemed) {
          setIsCouponApplied(false);
          setAppliedCouponCode('');
          setIsEmailVerified(false);
          setCheckoutError(
            isBangla
              ? 'আপনি ইতোপূর্বে এই অফারের জন্য কুপন ব্যবহার করেছেন! রেগুলার মূল্য বহাল রাখা হলো।'
              : 'You have already redeemed this coupon for this deal! Regular pricing applies.'
          );
          setCheckoutSubmitting(false);
          return;
        }

        // ফায়ারস্টোর রেডিম ট্র্যাকিং
        await recordCouponRedemption({
          dealId: activeDeal.id,
          email: userEmail,
          couponCode: activeCode,
          dealTitle: activeDeal.title,
          discountPercent: activeDeal.discountPercent || `${pricing.rate}%`,
          clientName: userName,
          message: checkoutMessage.trim()
        });
      }

      // Order Record for Client Confirmation
      const orderRecord = {
        dealTitle: activeDeal.title,
        finalPrice: pricing.finalPrice,
        couponCode: activeCode ? activeCode : (isBangla ? 'প্রযোজ্য নয় (রেগুলার মূল্য)' : 'None (Regular Price)'),
        clientName: userName,
        clientEmail: userEmail,
        message: checkoutMessage.trim(),
        redeemedAt: new Date().toISOString()
      };

      setCheckoutSuccess(orderRecord);
      setShowOrderToast(true);
      setTimeout(() => setShowOrderToast(false), 7000);
      localStorage.setItem('subscriber_deal_email', userEmail);
      setActiveUserEmail(userEmail);

      // সরাসরি মেইল ক্লায়েন্ট ট্রিগার (সাদা পেজ বা ফ্রিজ হওয়া সম্পূর্ণ রোধ করে)
      sendEmailPayload(activeCode, pricing.finalPrice, userEmail, activeDeal, userName, checkoutMessage);
    } catch (err) {
      setCheckoutError(err.message || (isBangla ? 'অর্ডার প্রসেস করতে ব্যর্থ হয়েছে।' : 'Failed to process order claim.'));
    } finally {
      setCheckoutSubmitting(false);
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
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '100%',
          minHeight: '100vh',
          overflowX: 'hidden',
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
        {/* TOP HEADER: Full-Width Canvas, 48px Glass Icon & 36px Back Button */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Dedicated Circular 36px Back Button */}
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
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

            {/* Enhanced 48px × 48px Circular Frosted Glass Badge with deal and discount.png */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.35), 0 0 20px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/deal and discount.png" 
                alt="Deals & Discounts" 
                style={{ width: '30px', height: '30px', objectFit: 'contain' }}
              />
            </div>

            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 900,
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontFamily: isBangla ? "'Anek Bangla', 'LiAdorNoirrit', sans-serif" : "'DM Serif Display', serif",
                letterSpacing: '0.2px'
              }}>
                {isBangla ? 'বিশেষ ডিল ও এক্সক্লুসিভ ডিসকাউন্ট' : 'Exclusive Deals & Discounts'}
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '0.78rem',
                color: isDark ? '#94A3B8' : '#64748B',
                fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
              }}>
                {isBangla 
                  ? 'ভেরিফাইড প্রোমো কোড, স্পেশাল বান্ডেল অফার ও প্রজেক্ট ডিসকাউন্ট সুবিধা' 
                  : 'Verified promo codes, special bundle offers & premium project discount perks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              border: 'none',
              color: isDark ? '#FFFFFF' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* EXPANSIVE FULL-SCREEN CANVAS CONTENT (No Overflow, Responsive Grid) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100%',
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <FirestoreStreamBuilder collectionName={COLLECTIONS.DEALS_DISCOUNTS}>
            {({ data }) => {
              const deals = data || [];

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                  gap: '24px',
                  width: '100%',
                  maxWidth: '1400px',
                  margin: '0 auto',
                  boxSizing: 'border-box'
                }}>
                  {deals.map((item) => {
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.22 }}
                        style={{
                          borderRadius: '20px',
                          background: isDark 
                            ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%)' 
                            : '#FFFFFF',
                          border: `1.5px solid ${isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 105, 92, 0.22)'}`,
                          overflow: 'hidden',
                          boxShadow: isDark 
                            ? '0 8px 32px rgba(34, 197, 94, 0.15), 0 0 20px rgba(16, 185, 129, 0.08)' 
                            : '0 8px 32px rgba(0, 105, 92, 0.12)',
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
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
                            onError={(e) => { e.target.src = '/add1.png'; }}
                            style={{ width: '100%', maxWidth: '100%', height: '100%', objectFit: 'cover' }}
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
                              onClick={() => handleOpenClaimModal(item)}
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
                              onClick={() => handleShareDeal(item)}
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
                  })}
                </div>
              );
            }}
          </FirestoreStreamBuilder>
        </div>

        {/* DYNAMIC CHECKOUT DRAWER / MODAL: Single-Use Per Email & Price Calculation */}
        <AnimatePresence>
          {selectedDealForClaim && (
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
                width: '100vw',
                height: '100vh',
                background: 'rgba(5, 10, 24, 0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                boxSizing: 'border-box'
              }}
              onClick={() => setSelectedDealForClaim(null)}
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '580px',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  borderRadius: '24px',
                  background: isDark ? 'linear-gradient(145deg, #0F172A 0%, #132338 100%)' : '#FFFFFF',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(16, 185, 129, 0.25)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  position: 'relative'
                }}
              >
                {/* Checkout Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      <Calculator size={20} />
                    </div>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                      }}>
                        {isBangla ? 'অর্ডার চেকআউট ও ডিসকাউন্ট ভ্যালিডেশন' : 'Claim Offer & Discount Checkout'}
                      </h3>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        {isBangla ? 'এক ইমেইলে একবারই প্রযোজ্য' : 'Single-use discount per verified subscriber'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDealForClaim(null)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      border: 'none',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Deal Summary Banner Preview */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
                }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={selectedDealForClaim.bannerUrl || '/add1.png'} 
                      alt="Deal preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                      {selectedDealForClaim.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981'
                      }}>
                        {selectedDealForClaim.discountPercent || 'Special Offer'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontFamily: "'Space Grotesk', monospace" }}>
                        Coupon: <strong style={{ color: isCouponApplied && appliedCouponCode ? '#10B981' : '#F59E0B' }}>
                          {isCouponApplied && appliedCouponCode 
                            ? appliedCouponCode 
                            : (isBangla ? '🔒 লকড (ভেরিফিকেশন আবশ্যক)' : '🔒 Locked (Verification Required)')}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Price Calculation Breakdown */}
                {(() => {
                  const hasEffectiveCoupon = isCouponApplied && !!appliedCouponCode;
                  const pricing = calculatePricing(selectedDealForClaim, hasEffectiveCoupon);
                  return (
                    <div style={{
                      padding: '16px 18px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(0, 105, 92, 0.15)' : 'rgba(0, 105, 92, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#94A3B8' }}>
                        <span>{isBangla ? 'প্যাকেজের মূল রেগুলার মূল্য:' : 'Standard Package Rate:'}</span>
                        <span style={{ fontFamily: "'Space Grotesk', monospace" }}>৳{pricing.basePrice} BDT</span>
                      </div>

                      {/* Coupon discount line */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: hasEffectiveCoupon ? '#10B981' : '#94A3B8', fontWeight: 700 }}>
                        <span>{hasEffectiveCoupon ? (isBangla ? `প্রযোজ্য কুপন ছাড় (${pricing.rateFormatted}):` : `Applied Coupon Discount (${pricing.rateFormatted}):`) : (isBangla ? 'কুপন প্রয়োগ ছাড়া (রেগুলার মূল্য):' : 'Without Coupon (Regular Rate):')}</span>
                        <span style={{ fontFamily: "'Space Grotesk', monospace" }}>
                          {hasEffectiveCoupon ? `-৳${pricing.discountAmount} BDT` : '৳0 BDT'}
                        </span>
                      </div>

                      {/* Final Net Payable Total */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '8px',
                        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        color: isDark ? '#FFFFFF' : '#0F172A'
                      }}>
                        <span>{isBangla ? 'চূড়ান্ত প্রদেয় মূল্য (Net Total):' : 'Final Net Payable:'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {hasEffectiveCoupon && (
                            <span style={{ fontSize: '0.82rem', color: '#94A3B8', textDecoration: 'line-through', fontFamily: "'Space Grotesk', monospace" }}>
                              ৳{pricing.basePrice}
                            </span>
                          )}
                          <span style={{ color: '#10B981', fontSize: '1.25rem', fontFamily: "'Space Grotesk', monospace" }}>
                            ৳{pricing.finalPrice} BDT
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Validation Error Message Box */}
                {checkoutError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1.5px solid #EF4444',
                      color: '#F87171',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{checkoutError}</span>
                  </motion.div>
                )}

                {/* Order Confirmation Success State */}
                {checkoutSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid #10B981',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <CheckCircle2 size={46} color="#10B981" />
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900, color: '#10B981' }}>
                        {isBangla 
                          ? '✓ আপনার অর্ডার সফলভাবে পাঠানো হয়েছে! শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।' 
                          : '✓ Your order has been submitted successfully! We will contact you soon.'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: isDark ? '#E2E8F0' : '#1E293B' }}>
                        {isBangla 
                          ? `প্রজেক্ট: ${checkoutSuccess.dealTitle} | চূড়ান্ত প্রদেয় মূল্য: ৳${checkoutSuccess.finalPrice} BDT (${checkoutSuccess.couponCode})` 
                          : `Project: ${checkoutSuccess.dealTitle} | Net Total: ৳${checkoutSuccess.finalPrice} BDT (${checkoutSuccess.couponCode})`}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
                      <button
                        onClick={() => {
                          sendEmailPayload(
                            checkoutSuccess.couponCode,
                            checkoutSuccess.finalPrice,
                            checkoutSuccess.clientEmail,
                            selectedDealForClaim,
                            checkoutSuccess.clientName,
                            checkoutSuccess.message
                          );
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 18px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <Send size={16} />
                        <span>{isBangla ? 'পুনরায় ইমেইল পাঠান' : 'Resend Email'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedDealForClaim(null)}
                        style={{
                          padding: '12px 18px',
                          borderRadius: '12px',
                          background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}`,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {isBangla ? 'বন্ধ করুন' : 'Close'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Checkout Form Fields */
                  <form onSubmit={handleConfirmOrderClaim} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <User size={13} />
                        <span>{isBangla ? 'আপনার নাম (Client Name)' : 'Your Full Name'}</span>
                      </label>
                      <input
                        type="text"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder={isBangla ? 'এখানে আপনার নাম লিখুন' : 'Enter your name here'}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#F8FAFC',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Verified Email Field with Dedicated Verification & Auto-Fill Button */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Mail size={13} />
                          <span>{isBangla ? 'ভেরিফাইড ইমেইল ঠিকানা (Email Verification) *' : 'Verified Email (Email Verification) *'}</span>
                        </label>
                        {isEmailVerified && (
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10B981',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle2 size={12} />
                            {isBangla ? 'ভেরিফাইড' : 'Verified'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                          <input
                            type="email"
                            required
                            value={checkoutEmail}
                            onChange={(e) => {
                              setCheckoutEmail(e.target.value);
                              setIsEmailVerified(false);
                              setIsCouponApplied(false);
                              setAppliedCouponCode('');
                              setCouponSuccessMsg(null);
                              setEmailFeedback(null);
                            }}
                            placeholder={isBangla ? 'এখানে আপনার ইমেইল লিখুন' : 'Enter your email here'}
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              paddingRight: isEmailVerified ? '36px' : '14px',
                              borderRadius: '12px',
                              background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#F8FAFC',
                              border: isEmailVerified
                                ? '1.5px solid #10B981'
                                : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                              color: isDark ? '#FFFFFF' : '#0F172A',
                              fontSize: '0.84rem',
                              boxSizing: 'border-box',
                              outline: 'none'
                            }}
                          />
                          {isEmailVerified && (
                            <CheckCircle2
                              size={16}
                              color="#10B981"
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                            />
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={emailChecking}
                          onClick={handleVerifyEmailAndAutoFill}
                          style={{
                            width: '100%',
                            padding: '11px 16px',
                            borderRadius: '12px',
                            background: isEmailVerified
                              ? 'rgba(16, 185, 129, 0.18)'
                              : 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                            border: isEmailVerified ? '1px solid #10B981' : 'none',
                            color: isEmailVerified ? '#10B981' : '#FFFFFF',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: emailChecking ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: isEmailVerified ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.35)',
                            opacity: emailChecking ? 0.75 : 1,
                            boxSizing: 'border-box'
                          }}
                        >
                          {emailChecking ? (
                            <span>{isBangla ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                          ) : isEmailVerified ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>{isBangla ? 'যাচাইকৃত' : 'Verified'}</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>{isBangla ? 'Verify Email / যাচাই করুন' : 'Verify Email'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Email Feedback (Error with State-Preserving Subscribe or Success) */}
                      {emailFeedback && (
                        <div style={{
                          marginTop: '8px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: emailFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          border: `1.5px solid ${emailFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: emailFeedback.type === 'error' ? '#EF4444' : '#10B981',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            {emailFeedback.type === 'error' ? <AlertCircle size={14} style={{ flexShrink: 0 }} /> : <CheckCircle2 size={14} style={{ flexShrink: 0 }} />}
                            <span>{emailFeedback.message}</span>
                          </div>
                          {emailFeedback.needsSubscribe && (
                            <button
                              type="button"
                              onClick={handleStatePreservedSubscribeAndRestore}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                              }}
                            >
                              <Sparkles size={13} />
                              <span>{isBangla ? 'এখনই সাবস্ক্রাইব করুন' : 'Subscribe Now'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Internal Coupon Verification Section (Have a coupon code?) */}
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.9)',
                      border: isCouponApplied 
                        ? '1.5px solid #10B981' 
                        : `1.5px dashed ${isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 105, 92, 0.35)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Tag size={15} color="#10B981" />
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: isDark ? '#FFFFFF' : '#0F172A',
                            fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                          }}>
                            {isBangla ? 'কুপন কোড আছে? (Have a coupon code?)' : 'Have a coupon code?'}
                          </span>
                        </div>
                        {isCouponApplied && (
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10B981',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle2 size={12} />
                            {isBangla ? 'ভেরিফাইড' : 'Verified'}
                          </span>
                        )}
                      </div>

                      {/* উল্লম্ব লেআউট (Vertical Stacking): উপরে ইনপুট, নিচে বাটন (পূর্ণ প্রস্থে) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                        {/* টাইপিং ইনপুট ঘর (পূর্ণ প্রস্থে উপরে) */}
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
                          placeholder={isBangla ? 'কুপন কোড লিখুন...' : 'ENTER COUPON CODE...'}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#FFFFFF',
                            border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)'}`,
                            color: isDark ? '#FFFFFF' : '#0F172A',
                            fontSize: '0.86rem',
                            fontFamily: "'Space Grotesk', monospace",
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />

                        {/* ভেরিফাই বাটন (ইনপুটের ঠিক নিচে পূর্ণ প্রস্থে) */}
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
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1.5px solid rgba(239, 68, 68, 0.35)',
                              color: '#EF4444',
                              fontSize: '0.86rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxSizing: 'border-box',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <X size={15} />
                            <span>{isBangla ? 'কুপন রিমুভ করুন' : 'Remove Coupon'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={couponChecking}
                            onClick={handleApplyCouponInsideModal}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                              border: 'none',
                              color: '#FFFFFF',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              cursor: couponChecking ? 'wait' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                              opacity: couponChecking ? 0.75 : 1,
                              boxSizing: 'border-box',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {couponChecking ? (
                              <span>{isBangla ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                            ) : (
                              <>
                                <KeyRound size={15} />
                                <span>{isBangla ? 'কুপন ভেরিফাই করুন' : 'Apply Coupon'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Success Feedback Badge */}
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

                      {/* Error / Validation Feedback with State-Preserving Subscribe Button */}
                      {couponErrorMsg && (
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1.5px solid rgba(239, 68, 68, 0.35)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700 }}>
                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                            <span>{couponErrorMsg}</span>
                          </div>
                          {(couponErrorMsg.includes('not subscribed') || couponErrorMsg.includes('সাবস্ক্রাইব করা নেই') || couponErrorMsg.includes('সাবস্ক্রাইব করেননি')) && (
                            <button
                              type="button"
                              disabled={couponChecking}
                              onClick={handleStatePreservedSubscribeAndRestore}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                              }}
                            >
                              <Sparkles size={13} />
                              <span>{isBangla ? 'এখনই সাবস্ক্রাইব করুন' : 'Subscribe Now'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <MessageSquare size={13} />
                        <span>{isBangla ? 'প্রজেক্ট নোট বা বার্তা (Project Scope)' : 'Project Scope / Message'}</span>
                      </label>
                      <textarea
                        rows={2}
                        value={checkoutMessage}
                        onChange={(e) => setCheckoutMessage(e.target.value)}
                        placeholder={isBangla ? 'আপনার প্রজেক্টের সংক্ষিপ্ত বিবরণ লিখুন...' : 'Briefly describe your requirements...'}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: isDark ? 'rgba(0, 0, 0, 0.35)' : '#F8FAFC',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                          color: isDark ? '#FFFFFF' : '#0F172A',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Action Buttons: "Email / অর্ডার পাঠান" */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="submit"
                        disabled={checkoutSubmitting}
                        style={{
                          flex: 1,
                          padding: '13px 18px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.94rem',
                          fontWeight: 900,
                          cursor: checkoutSubmitting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.38)',
                          opacity: checkoutSubmitting ? 0.7 : 1
                        }}
                      >
                        {checkoutSubmitting ? (
                          <span>{isBangla ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>{isBangla ? 'Email / অর্ডার পাঠান' : 'Email / Submit Order'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
        <AnimatePresence>
          {showOrderToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100000,
                background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
                color: '#FFFFFF',
                padding: '14px 24px',
                borderRadius: '50px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)',
                border: '1.5px solid rgba(16, 185, 129, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.88rem',
                fontWeight: 800,
                maxWidth: '90vw',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            >
              <CheckCircle2 size={20} color="#34D399" style={{ flexShrink: 0 }} />
              <span>
                {isBangla 
                  ? 'আপনার অর্ডার সফলভাবে পাঠানো হয়েছে! শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।' 
                  : 'Your order has been submitted successfully! We will contact you soon.'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default DealsDiscountsModal;
