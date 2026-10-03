import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Palette,
  Rocket,
  Star,
  Percent,
  Tag,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Sparkles,
  FolderGit2,
  LayoutDashboard,
  Activity,
  BarChart3
} from 'lucide-react';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { uploadFileToStorage, createLocalImagePreview } from '../services/storageService';
import { createProject, updateProject, deleteProject } from '../services/adminService';
import { usePortfolioStream } from '../firebase/usePortfolioStream';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS, saveFeatureItem, updateFeatureItem, deleteFeatureItem } from '../services/featuresService';
import { firebaseConfig } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import AddDealModal from './AddDealModal';
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

  // Dedicated Admin Tabs: 'overview' | 'projects' | 'design' | 'upcoming' | 'favorite' | 'deals'
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [featureActionLoading, setFeatureActionLoading] = useState(false);
  const [featureToast, setFeatureToast] = useState(null); // { type: 'success' | 'error', text: '' }
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);

  const showFeatureToast = (text, type = 'success') => {
    setFeatureToast({ text, type });
    setTimeout(() => setFeatureToast(null), 4000);
  };

  // --- DEDICATED TAB: PROJECTS (APPS & WEBSITE) STATE ---
  const [projectEditingId, setProjectEditingId] = useState(null);
  const [projectCategory, setProjectCategory] = useState('apps'); // 'apps' | 'website'
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSubCategory, setProjectSubCategory] = useState('');
  const [projectMediaUrl, setProjectMediaUrl] = useState('/icons/hisabnama-icon.png');
  const [projectActionUrl, setProjectActionUrl] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [uploadingProjectMedia, setUploadingProjectMedia] = useState(false);

  const handleProjectMediaChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = createLocalImagePreview(file);
    setProjectMediaUrl(localUrl);
    setUploadingProjectMedia(true);
    try {
      const url = await uploadFileToStorage(file, 'projects', idToken);
      setProjectMediaUrl(url);
      showFeatureToast(isBangla ? '✓ মিডিয়া আপলোড সম্পন্ন হয়েছে' : '✓ Media uploaded to storage');
    } catch (err) {
      console.warn('Project media upload notice:', err.message);
    } finally {
      setUploadingProjectMedia(false);
    }
  };

  const resetProjectsForm = () => {
    setProjectEditingId(null);
    setProjectCategory('apps');
    setProjectTitle('');
    setProjectSubCategory('');
    setProjectMediaUrl('/icons/hisabnama-icon.png');
    setProjectActionUrl('');
    setProjectDescription('');
  };

  const handleSaveProjectsItem = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে প্রজেক্ট টাইটেল দিন' : 'Please provide a project title', 'error');
      return;
    }
    setFeatureActionLoading(true);
    try {
      const payload = {
        title: projectTitle.trim(),
        category: projectCategory,
        subCategory: projectSubCategory.trim(),
        mediaUrl: projectMediaUrl.trim() || (projectCategory === 'apps' ? '/icons/hisabnama-icon.png' : '/banners/madrasah-banner.jpg'),
        actionUrl: projectActionUrl.trim(),
        description: projectDescription.trim()
      };
      if (projectEditingId) {
        await updateFeatureItem('projects', projectEditingId, payload, idToken);
        showFeatureToast(isBangla ? '✓ প্রজেক্ট সফলভাবে আপডেট হয়েছে!' : '✓ Project updated successfully!');
      } else {
        await saveFeatureItem('projects', payload, idToken);
        showFeatureToast(isBangla ? '✓ নতুন প্রজেক্ট সফলভাবে যুক্ত হয়েছে!' : '✓ New project added successfully!');
      }
      resetProjectsForm();
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  const handleEditProjectItem = (item) => {
    setProjectEditingId(item.id);
    const cat = (item.category || 'apps').toLowerCase();
    setProjectCategory(cat === 'website' || cat === 'web' ? 'website' : 'apps');
    setProjectTitle(item.title || item.name || '');
    setProjectSubCategory(item.subCategory || item.platform || item.domain || item.tagline || '');
    setProjectMediaUrl(item.mediaUrl || item.icon || item.banner || item.thumbnail?.imageUrl || '');
    setProjectActionUrl(item.actionUrl || item.playStoreUrl || item.liveUrl || item.link || '');
    setProjectDescription(item.description || item.shortDescription || '');
  };

  const handleDeleteProjectItem = async (item) => {
    const title = item.title || item.name || 'this item';
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${title}" মুছে ফেলতে চান?` : `Delete "${title}"?`)) return;
    setFeatureActionLoading(true);
    try {
      await deleteFeatureItem('projects', item.id, idToken);
      showFeatureToast(isBangla ? '✓ প্রজেক্ট মুছে ফেলা হয়েছে!' : '✓ Project deleted successfully!');
      if (projectEditingId === item.id) resetProjectsForm();
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  // --- TAB 1: DESIGN PROJECT STATE ---
  const [designEditingId, setDesignEditingId] = useState(null);
  const [designTitle, setDesignTitle] = useState('');
  const [designSubtitle, setDesignSubtitle] = useState('');
  const [designImageUrl, setDesignImageUrl] = useState('/app1.png');
  const [designImageFile, setDesignImageFile] = useState(null);
  const [uploadingDesignImage, setUploadingDesignImage] = useState(false);
  const [designProjectUrl, setDesignProjectUrl] = useState('');
  const [designStatus, setDesignStatus] = useState('Active');
  const [designCategory, setDesignCategory] = useState('UI/UX Design');

  const handleDesignImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDesignImageFile(file);
    const localUrl = createLocalImagePreview(file);
    setDesignImageUrl(localUrl);
    setUploadingDesignImage(true);
    try {
      const url = await uploadFileToStorage(file, 'design_projects', idToken);
      setDesignImageUrl(url);
      showFeatureToast(isBangla ? '✓ ছবি সফলভাবে স্টোরেজে আপলোড হয়েছে' : '✓ Image uploaded to storage');
    } catch (err) {
      console.warn('Design upload notice:', err.message);
    } finally {
      setUploadingDesignImage(false);
    }
  };

  const resetDesignForm = () => {
    setDesignEditingId(null);
    setDesignTitle('');
    setDesignSubtitle('');
    setDesignImageUrl('/app1.png');
    setDesignImageFile(null);
    setDesignProjectUrl('');
    setDesignStatus('Active');
    setDesignCategory('UI/UX Design');
  };

  const handleSaveDesign = async (e) => {
    e.preventDefault();
    if (!designTitle.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে প্রজেক্ট টাইটেল দিন' : 'Please provide a project title', 'error');
      return;
    }
    setFeatureActionLoading(true);
    try {
      const payload = {
        title: designTitle.trim(),
        subtitle: designSubtitle.trim(),
        description: designSubtitle.trim(),
        imageUrl: designImageUrl.trim() || '/app1.png',
        projectUrl: designProjectUrl.trim(),
        status: designStatus,
        category: designCategory
      };
      if (designEditingId) {
        await updateFeatureItem(COLLECTIONS.DESIGN_PROJECTS, designEditingId, payload, idToken);
        showFeatureToast(isBangla ? '✓ ডিজাইন প্রজেক্ট সফলভাবে আপডেট হয়েছে!' : '✓ Design project updated successfully!');
      } else {
        await saveFeatureItem(COLLECTIONS.DESIGN_PROJECTS, payload, idToken);
        showFeatureToast(isBangla ? '✓ নতুন ডিজাইন প্রজেক্ট সফলভাবে যুক্ত হয়েছে!' : '✓ New design project added successfully!');
      }
      resetDesignForm();
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  const handleEditDesign = (item) => {
    setDesignEditingId(item.id);
    setDesignTitle(item.title || '');
    setDesignSubtitle(item.subtitle || item.description || '');
    setDesignImageUrl(item.imageUrl || '/app1.png');
    setDesignProjectUrl(item.projectUrl || '');
    setDesignStatus(item.status || 'Active');
    setDesignCategory(item.category || 'UI/UX Design');
  };

  const handleDeleteDesign = async (item) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${item.title}" মুছে ফেলতে চান?` : `Delete "${item.title}"?`)) return;
    setFeatureActionLoading(true);
    try {
      await deleteFeatureItem(COLLECTIONS.DESIGN_PROJECTS, item.id, idToken);
      showFeatureToast(isBangla ? '✓ ডিজাইন প্রজেক্ট মুছে ফেলা হয়েছে!' : '✓ Design project deleted successfully!');
      if (designEditingId === item.id) resetDesignForm();
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  // --- TAB 2: UPCOMING PROJECT STATE ---
  const [upcomingEditingId, setUpcomingEditingId] = useState(null);
  const [upcomingTitle, setUpcomingTitle] = useState('');
  const [upcomingReleaseDate, setUpcomingReleaseDate] = useState('Nov 2026');
  const [upcomingProgress, setUpcomingProgress] = useState(75);
  const [upcomingDescription, setUpcomingDescription] = useState('');
  const [upcomingDemoUrl, setUpcomingDemoUrl] = useState('');
  const [upcomingStatus, setUpcomingStatus] = useState('In Development');
  const [upcomingBannerUrl, setUpcomingBannerUrl] = useState('');
  const [upcomingImageFile, setUpcomingImageFile] = useState(null);
  const [uploadingUpcomingImage, setUploadingUpcomingImage] = useState(false);

  const handleUpcomingImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpcomingImageFile(file);
    const localUrl = createLocalImagePreview(file);
    setUpcomingBannerUrl(localUrl);
    setUploadingUpcomingImage(true);
    try {
      const url = await uploadFileToStorage(file, 'upcoming', idToken);
      setUpcomingBannerUrl(url);
      showFeatureToast(isBangla ? '✓ ব্যানার সফলভাবে আপলোড হয়েছে' : '✓ Banner uploaded to storage');
    } catch (err) {
      console.warn('Upcoming upload notice:', err.message);
    } finally {
      setUploadingUpcomingImage(false);
    }
  };

  const resetUpcomingForm = () => {
    setUpcomingEditingId(null);
    setUpcomingTitle('');
    setUpcomingReleaseDate('Nov 2026');
    setUpcomingProgress(75);
    setUpcomingDescription('');
    setUpcomingDemoUrl('');
    setUpcomingStatus('In Development');
    setUpcomingBannerUrl('');
    setUpcomingImageFile(null);
  };

  const handleSaveUpcoming = async (e) => {
    e.preventDefault();
    if (!upcomingTitle.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে প্রজেক্টের নাম দিন' : 'Please provide project name', 'error');
      return;
    }
    setFeatureActionLoading(true);
    try {
      const payload = {
        title: upcomingTitle.trim(),
        name: upcomingTitle.trim(),
        releaseDate: upcomingReleaseDate.trim(),
        progress: parseInt(upcomingProgress, 10) || 0,
        description: upcomingDescription.trim(),
        demoUrl: upcomingDemoUrl.trim(),
        githubUrl: upcomingDemoUrl.trim(),
        status: upcomingStatus,
        bannerUrl: upcomingBannerUrl.trim()
      };
      if (upcomingEditingId) {
        await updateFeatureItem(COLLECTIONS.UPCOMING_PROJECTS, upcomingEditingId, payload, idToken);
        showFeatureToast(isBangla ? '✓ আপকামিং প্রজেক্ট সফলভাবে আপডেট হয়েছে!' : '✓ Upcoming project updated successfully!');
      } else {
        await saveFeatureItem(COLLECTIONS.UPCOMING_PROJECTS, payload, idToken);
        showFeatureToast(isBangla ? '✓ নতুন আপকামিং প্রজেক্ট সফলভাবে যুক্ত হয়েছে!' : '✓ New upcoming project added successfully!');
      }
      resetUpcomingForm();
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  const handleEditUpcoming = (item) => {
    setUpcomingEditingId(item.id);
    setUpcomingTitle(item.title || item.name || '');
    setUpcomingReleaseDate(item.releaseDate || '');
    setUpcomingProgress(item.progress || 50);
    setUpcomingDescription(item.description || '');
    setUpcomingDemoUrl(item.demoUrl || item.githubUrl || '');
    setUpcomingStatus(item.status || 'In Development');
    setUpcomingBannerUrl(item.bannerUrl || '');
  };

  const handleDeleteUpcoming = async (item) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${item.title || item.name}" মুছে ফেলতে চান?` : `Delete "${item.title || item.name}"?`)) return;
    setFeatureActionLoading(true);
    try {
      await deleteFeatureItem(COLLECTIONS.UPCOMING_PROJECTS, item.id, idToken);
      showFeatureToast(isBangla ? '✓ আপকামিং প্রজেক্ট মুছে ফেলা হয়েছে!' : '✓ Upcoming project deleted successfully!');
      if (upcomingEditingId === item.id) resetUpcomingForm();
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  // --- TAB 3: FAVORITE TOOLS STATE ---
  const [favoriteEditingId, setFavoriteEditingId] = useState(null);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteCategory, setFavoriteCategory] = useState('Design');
  const [favoriteOfficialUrl, setFavoriteOfficialUrl] = useState('');
  const [favoriteRating, setFavoriteRating] = useState('5.0');
  const [favoriteThumbnailUrl, setFavoriteThumbnailUrl] = useState('/favorite.png');
  const [favoriteImageFile, setFavoriteImageFile] = useState(null);
  const [uploadingFavoriteImage, setUploadingFavoriteImage] = useState(false);
  const [favoriteDescription, setFavoriteDescription] = useState('');

  const handleFavoriteImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFavoriteImageFile(file);
    const localUrl = createLocalImagePreview(file);
    setFavoriteThumbnailUrl(localUrl);
    setUploadingFavoriteImage(true);
    try {
      const url = await uploadFileToStorage(file, 'favorites', idToken);
      setFavoriteThumbnailUrl(url);
      showFeatureToast(isBangla ? '✓ আইকন/থাম্বনেইল সফলভাবে আপলোড হয়েছে' : '✓ Icon uploaded to storage');
    } catch (err) {
      console.warn('Favorite upload notice:', err.message);
    } finally {
      setUploadingFavoriteImage(false);
    }
  };

  const resetFavoriteForm = () => {
    setFavoriteEditingId(null);
    setFavoriteName('');
    setFavoriteCategory('Design');
    setFavoriteOfficialUrl('');
    setFavoriteRating('5.0');
    setFavoriteThumbnailUrl('/favorite.png');
    setFavoriteImageFile(null);
    setFavoriteDescription('');
  };

  const handleSaveFavorite = async (e) => {
    e.preventDefault();
    if (!favoriteName.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে টুলের নাম দিন' : 'Please provide tool name', 'error');
      return;
    }
    setFeatureActionLoading(true);
    try {
      const payload = {
        name: favoriteName.trim(),
        title: favoriteName.trim(),
        category: favoriteCategory,
        officialUrl: favoriteOfficialUrl.trim(),
        rating: favoriteRating.trim() || '5.0',
        thumbnailUrl: favoriteThumbnailUrl.trim() || '/favorite.png',
        description: favoriteDescription.trim()
      };
      if (favoriteEditingId) {
        await updateFeatureItem(COLLECTIONS.FAVORITE_TOOLS, favoriteEditingId, payload, idToken);
        showFeatureToast(isBangla ? '✓ ফেভারিট টুল সফলভাবে আপডেট হয়েছে!' : '✓ Favorite tool updated successfully!');
      } else {
        await saveFeatureItem(COLLECTIONS.FAVORITE_TOOLS, payload, idToken);
        showFeatureToast(isBangla ? '✓ নতুন ফেভারিট টুল সফলভাবে যুক্ত হয়েছে!' : '✓ New favorite tool added successfully!');
      }
      resetFavoriteForm();
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  const handleEditFavorite = (item) => {
    setFavoriteEditingId(item.id);
    setFavoriteName(item.name || item.title || '');
    setFavoriteCategory(item.category || 'Design');
    setFavoriteOfficialUrl(item.officialUrl || '');
    setFavoriteRating(item.rating || '5.0');
    setFavoriteThumbnailUrl(item.thumbnailUrl || '/favorite.png');
    setFavoriteDescription(item.description || item.note || '');
  };

  const handleDeleteFavorite = async (item) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${item.name || item.title}" মুছে ফেলতে চান?` : `Delete "${item.name || item.title}"?`)) return;
    setFeatureActionLoading(true);
    try {
      await deleteFeatureItem(COLLECTIONS.FAVORITE_TOOLS, item.id, idToken);
      showFeatureToast(isBangla ? '✓ ফেভারিট টুল মুছে ফেলা হয়েছে!' : '✓ Favorite tool deleted successfully!');
      if (favoriteEditingId === item.id) resetFavoriteForm();
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  // --- TAB 4: DEALS & DISCOUNTS STATE ---
  const [dealEditingId, setDealEditingId] = useState(null);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDiscountPercent, setDealDiscountPercent] = useState('75% OFF');
  const [dealDiscountCode, setDealDiscountCode] = useState('RASEDUL75');
  const [dealExpiryDate, setDealExpiryDate] = useState('2026-12-31');
  const [dealPartnerUrl, setDealPartnerUrl] = useState('');
  const [dealBannerUrl, setDealBannerUrl] = useState('/add1.png');
  const [dealImageFile, setDealImageFile] = useState(null);
  const [uploadingDealImage, setUploadingDealImage] = useState(false);
  const [dealDescription, setDealDescription] = useState('');

  const handleDealImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDealImageFile(file);
    const localUrl = createLocalImagePreview(file);
    setDealBannerUrl(localUrl);
    setUploadingDealImage(true);
    try {
      const url = await uploadFileToStorage(file, 'deals', idToken);
      setDealBannerUrl(url);
      showFeatureToast(isBangla ? '✓ ব্যানার ইমেজ সফলভাবে আপলোড হয়েছে' : '✓ Banner uploaded to storage');
    } catch (err) {
      console.warn('Deals upload notice:', err.message);
    } finally {
      setUploadingDealImage(false);
    }
  };

  const resetDealForm = () => {
    setDealEditingId(null);
    setDealTitle('');
    setDealDiscountPercent('75% OFF');
    setDealDiscountCode('RASEDUL75');
    setDealExpiryDate('2026-12-31');
    setDealPartnerUrl('');
    setDealBannerUrl('/add1.png');
    setDealImageFile(null);
    setDealDescription('');
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    if (!dealTitle.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে অফার টাইটেল দিন' : 'Please provide offer title', 'error');
      return;
    }
    setFeatureActionLoading(true);
    try {
      const payload = {
        title: dealTitle.trim(),
        discountPercent: dealDiscountPercent.trim(),
        discountCode: dealDiscountCode.trim(),
        expiryDate: dealExpiryDate.trim(),
        partnerUrl: dealPartnerUrl.trim(),
        bannerUrl: dealBannerUrl.trim() || '/add1.png',
        description: dealDescription.trim()
      };
      if (dealEditingId) {
        await updateFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, dealEditingId, payload, idToken);
        showFeatureToast(isBangla ? '✓ অফার ও ডিসকাউন্ট সফলভাবে আপডেট হয়েছে!' : '✓ Deal updated successfully!');
      } else {
        await saveFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, payload, idToken);
        showFeatureToast(isBangla ? '✓ নতুন অফার সফলভাবে যুক্ত হয়েছে!' : '✓ New deal added successfully!');
      }
      resetDealForm();
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  const handleEditDeal = (item) => {
    setDealEditingId(item.id);
    setDealTitle(item.title || '');
    setDealDiscountPercent(item.discountPercent || '');
    setDealDiscountCode(item.discountCode || '');
    setDealExpiryDate(item.expiryDate || '');
    setDealPartnerUrl(item.partnerUrl || '');
    setDealBannerUrl(item.bannerUrl || '/add1.png');
    setDealDescription(item.description || '');
  };

  const handleDeleteDeal = async (item) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${item.title}" মুছে ফেলতে চান?` : `Delete "${item.title}"?`)) return;
    setFeatureActionLoading(true);
    try {
      await deleteFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, item.id, idToken);
      showFeatureToast(isBangla ? '✓ অফার মুছে ফেলা হয়েছে!' : '✓ Deal deleted successfully!');
      if (dealEditingId === item.id) resetDealForm();
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

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

  // 4. PopScope / Nested Browser & Hardware Back Interception
  const activeAdminTabRef = useRef(activeAdminTab);
  useEffect(() => {
    activeAdminTabRef.current = activeAdminTab;
  }, [activeAdminTab]);

  useEffect(() => {
    // Initial history push for Admin modal
    window.history.pushState({ modal: 'admin', tab: 'overview' }, '');

    const handlePopState = () => {
      // If user is inside an admin sub-tab, intercept back press and return to overview dashboard
      if (activeAdminTabRef.current !== 'overview') {
        setActiveAdminTab('overview');
        window.history.pushState({ modal: 'admin', tab: 'overview' }, '');
      } else {
        // If user is on overview dashboard, exit admin modal back to home
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  const handleSelectAdminTab = (tabId) => {
    if (activeAdminTab === 'overview' && tabId !== 'overview') {
      window.history.pushState({ modal: 'admin', tab: tabId }, '');
    }
    setActiveAdminTab(tabId);
  };

  const handleAdminBack = () => {
    if (activeAdminTab !== 'overview') {
      setActiveAdminTab('overview');
    } else {
      onClose();
    }
  };

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
              maxWidth: '1600px',
              height: '92vh',
              maxHeight: '94vh',
              background: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 240, 255, 0.2)',
              position: 'relative',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
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
                <button
                  onClick={handleAdminBack}
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
                    cursor: 'pointer',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title={activeAdminTab !== 'overview' ? (isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview') : (isBangla ? 'হোমবারে ফিরুন' : 'Back to Home')}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>

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

            {/* 6-Tab Navigation Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {[
                { id: 'overview', labelBn: 'ড্যাশবোর্ড ওভারভিউ', labelEn: 'Overview', icon: LayoutDashboard, color: '#38BDF8' },
                { id: 'projects', labelBn: 'ওয়েব ও অ্যাপস', labelEn: 'Web & Apps', icon: FolderGit2, color: '#00F0FF' },
                { id: 'design', labelBn: 'ডিজাইন প্রজেক্ট', labelEn: 'Design Project', icon: Palette, color: '#00E5FF' },
                { id: 'upcoming', labelBn: 'আপকামিং প্রজেক্ট', labelEn: 'Upcoming Project', icon: Rocket, color: '#C084FC' },
                { id: 'favorite', labelBn: 'ফেভারিট টুলস', labelEn: 'Favorite Tools', icon: Star, color: '#FFB300' },
                { id: 'deals', labelBn: 'ডিল ও ডিসকাউন্ট', labelEn: 'Deals & Discounts', icon: Percent, color: '#10B981' }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectAdminTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      background: isActive ? `${tab.color}22` : 'rgba(255, 255, 255, 0.04)',
                      border: `1.5px solid ${isActive ? tab.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isActive ? `0 4px 16px ${tab.color}44` : 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                    }}
                  >
                    <IconComp size={15} color={tab.color} />
                    <span>{isBangla ? tab.labelBn : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Green / Error Toast Notification */}
            {featureToast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '18px',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: featureToast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1.5px solid ${featureToast.type === 'error' ? '#EF4444' : '#10B981'}`,
                  color: featureToast.type === 'error' ? '#F87171' : '#10B981',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
                  fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                }}
              >
                {featureToast.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle size={17} />}
                <span>{featureToast.text}</span>
              </motion.div>
            )}

            {/* TAB: CENTRAL OVERVIEW DASHBOARD */}
            {activeAdminTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Dashboard Summary Status Banner */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38BDF8'
                    }}>
                      <Activity size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {isBangla ? 'রিয়েলটাইম সেন্ট্রাল কন্ট্রোল ড্যাশবোর্ড' : 'Central Control Real-Time Overview'}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                        {isBangla ? 'ফায়ারস্টোর লাইভ সিঙ্ক ও ডিভাইস গ্যালারি স্টোরেজ হাব' : 'Live Firestore synchronization & device gallery storage hub'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#10B981',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                      <span>{isBangla ? 'লাইভ সিঙ্ক চালু' : 'Live Sync Active'}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(0, 240, 255, 0.12)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      color: '#00F0FF',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      <Upload size={13} />
                      <span>{isBangla ? 'ডিরেক্ট গ্যালারি স্টোরেজ' : 'Direct Gallery Upload'}</span>
                    </div>
                  </div>
                </div>

                {/* 5 Real-Time Status & Counter Cards Grid (Miniaturized & Scroll-Free) */}
                <div
                  className="admin-overview-grid"
                  style={{
                    display: 'grid',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* CARD 1: DESIGN PROJECTS */}
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.DESIGN_PROJECTS}>
                    {({ data }) => {
                      const count = (data || []).length;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('design')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(0, 229, 255, 0.16), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(0, 229, 255, 0.35)',
                            boxShadow: '0 4px 16px rgba(0, 229, 255, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(0, 229, 255, 0.2)',
                              border: '1px solid rgba(0, 229, 255, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#00E5FF',
                              flexShrink: 0
                            }}>
                              <Palette size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#00E5FF',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2
                              }}>
                                {isBangla ? 'ডিজাইন প্রজেক্ট' : 'Design Projects'}
                              </h4>
                              <span style={{
                                fontSize: '10.5px',
                                color: '#94A3B8',
                                display: 'block',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? 'লাইভ সিঙ্ক' : 'Live Stream'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '17px',
                              fontWeight: 900,
                              color: '#FFFFFF',
                              fontFamily: "'Space Grotesk', monospace",
                              lineHeight: 1
                            }}>
                              {count}
                            </span>
                            <ChevronRight size={14} color="#00E5FF" opacity={0.8} />
                          </div>
                        </motion.div>
                      );
                    }}
                  </FirestoreStreamBuilder>

                  {/* CARD 2: UPCOMING PROJECTS */}
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.UPCOMING_PROJECTS}>
                    {({ data }) => {
                      const count = (data || []).length;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('upcoming')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(192, 132, 252, 0.16), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(192, 132, 252, 0.35)',
                            boxShadow: '0 4px 16px rgba(192, 132, 252, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(192, 132, 252, 0.2)',
                              border: '1px solid rgba(192, 132, 252, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#C084FC',
                              flexShrink: 0
                            }}>
                              <Rocket size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#C084FC',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2
                              }}>
                                {isBangla ? 'আপকামিং প্রজেক্ট' : 'Upcoming Projects'}
                              </h4>
                              <span style={{
                                fontSize: '10.5px',
                                color: '#94A3B8',
                                display: 'block',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? 'চলমান পাইপলাইন' : 'Pipeline'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '17px',
                              fontWeight: 900,
                              color: '#FFFFFF',
                              fontFamily: "'Space Grotesk', monospace",
                              lineHeight: 1
                            }}>
                              {count}
                            </span>
                            <ChevronRight size={14} color="#C084FC" opacity={0.8} />
                          </div>
                        </motion.div>
                      );
                    }}
                  </FirestoreStreamBuilder>

                  {/* CARD 3: FAVORITE TOOLS */}
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.FAVORITE_TOOLS}>
                    {({ data }) => {
                      const count = (data || []).length;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('favorite')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(255, 179, 0, 0.16), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(255, 179, 0, 0.35)',
                            boxShadow: '0 4px 16px rgba(255, 179, 0, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(255, 179, 0, 0.2)',
                              border: '1px solid rgba(255, 179, 0, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFB300',
                              flexShrink: 0
                            }}>
                              <Star size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#FFB300',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2
                              }}>
                                {isBangla ? 'ফেভারিট টুলস' : 'Favorite Tools'}
                              </h4>
                              <span style={{
                                fontSize: '10.5px',
                                color: '#94A3B8',
                                display: 'block',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? 'কিউরেটেড টুলস' : 'Curated'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '17px',
                              fontWeight: 900,
                              color: '#FFFFFF',
                              fontFamily: "'Space Grotesk', monospace",
                              lineHeight: 1
                            }}>
                              {count}
                            </span>
                            <ChevronRight size={14} color="#FFB300" opacity={0.8} />
                          </div>
                        </motion.div>
                      );
                    }}
                  </FirestoreStreamBuilder>

                  {/* CARD 4: DEALS & DISCOUNTS */}
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.DEALS_DISCOUNTS}>
                    {({ data }) => {
                      const count = (data || []).length;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('deals')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.16), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(16, 185, 129, 0.35)',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#10B981',
                              flexShrink: 0
                            }}>
                              <Percent size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#10B981',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2
                              }}>
                                {isBangla ? 'ডিল ও ডিসকাউন্ট' : 'Deals & Discounts'}
                              </h4>
                              <span style={{
                                fontSize: '10.5px',
                                color: '#94A3B8',
                                display: 'block',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? 'অফার ও কুপন' : 'Active Deals'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '17px',
                              fontWeight: 900,
                              color: '#FFFFFF',
                              fontFamily: "'Space Grotesk', monospace",
                              lineHeight: 1
                            }}>
                              {count}
                            </span>
                            <ChevronRight size={14} color="#10B981" opacity={0.8} />
                          </div>
                        </motion.div>
                      );
                    }}
                  </FirestoreStreamBuilder>

                  {/* CARD 5: SEE PROJECTS (WEB & APPS SHOWCASE) */}
                  <FirestoreStreamBuilder collectionName="projects">
                    {({ data }) => {
                      const count = (data || []).length;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('projects')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(0, 240, 255, 0.16), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(0, 240, 255, 0.35)',
                            boxShadow: '0 4px 16px rgba(0, 240, 255, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(0, 240, 255, 0.2)',
                              border: '1px solid rgba(0, 240, 255, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#00F0FF',
                              flexShrink: 0
                            }}>
                              <FolderGit2 size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#00F0FF',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2
                              }}>
                                {isBangla ? 'ওয়েব ও অ্যাপস' : 'Web & Apps'}
                              </h4>
                              <span style={{
                                fontSize: '10.5px',
                                color: '#94A3B8',
                                display: 'block',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? 'লাইভ শোকেস' : 'Showcase'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '17px',
                              fontWeight: 900,
                              color: '#FFFFFF',
                              fontFamily: "'Space Grotesk', monospace",
                              lineHeight: 1
                            }}>
                              {count}
                            </span>
                            <ChevronRight size={14} color="#00F0FF" opacity={0.8} />
                          </div>
                        </motion.div>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </div>
              </div>
            )}

            {/* TAB: DEDICATED REALTIME PROJECTS (APPS & WEBSITE) MANAGER */}
            {activeAdminTab === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Dedicated Top-Left Navigation Back Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <button
                    onClick={() => setActiveAdminTab('overview')}
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
                      cursor: 'pointer',
                      color: '#00F0FF',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}
                    title={isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview'}
                    aria-label="Back to Overview"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {isBangla ? '← ড্যাশবোর্ড ওভারভিউতে ফিরুন' : '← Back to Overview Dashboard'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>
                      {isBangla ? 'প্রজেক্ট ও শোকেস লাইভ ম্যানেজমেন্ট (Firestore)' : 'Projects & Showcase Live Management (Firestore)'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                
                  {/* Left Column: Add / Edit Form */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#00F0FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderGit2 size={18} />
                      <span>{projectEditingId ? (isBangla ? 'প্রজেক্ট সম্পাদনা করুন' : 'Edit Project') : (isBangla ? 'নতুন প্রজেক্ট যুক্ত করুন' : 'Add New Project')}</span>
                    </h3>

                    <form onSubmit={handleSaveProjectsItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Category Selector */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'ক্যাটাগরি *' : 'Category *'}</label>
                        <select
                          value={projectCategory}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setProjectCategory(newCat);
                            if (newCat === 'apps' && projectMediaUrl.includes('banner')) {
                              setProjectMediaUrl('/icons/hisabnama-icon.png');
                            } else if (newCat === 'website' && projectMediaUrl.includes('icon')) {
                              setProjectMediaUrl('/banners/madrasah-banner.jpg');
                            }
                          }}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.86rem' }}
                        >
                          <option value="apps">Apps (Mobile Application)</option>
                          <option value="website">Website (Web Application)</option>
                        </select>
                      </div>

                      {/* Project Title */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'প্রজেক্টের নাম (Project Title) *' : 'Project Title *'}</label>
                        <input
                          type="text"
                          required
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder={projectCategory === 'apps' ? 'e.g., HisabNama / Naf Sports' : 'e.g., Sufia Nuria Madrasah'}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Sub-category / Platform */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'সাব-ক্যাটেগরি / প্ল্যাটফর্ম (Sub-category / Platform)' : 'Sub-category / Platform'}</label>
                        <input
                          type="text"
                          value={projectSubCategory}
                          onChange={(e) => setProjectSubCategory(e.target.value)}
                          placeholder={projectCategory === 'apps' ? 'e.g., Finance & Productivity / Android' : 'e.g., React, Node.js & Vite'}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Media URL (Apps: Icon URL, Website: Banner URL) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                            {projectCategory === 'apps'
                              ? (isBangla ? 'অ্যাপ আইকন URL (Icon URL) *' : 'App Icon URL (Media URL) *')
                              : (isBangla ? 'ওয়েবসাইট ব্যানার URL (Banner URL) *' : 'Website Banner URL (Media URL) *')}
                          </label>
                        </div>
                        <input
                          type="text"
                          value={projectMediaUrl}
                          onChange={(e) => setProjectMediaUrl(e.target.value)}
                          placeholder={projectCategory === 'apps' ? '/icons/hisabnama-icon.png or https://...' : '/banners/madrasah-banner.jpg or https://...'}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />

                        {/* Quick Presets from public/ folder */}
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Quick public/ assets:</span>
                          {(projectCategory === 'apps'
                            ? [
                                { label: 'HisabNama', path: '/icons/hisabnama-icon.png' },
                                { label: 'NafSports', path: '/icons/nafsports-icon.png' },
                                { label: 'GoEasy', path: '/icons/goeasy-icon.png' },
                                { label: 'App1', path: '/app1.png' },
                                { label: 'App2', path: '/app2.png' }
                              ]
                            : [
                                { label: 'Madrasah', path: '/banners/madrasah-banner.jpg' },
                                { label: 'ESheba', path: '/banners/esheba-banner.jpg' },
                                { label: 'Community', path: '/banners/community-banner.jpg' },
                                { label: 'Add1', path: '/add1.png' },
                                { label: 'Add2', path: '/add2.png' }
                              ]
                          ).map((preset) => (
                            <button
                              key={preset.path}
                              type="button"
                              onClick={() => setProjectMediaUrl(preset.path)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: projectMediaUrl === preset.path ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${projectMediaUrl === preset.path ? '#00F0FF' : 'rgba(255, 255, 255, 0.1)'}`,
                                color: projectMediaUrl === preset.path ? '#00F0FF' : '#CBD5E1',
                                fontSize: '0.68rem',
                                cursor: 'pointer'
                              }}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        {/* Device File Picker Upload Button */}
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{
                            padding: '6px 12px',
                            background: 'rgba(0, 240, 255, 0.12)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '8px',
                            color: '#00F0FF',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.78rem'
                          }}>
                            <Upload size={14} />
                            <span>{uploadingProjectMedia ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBangla ? 'গ্যালারি থেকে ছবি আপলোড' : 'Upload from Device')}</span>
                            <input type="file" accept="image/*" onChange={handleProjectMediaChange} style={{ display: 'none' }} />
                          </label>

                          {/* Live Media Preview Thumbnail */}
                          {projectMediaUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: projectCategory === 'apps' ? '42px' : '64px',
                                height: '42px',
                                borderRadius: projectCategory === 'apps' ? '50%' : '8px',
                                overflow: 'hidden',
                                border: '1.5px solid #00F0FF',
                                background: '#0B1329',
                                flexShrink: 0
                              }}>
                                <img
                                  src={projectMediaUrl}
                                  alt="Preview"
                                  onError={(e) => { e.target.src = projectCategory === 'apps' ? '/app1.png' : '/add1.png'; }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#10B981' }}>✓ {isBangla ? 'মিডিয়া প্রস্তুত' : 'Media Ready'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action URL */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          {projectCategory === 'apps'
                            ? (isBangla ? 'গুগল প্লে স্টোর লিংক (Action URL)' : 'Google Play Store Link (Action URL)')
                            : (isBangla ? 'ওয়েবসাইট লাইভ লিংক (Action URL)' : 'Live Website Link (Action URL)')}
                        </label>
                        <input
                          type="url"
                          value={projectActionUrl}
                          onChange={(e) => setProjectActionUrl(e.target.value)}
                          placeholder={projectCategory === 'apps' ? 'https://play.google.com/store/apps/details?id=...' : 'https://example.com'}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Short Description */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'সংক্ষিপ্ত বিবরণ (Short Description)' : 'Short Description'}</label>
                        <textarea
                          rows={3}
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          placeholder="Brief description of the app or website project..."
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                      </div>

                      {/* Submit & Cancel Buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button
                          type="submit"
                          disabled={featureActionLoading || uploadingProjectMedia}
                          style={{
                            flex: 1,
                            padding: '11px',
                            background: 'linear-gradient(135deg, #00838F 0%, #00F0FF 100%)',
                            color: '#000',
                            fontWeight: 800,
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.88rem'
                          }}
                        >
                          {featureActionLoading ? (isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving to Firestore...') : (projectEditingId ? (isBangla ? 'প্রজেক্ট আপডেট করুন' : 'Update Project') : (isBangla ? 'ফায়ারস্টোরে পাবলিশ করুন' : 'Publish to Firestore'))}
                        </button>
                        {projectEditingId && (
                          <button
                            type="button"
                            onClick={resetProjectsForm}
                            style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem' }}
                          >
                            {isBangla ? 'বাতিল' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Existing Projects List (Streamed Realtime from Firestore) */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <FirestoreStreamBuilder collectionName="projects">
                      {({ data }) => {
                        const list = data || [];
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px 0' }}>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={17} color="#00F0FF" />
                                <span>{isBangla ? `বিদ্যমান প্রজেক্টসমূহ (${list.length})` : `Existing Projects (${list.length})`}</span>
                              </h3>
                              <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                                <span>Firestore Live</span>
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                              {list.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                  {isBangla ? 'কোনো প্রজেক্ট পাওয়া যায়নি। বামপাশের ফর্ম পূরণ করে যুক্ত করুন।' : 'No projects found in Firestore. Add one using the form on the left.'}
                                </div>
                              ) : (
                                list.map((item) => {
                                  const isApp = (item.category || '').toLowerCase() === 'apps' || (item.category || '').toLowerCase() === 'app';
                                  const media = item.mediaUrl || item.icon || item.banner || item.thumbnail?.imageUrl || (isApp ? '/icons/hisabnama-icon.png' : '/banners/madrasah-banner.jpg');
                                  const actionUrl = item.actionUrl || item.playStoreUrl || item.liveUrl || item.link;

                                  return (
                                    <div
                                      key={item.id}
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
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                        {/* Media Preview (circular for app, rounded for web) */}
                                        <div style={{
                                          width: isApp ? '40px' : '48px',
                                          height: '40px',
                                          borderRadius: isApp ? '50%' : '8px',
                                          overflow: 'hidden',
                                          background: '#0B1329',
                                          border: isApp ? '1.5px solid #10B981' : '1.5px solid #00F0FF',
                                          flexShrink: 0
                                        }}>
                                          <img
                                            src={media}
                                            alt={item.title}
                                            onError={(e) => { e.target.src = isApp ? '/app1.png' : '/add1.png'; }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          />
                                        </div>

                                        <div style={{ minWidth: 0, flex: 1 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {item.title || item.name || 'Untitled'}
                                            </h4>
                                            <span style={{
                                              fontSize: '0.64rem',
                                              fontWeight: 800,
                                              padding: '1px 6px',
                                              borderRadius: '4px',
                                              background: isApp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                                              color: isApp ? '#10B981' : '#00F0FF'
                                            }}>
                                              {isApp ? 'Apps' : 'Website'}
                                            </span>
                                          </div>

                                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {item.subCategory && (
                                              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.subCategory}</span>
                                            )}
                                            {actionUrl && (
                                              <a
                                                href={actionUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.68rem', color: '#00F0FF', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                                              >
                                                <span>Link</span>
                                                <ExternalLink size={10} />
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons: Edit and Delete */}
                                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        <button
                                          onClick={() => handleEditProjectItem(item)}
                                          style={{ padding: '6px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0,240,255,0.3)', color: '#00F0FF', borderRadius: '6px', cursor: 'pointer' }}
                                          title={isBangla ? 'সম্পাদনা করুন' : 'Edit'}
                                        >
                                          <Edit3 size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProjectItem(item)}
                                          style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: '6px', cursor: 'pointer' }}
                                          title={isBangla ? 'মুছে ফেলুন' : 'Delete'}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </>
                        );
                      }}
                    </FirestoreStreamBuilder>
                  </div>

                </div>
              </div>
            )}

          {/* TAB 1: DESIGN PROJECT MANAGER */}
          {activeAdminTab === 'design' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dedicated Top-Left Navigation Back Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  onClick={() => setActiveAdminTab('overview')}
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
                    cursor: 'pointer',
                    color: '#00E5FF',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title={isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview'}
                  aria-label="Back to Overview"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {isBangla ? '← ড্যাশবোর্ড ওভারভিউতে ফিরুন' : '← Back to Overview Dashboard'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>
                    {isBangla ? 'ডিজাইন প্রজেক্ট ম্যানেজমেন্ট' : 'Design Projects Management'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Form Column */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#00E5FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={18} />
                    <span>{designEditingId ? (isBangla ? 'ডিজাইন প্রজেক্ট সম্পাদনা' : 'Edit Design Project') : (isBangla ? 'নতুন ডিজাইন প্রজেক্ট যুক্ত করুন' : 'Add New Design Project')}</span>
                  </h3>

                  <form onSubmit={handleSaveDesign} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'প্রজেক্ট টাইটেল *' : 'Project Title *'}</label>
                      <input
                        type="text"
                        required
                        value={designTitle}
                        onChange={(e) => setDesignTitle(e.target.value)}
                        placeholder="e.g., FinTech Mobile Banking App"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'সাবটাইটেল / বিবরণ' : 'Subtitle / Description'}</label>
                      <textarea
                        rows={2}
                        value={designSubtitle}
                        onChange={(e) => setDesignSubtitle(e.target.value)}
                        placeholder="e.g., Modern UI/UX Glassmorphism experience with interactive charts"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'ক্যাটাগরি' : 'Category'}</label>
                        <select
                          value={designCategory}
                          onChange={(e) => setDesignCategory(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        >
                          <option value="UI/UX Design">UI/UX Design</option>
                          <option value="Web Design">Web Design</option>
                          <option value="Branding">Branding</option>
                          <option value="Graphic Design">Graphic Design</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'স্ট্যাটাস' : 'Status'}</label>
                        <select
                          value={designStatus}
                          onChange={(e) => setDesignStatus(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        >
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'প্রজেক্ট লিঙ্ক (Behance / Drive / Figma)' : 'Project Link (Behance / Drive / Figma)'}</label>
                      <input
                        type="url"
                        value={designProjectUrl}
                        onChange={(e) => setDesignProjectUrl(e.target.value)}
                        placeholder="https://behance.net/..."
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Direct Device Gallery File Picker (NO URL Input) */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        {isBangla ? 'ডিভাইস গ্যালারি থেকে ছবি নির্বাচন (Direct File Picker) *' : 'Direct Device Gallery / File Picker *'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(0, 229, 255, 0.15)',
                          border: '1.5px solid #00E5FF',
                          color: '#00E5FF',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <Upload size={16} />
                          <span>
                            {uploadingDesignImage
                              ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading to Storage...')
                              : (isBangla ? 'গ্যালারি থেকে ছবি বাছুন' : 'Choose from Gallery')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDesignImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {designImageUrl && (
                          <span style={{ fontSize: '0.76rem', color: '#4ADE80', fontWeight: 700 }}>
                            {uploadingDesignImage ? (isBangla ? 'স্টোরেজে সেভ হচ্ছে...' : 'Uploading...') : (isBangla ? '✓ ছবি প্রস্তুত' : '✓ Image Ready')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.05)', border: '1px dashed rgba(0, 229, 255, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#00E5FF', fontSize: '0.74rem', fontWeight: 800 }}>
                        <Sparkles size={13} />
                        <span>{isBangla ? 'লাইভ প্রিভিউ কার্ড' : 'Live Preview Card'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                          <img src={designImageUrl || '/app1.png'} alt="Preview" onError={(e) => { e.target.src = '/app1.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{designTitle || 'Project Title'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{designSubtitle || 'Subtitle / Description'}</div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                            <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.2)', color: '#00E5FF' }}>{designCategory}</span>
                            <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '4px', background: designStatus === 'Draft' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)', color: '#fff' }}>{designStatus}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="submit"
                        disabled={featureActionLoading}
                        style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00838F 0%, #00E5FF 100%)', color: '#000', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        {featureActionLoading ? 'Saving...' : (designEditingId ? (isBangla ? 'আপডেট করুন' : 'Update Design') : (isBangla ? 'সংরক্ষণ করুন' : 'Save Design Project'))}
                      </button>
                      {designEditingId && (
                        <button
                          type="button"
                          onClick={resetDesignForm}
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
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.DESIGN_PROJECTS}>
                    {({ data }) => {
                      const list = data || [];
                      return (
                        <>
                          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Palette size={17} color="#00E5FF" />
                            <span>{isBangla ? `ডিজাইন প্রজেক্ট তালিকা (${list.length})` : `Existing Designs (${list.length})`}</span>
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                            {list.map((item) => (
                              <div
                                key={item.id}
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
                                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#0b1329', flexShrink: 0 }}>
                                    <img src={item.imageUrl || '/app1.png'} alt={item.title} onError={(e) => { e.target.src = '/app1.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '0.86rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.7rem', color: '#00E5FF' }}>{item.category}</span>
                                      <span style={{ fontSize: '0.64rem', color: item.status === 'Draft' ? '#F87171' : '#4ADE80' }}>• {item.status || 'Active'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => handleEditDesign(item)}
                                    style={{ padding: '6px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Edit"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDesign(item)}
                                    style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPCOMING PROJECT MANAGER */}
          {activeAdminTab === 'upcoming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dedicated Top-Left Navigation Back Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  onClick={() => setActiveAdminTab('overview')}
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
                    cursor: 'pointer',
                    color: '#C084FC',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title={isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview'}
                  aria-label="Back to Overview"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {isBangla ? '← ড্যাশবোর্ড ওভারভিউতে ফিরুন' : '← Back to Overview Dashboard'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>
                    {isBangla ? 'আপকামিং প্রজেক্ট ম্যানেজমেন্ট' : 'Upcoming Projects Management'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Form Column */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#C084FC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Rocket size={18} />
                    <span>{upcomingEditingId ? (isBangla ? 'আপকামিং প্রজেক্ট সম্পাদনা' : 'Edit Upcoming Project') : (isBangla ? 'নতুন আপকামিং প্রজেক্ট যুক্ত করুন' : 'Add New Upcoming Project')}</span>
                  </h3>

                  <form onSubmit={handleSaveUpcoming} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'প্রজেক্ট নাম *' : 'Project Name *'}</label>
                      <input
                        type="text"
                        required
                        value={upcomingTitle}
                        onChange={(e) => setUpcomingTitle(e.target.value)}
                        placeholder="e.g., NafPay Digital Smart Wallet"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'সম্ভাব্য রিলিজ তারিখ' : 'Target Release Date'}</label>
                        <input
                          type="text"
                          value={upcomingReleaseDate}
                          onChange={(e) => setUpcomingReleaseDate(e.target.value)}
                          placeholder="e.g., Nov 2026 or Q1 2027"
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'স্ট্যাটাস' : 'Status'}</label>
                        <select
                          value={upcomingStatus}
                          onChange={(e) => setUpcomingStatus(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        >
                          <option value="In Development">In Development</option>
                          <option value="Planning">Planning</option>
                          <option value="Beta">Beta</option>
                        </select>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'ডেভেলপমেন্ট স্টেজ / প্রগ্রেস' : 'Development Stage / Progress'}</label>
                        <span style={{ fontSize: '0.85rem', color: '#C084FC', fontWeight: 900 }}>{upcomingProgress}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={upcomingProgress}
                        onChange={(e) => setUpcomingProgress(e.target.value)}
                        style={{ width: '100%', accentColor: '#C084FC' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'বিবরণ' : 'Description'}</label>
                      <textarea
                        rows={2}
                        value={upcomingDescription}
                        onChange={(e) => setUpcomingDescription(e.target.value)}
                        placeholder="e.g., Ultra-fast contactless payment gateway for regional merchants"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'গিটহাব / ডেমো প্রিভিউ লিঙ্ক' : 'GitHub / Demo Preview Link'}</label>
                      <input
                        type="url"
                        value={upcomingDemoUrl}
                        onChange={(e) => setUpcomingDemoUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Direct Device Gallery File Picker (Upcoming Project Visual / Banner) */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        {isBangla ? 'গ্যালারি থেকে প্রজেক্ট প্রিভিউ বা ব্যানার (ঐচ্ছিক)' : 'Project Visual / Banner from Gallery (Optional)'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(192, 132, 252, 0.15)',
                          border: '1.5px solid #C084FC',
                          color: '#C084FC',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <Upload size={16} />
                          <span>
                            {uploadingUpcomingImage
                              ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading to Storage...')
                              : (isBangla ? 'গ্যালারি থেকে ছবি বাছুন' : 'Choose from Gallery')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpcomingImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {upcomingBannerUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #C084FC' }}>
                              <img src={upcomingBannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <button
                              type="button"
                              onClick={() => setUpcomingBannerUrl('')}
                              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              {isBangla ? 'মুছুন' : 'Remove'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(106, 27, 154, 0.08)', border: '1px dashed rgba(192, 132, 252, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#C084FC', fontSize: '0.74rem', fontWeight: 800 }}>
                        <Sparkles size={13} />
                        <span>{isBangla ? 'লাইভ প্রিভিউ কার্ড' : 'Live Preview Card'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff' }}>{upcomingTitle || 'Upcoming Project Name'}</div>
                        <span style={{ fontSize: '0.64rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.2)', color: '#C084FC' }}>{upcomingStatus}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Target: {upcomingReleaseDate || 'TBD'}</div>
                      <div style={{ marginTop: '6px', height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${upcomingProgress}%`, height: '100%', background: 'linear-gradient(90deg, #6A1B9A, #C084FC)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="submit"
                        disabled={featureActionLoading}
                        style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6A1B9A 0%, #C084FC 100%)', color: '#FFFFFF', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        {featureActionLoading ? 'Saving...' : (upcomingEditingId ? (isBangla ? 'আপডেট করুন' : 'Update Project') : (isBangla ? 'সংরক্ষণ করুন' : 'Save Upcoming Project'))}
                      </button>
                      {upcomingEditingId && (
                        <button
                          type="button"
                          onClick={resetUpcomingForm}
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
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.UPCOMING_PROJECTS}>
                    {({ data }) => {
                      const list = data || [];
                      return (
                        <>
                          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Rocket size={17} color="#C084FC" />
                            <span>{isBangla ? `আসন্ন প্রজেক্ট তালিকা (${list.length})` : `Upcoming Pipeline (${list.length})`}</span>
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                            {list.map((item) => (
                              <div
                                key={item.id}
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
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <h4 style={{ margin: 0, fontSize: '0.86rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || item.name}</h4>
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#C084FC', fontWeight: 800 }}>{item.progress}%</span>
                                    <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{item.releaseDate}</span>
                                    <span style={{ fontSize: '0.64rem', color: '#A855F7' }}>• {item.status}</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => handleEditUpcoming(item)}
                                    style={{ padding: '6px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#C084FC', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Edit"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUpcoming(item)}
                                    style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAVORITE TOOLS MANAGER */}
          {activeAdminTab === 'favorite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dedicated Top-Left Navigation Back Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  onClick={() => setActiveAdminTab('overview')}
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
                    cursor: 'pointer',
                    color: '#FFB300',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title={isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview'}
                  aria-label="Back to Overview"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {isBangla ? '← ড্যাশবোর্ড ওভারভিউতে ফিরুন' : '← Back to Overview Dashboard'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>
                    {isBangla ? 'ফেভারিট টুলস ও রিসোর্স ম্যানেজমেন্ট' : 'Favorite Tools & Resource Management'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Form Column */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 179, 0, 0.2)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#FFB300', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} />
                    <span>{favoriteEditingId ? (isBangla ? 'ফেভারিট টুল সম্পাদনা' : 'Edit Favorite Tool') : (isBangla ? 'নতুন ফেভারিট টুল যুক্ত করুন' : 'Add New Favorite Tool')}</span>
                  </h3>

                  <form onSubmit={handleSaveFavorite} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'টুলের নাম / আইটেম *' : 'Tool Name / Item *'}</label>
                      <input
                        type="text"
                        required
                        value={favoriteName}
                        onChange={(e) => setFavoriteName(e.target.value)}
                        placeholder="e.g., Figma"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'ক্যাটাগরি' : 'Category'}</label>
                        <select
                          value={favoriteCategory}
                          onChange={(e) => setFavoriteCategory(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        >
                          <option value="Design">Design</option>
                          <option value="Coding">Coding</option>
                          <option value="Productivity">Productivity</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'রেটিং / নোট' : 'Rating / Note'}</label>
                        <input
                          type="text"
                          value={favoriteRating}
                          onChange={(e) => setFavoriteRating(e.target.value)}
                          placeholder="e.g., 5.0"
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'অফিশিয়াল লিঙ্ক' : 'Official Link'}</label>
                      <input
                        type="url"
                        value={favoriteOfficialUrl}
                        onChange={(e) => setFavoriteOfficialUrl(e.target.value)}
                        placeholder="https://figma.com"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Direct Device Gallery File Picker (NO URL Input) */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        {isBangla ? 'গ্যালারি থেকে আইকন বা থাম্বনেইল নির্বাচন *' : 'Icon / Thumbnail from Device Gallery *'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(255, 179, 0, 0.15)',
                          border: '1.5px solid #FFB300',
                          color: '#FFB300',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <Upload size={16} />
                          <span>
                            {uploadingFavoriteImage
                              ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading to Storage...')
                              : (isBangla ? 'গ্যালারি থেকে ছবি বাছুন' : 'Choose from Gallery')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFavoriteImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {favoriteThumbnailUrl && (
                          <span style={{ fontSize: '0.76rem', color: '#4ADE80', fontWeight: 700 }}>
                            {uploadingFavoriteImage ? (isBangla ? 'স্টোরেজে সেভ হচ্ছে...' : 'Uploading...') : (isBangla ? '✓ আইকন প্রস্তুত' : '✓ Icon Ready')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'বিবরণ / নোট' : 'Description / Note'}</label>
                      <textarea
                        rows={2}
                        value={favoriteDescription}
                        onChange={(e) => setFavoriteDescription(e.target.value)}
                        placeholder="e.g., Collaborative vector design and interactive prototyping suite"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    {/* Live Preview Card */}
                    <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(245, 127, 23, 0.08)', border: '1px dashed rgba(255, 179, 0, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#FFB300', fontSize: '0.74rem', fontWeight: 800 }}>
                        <Sparkles size={13} />
                        <span>{isBangla ? 'লাইভ প্রিভিউ কার্ড' : 'Live Preview Card'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', background: '#0b1329', border: '1px solid rgba(255, 179, 0, 0.3)' }}>
                          <img src={favoriteThumbnailUrl || '/favorite.png'} alt="Preview" onError={(e) => { e.target.src = '/favorite.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff' }}>{favoriteName || 'Tool Name'}</span>
                            <span style={{ fontSize: '0.7rem', color: '#FFB300', fontWeight: 800 }}>★ {favoriteRating}</span>
                          </div>
                          <span style={{ fontSize: '0.64rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 127, 23, 0.2)', color: '#FFB300' }}>{favoriteCategory}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="submit"
                        disabled={featureActionLoading}
                        style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #F57F17 0%, #FFB300 100%)', color: '#000', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        {featureActionLoading ? 'Saving...' : (favoriteEditingId ? (isBangla ? 'আপডেট করুন' : 'Update Tool') : (isBangla ? 'সংরক্ষণ করুন' : 'Save Favorite Tool'))}
                      </button>
                      {favoriteEditingId && (
                        <button
                          type="button"
                          onClick={resetFavoriteForm}
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
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.FAVORITE_TOOLS}>
                    {({ data }) => {
                      const list = data || [];
                      return (
                        <>
                          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={17} color="#FFB300" />
                            <span>{isBangla ? `ফেভারিট টুলস তালিকা (${list.length})` : `Favorite Tools (${list.length})`}</span>
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                            {list.map((item) => (
                              <div
                                key={item.id}
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
                                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', background: '#0b1329', flexShrink: 0 }}>
                                    <img src={item.thumbnailUrl || '/favorite.png'} alt={item.name} onError={(e) => { e.target.src = '/favorite.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <h4 style={{ margin: 0, fontSize: '0.86rem', color: '#fff' }}>{item.name || item.title}</h4>
                                      <span style={{ fontSize: '0.68rem', color: '#FFB300', fontWeight: 800 }}>★ {item.rating}</span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{item.category}</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => handleEditFavorite(item)}
                                    style={{ padding: '6px', background: 'rgba(255, 179, 0, 0.1)', border: '1px solid rgba(255,179,0,0.3)', color: '#FFB300', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Edit"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFavorite(item)}
                                    style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEALS & DISCOUNTS MANAGER */}
          {activeAdminTab === 'deals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dedicated Top-Left Navigation Back Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  onClick={() => setActiveAdminTab('overview')}
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
                    cursor: 'pointer',
                    color: '#10B981',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title={isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview'}
                  aria-label="Back to Overview"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {isBangla ? '← ড্যাশবোর্ড ওভারভিউতে ফিরুন' : '← Back to Overview Dashboard'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>
                    {isBangla ? 'ডিল ও ডিসকাউন্ট অফার ম্যানেজমেন্ট' : 'Deals & Discounts Offer Management'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddDealModalOpen(true)}
                  style={{
                    marginLeft: 'auto',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.25) 100%)',
                    border: '1.5px solid #06B6D4',
                    color: '#22D3EE',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <Plus size={15} />
                  <span>{isBangla ? '+ নতুন ডিল মডাল' : '+ Open Add Deal Modal'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Form Column */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Percent size={18} />
                    <span>{dealEditingId ? (isBangla ? 'অফার ও ডিসকাউন্ট সম্পাদনা' : 'Edit Deal & Discount') : (isBangla ? 'নতুন ডিল ও ডিসকাউন্ট যুক্ত করুন' : 'Add New Deal & Discount')}</span>
                  </h3>

                  <form onSubmit={handleSaveDeal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'অফার টাইটেল *' : 'Offer Title *'}</label>
                      <input
                        type="text"
                        required
                        value={dealTitle}
                        onChange={(e) => setDealTitle(e.target.value)}
                        placeholder="e.g., Hostinger Cloud Pro Hosting"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'ডিসকাউন্ট ব্যাজ' : 'Discount Badge'}</label>
                        <input
                          type="text"
                          value={dealDiscountPercent}
                          onChange={(e) => setDealDiscountPercent(e.target.value)}
                          placeholder="e.g., 75% OFF"
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'কুপন কোড' : 'Coupon Code'}</label>
                        <input
                          type="text"
                          value={dealDiscountCode}
                          onChange={(e) => setDealDiscountCode(e.target.value)}
                          placeholder="e.g., RASEDUL75"
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'মেয়াদ শেষ হওয়ার তারিখ' : 'Expiration Date'}</label>
                        <input
                          type="text"
                          value={dealExpiryDate}
                          onChange={(e) => setDealExpiryDate(e.target.value)}
                          placeholder="e.g., 2026-12-31"
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'অফার পার্টনার লিঙ্ক' : 'Partner Link'}</label>
                        <input
                          type="url"
                          value={dealPartnerUrl}
                          onChange={(e) => setDealPartnerUrl(e.target.value)}
                          placeholder="https://hostinger.com"
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* Direct Device Gallery File Picker (NO URL Input) */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        {isBangla ? 'গ্যালারি থেকে ব্যানার নির্বাচন *' : 'Offer Banner from Device Gallery *'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1.5px solid #10B981',
                          color: '#10B981',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <Upload size={16} />
                          <span>
                            {uploadingDealImage
                              ? (isBangla ? 'আপলোড হচ্ছে...' : 'Uploading to Storage...')
                              : (isBangla ? 'গ্যালারি থেকে ছবি বাছুন' : 'Choose from Gallery')}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDealImageChange}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {dealBannerUrl && (
                          <span style={{ fontSize: '0.76rem', color: '#4ADE80', fontWeight: 700 }}>
                            {uploadingDealImage ? (isBangla ? 'স্টোরেজে সেভ হচ্ছে...' : 'Uploading...') : (isBangla ? '✓ ব্যানার প্রস্তুত' : '✓ Banner Ready')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'বিবরণ' : 'Description'}</label>
                      <textarea
                        rows={2}
                        value={dealDescription}
                        onChange={(e) => setDealDescription(e.target.value)}
                        placeholder="e.g., Exclusive 75% off on high-performance cloud hosting with free domain name"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    {/* Live Preview Card */}
                    <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(0, 105, 92, 0.08)', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#10B981', fontSize: '0.74rem', fontWeight: 800 }}>
                        <Sparkles size={13} />
                        <span>{isBangla ? 'লাইভ প্রিভিউ কার্ড' : 'Live Preview Card'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                          <img src={dealBannerUrl || '/add1.png'} alt="Preview" onError={(e) => { e.target.src = '/add1.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dealTitle || 'Offer Title'}</span>
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: '#00695C', color: '#fff', fontWeight: 800 }}>{dealDiscountPercent || '75% OFF'}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#10B981', fontFamily: "'Space Grotesk', monospace" }}>Code: {dealDiscountCode || 'NONE'} • Exp: {dealExpiryDate || 'Dec 2026'}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="submit"
                        disabled={featureActionLoading}
                        style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00695C 0%, #10B981 100%)', color: '#FFFFFF', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        {featureActionLoading ? 'Saving...' : (dealEditingId ? (isBangla ? 'আপডেট করুন' : 'Update Deal') : (isBangla ? 'সংরক্ষণ করুন' : 'Save Deal & Discount'))}
                      </button>
                      {dealEditingId && (
                        <button
                          type="button"
                          onClick={resetDealForm}
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
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.DEALS_DISCOUNTS}>
                    {({ data }) => {
                      const list = data || [];
                      return (
                        <>
                          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Percent size={17} color="#10B981" />
                            <span>{isBangla ? `সক্রিয় ডিল ও ডিসকাউন্ট (${list.length})` : `Active Deals & Discounts (${list.length})`}</span>
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                            {list.map((item) => (
                              <div
                                key={item.id}
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
                                  <div style={{ width: '42px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: '#0b1329', flexShrink: 0 }}>
                                    <img src={item.bannerUrl || '/add1.png'} alt={item.title} onError={(e) => { e.target.src = '/add1.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <h4 style={{ margin: 0, fontSize: '0.86rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                      <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '4px', background: '#00695C', color: '#fff', fontWeight: 800 }}>{item.discountPercent || item.discountCode}</span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#10B981' }}>{item.discountCode ? `Code: ${item.discountCode}` : ''}</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => handleEditDeal(item)}
                                    style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Edit"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDeal(item)}
                                    style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </div>
              </div>

              {/* Standalone Add Deal Modal Integration */}
              {isAddDealModalOpen && (
                <AddDealModal
                  isOpen={isAddDealModalOpen}
                  onClose={() => setIsAddDealModalOpen(false)}
                />
              )}
            </div>
          )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminModal;
