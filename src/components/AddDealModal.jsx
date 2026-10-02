import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { COLLECTIONS, saveFeatureItem } from '../services/featuresService';

const AddDealModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    imagePath: '',
    originalPrice: '',
    discountPercentage: '',
    couponCode: '',
    validUntil: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.couponCode || !formData.discountPercentage) {
      alert("অনুগ্রহ করে শিরোনাম, ডিসকাউন্ট এবং কুপন কোড পূরণ করুন।");
      return;
    }

    setLoading(true);
    try {
      const originalPriceNum = Number(formData.originalPrice) || 0;
      const discountPercentageNum = Number(formData.discountPercentage) || 0;
      const cleanCouponCode = formData.couponCode.trim().toUpperCase();
      const cleanImagePath = formData.imagePath.trim() || 'add1.png';
      const normalizedBannerUrl = cleanImagePath.startsWith('/') ? cleanImagePath : '/' + cleanImagePath;

      // 1. Save to primary 'deals' collection
      await addDoc(collection(db, "deals"), {
        ...formData,
        originalPrice: originalPriceNum,
        discountPercentage: discountPercentageNum,
        couponCode: cleanCouponCode,
        imagePath: cleanImagePath,
        bannerUrl: normalizedBannerUrl,
        discountPercent: `${discountPercentageNum}% OFF`,
        discountCode: cleanCouponCode,
        expiryDate: formData.validUntil,
        createdAt: serverTimestamp()
      });

      // 2. Real-time Synchronization with Features Deals & Discounts Stream
      await saveFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, {
        title: formData.title.trim(),
        originalPrice: originalPriceNum,
        discountPercentage: discountPercentageNum,
        discountPercent: `${discountPercentageNum}% OFF`,
        couponCode: cleanCouponCode,
        discountCode: cleanCouponCode,
        imagePath: cleanImagePath,
        bannerUrl: normalizedBannerUrl,
        expiryDate: formData.validUntil,
        validUntil: formData.validUntil,
        description: formData.description.trim(),
        isActive: formData.isActive
      });

      alert("নতুন ডিল সফলভাবে যুক্ত হয়েছে!");
      onClose();
    } catch (error) {
      console.error("Error adding deal: ", error);
      alert("ডিল যুক্ত করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 my-8">
        
        {/* হেডার */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              🏷️
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">নতুন ডিল যুক্ত করুন</h3>
              <p className="text-xs text-gray-500">পোর্টফোলিওতে ডিসকাউন্ট অফার প্রকাশ করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
        </div>

        {/* মূল ইনপুট ফিল্ডসমূহ */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 text-left">
          
          {/* ১. ডিল টাইটেল */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">প্রজেক্ট / অফারের শিরোনাম *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: Banner Design / Portfolio Website"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* ২. ব্যানারের ছবি (public/ পাথ) */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">ছবির নাম (public/ ফোল্ডার থেকে) *</label>
            <input
              type="text"
              required
              value={formData.imagePath}
              onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
              placeholder="যেমন: banner.png বা deal.png"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* ৩. প্যাকেজ রেট ও ডিসকাউন্ট রেট */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">প্যাকেজ রেট (৳ BDT) *</label>
              <input
                type="number"
                required
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="যেমন: 5000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">ডিসকাউন্ট (%) *</label>
              <input
                type="number"
                required
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                placeholder="যেমন: 75"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* ৪. কুপন কোড ও মেয়াদ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">কুপন কোড *</label>
              <input
                type="text"
                required
                value={formData.couponCode}
                onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                placeholder="যেমন: RASEDUL75"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">অফারের মেয়াদ *</label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* ৫. অফারের বিবরণ */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">অফারের সংক্ষিপ্ত বিবরণ</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="অফার সম্পর্কে কিছু তথ্য লিখুন..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* সাবমিট বাটন */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              {loading ? "যোগ হচ্ছে..." : "ডিল প্রকাশ করুন"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddDealModal;
