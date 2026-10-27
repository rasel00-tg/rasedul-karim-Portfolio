import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Tag, 
  Percent, 
  Image as ImageIcon, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  FileCheck 
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS, saveFeatureItem, updateFeatureItem } from '../services/featuresService';
import { 
  processAndUploadProjectMedia, 
  uploadFileToStorage 
} from '../services/storageService';

/**
 * Pure Client-Side HTML5 Canvas Image Compression Utility
 * Resizes large images (max 1280px) and iteratively compresses to WebP targeting < 300 KB
 */
export const compressImageClientSide = async (file, targetKb = 300) => {
  if (!file) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDimension = 1280;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const tryQuality = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback to JPEG if WebP blob creation is unsupported
                canvas.toBlob(
                  (jpegBlob) => {
                    if (!jpegBlob) return resolve(file);
                    const cleanName = (file.name || 'deal_image').replace(/\.[^.]+$/, '') + '.jpg';
                    resolve(new File([jpegBlob], cleanName, { type: 'image/jpeg' }));
                  },
                  'image/jpeg',
                  q
                );
                return;
              }

              const sizeKb = blob.size / 1024;
              // If still exceeds target and quality is above threshold, compress further
              if (sizeKb > targetKb && q > 0.45) {
                tryQuality(q - 0.15);
              } else {
                const cleanName = (file.name || 'deal_image').replace(/\.[^.]+$/, '') + '.webp';
                resolve(new File([blob], cleanName, { type: 'image/webp' }));
              }
            },
            'image/webp',
            q
          );
        };

        tryQuality(0.82);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const AddDealModal = ({ isOpen, onClose, dealToEdit = null, idToken = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    imagePath: '',
    originalPrice: '',
    discountPercentage: '',
    couponCode: '',
    isLimited: false,
    expiryDate: '',
    description: '',
    isActive: true
  });

  // Client-Side Image Picker & Deferred Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState('');
  const [fileSizeInfo, setFileSizeInfo] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync form data with dealToEdit when modal opens or dealToEdit changes
  useEffect(() => {
    if (dealToEdit) {
      setFormData({
        title: dealToEdit.title || dealToEdit.name || '',
        imagePath: dealToEdit.imagePath || dealToEdit.bannerUrl || '',
        originalPrice: dealToEdit.originalPrice ? String(dealToEdit.originalPrice) : '',
        discountPercentage: dealToEdit.discountPercentage 
          ? String(dealToEdit.discountPercentage) 
          : (dealToEdit.discountPercent ? String(dealToEdit.discountPercent).replace(/[^0-9]/g, '') : ''),
        couponCode: dealToEdit.couponCode || dealToEdit.discountCode || '',
        isLimited: Boolean(dealToEdit.isLimited),
        expiryDate: dealToEdit.expiryDate || dealToEdit.validUntil || '',
        description: dealToEdit.description || '',
        isActive: dealToEdit.isActive !== false
      });
      setLocalPreview(dealToEdit.imagePath || dealToEdit.bannerUrl || '');
      setSelectedFile(null);
      setFileSizeInfo('');
    } else {
      // Clean empty fields - strictly NO hardcoded default values
      setFormData({
        title: '',
        imagePath: '',
        originalPrice: '',
        discountPercentage: '',
        couponCode: '',
        isLimited: false,
        expiryDate: '',
        description: '',
        isActive: true
      });
      setLocalPreview('');
      setSelectedFile(null);
      setFileSizeInfo('');
    }
    setErrorMsg('');
  }, [dealToEdit, isOpen]);

  // Clean up blob URLs when modal unmounts or closes
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  if (!isOpen) return null;

  // 1. File Selection Handler: Zero immediate network upload! Local preview only
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeKb = (file.size / 1024).toFixed(0);
    const originalSizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

    setFileSizeInfo(`মূল ফাইলের আকার: ${originalSizeStr} (ডিল প্রকাশের সময় ব্রাউজারে স্বয়ংক্রিয়ভাবে < ৩০০ KB WebP-তে কম্প্রেস হবে)`);
    setErrorMsg('');
  };

  const handleRemoveImage = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    setSelectedFile(null);
    setLocalPreview('');
    setFileSizeInfo('');
    setFormData(prev => ({ ...prev, imagePath: '' }));
  };

  // 2. Form Submission with Client-Side Canvas Compression and Deferred Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg("অনুগ্রহ করে ডিলের শিরোনাম লিখুন।");
      return;
    }

    if (!formData.discountPercentage) {
      setErrorMsg("অনুগ্রহ করে ডিসকাউন্টের শতকরা হার (%) লিখুন।");
      return;
    }

    if (!formData.couponCode.trim()) {
      setErrorMsg("অনুগ্রহ করে কুপন কোড প্রদান করুন।");
      return;
    }

    if (formData.isLimited && !formData.expiryDate) {
      setErrorMsg("সীমিত সময়ের অফার সিলেক্ট করলে অবশ্যই এক্সপায়ারি তারিখ ও সময় নির্ধারণ করতে হবে।");
      return;
    }

    setLoading(true);
    try {
      let finalImagePath = formData.imagePath.trim() || '/add1.png';

      // 3. Deferred Upload: Only compress and upload now if a file was selected by the user
      if (selectedFile) {
        setIsCompressing(true);
        try {
          // A. Client-Side HTML5 Canvas Compression targeting < 300 KB / WebP format
          const compressed = await compressImageClientSide(selectedFile, 300);

          // B. Upload compressed file to Cloudflare R2 / Storage / Cloudinary
          try {
            finalImagePath = await processAndUploadProjectMedia(compressed, { idToken });
          } catch (uploadErr) {
            console.warn('Primary upload notice, testing fallback:', uploadErr.message);
            finalImagePath = await uploadFileToStorage(compressed, 'deals', idToken);
          }
        } catch (compErr) {
          console.warn('Canvas compression notice, falling back:', compErr.message);
          finalImagePath = await uploadFileToStorage(selectedFile, 'deals', idToken);
        } finally {
          setIsCompressing(false);
        }
      } else if (!finalImagePath.startsWith('/') && !finalImagePath.startsWith('http') && !finalImagePath.startsWith('data:')) {
        finalImagePath = '/' + finalImagePath;
      }

      const originalPriceNum = Number(formData.originalPrice) || 0;
      const discountPercentageNum = Number(formData.discountPercentage) || 0;
      const cleanCouponCode = formData.couponCode.trim().toUpperCase();

      const payload = {
        title: formData.title.trim(),
        name: formData.title.trim(),
        imagePath: finalImagePath,
        bannerUrl: finalImagePath,
        originalPrice: originalPriceNum,
        regularPrice: originalPriceNum,
        discountPercentage: discountPercentageNum,
        discountPercent: `${discountPercentageNum}% OFF`,
        couponCode: cleanCouponCode,
        discountCode: cleanCouponCode,
        isLimited: Boolean(formData.isLimited),
        expiryDate: formData.isLimited ? formData.expiryDate : '',
        validUntil: formData.isLimited ? formData.expiryDate : '',
        description: formData.description.trim(),
        isActive: formData.isActive
      };

      if (dealToEdit && (dealToEdit.id || dealToEdit._firestoreDocId)) {
        const docId = dealToEdit._firestoreDocId || dealToEdit.id;
        // Update existing deal in COLLECTIONS.DEALS_DISCOUNTS
        await updateFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, docId, payload, idToken);

        // Also update in primary 'deals' collection if exists
        try {
          if (db) {
            await updateDoc(doc(db, "deals", docId), {
              ...payload,
              updatedAt: serverTimestamp()
            });
          }
        } catch (updateErr) {
          console.warn("Notice: primary deals collection sync:", updateErr.message);
        }
      } else {
        // 1. Save to primary 'deals' collection
        try {
          if (db) {
            await addDoc(collection(db, "deals"), {
              ...payload,
              createdAt: serverTimestamp()
            });
          }
        } catch (addErr) {
          console.warn("Notice: primary deals collection add:", addErr.message);
        }

        // 2. Real-time Synchronization with Features Deals & Discounts Stream
        await saveFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, {
          ...payload,
          createdAt: new Date().toISOString()
        }, idToken);
      }

      onClose();
    } catch (error) {
      console.error("Error saving deal: ", error);
      setErrorMsg(error.message || "ডিল সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
      setIsCompressing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      style={{ zIndex: 100010 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-white my-auto relative overflow-hidden"
      >
        {/* Ambient Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg shadow-inner">
              🏷️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {dealToEdit ? 'ডিল ও ডিসকাউন্ট সম্পাদনা করুন' : 'নতুন ডিল যুক্ত করুন'}
              </h3>
              <p className="text-xs text-slate-400">
                {dealToEdit ? 'বিদ্যমান অফারটির তথ্য পরিবর্তন করুন' : 'পোর্টফোলিওতে আকর্ষণীয় ডিসকাউন্ট অফার প্রকাশ করুন'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            disabled={loading}
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form (Clean, Dark Themed, Strictly NO Hardcoded Defaults) */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-left">
          
          {/* 1. ডিল শিরোনাম */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-400" />
              <span>প্রজেক্ট / অফারের শিরোনাম *</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: Banner Design / Portfolio Website / Full Branding"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* 2. ক্লায়েন্ট-সাইড ইমেজ আপলোড ও প্রিভিউ সেকশন (Deferred Upload + Auto Compression) */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <ImageIcon size={13} className="text-teal-400" />
              <span>ব্যানারের ছবি (ক্লায়েন্ট-সাইড কম্প্রেশন ও ডেফার্ড আপলোড)</span>
            </label>

            {localPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-600 bg-slate-900/80 p-2 flex items-center gap-3">
                <img 
                  src={localPreview} 
                  alt="Deal Banner Preview" 
                  className="w-20 h-14 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  onError={(e) => { e.target.src = '/add1.png'; }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={13} />
                    <span>ছবি প্রস্তুত (লোকাল প্রিভিউ)</span>
                  </div>
                  {fileSizeInfo ? (
                    <p className="text-[11px] text-amber-300/90 leading-tight mt-1">
                      {fileSizeInfo}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                      {formData.imagePath || 'বিদ্যমান ব্যানার ছবি'}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all flex-shrink-0"
                  title="ছবি মুছে নতুন ছবি নির্বাচন করুন"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div>
                <label 
                  htmlFor="deal-file-upload" 
                  className="w-full border-2 border-dashed border-slate-600 hover:border-emerald-500/80 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      কম্পিউটার/মোবাইল থেকে ছবি বেছে নিন
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      (সিলেক্টে তাৎক্ষণিক আপলোড হবে না; ডিল পাবলিশে ব্রাউজারেই &lt; ৩০০ KB WebP-তে কম্প্রেস হয়ে আপলোড হবে)
                    </span>
                  </div>
                </label>
                <input 
                  id="deal-file-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>
            )}

            {/* বিকল্প public/ ইমেজ পাথ ইনপুট */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">
                অথবা public/ ফোল্ডারের ইমেজ ফাইল লিখুন (ঐচ্ছিক):
              </span>
              <input
                type="text"
                value={formData.imagePath}
                onChange={(e) => {
                  setFormData({ ...formData, imagePath: e.target.value });
                  if (!selectedFile) setLocalPreview(e.target.value);
                }}
                placeholder="যেমন: add1.png বা banner.png (ডিফল্ট: /add1.png)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* 3. প্যাকেজ রেট ও ডিসকাউন্ট রেট */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Tag size={13} className="text-emerald-400" />
                <span>প্যাকেজ রেট (৳ BDT)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="রেগুলার প্রাইস (যেমন: 5000)"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Percent size={13} className="text-teal-400" />
                <span>ডিসকাউন্ট শতকরা হার (%) *</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                placeholder="শতকরা ছাড় (যেমন: 75)"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* 4. কুপন কোড */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-amber-400" />
              <span>কুপন কোড *</span>
            </label>
            <input
              type="text"
              required
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
              placeholder="যেমন: RASEDUL75 বা SAVE50"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* 5. লিমিটেড টাইম ডিল টগল ও অটো-এক্সপায়ার ফিল্ড */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className={formData.isLimited ? 'text-amber-400' : 'text-slate-400'} />
                <div>
                  <span className="text-xs font-bold text-white block">
                    ⏰ Limited Time Deal (সীমিত সময়ের অফার)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    নির্দিষ্ট সময় পার হওয়ার পর পোর্টফোলিও থেকে স্বয়ংক্রিয়ভাবে অদৃশ্য হয়ে যাবে
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.isLimited}
                onChange={(e) => setFormData({ ...formData, isLimited: e.target.checked })}
                className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
              />
            </label>

            {/* Expiry Date & Time (Conditional) */}
            {formData.isLimited && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 border-t border-slate-700/60"
              >
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-400" />
                  <span>অফারের মেয়াদ শেষ হওয়ার তারিখ ও সময় (Expiry Date & Time) *</span>
                </label>
                <input
                  type="datetime-local"
                  required={formData.isLimited}
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </motion.div>
            )}
          </div>

          {/* 6. অফারের বিবরণ */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              অফারের সংক্ষিপ্ত বিবরণ (Description)
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="অফার সম্পর্কে প্রয়োজনীয় তথ্য বা শর্তাবলি লিখুন..."
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            ></textarea>
          </div>

          {/* সাবমিট ও বাতিল বাটন */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              {isCompressing ? (
                <span>ইমেজ কম্প্রেশন হচ্ছে (&lt; ৩০০ KB)...</span>
              ) : loading ? (
                <span>সংরক্ষণ হচ্ছে...</span>
              ) : (
                <>
                  <span>{dealToEdit ? 'আপডেট করুন' : 'নতুন ডিল প্রকাশ করুন'}</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default AddDealModal;
