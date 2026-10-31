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
  BarChart3,
  Eye,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  MessageSquare,
  User,
  Fingerprint
} from 'lucide-react';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { uploadImageToCloudflareR2 } from '../utils/r2Upload';
import {
  uploadFileToStorage,
  createLocalImagePreview,
  readFileAsBase64,
  processAndUploadProjectMedia,
  compressImageWithCanvas,
  uploadSponsorBannerToR2,
  deleteSponsorBannerFromR2
} from '../services/storageService';
import { createProject, updateProject, deleteProject } from '../services/adminService';
import { usePortfolioStream } from '../firebase/usePortfolioStream';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { COLLECTIONS, saveFeatureItem, updateFeatureItem, deleteFeatureItem, saveSponsorBannerWithFIFO } from '../services/featuresService';
import { firebaseConfig, initFirebase } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { isBiometricAvailable, isBiometricEnrolled, registerBiometric, verifyBiometricLogin, disableBiometric } from '../utils/biometricAuth';
import AddDealModal, { compressImageClientSide } from './AddDealModal';
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

  // Biometric Auth States
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

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
  const [currentAdminView, setCurrentAdminView] = useState(null); // null | 'add-deal' | 'order-details'
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
  const [projectMediaUrl, setProjectMediaUrl] = useState('');
  const [projectActionUrl, setProjectActionUrl] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedProjectFile, setSelectedProjectFile] = useState(null); // In-memory selected file
  const [projectLocalPreview, setProjectLocalPreview] = useState(''); // Local preview URL
  const [uploadingProjectMedia, setUploadingProjectMedia] = useState(false);
  const [projectFormErrors, setProjectFormErrors] = useState({});
  const [isPublishingModalOpen, setIsPublishingModalOpen] = useState(false);
  const [publishSuccessModalData, setPublishSuccessModalData] = useState(null);

  // --- DEDICATED TAB: SPONSOR BANNERS (7-IMAGE FIFO ROTATION) STATE ---
  const [sponsorTitle, setSponsorTitle] = useState('');
  const [sponsorDescription, setSponsorDescription] = useState('');
  const [sponsorSelectedFile, setSponsorSelectedFile] = useState(null);
  const [sponsorLocalPreview, setSponsorLocalPreview] = useState('');
  const [sponsorCompressedBlob, setSponsorCompressedBlob] = useState(null);
  const [sponsorOriginalSize, setSponsorOriginalSize] = useState(0);
  const [sponsorCompressedSize, setSponsorCompressedSize] = useState(0);
  const [sponsorIsCompressing, setSponsorIsCompressing] = useState(false);
  const [sponsorUploading, setSponsorUploading] = useState(false);
  const [sponsorFormErrors, setSponsorFormErrors] = useState({});
  const sponsorFileInputRef = useRef(null);

  // File Selection & Client-Side HTML5 Canvas Compression (< 250-300 KB)
  const handleSponsorFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSponsorFormErrors((prev) => ({
        ...prev,
        image: isBangla ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন' : 'Please select an image file'
      }));
      return;
    }

    setSponsorFormErrors((prev) => ({ ...prev, image: null }));
    setSponsorSelectedFile(file);

    // Instant local preview without network upload (Deferred Upload)
    const localUrl = URL.createObjectURL(file);
    setSponsorLocalPreview(localUrl);

    // Client-side HTML5 Canvas Auto-Compression & Resolution Balancing
    setSponsorIsCompressing(true);
    try {
      const compressed = await compressImageWithCanvas(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
        format: 'image/webp'
      });
      if (compressed?.blob) {
        setSponsorCompressedBlob(compressed.blob);
        setSponsorOriginalSize(file.size);
        setSponsorCompressedSize(compressed.blob.size || compressed.size);
      } else {
        setSponsorCompressedBlob(file);
        setSponsorOriginalSize(file.size);
        setSponsorCompressedSize(file.size);
      }
    } catch (err) {
      console.warn('Canvas auto-compression notice:', err);
      setSponsorCompressedBlob(file);
      setSponsorOriginalSize(file.size);
      setSponsorCompressedSize(file.size);
    } finally {
      setSponsorIsCompressing(false);
    }
  };

  const handleResetSponsorImage = () => {
    if (sponsorLocalPreview && sponsorLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(sponsorLocalPreview);
    }
    setSponsorSelectedFile(null);
    setSponsorLocalPreview('');
    setSponsorCompressedBlob(null);
    setSponsorOriginalSize(0);
    setSponsorCompressedSize(0);
    if (sponsorFileInputRef.current) sponsorFileInputRef.current.value = '';
  };

  // Form Submit: Validates -> Uploads to Cloud Storage -> FIFO Auto-Rotates (Max 7)
  const handlePublishSponsorBanner = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!sponsorTitle.trim()) {
      errors.title = isBangla ? 'ছবির শিরোনাম বা ক্যাপশন আবশ্যক' : 'Title or caption is required';
    }
    if (!sponsorDescription.trim()) {
      errors.description = isBangla ? 'বিস্তারিত বিবরণ লেখা আবশ্যক' : 'Detailed description is required';
    }
    if (!sponsorCompressedBlob && !sponsorSelectedFile) {
      errors.image = isBangla ? 'একটি ব্যানার ছবি নির্বাচন করুন' : 'Please select a banner image';
    }

    if (Object.keys(errors).length > 0) {
      setSponsorFormErrors(errors);
      return;
    }

    setSponsorUploading(true);
    try {
      // 1. Deferred Cloudflare R2 Upload happens ONLY NOW upon form submit (Zero Firebase Storage usage)
      const uploadFile = sponsorCompressedBlob || sponsorSelectedFile;
      const uploadedUrl = await uploadSponsorBannerToR2(uploadFile, uploadFile.name || 'sponsor_banner.webp');

      // 2. Strict Validation: Absolute requirement that uploadedUrl is an authentic Cloudflare R2 HTTPS link
      if (!uploadedUrl || !uploadedUrl.startsWith('https://') || uploadedUrl.startsWith('/uploads/')) {
        throw new Error(
          isBangla 
            ? 'ক্লাউডফ্লেয়ার R2 বাকেটে ফাইল জমা হয়নি (পাবলিক HTTPS লিংক মিসিং)। ফায়ারস্টোরে কোনো ডেটা সেভ করা হয়নি।' 
            : 'File was not saved in Cloudflare R2 bucket. No Firestore document created.'
        );
      }

      // 3. Save with FIFO Auto-Rotation (Limit 7 items, Newest First)
      await saveSponsorBannerWithFIFO({
        title: sponsorTitle.trim(),
        description: sponsorDescription.trim(),
        imageUrl: uploadedUrl,
        createdAt: new Date().toISOString()
      }, idToken);

      showFeatureToast(
        isBangla 
          ? '📢 ক্লাউডফ্লেয়ার R2-তে ব্যানার সফলভাবে সংরক্ষিত ও ৭টি ছবির FIFO রোটেশন সিঙ্ক হয়েছে!' 
          : '📢 Sponsor Banner uploaded to Cloudflare R2 and 7-image FIFO rotation synchronized!',
        'success'
      );

      // Clean up local preview & reset form
      handleResetSponsorImage();
      setSponsorTitle('');
      setSponsorDescription('');
      setSponsorFormErrors({});
    } catch (err) {
      console.error('Error publishing sponsor banner:', err);
      showFeatureToast(err.message || (isBangla ? 'ব্যানার প্রকাশে সমস্যা হয়েছে' : 'Failed to publish banner'), 'error');
    } finally {
      setSponsorUploading(false);
    }
  };

  const handleDeleteSponsorBanner = async (bannerId, bannerTitle, imageUrl) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${bannerTitle || 'এই ব্যানার'}" ডিলিট করতে চান?` : `Are you sure you want to delete "${bannerTitle || 'this banner'}"?`)) {
      return;
    }
    try {
      // 1. Direct Firestore SDK deleteDoc execution for 100% persistent deletion
      try {
        const { db } = await initFirebase();
        if (db) {
          const { doc, deleteDoc } = await import('firebase/firestore');
          await deleteDoc(doc(db, COLLECTIONS.SPONSORS, bannerId));
          console.log(`✓ [Firestore deleteDoc] Successfully deleted sponsor banner: ${bannerId}`);
        }
      } catch (sdkErr) {
        console.warn('Direct Firestore deleteDoc notice:', sdkErr.message);
      }

      // 2. REST fallback & cache synchronization
      await deleteFeatureItem(COLLECTIONS.SPONSORS, bannerId, idToken);

      // 3. Purge storage from Cloudflare R2
      if (imageUrl) {
        try {
          await deleteSponsorBannerFromR2(imageUrl);
        } catch (r2Err) {
          console.warn('R2 storage purge notice:', r2Err.message);
        }
      }

      showFeatureToast(isBangla ? 'ব্যানার ডিলিট সফল হয়েছে' : 'Banner deleted successfully', 'success');
    } catch (err) {
      showFeatureToast(err.message || (isBangla ? 'ডিলিট ব্যর্থ হয়েছে' : 'Failed to delete banner'), 'error');
    }
  };

  // Auto-dismiss success feedback modal
  useEffect(() => {
    if (publishSuccessModalData) {
      const timer = setTimeout(() => {
        setPublishSuccessModalData(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [publishSuccessModalData]);

  // Handle local image file picker selection (Strictly client-side memory retention, NO immediate network upload)
  const handleProjectMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old object URL if any to prevent memory leaks
    if (projectLocalPreview && projectLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(projectLocalPreview);
    }

    // Generate instantaneous local preview with createObjectURL
    const localUrl = createLocalImagePreview(file);
    setSelectedProjectFile(file);
    setProjectLocalPreview(localUrl);
    setProjectMediaUrl(localUrl);
    setProjectFormErrors((prev) => ({ ...prev, mediaUrl: '' }));
    showFeatureToast(isBangla ? '✓ ছবি নির্বাচন করা হয়েছে (পাবলিশে কম্প্রেশন ও R2 আপলোড হবে)' : '✓ Image selected (Will compress & upload to R2 on publish)');
  };

  const resetProjectsForm = () => {
    if (projectLocalPreview && projectLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(projectLocalPreview);
    }
    setSelectedProjectFile(null);
    setProjectLocalPreview('');
    setProjectEditingId(null);
    setProjectCategory('apps');
    setProjectTitle('');
    setProjectSubCategory('');
    setProjectMediaUrl('');
    setProjectActionUrl('');
    setProjectDescription('');
    setProjectFormErrors({});
  };

  const handleSaveProjectsItem = async (e) => {
    e.preventDefault();

    // 1. Strict required field validation with clear inline alerts
    const errors = {};
    if (!projectTitle.trim()) {
      errors.title = isBangla ? 'প্রজেক্টের নাম দেওয়া আবশ্যক' : 'Project title is required';
    }
    if (!projectSubCategory.trim()) {
      errors.subCategory = isBangla ? 'সাব-ক্যাটেগরি / প্ল্যাটফর্ম দেওয়া আবশ্যক' : 'Platform / Sub-category is required';
    }
    if (!projectActionUrl.trim()) {
      errors.actionUrl = isBangla ? 'প্রজেক্ট লিংক (URL) দেওয়া আবশ্যক' : 'Project URL is required';
    }
    if (!projectMediaUrl.trim() && !selectedProjectFile) {
      errors.mediaUrl = isBangla ? 'আইকন/ব্যানার ছবি নির্বাচন বা URL প্রদান করুন' : 'Icon/banner image or URL is required';
    }
    if (!projectDescription.trim()) {
      errors.description = isBangla ? 'প্রজেক্টের সংক্ষিপ্ত বিবরণ দেওয়া আবশ্যক' : 'Project description is required';
    }

    // Abort execution immediately if any required field is missing
    if (Object.keys(errors).length > 0) {
      setProjectFormErrors(errors);
      showFeatureToast(isBangla ? 'অনুগ্রহ করে প্রয়োজনীয় সকল ঘর পূরণ করুন' : 'Please fill all required fields', 'error');
      return;
    }

    setProjectFormErrors({});
    setIsPublishingModalOpen(true);
    setFeatureActionLoading(true);

    try {
      let finalMediaUrl = projectMediaUrl.trim();

      // 2. Client-Side Canvas Optimization & Delayed Upload to Cloudflare R2 on Form Submit
      if (selectedProjectFile) {
        finalMediaUrl = await processAndUploadProjectMedia(selectedProjectFile, { idToken, folder: 'projects' });
      }

      const payload = {
        title: projectTitle.trim(),
        name: projectTitle.trim(),
        headline: projectTitle.trim(),
        category: projectCategory,
        subCategory: projectSubCategory.trim(),
        mediaUrl: finalMediaUrl,
        icon: finalMediaUrl,
        banner: finalMediaUrl,
        logo: finalMediaUrl,
        actionUrl: projectActionUrl.trim(),
        projectUrl: projectActionUrl.trim(),
        liveUrl: projectActionUrl.trim(),
        playStoreUrl: projectActionUrl.trim(),
        description: projectDescription.trim(),
        updatedAt: new Date().toISOString()
      };

      if (projectEditingId) {
        await updateFeatureItem('projects', projectEditingId, payload, idToken);
        setPublishSuccessModalData({
          title: payload.title,
          isUpdate: true,
          category: projectCategory
        });
        showFeatureToast(isBangla ? '✓ প্রজেক্ট সফলভাবে আপডেট হয়েছে!' : '✓ Project updated successfully!');
      } else {
        await saveFeatureItem('projects', payload, idToken);
        setPublishSuccessModalData({
          title: payload.title,
          isUpdate: false,
          category: projectCategory
        });
        showFeatureToast(isBangla ? '✓ নতুন প্রজেক্ট সফলভাবে পাবলিশ হয়েছে!' : '✓ New project published successfully!');
      }
      resetProjectsForm();
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
      setIsPublishingModalOpen(false);
    }
  };

  const handleEditProjectItem = (item) => {
    if (projectLocalPreview && projectLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(projectLocalPreview);
    }
    setSelectedProjectFile(null);
    setProjectLocalPreview('');
    setProjectEditingId(item.id);
    setProjectFormErrors({});
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
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${title}" স্থায়ীভাবে মুছে ফেলতে চান?` : `Permanently delete "${title}"?`)) return;
    setFeatureActionLoading(true);
    try {
      // 1. Direct Firestore SDK deleteDoc execution
      try {
        const { db } = await initFirebase();
        if (db) {
          const { doc, deleteDoc } = await import('firebase/firestore');
          await deleteDoc(doc(db, 'projects', item.id));
        }
      } catch (sdkErr) {
        console.warn('Direct Firestore deleteDoc notice:', sdkErr.message);
      }

      // 2. Also run deleteFeatureItem for REST fallback & cache synchronization
      await deleteFeatureItem('projects', item.id, idToken);
      showFeatureToast(isBangla ? '✓ প্রজেক্ট স্থায়ীভাবে মুছে ফেলা হয়েছে!' : '✓ Project permanently deleted!');
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
  const [favoriteCategory, setFavoriteCategory] = useState('AI Tools');
  const [favoriteWhyLove, setFavoriteWhyLove] = useState('');
  const [favoriteOfficialUrl, setFavoriteOfficialUrl] = useState('');
  const [favoriteRating, setFavoriteRating] = useState('5.0');
  const [favoriteThumbnailUrl, setFavoriteThumbnailUrl] = useState('/favorite.png');
  const [favoriteImageFile, setFavoriteImageFile] = useState(null);
  const [uploadingFavoriteImage, setUploadingFavoriteImage] = useState(false);
  const [favoriteDescription, setFavoriteDescription] = useState('');

  // 1. Strict No Pre-Upload: image selection ONLY creates local preview
  const handleFavoriteImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFavoriteImageFile(file);
    const localUrl = createLocalImagePreview(file);
    setFavoriteThumbnailUrl(localUrl);
    showFeatureToast(isBangla ? '✓ ছবি নির্বাচন সম্পন্ন (সংরক্ষণে কম্প্রেস ও R2-তে আপলোড হবে)' : '✓ Image selected (will compress & upload on save)');
  };

  const resetFavoriteForm = () => {
    setFavoriteEditingId(null);
    setFavoriteName('');
    setFavoriteCategory('AI Tools');
    setFavoriteWhyLove('');
    setFavoriteOfficialUrl('');
    setFavoriteRating('5.0');
    setFavoriteThumbnailUrl('/favorite.png');
    setFavoriteImageFile(null);
    setFavoriteDescription('');
  };

  // 2. Strict Deferred Upload on Form Submit with Client-Side Canvas Compression & Cloudflare R2 Upload
  const handleSaveFavorite = async (e) => {
    e.preventDefault();
    setFeatureToast(null); // Clear previous error banner immediately on submit

    if (!favoriteName.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে টুলের নাম দিন' : 'Please provide tool name', 'error');
      return;
    }
    if (!favoriteOfficialUrl.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে টুলের অফিসিয়াল লিঙ্ক দিন' : 'Please provide tool official URL', 'error');
      return;
    }

    setFeatureActionLoading(true);
    setUploadingFavoriteImage(true);
    try {
      let finalThumbnailUrl = favoriteThumbnailUrl || '/favorite.png';

      // Only upload to Cloudflare R2 when form passes validation and file exists
      if (favoriteImageFile) {
        showFeatureToast(isBangla ? 'ছবি কম্প্রেস ও ক্লাউডফ্লেয়ার R2-তে আপলোড হচ্ছে...' : 'Compressing image & uploading to Cloudflare R2...');
        try {
          finalThumbnailUrl = await uploadImageToCloudflareR2(favoriteImageFile, {
            folder: 'favorites',
            maxWidth: 1000,
            maxHeight: 1000,
            quality: 0.82
          });
        } catch (uploadErr) {
          console.error("R2 Upload Detail:", uploadErr);
          const errMsg = uploadErr.message?.includes('Failed to fetch') || uploadErr.message?.includes('CORS')
            ? (isBangla ? 'Cloudflare R2 স্টোরেজে সংযোগ করা যায়নি! CORS বা Worker URL চেক করুন।' : 'Could not connect to Cloudflare R2! Check CORS or Worker URL.')
            : (uploadErr.message || (isBangla ? 'Cloudflare R2 স্টোরেজে সংযোগ করা যায়নি! CORS বা Worker URL চেক করুন।' : 'R2 connection failed'));
          showFeatureToast(errMsg, 'error');
          setFeatureActionLoading(false);
          setUploadingFavoriteImage(false);
          return;
        }
      }

      const now = new Date().toISOString();
      const payload = {
        name: favoriteName.trim(),
        title: favoriteName.trim(),
        category: favoriteCategory,
        whyPrefer: favoriteWhyLove.trim(),
        whyLove: favoriteWhyLove.trim(),
        url: favoriteOfficialUrl.trim(),
        officialUrl: favoriteOfficialUrl.trim(),
        rating: favoriteRating.trim() || '5.0',
        iconUrl: finalThumbnailUrl.trim() || '/favorite.png',
        thumbnailUrl: finalThumbnailUrl.trim() || '/favorite.png',
        description: favoriteWhyLove.trim() || favoriteDescription.trim(),
        createdAt: now,
        updatedAt: now
      };

      if (favoriteEditingId) {
        await updateFeatureItem(COLLECTIONS.FAVORITE_TOOLS, favoriteEditingId, payload, idToken);
        try {
          const { db } = await initFirebase();
          if (db) {
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'favourite_tools', favoriteEditingId), payload, { merge: true });
          }
        } catch (_) {}
        showFeatureToast(isBangla ? '✓ ফেভারিট টুল সফলভাবে আপডেট হয়েছে!' : '✓ Favorite tool updated successfully!');
      } else {
        const savedDoc = await saveFeatureItem(COLLECTIONS.FAVORITE_TOOLS, payload, idToken);
        try {
          const { db } = await initFirebase();
          if (db) {
            const { doc, setDoc } = await import('firebase/firestore');
            const targetId = savedDoc?.id || `tool_${Date.now()}`;
            await setDoc(doc(db, 'favourite_tools', targetId), { ...payload, id: targetId }, { merge: true });
          }
        } catch (_) {}
        showFeatureToast(isBangla ? '✓ নতুন ফেভারিট টুল সফলভাবে যুক্ত হয়েছে!' : '✓ New favorite tool added successfully!');
      }
      resetFavoriteForm();
    } catch (err) {
      console.error('Failed to save favorite tool:', err);
      const errMsg = err.message?.includes('Failed to fetch') || err.message?.includes('CORS')
        ? (isBangla ? 'Cloudflare R2 স্টোরেজে সংযোগ করা যায়নি! CORS বা Worker URL চেক করুন।' : 'Could not connect to Cloudflare R2! Check CORS or Worker URL.')
        : (err.message || 'Operation failed');
      showFeatureToast(errMsg, 'error');
    } finally {
      setFeatureActionLoading(false);
      setUploadingFavoriteImage(false);
    }
  };

  const handleEditFavorite = (item) => {
    setFavoriteEditingId(item.id);
    setFavoriteName(item.name || item.title || '');
    setFavoriteCategory(item.category || 'AI Tools');
    setFavoriteWhyLove(item.whyLove || item.whyPrefer || item.description || item.note || '');
    setFavoriteOfficialUrl(item.officialUrl || '');
    setFavoriteRating(item.rating || '5.0');
    setFavoriteThumbnailUrl(item.thumbnailUrl || '/favorite.png');
    setFavoriteDescription(item.description || item.note || '');
    setFavoriteImageFile(null);
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

  // --- TAB 1: DEALS & DISCOUNTS POST STATE ---
  const [dealToEdit, setDealToEdit] = useState(null);
  const [selectedAdminOrderDetails, setSelectedAdminOrderDetails] = useState(null);
  const [dealEditingId, setDealEditingId] = useState(null);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealOriginalPrice, setDealOriginalPrice] = useState('');
  const [dealDiscountedPrice, setDealDiscountedPrice] = useState('');
  const [dealCouponCode, setDealCouponCode] = useState('');
  const [dealDiscountPercent, setDealDiscountPercent] = useState('');
  const [dealIsLimited, setDealIsLimited] = useState(false);
  const [dealExpiryDate, setDealExpiryDate] = useState('');
  const [dealPartnerUrl, setDealPartnerUrl] = useState('');
  const [dealBannerUrl, setDealBannerUrl] = useState('');
  const [dealLocalPreview, setDealLocalPreview] = useState('');
  const [dealFileSizeInfo, setDealFileSizeInfo] = useState('');
  const [selectedDealFile, setSelectedDealFile] = useState(null);
  const [uploadingDealImage, setUploadingDealImage] = useState(false);
  const [isCompressingDealImage, setIsCompressingDealImage] = useState(false);

  // --- TAB 2: PENDING DEALS & ORDERS STATE ---
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'cancelled'
  const [orderUpdatingId, setOrderUpdatingId] = useState(null);
  const [localOrderStatusOverrides, setLocalOrderStatusOverrides] = useState({});
  const [localDeletedOrderIds, setLocalDeletedOrderIds] = useState(new Set());

  const handleDealFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (dealLocalPreview && dealLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(dealLocalPreview);
    }

    setSelectedDealFile(file);
    const previewUrl = URL.createObjectURL(file);
    setDealLocalPreview(previewUrl);
    setDealBannerUrl(previewUrl);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeKb = (file.size / 1024).toFixed(0);
    const originalSizeStr = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

    setDealFileSizeInfo(
      isBangla 
        ? `মূল ফাইলের সাইজ: ${originalSizeStr} (ডিল প্রকাশের সময় ব্রাউজারে < ৩০০ KB WebP-তে কম্প্রেস হবে)` 
        : `Original file size: ${originalSizeStr} (Will compress to < 300 KB WebP on publish)`
    );
  };

  const handleRemoveDealImage = () => {
    if (dealLocalPreview && dealLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(dealLocalPreview);
    }
    setSelectedDealFile(null);
    setDealLocalPreview('');
    setDealBannerUrl('');
    setDealFileSizeInfo('');
  };

  const handleDealImageChange = async (e) => {
    handleDealFileChange(e);
  };

  const resetDealForm = () => {
    if (dealLocalPreview && dealLocalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(dealLocalPreview);
    }
    setDealEditingId(null);
    setDealToEdit(null);
    setDealTitle('');
    setDealDescription('');
    setDealOriginalPrice('');
    setDealDiscountedPrice('');
    setDealCouponCode('');
    setDealDiscountPercent('');
    setDealIsLimited(false);
    setDealExpiryDate('');
    setDealPartnerUrl('');
    setDealBannerUrl('');
    setDealLocalPreview('');
    setSelectedDealFile(null);
    setDealFileSizeInfo('');
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    if (!dealTitle.trim()) {
      showFeatureToast(isBangla ? 'অনুগ্রহ করে ডিলের নাম দিন' : 'Please provide deal name', 'error');
      return;
    }

    setIsPublishingModalOpen(true);
    setFeatureActionLoading(true);

    try {
      let finalBanner = dealBannerUrl.trim() || '/add1.png';
      
      // Deferred Upload with Client-Side HTML5 Canvas Compression (< 300 KB WebP)
      if (selectedDealFile) {
        setIsCompressingDealImage(true);
        try {
          const compressed = await compressImageClientSide(selectedDealFile, 300);
          try {
            finalBanner = await processAndUploadProjectMedia(compressed, { idToken, folder: 'deals' });
          } catch (e) {
            finalBanner = await uploadFileToStorage(compressed, 'deals', idToken);
          }
        } catch (compErr) {
          console.warn('Canvas compression notice, fallback to raw upload:', compErr);
          finalBanner = await uploadFileToStorage(selectedDealFile, 'deals', idToken);
        } finally {
          setIsCompressingDealImage(false);
        }
      }

      const origPrice = Number(dealOriginalPrice) || 0;
      const discPercentNum = Number(String(dealDiscountPercent).replace(/[^0-9]/g, '')) || 0;
      const discPrice = origPrice > 0 && discPercentNum > 0 
        ? Math.round(origPrice * (1 - discPercentNum / 100)) 
        : (Number(dealDiscountedPrice) || origPrice);
      const cleanCoupon = (dealCouponCode || '').trim().toUpperCase();

      const payload = {
        title: dealTitle.trim(),
        name: dealTitle.trim(),
        description: dealDescription.trim(),
        originalPrice: origPrice,
        regularPrice: origPrice,
        discountPercentage: discPercentNum,
        discountPercent: `${discPercentNum}% OFF`,
        discountedPrice: discPrice,
        finalPrice: discPrice || origPrice,
        couponCode: cleanCoupon || null,
        discountCode: cleanCoupon || null,
        hasCoupon: !!cleanCoupon,
        isLimited: Boolean(dealIsLimited),
        expiryDate: dealIsLimited ? dealExpiryDate : '',
        validUntil: dealIsLimited ? dealExpiryDate : '',
        partnerUrl: dealPartnerUrl.trim() || '',
        bannerUrl: finalBanner,
        imagePath: finalBanner,
        updatedAt: new Date().toISOString()
      };

      // 1. Direct Firestore SDK execution on 'deals' collection
      try {
        const { db } = await initFirebase();
        if (db) {
          const { collection, addDoc, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
          if (dealEditingId) {
            try {
              await updateDoc(doc(db, 'deals', dealEditingId), {
                ...payload,
                updatedAt: serverTimestamp()
              });
            } catch (err) {}
          } else {
            await addDoc(collection(db, 'deals'), {
              ...payload,
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (firestoreErr) {
        console.warn('Firestore deals write notice:', firestoreErr);
      }

      // 2. Synchronization with COLLECTIONS.DEALS_DISCOUNTS ('features_deals_discounts')
      if (dealEditingId) {
        await updateFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, dealEditingId, payload, idToken);
        setPublishSuccessModalData({
          title: payload.title,
          isUpdate: true,
          isDeal: true
        });
        showFeatureToast(isBangla ? '✓ ডিল সফলভাবে আপডেট হয়েছে!' : '✓ Deal updated successfully!');
      } else {
        await saveFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, payload, idToken);
        setPublishSuccessModalData({
          title: payload.title,
          isUpdate: false,
          isDeal: true
        });
        showFeatureToast(isBangla ? '✓ নতুন ডিল সফলভাবে প্রকাশিত হয়েছে!' : '✓ New deal published successfully to Firestore deals collection!');
      }

      resetDealForm();
      setCurrentAdminView(null);
    } catch (err) {
      showFeatureToast(err.message || 'Operation failed', 'error');
    } finally {
      setFeatureActionLoading(false);
      setIsPublishingModalOpen(false);
    }
  };

  const handleEditDeal = (item) => {
    setDealEditingId(item.id || item._firestoreDocId);
    setDealToEdit(item);
    setDealTitle(item.title || item.name || '');
    setDealDescription(item.description || '');
    setDealOriginalPrice(String(item.originalPrice || item.regularPrice || ''));
    const rawRate = item.discountPercentage || item.discountPercent || '';
    const parsedRate = String(rawRate).replace(/[^0-9]/g, '');
    setDealDiscountPercent(parsedRate || '');
    setDealDiscountedPrice(String(item.discountedPrice || item.finalPrice || ''));
    setDealCouponCode(item.couponCode || item.discountCode || '');
    setDealIsLimited(Boolean(item.isLimited));
    setDealExpiryDate(item.expiryDate || item.validUntil || '');
    setDealPartnerUrl(item.partnerUrl || '');
    setDealBannerUrl(item.bannerUrl || item.imagePath || '');
    setDealLocalPreview(item.bannerUrl || item.imagePath || '');
    setSelectedDealFile(null);
    setDealFileSizeInfo('');
    setCurrentAdminView('add-deal');
  };

  const handleDeleteDeal = async (item) => {
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত "${item.title}" ডিলটি মুছে ফেলতে চান?` : `Delete "${item.title}"?`)) return;
    setFeatureActionLoading(true);
    try {
      try {
        const { db } = await initFirebase();
        if (db) {
          const { doc, deleteDoc } = await import('firebase/firestore');
          await deleteDoc(doc(db, 'deals', item.id));
        }
      } catch (sdkErr) {}

      await deleteFeatureItem(COLLECTIONS.DEALS_DISCOUNTS, item.id, idToken);
      showFeatureToast(isBangla ? '✓ ডিল মুছে ফেলা হয়েছে!' : '✓ Deal deleted successfully!');
      if (dealEditingId === item.id) resetDealForm();
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete', 'error');
    } finally {
      setFeatureActionLoading(false);
    }
  };

  // Real-time Order Action Handlers: Accept (গ্রহণ) and Cancel (বাতিল) - Persistent Firestore Updates
  const handleUpdateOrderStatus = async (orderOrId, newStatus) => {
    if (!orderOrId) return;
    const targetDocId = typeof orderOrId === 'object' ? (orderOrId._firestoreDocId || orderOrId.id) : orderOrId;
    const orderCode = typeof orderOrId === 'object' ? (orderOrId.orderCode || orderOrId.orderId) : null;
    const trackingKey = targetDocId || orderCode || 'order_action';
    setOrderUpdatingId(trackingKey);

    // Instant optimistic state update: immediately transitions between tabs without waiting
    setLocalOrderStatusOverrides((prev) => {
      const next = { ...prev };
      if (targetDocId) next[targetDocId] = newStatus;
      if (orderCode) next[orderCode] = newStatus;
      return next;
    });

    // Update selected modal details view if currently open
    if (selectedAdminOrderDetails) {
      const isCurrentSelected = 
        (targetDocId && (selectedAdminOrderDetails.id === targetDocId || selectedAdminOrderDetails._firestoreDocId === targetDocId)) ||
        (orderCode && (selectedAdminOrderDetails.orderCode === orderCode || selectedAdminOrderDetails.orderId === orderCode));
      if (isCurrentSelected) {
        setSelectedAdminOrderDetails(prev => prev ? ({ ...prev, status: newStatus, claimed: newStatus === 'accepted' }) : null);
      }
    }

    try {
      const { db } = await initFirebase();
      if (db) {
        const { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } = await import('firebase/firestore');
        const updatePayload = {
          status: newStatus,
          updatedAt: serverTimestamp()
        };
        if (newStatus === 'accepted') {
          updatePayload.claimed = true;
          updatePayload.approvedAt = serverTimestamp();
        } else if (newStatus === 'cancelled') {
          updatePayload.claimed = false;
          updatePayload.rejectedAt = serverTimestamp();
        }

        let docUpdated = false;
        if (targetDocId) {
          try {
            await updateDoc(doc(db, 'deal_orders', targetDocId), updatePayload);
            docUpdated = true;
          } catch (directDocErr) {
            console.warn('Direct doc update by id notice:', directDocErr.message);
          }
        }

        // Resilient query fallback by orderCode / orderId if direct doc id update didn't succeed
        if (!docUpdated && orderCode) {
          const colRef = collection(db, 'deal_orders');
          const q = query(colRef, where('orderCode', '==', orderCode));
          const snap = await getDocs(q);
          if (!snap.empty) {
            for (const d of snap.docs) {
              await updateDoc(d.ref, updatePayload);
              docUpdated = true;
            }
          } else {
            const q2 = query(colRef, where('orderId', '==', orderCode));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) {
              for (const d of snap2.docs) {
                await updateDoc(d.ref, updatePayload);
                docUpdated = true;
              }
            }
          }
        }

        const statusLabel = newStatus === 'accepted' 
          ? (isBangla ? 'অনুমোদিত (Accepted)' : 'Accepted') 
          : (newStatus === 'cancelled' ? (isBangla ? 'বাতিল (Cancelled)' : 'Cancelled') : 'Pending');
        showFeatureToast(isBangla ? `✓ অর্ডার স্ট্যাটাস '${statusLabel}' এ ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে!` : `✓ Order status '${statusLabel}' saved persistently to database!`);
      }
    } catch (err) {
      console.error('Error updating order status in deal_orders:', err);
      showFeatureToast(err.message || 'Failed to update order status in database', 'error');
    } finally {
      setOrderUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (order) => {
    const code = order.orderCode || order.orderId || 'this order';
    if (!window.confirm(isBangla ? `আপনি কি নিশ্চিত অর্ডার "${code}" ডিলিট করতে চান?` : `Delete order "${code}"?`)) return;
    const targetId = order._firestoreDocId || order.id || order.orderCode;
    setLocalDeletedOrderIds(prev => new Set([...prev, targetId, order.id, order.orderCode].filter(Boolean)));
    try {
      const { db } = await initFirebase();
      if (db) {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const docId = order._firestoreDocId || order.id;
        if (docId) {
          await deleteDoc(doc(db, 'deal_orders', docId));
        }
        showFeatureToast(isBangla ? '✓ অর্ডার রেকর্ড মুছে ফেলা হয়েছে!' : '✓ Order deleted!');
      }
    } catch (err) {
      showFeatureToast(err.message || 'Failed to delete order', 'error');
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
  const currentAdminViewRef = useRef(currentAdminView);

  useEffect(() => {
    activeAdminTabRef.current = activeAdminTab;
  }, [activeAdminTab]);

  useEffect(() => {
    currentAdminViewRef.current = currentAdminView;
  }, [currentAdminView]);

  useEffect(() => {
    // Initial history push for Admin modal
    window.history.pushState({ modal: 'admin', tab: 'overview' }, '');

    const handlePopState = () => {
      // If user is inside a dedicated sub-view, back press exits sub-view first
      if (currentAdminViewRef.current) {
        setCurrentAdminView(null);
        setSelectedAdminOrderDetails(null);
        window.history.pushState({ modal: 'admin', tab: activeAdminTabRef.current }, '');
      } else if (activeAdminTabRef.current !== 'overview') {
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
    setCurrentAdminView(null);
    setSelectedAdminOrderDetails(null);
    if (activeAdminTab === 'overview' && tabId !== 'overview') {
      window.history.pushState({ modal: 'admin', tab: tabId }, '');
    }
    setActiveAdminTab(tabId);
  };

  const handleAdminBack = () => {
    if (currentAdminView) {
      setCurrentAdminView(null);
      setSelectedAdminOrderDetails(null);
      return;
    }
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

  useEffect(() => {
    isBiometricAvailable().then((supported) => {
      setBiometricSupported(supported);
      if (supported) {
        setBiometricEnrolled(isBiometricEnrolled());
      }
    });
  }, []);

  const handleBiometricLogin = async () => {
    if (lockoutState.isLocked) return;
    setBiometricLoading(true);
    setPinError('');
    try {
      const success = await verifyBiometricLogin();
      if (success) {
        resetFailedAttempts();
        await registerActiveSession('admin_biometric');
        setIdToken('biometric_verified_token');
        setIsAuthenticated(true);
        setStatusMessage({
          type: 'success',
          text: isBangla 
            ? 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট দিয়ে সফলভাবে প্রবেশ করা হয়েছে।' 
            : 'Biometric fingerprint login verified successfully.'
        });
      }
    } catch (err) {
      setPinError(err.message || (isBangla ? 'বায়োমেট্রিক অথেন্টিকেশন ব্যর্থ হয়েছে।' : 'Biometric authentication failed.'));
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleToggleBiometric = async () => {
    setBiometricLoading(true);
    try {
      if (biometricEnrolled) {
        disableBiometric();
        setBiometricEnrolled(false);
        setStatusMessage({
          type: 'success',
          text: isBangla ? 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট নিষ্ক্রিয় করা হয়েছে।' : 'Biometric fingerprint disabled.'
        });
      } else {
        const success = await registerBiometric('admin_master');
        if (success) {
          setBiometricEnrolled(true);
          setStatusMessage({
            type: 'success',
            text: isBangla ? 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট সফলভাবে যুক্ত করা হয়েছে!' : 'Biometric fingerprint registered successfully!'
          });
        }
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || (isBangla ? 'বায়োমেট্রিক রেজিস্ট্রেশন ব্যর্থ হয়েছে।' : 'Biometric registration failed.')
      });
    } finally {
      setBiometricLoading(false);
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
        setStatusMessage({ type: 'success', text: 'New project published successfully' });
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

            {/* Quick Biometric Fingerprint Button */}
            {biometricSupported && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBiometricLogin}
                  disabled={biometricLoading || lockoutState.isLocked}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1.5px solid rgba(255, 107, 53, 0.3)',
                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.15)',
                    color: '#E05322',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: lockoutState.isLocked ? 'not-allowed' : 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Fingerprint size={20} className={biometricLoading ? 'animate-pulse' : ''} />
                  <span>
                    {biometricLoading
                      ? (isBangla ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                      : (isBangla ? 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট' : 'Touch ID / Fingerprint')}
                  </span>
                </motion.button>
                {!biometricEnrolled && (
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px' }}>
                    {isBangla ? '(ড্যাশবোর্ড থেকে আগে একবার এনাবল করুন)' : '(Enable once inside Dashboard)'}
                  </span>
                )}
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
                {biometricSupported && (
                  <button
                    onClick={handleToggleBiometric}
                    disabled={biometricLoading}
                    style={{
                      background: biometricEnrolled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${biometricEnrolled ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.15)'}`,
                      color: biometricEnrolled ? '#10B981' : '#E2E8F0',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease'
                    }}
                    title={biometricEnrolled ? 'Biometric enabled' : 'Enable biometric'}
                  >
                    <Fingerprint size={14} className={biometricLoading ? 'animate-pulse' : ''} />
                    <span>
                      {biometricEnrolled 
                        ? (isBangla ? 'বায়োমেট্রিক অন' : 'Biometric ON') 
                        : (isBangla ? 'বায়োমেট্রিক সেটআপ' : 'Enable Biometric')}
                    </span>
                  </button>
                )}
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

            {/* 6-Tab Navigation Strip (Fixed Overflow, Smooth Horizontal Scroll, Zero Clipping) */}
            <div 
              className="admin-tab-bar-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minHeight: '48px',
                padding: '10px 16px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                boxSizing: 'border-box',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin'
              }}
            >
              {[
                { id: 'overview', labelBn: 'ড্যাশবোর্ড ওভারভিউ', labelEn: 'Overview', icon: LayoutDashboard, color: '#38BDF8' },
                { id: 'projects', labelBn: 'প্রজেক্টস লাইভ (Projects)', labelEn: 'Projects Live Management', icon: FolderGit2, color: '#10B981' },
                { id: 'design', labelBn: 'ডিজাইন প্রজেক্ট', labelEn: 'Design Projects', icon: Palette, color: '#00E5FF' },
                { id: 'upcoming', labelBn: 'আপকামিং প্রজেক্ট', labelEn: 'Upcoming Projects', icon: Rocket, color: '#C084FC' },
                { id: 'favorite', labelBn: 'ফেভারিট টুলস', labelEn: 'Favorite Tools', icon: Star, color: '#FFB300' },
                { id: 'deals', labelBn: 'Deals & Discounts Post', labelEn: 'Deals & Discounts Post', icon: Percent, color: '#10B981' },
                { id: 'deal_orders', labelBn: 'Pending Deals & Orders', labelEn: 'Pending Deals & Orders', icon: Clock, color: '#F59E0B' },
                { id: 'sponsors', labelBn: '📢 Sponsor Banners', labelEn: '📢 Sponsor Banners', icon: Sparkles, color: '#FF6B00' }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectAdminTab(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      minHeight: '38px',
                      borderRadius: '12px',
                      background: isActive ? `${tab.color}22` : 'rgba(255, 255, 255, 0.04)',
                      border: `1.5px solid ${isActive ? tab.color : 'rgba(255, 255, 255, 0.1)'}`,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      lineHeight: 1.2,
                      boxSizing: 'border-box',
                      boxShadow: isActive ? `0 4px 16px ${tab.color}44` : 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: isBangla ? "'Anek Bangla', sans-serif" : "'DM Serif Display', serif"
                    }}
                  >
                    <IconComp size={15} color={tab.color} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>{isBangla ? tab.labelBn : tab.labelEn}</span>
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
                        {isBangla ? 'ক্লাউড লাইভ সিঙ্ক ও ডিভাইস গ্যালারি স্টোরেজ হাব' : 'Cloud live synchronization & device gallery storage hub'}
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

                  {/* CARD 6: PENDING DEALS & ORDERS */}
                  <FirestoreStreamBuilder collectionName="deal_orders" orderByField="createdAt" orderDirection="desc">
                    {({ data }) => {
                      const allOrders = data || [];
                      const pendingCount = allOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('deal_orders')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(245, 158, 11, 0.18), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(245, 158, 11, 0.4)',
                            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(245, 158, 11, 0.2)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#F59E0B',
                              flexShrink: 0
                            }}>
                              <Clock size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#F59E0B',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.2
                              }}>
                                {isBangla ? 'পেন্ডিং ডিল অর্ডার' : 'Pending Deal Orders'}
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
                                {isBangla ? `${pendingCount}টি অর্ডার পেন্ডিং` : `${pendingCount} Pending Claims`}
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
                              {pendingCount}
                            </span>
                            <ChevronRight size={14} color="#F59E0B" opacity={0.8} />
                          </div>
                        </motion.div>
                      );
                    }}
                  </FirestoreStreamBuilder>

                  {/* CARD 7: SPONSOR BANNERS (7-IMAGE FIFO ROTATION) */}
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.SPONSOR_BANNERS}>
                    {({ data }) => {
                      const count = (data && data.length > 0) ? data.length : 6;
                      return (
                        <motion.div
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectAdminTab('sponsors')}
                          className="admin-compact-card"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(255, 107, 0, 0.16), rgba(15, 23, 42, 0.92))',
                            border: '1.2px solid rgba(255, 107, 0, 0.35)',
                            boxShadow: '0 4px 16px rgba(255, 107, 0, 0.12)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(255, 107, 0, 0.2)',
                              border: '1px solid rgba(255, 107, 0, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FF6B00',
                              flexShrink: 0
                            }}>
                              <Sparkles size={17} />
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <h4 style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: '#FFFFFF',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? '📢 Sponsor Banners' : '📢 Sponsor Banners'}
                              </h4>
                              <span style={{
                                fontSize: '0.66rem',
                                color: '#94A3B8',
                                display: 'block',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {isBangla ? '৭টি ছবির FIFO রোটেশন' : '7-Image FIFO Rotation'}
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
                            <ChevronRight size={14} color="#FF6B00" opacity={0.8} />
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
                      {isBangla ? 'প্রজেক্ট ও শোকেস লাইভ ম্যানেজমেন্ট' : 'Projects & Showcase Live Management'}
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

                    <form onSubmit={handleSaveProjectsItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Category Selector */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>{isBangla ? 'ক্যাটাগরি *' : 'Category *'}</label>
                        <select
                          value={projectCategory}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setProjectCategory(newCat);
                            setProjectFormErrors((prev) => ({ ...prev, mediaUrl: '' }));
                          }}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '0.86rem', marginTop: '4px' }}
                        >
                          <option value="apps">Apps (Mobile Application)</option>
                          <option value="website">Website (Web Application)</option>
                        </select>
                      </div>

                      {/* Project Title */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: projectFormErrors.title ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                          {isBangla ? 'প্রজেক্টের নাম (Project Title) *' : 'Project Title *'}
                        </label>
                        <input
                          type="text"
                          value={projectTitle}
                          onChange={(e) => {
                            setProjectTitle(e.target.value);
                            if (projectFormErrors.title) setProjectFormErrors((prev) => ({ ...prev, title: '' }));
                          }}
                          placeholder={isBangla ? 'প্রজেক্টের নাম লিখুন...' : 'Enter project title...'}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: projectFormErrors.title ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            boxSizing: 'border-box',
                            marginTop: '4px'
                          }}
                        />
                        {projectFormErrors.title && (
                          <span style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            {projectFormErrors.title}
                          </span>
                        )}
                      </div>

                      {/* Sub-category / Platform */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: projectFormErrors.subCategory ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                          {isBangla ? 'সাব-ক্যাটেগরি / প্ল্যাটফর্ম (Sub-category / Platform) *' : 'Sub-category / Platform *'}
                        </label>
                        <input
                          type="text"
                          value={projectSubCategory}
                          onChange={(e) => {
                            setProjectSubCategory(e.target.value);
                            if (projectFormErrors.subCategory) setProjectFormErrors((prev) => ({ ...prev, subCategory: '' }));
                          }}
                          placeholder={isBangla ? 'যেমন: Android / React / Node.js' : 'e.g. Android / React / Flutter'}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: projectFormErrors.subCategory ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            boxSizing: 'border-box',
                            marginTop: '4px'
                          }}
                        />
                        {projectFormErrors.subCategory && (
                          <span style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            {projectFormErrors.subCategory}
                          </span>
                        )}
                      </div>

                      {/* Media URL (Apps: Icon URL, Website: Banner URL) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: projectFormErrors.mediaUrl ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                            {projectCategory === 'apps'
                              ? (isBangla ? 'অ্যাপ আইকন URL বা আপলোড (Icon URL) *' : 'App Icon URL or Upload (Media URL) *')
                              : (isBangla ? 'ওয়েবসাইট ব্যানার URL বা আপলোড (Banner URL) *' : 'Website Banner URL or Upload (Media URL) *')}
                          </label>
                        </div>
                        <input
                          type="text"
                          value={projectMediaUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjectMediaUrl(val);
                            if (!val.startsWith('blob:')) {
                              setSelectedProjectFile(null);
                              setProjectLocalPreview('');
                            }
                            if (projectFormErrors.mediaUrl) setProjectFormErrors((prev) => ({ ...prev, mediaUrl: '' }));
                          }}
                          placeholder={isBangla ? 'ইমেজ লিংক দিন অথবা ডিভাইস থেকে ছবি আপলোড করুন...' : 'Paste icon/banner URL or upload from device...'}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: projectFormErrors.mediaUrl ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            boxSizing: 'border-box'
                          }}
                        />
                        {projectFormErrors.mediaUrl && (
                          <span style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            {projectFormErrors.mediaUrl}
                          </span>
                        )}

                        {/* Device File Picker Upload Button (Client-side selection with delayed upload) */}
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <label style={{
                            padding: '7px 14px',
                            background: selectedProjectFile ? 'rgba(0, 240, 255, 0.22)' : 'rgba(0, 240, 255, 0.12)',
                            border: '1.5px solid rgba(0, 240, 255, 0.35)',
                            borderRadius: '8px',
                            color: '#00F0FF',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            transition: 'all 0.2s ease'
                          }}>
                            <Upload size={14} />
                            <span>
                              {selectedProjectFile 
                                ? (isBangla ? 'অন্য ছবি পরিবর্তন করুন' : 'Change Selected Image') 
                                : (isBangla ? 'গ্যালারি থেকে ছবি আপলোড' : 'Upload from Device')}
                            </span>
                            <input type="file" accept="image/*" onChange={handleProjectMediaChange} style={{ display: 'none' }} />
                          </label>

                          {/* Live Media Preview Thumbnail */}
                          {projectMediaUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: projectCategory === 'apps' ? '40px' : '56px',
                                height: '40px',
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
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle size={13} />
                                  {selectedProjectFile 
                                    ? (isBangla ? 'ছবি নির্বাচিত (পাবলিশে Canvas কম্প্রেশন ও R2 আপলোড হবে)' : 'Image selected (Compress & R2 upload on publish)') 
                                    : (isBangla ? 'মিডিয়া প্রস্তুত' : 'Media Ready')}
                                </span>
                                {selectedProjectFile && (
                                  <span style={{ fontSize: '0.66rem', color: '#94A3B8' }}>
                                    {selectedProjectFile.name} ({(selectedProjectFile.size / 1024).toFixed(0)} KB)
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action URL */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: projectFormErrors.actionUrl ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                          {projectCategory === 'apps'
                            ? (isBangla ? 'গুগল প্লে স্টোর লিংক (Action URL) *' : 'Google Play Store Link (Action URL) *')
                            : (isBangla ? 'ওয়েবসাইট লাইভ লিংক (Action URL) *' : 'Live Website Link (Action URL) *')}
                        </label>
                        <input
                          type="url"
                          value={projectActionUrl}
                          onChange={(e) => {
                            setProjectActionUrl(e.target.value);
                            if (projectFormErrors.actionUrl) setProjectFormErrors((prev) => ({ ...prev, actionUrl: '' }));
                          }}
                          placeholder={projectCategory === 'apps' ? 'https://play.google.com/store/apps/details?id=...' : 'https://yourwebsite.com'}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: projectFormErrors.actionUrl ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            boxSizing: 'border-box',
                            marginTop: '4px'
                          }}
                        />
                        {projectFormErrors.actionUrl && (
                          <span style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            {projectFormErrors.actionUrl}
                          </span>
                        )}
                      </div>

                      {/* Short Description */}
                      <div>
                        <label style={{ fontSize: '0.8rem', color: projectFormErrors.description ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>
                          {isBangla ? 'সংক্ষিপ্ত বিবরণ (Short Description) *' : 'Short Description *'}
                        </label>
                        <textarea
                          rows={3}
                          value={projectDescription}
                          onChange={(e) => {
                            setProjectDescription(e.target.value);
                            if (projectFormErrors.description) setProjectFormErrors((prev) => ({ ...prev, description: '' }));
                          }}
                          placeholder={isBangla ? 'প্রজেক্টের সংক্ষিপ্ত বিবরণ লিখুন...' : 'Enter brief project description...'}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: projectFormErrors.description ? '1.5px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                            marginTop: '4px'
                          }}
                        />
                        {projectFormErrors.description && (
                          <span style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            {projectFormErrors.description}
                          </span>
                        )}
                      </div>

                      {/* Submit & Cancel Buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          type="submit"
                          disabled={featureActionLoading || uploadingProjectMedia}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: 'linear-gradient(135deg, #00838F 0%, #00F0FF 100%)',
                            color: '#000',
                            fontWeight: 800,
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 16px rgba(0, 240, 255, 0.25)'
                          }}
                        >
                          {featureActionLoading ? (
                            <>
                              <RefreshCw size={15} className="animate-spin" />
                              <span>{isBangla ? 'পাবলিশ হচ্ছে...' : 'Publishing...'}</span>
                            </>
                          ) : (
                            projectEditingId ? (
                              isBangla ? 'প্রজেক্ট আপডেট করুন' : 'Update Project'
                            ) : (
                              projectCategory === 'website' ? (
                                isBangla ? 'ওয়েবসাইট পাবলিশ করুন' : 'Publish Website'
                              ) : (
                                isBangla ? 'প্রজেক্ট পাবলিশ করুন' : 'Publish Project'
                              )
                            )
                          )}
                        </button>
                        {projectEditingId && (
                          <button
                            type="button"
                            onClick={resetProjectsForm}
                            style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.88rem' }}
                          >
                            {isBangla ? 'বাতিল' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Existing Projects List (Streamed Realtime) */}
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
                              <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
                                <span>{isBangla ? 'লাইভ স্ট্যাটাস' : 'Live Status'}</span>
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                              {list.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.84rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                  {isBangla ? 'এখনো কোনো প্রজেক্ট যুক্ত করা হয়নি। বামপাশের ফর্ম পূরণ করে যুক্ত করুন।' : 'No projects added yet. Add one using the form on the left.'}
                                </div>
                              ) : (
                                list.map((item) => {
                                  const isApp = (item.category || '').toLowerCase() === 'apps' || (item.category || '').toLowerCase() === 'app';
                                  const media = item.mediaUrl || item.icon || item.banner || item.thumbnail?.imageUrl || (isApp ? '/app1.png' : '/add1.png');
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
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'টুলের নাম (Tool Name) *' : 'Tool Name *'}</label>
                      <input
                        type="text"
                        required
                        value={favoriteName}
                        onChange={(e) => setFavoriteName(e.target.value)}
                        placeholder="e.g., Figma / Midjourney / CapCut"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'ক্যাটাগরি (Category) *' : 'Category *'}</label>
                        <select
                          value={favoriteCategory}
                          onChange={(e) => setFavoriteCategory(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0b1329', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        >
                          <option value="AI Tools">AI Tools</option>
                          <option value="Editing Apps">Editing Apps</option>
                          <option value="Design">Design</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'রেটিং (Rating)' : 'Rating'}</label>
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
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{isBangla ? 'কিসের জন্য পছন্দ করি / কেন ব্যবহার করি (Why I Prefer/Love This Tool) *' : 'Why I Prefer/Love This Tool *'}</span>
                        <span style={{ fontSize: '0.70rem', color: '#60A5FA' }}>{isBangla ? 'AI ও ডিজাইন স্পেশাল' : 'AI & Design Highlight'}</span>
                      </label>
                      <textarea
                        rows={2}
                        value={favoriteWhyLove}
                        onChange={(e) => setFavoriteWhyLove(e.target.value)}
                        placeholder={isBangla ? 'টুলটি পছন্দের কারণ ও ব্যবহার উল্লেখ করুন (যেমন: UI/UX ডিজাইন, প্রোটোটাইপিংয়ের সেরা টুল)...' : 'Why do you love this tool and when do you use it...'}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{isBangla ? 'টুল অফিশিয়াল URL / লাইভ লিংক (Official Link) *' : 'Tool Official URL / Live Link *'}</label>
                      <input
                        type="url"
                        required
                        value={favoriteOfficialUrl}
                        onChange={(e) => setFavoriteOfficialUrl(e.target.value)}
                        placeholder="https://figma.com"
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Direct Device Gallery File Picker with No Pre-Upload */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        {isBangla ? 'টুল আইকন বা লোগো ফাইল নির্বাচন (ক্লাউডফ্লেয়ার R2-তে সেভ হবে)' : 'Tool Icon / Logo File (Saved to Cloudflare R2)'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(29, 104, 255, 0.15)',
                          border: '1.5px solid #1D68FF',
                          color: '#60A5FA',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <Upload size={16} />
                          <span>
                            {uploadingFavoriteImage
                              ? (isBangla ? 'কম্প্রেস ও আপলোড হচ্ছে...' : 'Compressing & Uploading to R2...')
                              : (isBangla ? 'গ্যালারি থেকে আইকন বাছুন' : 'Choose Icon File')}
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
                            {uploadingFavoriteImage 
                              ? (isBangla ? 'R2-তে আপলোড হচ্ছে...' : 'Uploading to R2...') 
                              : (favoriteImageFile ? (isBangla ? '✓ নির্বাচিত (সংরক্ষণে কম্প্রেস ও আপলোড হবে)' : '✓ Selected (will compress & upload on save)') : (isBangla ? '✓ বর্তমান আইকন' : '✓ Current Icon'))}
                          </span>
                        )}
                      </div>
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
                          <span style={{ fontSize: '0.64rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(29, 104, 255, 0.2)', color: '#60A5FA' }}>{favoriteCategory}</span>
                          {favoriteWhyLove && (
                            <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#BFDBFE', background: 'rgba(29, 104, 255, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>
                              🎯 Why I Love: {favoriteWhyLove}
                            </div>
                          )}
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
              {currentAdminView === 'add-deal' ? (
                /* 1. DEDICATED ADD / EDIT DEAL COMPACT NO-SCROLL VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
                  {/* Compact Modern Form Card (max-w-4xl, no-scroll fit) */}
                  <div
                    style={{
                      maxWidth: '880px',
                      width: '100%',
                      margin: '0 auto',
                      background: 'linear-gradient(145deg, #0e172a 0%, #131e36 100%)',
                      border: '1.5px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '20px',
                      padding: '16px 22px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.08)',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Compact Top Header Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1.2px solid rgba(16, 185, 129, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10B981',
                            flexShrink: 0
                          }}
                        >
                          <Percent size={18} />
                        </div>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.2px' }}>
                            {dealEditingId 
                              ? (isBangla ? 'ডিল সম্পাদনা করুন (Edit Deal)' : 'Edit Deal Offer') 
                              : (isBangla ? 'নতুন ডিল প্রকাশ করুন (Create New Deal)' : 'Create & Publish New Deal')}
                          </h2>
                          <span style={{ fontSize: '0.70rem', color: '#94A3B8', display: 'block' }}>
                            {isBangla ? 'ল্যাপটপ স্ক্রিন ফিট কমপ্যাক্ট ফর্ম' : 'Compact no-scroll form'}
                          </span>
                        </div>
                      </div>

                      {/* Clear Back to Dashboard Button */}
                      <button
                        type="button"
                        onClick={() => {
                          resetDealForm();
                          setCurrentAdminView(null);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#E2E8F0',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }}
                      >
                        <ArrowLeft size={14} color="#38BDF8" />
                        <span>{isBangla ? '← ব্যাক টু ড্যাশবোর্ড' : '← Back to Dashboard'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleSaveDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Compact 2-Column Responsive Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                          gap: '16px',
                          width: '100%',
                          alignItems: 'start'
                        }}
                      >
                        {/* LEFT COLUMN: Title, Pricing/Discount, Coupon, Limited Deal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* 1. Deal Title */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0' }}>
                              {isBangla ? 'ডিল শিরোনাম (Deal Title) *' : 'Deal Title *'}
                            </label>
                            <input
                              type="text"
                              required
                              value={dealTitle}
                              onChange={(e) => setDealTitle(e.target.value)}
                              placeholder={isBangla ? 'ডিলের নাম বা শিরোনাম লিখুন...' : 'Enter deal title...'}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1.2px solid rgba(255, 255, 255, 0.12)',
                                color: '#FFFFFF',
                                fontSize: '0.84rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#10B981'}
                              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                            />
                          </div>

                          {/* 2. Package Rate & Discount - 2 Sub-Columns */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {/* Regular Price */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#E2E8F0' }}>
                                {isBangla ? 'প্যাকেজ রেট (BDT) *' : 'Package Rate (BDT) *'}
                              </label>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span
                                  style={{
                                    position: 'absolute',
                                    left: '10px',
                                    color: '#10B981',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    fontFamily: "'Space Grotesk', monospace",
                                    pointerEvents: 'none'
                                  }}
                                >
                                  ৳ BDT
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={dealOriginalPrice}
                                  onChange={(e) => setDealOriginalPrice(e.target.value)}
                                  placeholder={isBangla ? 'মূল্য লিখুন (যেমন: ৫০০০)' : 'Regular price (e.g. 5000)'}
                                  style={{
                                    width: '100%',
                                    height: '36px',
                                    paddingLeft: '56px',
                                    paddingRight: '10px',
                                    borderRadius: '10px',
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1.2px solid rgba(255, 255, 255, 0.12)',
                                    color: '#FFFFFF',
                                    fontSize: '0.86rem',
                                    fontWeight: 700,
                                    fontFamily: "'Space Grotesk', monospace",
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                                />
                              </div>
                            </div>

                            {/* Discount Rate (%) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#E2E8F0' }}>
                                {isBangla ? 'ছাড়ের শতকরা হার (%) *' : 'Discount Rate (%) *'}
                              </label>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span
                                  style={{
                                    position: 'absolute',
                                    right: '10px',
                                    color: '#10B981',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    fontFamily: "'Space Grotesk', monospace",
                                    pointerEvents: 'none'
                                  }}
                                >
                                  % OFF
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  required
                                  value={dealDiscountPercent}
                                  onChange={(e) => setDealDiscountPercent(e.target.value)}
                                  placeholder={isBangla ? 'ছাড়ের হার (যেমন: ২৫)' : 'Discount rate % (e.g. 25)'}
                                  style={{
                                    width: '100%',
                                    height: '36px',
                                    paddingLeft: '10px',
                                    paddingRight: '56px',
                                    borderRadius: '10px',
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1.2px solid rgba(255, 255, 255, 0.12)',
                                    color: '#FFFFFF',
                                    fontSize: '0.86rem',
                                    fontWeight: 700,
                                    fontFamily: "'Space Grotesk', monospace",
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                                />
                              </div>
                            </div>
                          </div>

                          {/* 3. Coupon Code (Optional) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: 700, color: '#E2E8F0' }}>
                                <Tag size={13} color="#00E5FF" />
                                <span>{isBangla ? 'কুপন কোড (ঐচ্ছিক)' : 'Coupon Code (Optional)'}</span>
                              </label>
                              <span style={{ fontSize: '0.70rem', color: '#64748B' }}>
                                {isBangla ? 'কুপন না থাকলে খালি রাখুন' : 'Optional'}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={dealCouponCode}
                              onChange={(e) => setDealCouponCode(e.target.value.toUpperCase())}
                              placeholder={isBangla ? 'কুপন কোড (যদি থাকে)' : 'Coupon code (optional)'}
                              style={{
                                width: '100%',
                                height: '36px',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1.2px solid rgba(255, 255, 255, 0.12)',
                                color: '#00F0FF',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                fontFamily: "'Space Grotesk', monospace",
                                letterSpacing: '1px',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#00E5FF'}
                              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                            />
                          </div>

                          {/* 4. Limited Deal Option */}
                          <div
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                                <Clock size={14} color="#F59E0B" />
                                <span>{isBangla ? 'সীমিত সময়ের ডিল (Limited Time Deal)' : 'Limited Time Deal'}</span>
                              </span>
                              <input
                                type="checkbox"
                                checked={dealIsLimited}
                                onChange={(e) => setDealIsLimited(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#F59E0B', cursor: 'pointer' }}
                              />
                            </label>

                            {dealIsLimited && (
                              <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FBBF24' }}>
                                  {isBangla ? 'অফার সমাপ্তির তারিখ ও সময় *' : 'Offer Expiry Date & Time *'}
                                </label>
                                <input
                                  type="datetime-local"
                                  value={dealExpiryDate}
                                  onChange={(e) => setDealExpiryDate(e.target.value)}
                                  style={{
                                    width: '100%',
                                    height: '32px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    background: '#090d16',
                                    border: '1.2px solid rgba(245, 158, 11, 0.5)',
                                    color: '#FBBF24',
                                    fontSize: '0.78rem',
                                    fontFamily: "'Space Grotesk', monospace",
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Banner Image Uploader, Description, Submit Button */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* 5. Banner Image Uploader */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0' }}>
                              {isBangla ? 'ব্যানার ইমেজ আপলোডার (Banner Image)' : 'Banner Image Uploader'}
                            </label>

                            {dealBannerUrl ? (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '8px 12px',
                                  height: '75px',
                                  borderRadius: '12px',
                                  background: 'rgba(15, 23, 42, 0.9)',
                                  border: '1.2px solid rgba(56, 189, 248, 0.35)',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <div
                                  style={{
                                    width: '65px',
                                    height: '50px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: '#090d16',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    flexShrink: 0
                                  }}
                                >
                                  <img
                                    src={dealBannerUrl}
                                    alt="Deal Banner Preview"
                                    onError={(e) => { e.target.src = '/add1.png'; }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span
                                    style={{
                                      display: 'block',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      color: '#FFFFFF',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {selectedDealFile ? selectedDealFile.name : (dealBannerUrl.startsWith('http') ? 'ক্লাউড ব্যানার ইমেজ' : 'নির্বাচিত ব্যানার')}
                                  </span>
                                  {dealFileSizeInfo ? (
                                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#10B981', marginTop: '1px' }}>
                                      {dealFileSizeInfo}
                                    </span>
                                  ) : (
                                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px' }}>
                                      {isBangla ? 'ব্যানার প্রিভিউ সক্রিয়' : 'Banner active'}
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={handleRemoveDealImage}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    color: '#EF4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                  title={isBangla ? 'ছবি মুছুন' : 'Remove Image'}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ) : (
                              <label
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '75px',
                                  padding: '8px 12px',
                                  borderRadius: '12px',
                                  border: '1.5px dashed rgba(56, 189, 248, 0.4)',
                                  background: 'rgba(15, 23, 42, 0.6)',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.2s ease',
                                  boxSizing: 'border-box'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#10B981';
                                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                                }}
                              >
                                <Upload size={20} color="#38BDF8" style={{ marginBottom: '4px' }} />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                                  {isBangla ? 'ছবি নির্বাচন করুন (Browse Deal Banner)' : 'Browse Deal Banner Image'}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                  {isBangla ? 'সিলেক্ট করলে প্রিভিউ দেখাবে (< ৩০০ KB WebP)' : 'Local preview on selection (< 300 KB WebP)'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleDealFileChange}
                                  style={{ display: 'none' }}
                                />
                              </label>
                            )}
                          </div>

                          {/* 6. Short Description */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#E2E8F0' }}>
                              {isBangla ? 'সংক্ষিপ্ত বিবরণ ও সুবিধাসমূহ (Description)' : 'Short Description & Features'}
                            </label>
                            <textarea
                              rows={2}
                              value={dealDescription}
                              onChange={(e) => setDealDescription(e.target.value)}
                              placeholder={isBangla ? 'অফারের আওতায় অন্তর্ভুক্ত সুবিধাসমূহ ও টেকনোলজি লিখুন...' : 'Key deliverables, features, and terms of this deal...'}
                              style={{
                                width: '100%',
                                height: '62px',
                                minHeight: '62px',
                                maxHeight: '75px',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1.2px solid rgba(255, 255, 255, 0.12)',
                                color: '#FFFFFF',
                                fontSize: '0.80rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                resize: 'none',
                                lineHeight: '1.4'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#10B981'}
                              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                            />
                          </div>

                          {/* 7. Action Button */}
                          <div style={{ marginTop: '2px' }}>
                            <button
                              type="submit"
                              disabled={featureActionLoading || isCompressingDealImage}
                              style={{
                                width: '100%',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                border: '1.5px solid #34D399',
                                color: '#FFFFFF',
                                fontSize: '0.90rem',
                                fontWeight: 800,
                                cursor: featureActionLoading || isCompressingDealImage ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                                transition: 'all 0.2s ease',
                                opacity: featureActionLoading || isCompressingDealImage ? 0.65 : 1
                              }}
                            >
                              {featureActionLoading || isCompressingDealImage ? (
                                <span>{isBangla ? '⏳ আপলোড ও প্রকাশ করা হচ্ছে...' : '⏳ Processing & Publishing...'}</span>
                              ) : (
                                <span>{dealEditingId ? (isBangla ? '💾 পরিবর্তন সংরক্ষণ করুন' : '💾 Update Deal') : (isBangla ? '🚀 ডিল প্রকাশ করুন' : '🚀 Publish Deal')}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* 2. DEALS CARDS DASHBOARD VIEW */
                <>
                  {/* Dedicated Top Navigation Bar */}
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
                      onClick={() => {
                        resetDealForm();
                        setCurrentAdminView('add-deal');
                      }}
                      style={{
                        marginLeft: 'auto',
                        padding: '10px 22px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        border: '1.5px solid #34D399',
                        color: '#FFFFFF',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={17} />
                      <span>{isBangla ? '+ নতুন ডিল যোগ করুন' : '+ Add New Deal'}</span>
                    </button>
                  </div>

                  {/* Full Width Deals Cards Section */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <FirestoreStreamBuilder collectionName={COLLECTIONS.DEALS_DISCOUNTS}>
                      {({ data }) => {
                        const list = data || [];
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Percent size={17} color="#10B981" />
                                <span>{isBangla ? `সক্রিয় ডিল ও ডিসকাউন্ট (${list.length})` : `Active Deals & Discounts (${list.length})`}</span>
                              </h3>
                              <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                                {isBangla ? 'রিয়েলটাইম ফায়ারস্টোর deals কালেকশন' : 'Real-time Firestore deals stream'}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
                              {list.map((item) => {
                                const isExpired = Boolean(item.isLimited && item.expiryDate && (new Date(item.expiryDate).getTime() < Date.now()));
                                const isLimitedActive = Boolean(item.isLimited && item.expiryDate && (new Date(item.expiryDate).getTime() >= Date.now()));

                                return (
                                  <div
                                    key={item.id}
                                    style={{
                                      padding: '14px',
                                      background: 'rgba(15, 23, 42, 0.85)',
                                      border: `1.5px solid ${isExpired ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                                      borderRadius: '14px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '10px'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ width: '48px', height: '38px', borderRadius: '8px', overflow: 'hidden', background: '#0b1329', border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
                                        <img src={item.bannerUrl || item.imagePath || '/add1.png'} alt={item.title} onError={(e) => { e.target.src = '/add1.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      </div>
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', color: '#fff', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <span style={{ fontSize: '0.64rem', padding: '1px 6px', borderRadius: '4px', background: '#00695C', color: '#fff', fontWeight: 800 }}>{item.discountPercent || item.discountCode}</span>
                                          <span style={{ fontSize: '0.7rem', color: '#10B981', fontFamily: "'Space Grotesk', monospace" }}>{item.couponCode || item.discountCode ? `🏷️ ${item.couponCode || item.discountCode}` : ''}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', fontSize: '0.74rem' }}>
                                      <div>
                                        <span style={{ color: '#F59E0B', fontWeight: 800, fontFamily: "'Space Grotesk', monospace" }}>
                                          ৳{item.originalPrice || item.regularPrice || 0} BDT
                                        </span>
                                      </div>
                                      <div>
                                        {isExpired ? (
                                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', fontWeight: 800, fontSize: '0.68rem' }}>
                                            ⏰ Expired (মেয়াদোত্তীর্ণ)
                                          </span>
                                        ) : isLimitedActive ? (
                                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#FBBF24', fontWeight: 800, fontSize: '0.68rem' }}>
                                            ⏰ Limited Time
                                          </span>
                                        ) : (
                                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', fontWeight: 700, fontSize: '0.68rem' }}>
                                            ✓ Active
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleEditDeal(item)}
                                        style={{ padding: '5px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', borderRadius: '6px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        title="Edit Deal"
                                      >
                                        <Edit3 size={13} />
                                        <span>{isBangla ? 'সম্পাদনা' : 'Edit'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDeal(item)}
                                        style={{ padding: '5px 10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        title="Delete Deal"
                                      >
                                        <Trash2 size={13} />
                                        <span>{isBangla ? 'মুছুন' : 'Delete'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      }}
                    </FirestoreStreamBuilder>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: PENDING DEALS & ORDERS */}
          {activeAdminTab === 'deal_orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentAdminView === 'order-details' && selectedAdminOrderDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
                  {/* Full Order Details Dashboard Card (max-w-3xl) */}
                  <div
                    style={{
                      maxWidth: '820px',
                      width: '100%',
                      margin: '0 auto',
                      background: 'linear-gradient(145deg, #0e172a 0%, #131e36 100%)',
                      border: '1.5px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '24px',
                      padding: '28px 32px',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.08)',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* 1. Top Header & Navigation Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '22px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.3px' }}>
                          {isBangla ? 'অর্ডার বিস্তারিত ড্যাশবোর্ড' : 'Order Details Dashboard'}
                        </h2>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(0, 240, 255, 0.15)',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            color: '#00F0FF',
                            fontFamily: "'Space Grotesk', monospace",
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {selectedAdminOrderDetails.orderCode || selectedAdminOrderDetails.orderId || 'ORD-84920'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAdminOrderDetails(null);
                            setCurrentAdminView(null);
                          }}
                          style={{
                            padding: '9px 18px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#E2E8F0',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          }}
                        >
                          <ArrowLeft size={16} color="#38BDF8" />
                          <span>{isBangla ? '← ব্যাক টু লিস্ট' : '← Back to List'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteOrder(selectedAdminOrderDetails);
                            setSelectedAdminOrderDetails(null);
                            setCurrentAdminView(null);
                          }}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title={isBangla ? 'অর্ডার রেকর্ড মুছুন' : 'Delete Order Record'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* 2. Order Quick Summary Header */}
                    <div
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} color="#64748B" />
                          <span>
                            {selectedAdminOrderDetails.orderDate || (selectedAdminOrderDetails.createdAt?.toDate ? selectedAdminOrderDetails.createdAt.toDate().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }) : (selectedAdminOrderDetails.createdAt ? String(selectedAdminOrderDetails.createdAt) : 'আজকের অর্ডার'))}
                          </span>
                        </span>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {selectedAdminOrderDetails.dealTitle || (isBangla ? 'এক্সক্লুসিভ অফার ডিল' : 'Exclusive Deal')}
                        </h3>
                      </div>

                      {/* Current status badge */}
                      <div>
                        {(() => {
                          const curStatus = (selectedAdminOrderDetails.status || 'pending').toLowerCase();
                          if (curStatus === 'accepted') {
                            return (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.18)', border: '1.5px solid #10B981', color: '#34D399', fontSize: '0.82rem', fontWeight: 800 }}>
                                <CheckCircle2 size={15} color="#34D399" />
                                <span>{isBangla ? 'অনুমোদিত (ACCEPTED)' : 'ACCEPTED'}</span>
                              </div>
                            );
                          }
                          if (curStatus === 'cancelled') {
                            return (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.18)', border: '1.5px solid #EF4444', color: '#F87171', fontSize: '0.82rem', fontWeight: 800 }}>
                                <X size={15} color="#F87171" />
                                <span>{isBangla ? 'বাতিল (CANCELLED)' : 'CANCELLED'}</span>
                              </div>
                            );
                          }
                          return (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.18)', border: '1.5px solid #F59E0B', color: '#FBBF24', fontSize: '0.82rem', fontWeight: 800 }}>
                              <Clock size={15} color="#FBBF24" />
                              <span>{isBangla ? 'পেন্ডিং (PENDING)' : 'PENDING'}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 3. Information Presentation: 2 Equal Columns Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '20px',
                        width: '100%'
                      }}
                    >
                      {/* Left Column: Customer Information Card */}
                      <div
                        style={{
                          background: 'rgba(15, 23, 42, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '18px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <User size={18} color="#38BDF8" />
                          <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                            {isBangla ? 'গ্রাহকের তথ্য (Customer Information)' : 'Customer Information'}
                          </h4>
                        </div>

                        {/* Customer Name */}
                        <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                            {isBangla ? 'গ্রাহকের নাম:' : 'Client Name:'}
                          </span>
                          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {selectedAdminOrderDetails.clientName || selectedAdminOrderDetails.name || (isBangla ? 'নাম দেওয়া হয়নি' : 'No Name Provided')}
                          </span>
                        </div>

                        {/* Mobile / WhatsApp */}
                        <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                            {isBangla ? 'মোবাইল / হোয়াটসঅ্যাপ:' : 'Mobile / WhatsApp:'}
                          </span>
                          <a
                            href={`tel:${selectedAdminOrderDetails.clientPhone || selectedAdminOrderDetails.phone || selectedAdminOrderDetails.whatsapp}`}
                            style={{
                              fontSize: '0.90rem',
                              fontWeight: 800,
                              color: '#38BDF8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={14} />
                            <span>{selectedAdminOrderDetails.clientPhone || selectedAdminOrderDetails.phone || selectedAdminOrderDetails.whatsapp || (isBangla ? 'মোবাইল নেই' : 'No Phone')}</span>
                          </a>
                        </div>

                        {/* Email Address */}
                        <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                            {isBangla ? 'ইমেইল অ্যাড্রেস:' : 'Email Address:'}
                          </span>
                          <a
                            href={`mailto:${selectedAdminOrderDetails.clientEmail || selectedAdminOrderDetails.email}`}
                            style={{
                              fontSize: '0.86rem',
                              fontWeight: 600,
                              color: '#E2E8F0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              textDecoration: 'none',
                              wordBreak: 'break-all'
                            }}
                          >
                            <Mail size={14} color="#38BDF8" style={{ flexShrink: 0 }} />
                            <span>{selectedAdminOrderDetails.clientEmail || selectedAdminOrderDetails.email || (isBangla ? 'ইমেইল দেওয়া হয়নি' : 'No Email')}</span>
                          </a>
                        </div>

                        {/* Full Delivery/Contact Address */}
                        <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, marginBottom: '4px' }}>
                            <MapPin size={13} color="#F59E0B" />
                            <span>{isBangla ? 'পূর্ণাঙ্গ ডেলিভারি/যোগাযোগের ঠিকানা:' : 'Full Delivery/Contact Address:'}</span>
                          </span>
                          <p style={{ margin: 0, fontSize: '0.86rem', color: '#E2E8F0', lineHeight: '1.6', fontWeight: 500 }}>
                            {selectedAdminOrderDetails.clientAddress || selectedAdminOrderDetails.address || (isBangla ? 'কোনো ঠিকানা উল্লেখ করা হয়নি' : 'No address provided')}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Pricing & Deal Details Card */}
                      <div
                        style={{
                          background: 'rgba(15, 23, 42, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '18px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <Tag size={18} color="#10B981" />
                          <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                            {isBangla ? 'মূল্য ও ডিলের বিবরণ (Pricing & Deal Details)' : 'Pricing & Deal Details'}
                          </h4>
                        </div>

                        {/* Deal Name */}
                        <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, marginBottom: '2px' }}>
                            {isBangla ? 'ডিলের নাম / প্যাকেজ:' : 'Deal / Package:'}
                          </span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {selectedAdminOrderDetails.dealTitle || (isBangla ? 'এক্সক্লুসিভ অফার ডিল' : 'Exclusive Deal')}
                          </span>
                        </div>

                        {/* Regular Price */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>
                            {isBangla ? 'প্যাকেজের মূল দাম:' : 'Original Package Rate:'}
                          </span>
                          <span style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'line-through', fontFamily: "'Space Grotesk', monospace" }}>
                            {selectedAdminOrderDetails.originalPrice ? `৳${selectedAdminOrderDetails.originalPrice} BDT` : '৳5000 BDT'}
                          </span>
                        </div>

                        {/* Discount & Coupon */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>
                            {isBangla ? 'ছাড় ও কুপন বিবরণ:' : 'Discount & Coupon:'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedAdminOrderDetails.couponCode && (
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  color: '#34D399',
                                  fontFamily: "'Space Grotesk', monospace",
                                  fontWeight: 800,
                                  fontSize: '0.74rem'
                                }}
                              >
                                🏷️ {selectedAdminOrderDetails.couponCode}
                              </span>
                            )}
                            <span style={{ color: '#10B981', fontWeight: 800, fontFamily: "'Space Grotesk', monospace", fontSize: '0.88rem' }}>
                              {selectedAdminOrderDetails.discountAmount || (selectedAdminOrderDetails.discountPercent ? `${selectedAdminOrderDetails.discountPercent}%` : '৳0 BDT')}
                            </span>
                          </div>
                        </div>

                        {/* Total Payable Amount */}
                        <div
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%)',
                            border: '1.5px solid rgba(245, 158, 11, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {isBangla ? 'সর্বমোট প্রদেয় মূল্য:' : 'Total Payable Amount:'}
                          </span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FBBF24', fontFamily: "'Space Grotesk', monospace" }}>
                            {selectedAdminOrderDetails.finalPrice ? `৳${selectedAdminOrderDetails.finalPrice} BDT` : (selectedAdminOrderDetails.originalPrice ? `৳${selectedAdminOrderDetails.originalPrice} BDT` : '৳5000 BDT')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Customer Note / Message (if present) */}
                    {selectedAdminOrderDetails.message ? (
                      <div
                        style={{
                          marginTop: '18px',
                          padding: '16px 20px',
                          borderRadius: '14px',
                          background: 'rgba(0, 229, 255, 0.08)',
                          borderLeft: '4px solid #00E5FF',
                          borderTop: '1px solid rgba(0, 229, 255, 0.2)',
                          borderRight: '1px solid rgba(0, 229, 255, 0.2)',
                          borderBottom: '1px solid rgba(0, 229, 255, 0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <MessageSquare size={16} color="#00E5FF" />
                          <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isBangla ? 'গ্রাহকের বিশেষ বার্তা বা নোট (Customer Message)' : 'Customer Message'}
                          </h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#E2E8F0', fontStyle: 'italic', lineHeight: '1.6' }}>
                          "{selectedAdminOrderDetails.message}"
                        </p>
                      </div>
                    ) : null}

                    {/* 5. Status & Action Control Bar */}
                    <div
                      style={{
                        marginTop: '24px',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                    >
                      {/* Left: Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>
                          {isBangla ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}
                        </span>
                        {(() => {
                          const orderStatus = (selectedAdminOrderDetails.status || 'pending').toLowerCase();
                          if (orderStatus === 'accepted' || orderStatus === 'confirmed') {
                            return (
                              <span
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  background: 'rgba(16, 185, 129, 0.18)',
                                  border: '1.5px solid #10B981',
                                  color: '#34D399',
                                  fontSize: '0.80rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <CheckCircle2 size={15} />
                                <span>{isBangla ? '✓ অনুমোদিত (Accepted)' : '✓ Accepted'}</span>
                              </span>
                            );
                          }
                          if (orderStatus === 'cancelled' || orderStatus === 'rejected') {
                            return (
                              <span
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  background: 'rgba(239, 68, 68, 0.18)',
                                  border: '1.5px solid #EF4444',
                                  color: '#F87171',
                                  fontSize: '0.80rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <X size={15} />
                                <span>{isBangla ? '✕ বাতিল (Cancelled)' : '✕ Cancelled'}</span>
                              </span>
                            );
                          }
                          return (
                            <span
                              style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                background: 'rgba(245, 158, 11, 0.18)',
                                border: '1.5px solid #F59E0B',
                                color: '#FBBF24',
                                fontSize: '0.80rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Clock size={15} />
                              <span>{isBangla ? '⏳ পেন্ডিং (Pending)' : '⏳ Pending'}</span>
                            </span>
                          );
                        })()}
                      </div>

                      {/* Right: Action Buttons: Accept & Reject (Visible ONLY when Pending) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {(() => {
                          const orderStatus = (selectedAdminOrderDetails.status || 'pending').toLowerCase();
                          const isPending = orderStatus === 'pending';

                          // If order is processed (accepted/confirmed/cancelled/rejected), permanently hide action buttons and display a prominent final badge
                          if (!isPending) {
                            const isAccepted = orderStatus === 'accepted' || orderStatus === 'confirmed';
                            return (
                              <div
                                style={{
                                  padding: '8px 18px',
                                  borderRadius: '12px',
                                  background: isAccepted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  border: `1.5px solid ${isAccepted ? '#10B981' : '#EF4444'}`,
                                  color: isAccepted ? '#34D399' : '#F87171',
                                  fontSize: '0.82rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  boxShadow: isAccepted ? '0 2px 10px rgba(16, 185, 129, 0.2)' : '0 2px 10px rgba(239, 68, 68, 0.2)'
                                }}
                              >
                                {isAccepted ? (
                                  <>
                                    <CheckCircle2 size={16} color="#10B981" />
                                    <span>{isBangla ? '✓ অর্ডারটি অনুমোদিত হয়েছে (Action Finalized)' : '✓ Order Accepted (Action Finalized)'}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={16} color="#EF4444" />
                                    <span>{isBangla ? '✕ অর্ডারটি বাতিল করা হয়েছে (Action Finalized)' : '✕ Order Cancelled (Action Finalized)'}</span>
                                  </>
                                )}
                              </div>
                            );
                          }

                          const orderKey = selectedAdminOrderDetails._firestoreDocId || selectedAdminOrderDetails.id || selectedAdminOrderDetails.orderCode;
                          const isUpdating = orderUpdatingId === orderKey || orderUpdatingId === selectedAdminOrderDetails.orderCode;

                          return (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateOrderStatus(selectedAdminOrderDetails, 'accepted')}
                                style={{
                                  padding: '10px 22px',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                  border: '1.5px solid #10B981',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: '0.84rem',
                                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                                  transition: 'all 0.2s ease',
                                  opacity: isUpdating ? 0.6 : 1
                                }}
                              >
                                <Check size={16} />
                                <span>{isUpdating ? 'সংরক্ষণ হচ্ছে...' : (isBangla ? '✓ গ্রহণ করুন (Accept)' : '✓ Accept')}</span>
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateOrderStatus(selectedAdminOrderDetails, 'cancelled')}
                                style={{
                                  padding: '10px 22px',
                                  borderRadius: '12px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1.5px solid #EF4444',
                                  color: '#F87171',
                                  fontWeight: 800,
                                  fontSize: '0.84rem',
                                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.2s ease',
                                  opacity: isUpdating ? 0.6 : 1
                                }}
                              >
                                <X size={16} />
                                <span>{isUpdating ? 'সংরক্ষণ হচ্ছে...' : (isBangla ? '✕ বাতিল করুন (Reject)' : '✕ Reject')}</span>
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                        color: '#F59E0B',
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
                        {isBangla ? 'গ্রাহকদের ডিল ও অর্ডার পেন্ডিং লিস্ট (Pending Deals & Orders)' : 'Customer Deal Claims & Pending Orders'}
                      </span>
                    </div>
                  </div>

                  {/* Real-time FirestoreStreamBuilder for deal_orders with Newest First sorting */}
                  <FirestoreStreamBuilder collectionName="deal_orders" orderByField="createdAt" orderDirection="desc">
                    {({ data, loading }) => {
                      const rawOrders = data || [];

                      // Helper to extract timestamp millis accurately for real-time descending sort
                      const parseOrderTime = (o) => {
                        if (!o) return 0;
                        if (o.createdAt) {
                          if (typeof o.createdAt.toMillis === 'function') return o.createdAt.toMillis();
                          if (typeof o.createdAt.toDate === 'function') return o.createdAt.toDate().getTime();
                          if (o.createdAt.seconds) return o.createdAt.seconds * 1000;
                          if (typeof o.createdAt === 'number') return o.createdAt;
                          const parsed = new Date(o.createdAt).getTime();
                          if (!isNaN(parsed) && parsed > 0) return parsed;
                        }
                        if (o.redeemedAt) {
                          const parsed = new Date(o.redeemedAt).getTime();
                          if (!isNaN(parsed) && parsed > 0) return parsed;
                        }
                        if (o.orderDate) {
                          const parsed = new Date(o.orderDate).getTime();
                          if (!isNaN(parsed) && parsed > 0) return parsed;
                        }
                        return 0;
                      };

                      // Merge optimistic local status overrides and exclude locally deleted orders
                      const allOrders = rawOrders
                        .filter((o) => !localDeletedOrderIds.has(o.id) && !localDeletedOrderIds.has(o._firestoreDocId) && !localDeletedOrderIds.has(o.orderCode))
                        .map((o) => {
                          const key = o._firestoreDocId || o.id || o.orderCode;
                          const override = localOrderStatusOverrides[key] || 
                                           (o.orderCode ? localOrderStatusOverrides[o.orderCode] : null) || 
                                           (o.id ? localOrderStatusOverrides[o.id] : null) ||
                                           (o._firestoreDocId ? localOrderStatusOverrides[o._firestoreDocId] : null);
                          if (override) {
                            return { ...o, status: override, claimed: override === 'accepted' };
                          }
                          return o;
                        })
                        .sort((a, b) => parseOrderTime(b) - parseOrderTime(a));

                      const pendingCount = allOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length;
                      const acceptedCount = allOrders.filter(o => (o.status || '').toLowerCase() === 'accepted').length;
                      const cancelledCount = allOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length;

                      const filteredOrders = allOrders.filter(o => {
                        const s = (o.status || 'pending').toLowerCase();
                        if (orderStatusFilter === 'pending') return s === 'pending';
                        if (orderStatusFilter === 'accepted') return s === 'accepted';
                        if (orderStatusFilter === 'cancelled') return s === 'cancelled';
                        return true;
                      });

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {/* Filter Control Pills */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            flexWrap: 'wrap',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {[
                                { id: 'all', labelBn: `সকল অর্ডার (${allOrders.length})`, labelEn: `All Orders (${allOrders.length})`, color: '#38BDF8' },
                                { id: 'pending', labelBn: `পেন্ডিং (${pendingCount})`, labelEn: `Pending (${pendingCount})`, color: '#F59E0B' },
                                { id: 'accepted', labelBn: `অনুমোদিত (${acceptedCount})`, labelEn: `Accepted (${acceptedCount})`, color: '#10B981' },
                                { id: 'cancelled', labelBn: `বাতিল (${cancelledCount})`, labelEn: `Cancelled (${cancelledCount})`, color: '#EF4444' }
                              ].map((f) => {
                                const isSelected = orderStatusFilter === f.id;
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setOrderStatusFilter(f.id)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: '20px',
                                      background: isSelected ? `${f.color}25` : 'rgba(255, 255, 255, 0.04)',
                                      border: `1.5px solid ${isSelected ? f.color : 'rgba(255, 255, 255, 0.1)'}`,
                                      color: isSelected ? '#FFFFFF' : '#94A3B8',
                                      fontSize: '0.80rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      boxShadow: isSelected ? `0 2px 10px ${f.color}33` : 'none'
                                    }}
                                  >
                                    {isBangla ? f.labelBn : f.labelEn}
                                  </button>
                                );
                              })}
                            </div>

                            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                              {isBangla ? `মোট প্রদর্শিত: ${filteredOrders.length}` : `Showing: ${filteredOrders.length}`}
                            </span>
                          </div>

                          {/* Orders List / Empty State */}
                          {filteredOrders.length === 0 ? (
                            <div style={{
                              textAlign: 'center',
                              padding: '48px 20px',
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px dashed rgba(255, 255, 255, 0.1)'
                            }}>
                              <Clock size={36} color="#64748B" style={{ margin: '0 auto 12px auto' }} />
                              <h4 style={{ margin: '0 0 6px 0', color: '#FFFFFF', fontSize: '1rem', fontWeight: 700 }}>
                                {isBangla ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No Orders Found'}
                              </h4>
                              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.82rem' }}>
                                {isBangla ? 'গ্রাহকরা ডিল ক্লেইম করলে রিয়েলটাইমে এই তালিকায় দেখা যাবে।' : 'Customer orders will appear here live in real-time.'}
                              </p>
                            </div>
                          ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredOrders.map((order) => {
                                  const status = (order.status || 'pending').toLowerCase();
                                  const isPending = status === 'pending';
                                  const isAccepted = status === 'accepted';
                                  const isCancelled = status === 'cancelled';
                                  const orderKey = order._firestoreDocId || order.id || order.orderCode;
                                  const isUpdating = orderUpdatingId === orderKey || orderUpdatingId === order.orderCode;

                                  const statusConfig = isAccepted
                                    ? { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', color: '#34D399', textBn: '✓ অনুমোদিত (Accepted)', textEn: '✓ Accepted' }
                                    : isCancelled
                                    ? { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', color: '#F87171', textBn: '✕ বাতিল (Cancelled)', textEn: '✕ Cancelled' }
                                    : { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', color: '#FBBF24', textBn: '⏳ পেন্ডিং (Pending)', textEn: '⏳ Pending' };

                                  return (
                                    <div
                                      key={orderKey}
                                      style={{
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        background: isPending ? 'rgba(15, 23, 42, 0.90)' : 'rgba(15, 23, 42, 0.70)',
                                        border: `1.2px solid ${isPending ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        boxShadow: isPending ? '0 2px 10px rgba(245, 158, 11, 0.08)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: '12px',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      {/* 1. Order Code */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '100px' }}>
                                        <span style={{
                                          padding: '3px 8px',
                                          borderRadius: '6px',
                                          background: 'rgba(0, 240, 255, 0.12)',
                                          border: '1px solid rgba(0, 240, 255, 0.35)',
                                          color: '#00F0FF',
                                          fontWeight: 800,
                                          fontSize: '0.78rem',
                                          fontFamily: "'Space Grotesk', monospace",
                                          letterSpacing: '0.5px',
                                          width: 'fit-content'
                                        }}>
                                          {order.orderCode || order.orderId || 'ORD-84920'}
                                        </span>
                                        <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                                          {order.orderDate || (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('bn-BD') : '')}
                                        </span>
                                      </div>

                                      {/* 2. Customer Name & Mobile */}
                                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '140px', flex: '1 1 140px' }}>
                                        <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {order.clientName || order.name || 'গ্রাহকের নাম নেই'}
                                        </span>
                                        <span style={{ color: '#38BDF8', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <Phone size={11} />
                                          <span>{order.clientPhone || order.phone || order.whatsapp || 'মোবাইল নেই'}</span>
                                        </span>
                                      </div>

                                      {/* 3. Product / Deal Name */}
                                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px', flex: '1.5 1 150px' }}>
                                        <span style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {order.dealTitle || (isBangla ? 'এক্সক্লুসিভ ডিল' : 'Exclusive Deal')}
                                        </span>
                                        {order.couponCode && (
                                          <span style={{ color: '#10B981', fontSize: '0.70rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Tag size={10} />
                                            <span>কুপন: {order.couponCode}</span>
                                          </span>
                                        )}
                                      </div>

                                      {/* 4. Price (BDT) */}
                                      <div style={{ minWidth: '95px', textAlign: 'right' }}>
                                        <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.90rem', fontFamily: "'Space Grotesk', monospace", display: 'block' }}>
                                          {order.finalPrice ? `৳${order.finalPrice} BDT` : (order.originalPrice || '৳5000 BDT')}
                                        </span>
                                      </div>

                                      {/* 5. Status Badge */}
                                      <div style={{ minWidth: '105px' }}>
                                        <span style={{
                                          padding: '3px 10px',
                                          borderRadius: '20px',
                                          background: statusConfig.bg,
                                          border: `1px solid ${statusConfig.border}`,
                                          color: statusConfig.color,
                                          fontSize: '0.74rem',
                                          fontWeight: 800,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {isBangla ? statusConfig.textBn : statusConfig.textEn}
                                        </span>
                                      </div>

                                      {/* 6. Action Buttons */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                                        {/* View Details Button (👁️) */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedAdminOrderDetails(order);
                                            setCurrentAdminView('order-details');
                                          }}
                                          style={{
                                            padding: '5px 12px',
                                            borderRadius: '8px',
                                            background: 'rgba(56, 189, 248, 0.12)',
                                            border: '1px solid rgba(56, 189, 248, 0.35)',
                                            color: '#38BDF8',
                                            fontSize: '0.76rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.15s ease'
                                          }}
                                          title={isBangla ? 'বিস্তারিত তথ্য দেখুন' : 'View Details'}
                                        >
                                          <Eye size={13} />
                                          <span>{isBangla ? 'বিস্তারিত' : 'Details'}</span>
                                        </button>

                                        {/* Quick Accept & Cancel Buttons: Shown ONLY when status === 'pending'. For Accepted/Cancelled orders, buttons are hidden leaving only the status badge */}
                                        {isPending ? (
                                          <>
                                            <button
                                              type="button"
                                              disabled={isUpdating}
                                              onClick={() => handleUpdateOrderStatus(order, 'accepted')}
                                              style={{
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                                border: '1px solid #059669',
                                                color: '#FFFFFF',
                                                fontSize: '0.76rem',
                                                fontWeight: 800,
                                                cursor: isUpdating ? 'wait' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
                                              }}
                                              title={isBangla ? 'অর্ডার গ্রহণ করুন' : 'Accept Order'}
                                            >
                                              <Check size={13} />
                                              <span>{isUpdating ? '...' : 'Accept'}</span>
                                            </button>

                                            <button
                                              type="button"
                                              disabled={isUpdating}
                                              onClick={() => handleUpdateOrderStatus(order, 'cancelled')}
                                              style={{
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                background: 'rgba(239, 68, 68, 0.12)',
                                                border: '1px solid #EF4444',
                                                color: '#F87171',
                                                fontSize: '0.76rem',
                                                fontWeight: 800,
                                                cursor: isUpdating ? 'wait' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                              }}
                                              title={isBangla ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}
                                            >
                                              <X size={13} />
                                              <span>{isUpdating ? '...' : 'Cancel'}</span>
                                            </button>
                                          </>
                                        ) : null}

                                        {/* Delete Record */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteOrder(order)}
                                          style={{
                                            padding: '5px 8px',
                                            borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            color: '#64748B',
                                            cursor: 'pointer'
                                          }}
                                          title={isBangla ? 'রেকর্ড মুছুন' : 'Delete'}
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </>
              )}
            </div>
          )}

          {/* TAB: SPONSOR BANNERS (7-IMAGE FIFO ROTATION & HIDDEN CAPTION POSTS) */}
          {activeAdminTab === 'sponsors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Back to Overview Header */}
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
                  type="button"
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
                    color: '#FF6B00',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title={isBangla ? 'ওভারভিউ ড্যাশবোর্ডে ফিরুন' : 'Back to Overview'}
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {isBangla ? '← ড্যাশবোর্ড ওভারভিউতে ফিরুন' : '← Back to Overview Dashboard'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>
                    {isBangla ? '📢 স্পন্সর ব্যানার ও ৭টি ছবির FIFO রোটেশন ম্যানেজমেন্ট' : '📢 Sponsor Banners & 7-Image FIFO Rotation Management'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* LEFT COLUMN: COMPACT ADD SPONSOR BANNER FORM */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  padding: '22px',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(255, 107, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'rgba(255, 107, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF6B00'
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#FF6B00', fontWeight: 800 }}>
                        {isBangla ? 'নতুন স্পন্সর ব্যানার যুক্ত করুন' : 'Add New Sponsor Banner'}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {isBangla ? 'সাবমিট-পরবর্তী অটো-কম্প্রেশন ও স্টোরেজ আপলোড' : 'Auto-compress & deferred upload on submit'}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handlePublishSponsorBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* 1. Title / Caption */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.80rem', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                        {isBangla ? 'ছবির শিরোনাম বা ক্যাপশন *' : 'Image Title / Caption *'}
                      </label>
                      <input
                        type="text"
                        value={sponsorTitle}
                        onChange={(e) => setSponsorTitle(e.target.value)}
                        placeholder={isBangla ? 'যেমন: Brand Visual Identity' : 'e.g., Brand Visual Identity'}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${sponsorFormErrors.title ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      {sponsorFormErrors.title && (
                        <span style={{ display: 'block', color: '#EF4444', fontSize: '0.72rem', marginTop: '4px' }}>
                          {sponsorFormErrors.title}
                        </span>
                      )}
                    </div>

                    {/* 2. Detailed Description Textarea */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.80rem', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                        {isBangla ? 'বিস্তারিত বিবরণ (Description) *' : 'Detailed Description *'}
                      </label>
                      <textarea
                        rows={4}
                        value={sponsorDescription}
                        onChange={(e) => setSponsorDescription(e.target.value)}
                        placeholder={isBangla ? 'স্পন্সর বা পোস্ট সংক্রান্ত বিস্তারিত বিবরণ লিখুন (ক্লিক করার পর এটি প্রদর্শিত হবে)...' : 'Write detailed sponsor description (shown when banner is clicked)...'}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${sponsorFormErrors.description ? '#EF4444' : 'rgba(255, 255, 255, 0.12)'}`,
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: isBangla ? "'Anek Bangla', sans-serif" : 'inherit'
                        }}
                      />
                      {sponsorFormErrors.description && (
                        <span style={{ display: 'block', color: '#EF4444', fontSize: '0.72rem', marginTop: '4px' }}>
                          {sponsorFormErrors.description}
                        </span>
                      )}
                    </div>

                    {/* 3. Deferred Upload & Auto-Compress Dropzone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.80rem', color: '#94A3B8', fontWeight: 700, marginBottom: '6px' }}>
                        {isBangla ? 'ব্যানার ছবি ড্রপজোন (Deferred Upload & Auto-Compress) *' : 'Banner Image Dropzone (Deferred Upload & Auto-Compress) *'}
                      </label>

                      <input
                        ref={sponsorFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSponsorFileSelect}
                        style={{ display: 'none' }}
                      />

                      {sponsorLocalPreview ? (
                        <div style={{
                          padding: '12px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1.5px solid rgba(255, 107, 0, 0.35)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          <div style={{
                            width: '100%',
                            height: '140px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: '#0B0F19',
                            position: 'relative'
                          }}>
                            <img
                              src={sponsorLocalPreview}
                              alt="Local Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                            <button
                              type="button"
                              onClick={handleResetSponsorImage}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.85)',
                                border: 'none',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Compression Stats Badge */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.74rem',
                            color: '#94A3B8',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                          }}>
                            <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={13} />
                              {sponsorIsCompressing 
                                ? (isBangla ? 'কম্প্রেস হচ্ছে...' : 'Compressing...') 
                                : (isBangla ? 'ক্লায়েন্ট সাইড অপ্টিমাইজড' : 'Client-Side Optimized')}
                            </span>
                            <span>
                              {sponsorOriginalSize > 0 && (
                                <>
                                  {(sponsorOriginalSize / 1024).toFixed(0)} KB → <strong style={{ color: '#10B981' }}>{(sponsorCompressedSize / 1024).toFixed(0)} KB</strong>
                                  {sponsorOriginalSize > sponsorCompressedSize && (
                                    <span style={{ color: '#38BDF8', marginLeft: '4px' }}>
                                      (-{Math.round((1 - sponsorCompressedSize / sponsorOriginalSize) * 100)}%)
                                    </span>
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => sponsorFileInputRef.current?.click()}
                          style={{
                            padding: '28px 16px',
                            borderRadius: '14px',
                            border: `2px dashed ${sponsorFormErrors.image ? '#EF4444' : 'rgba(255, 107, 0, 0.4)'}`,
                            background: 'rgba(255, 107, 0, 0.03)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'rgba(255, 107, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FF6B00'
                          }}>
                            <Upload size={20} />
                          </div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {isBangla ? 'ছবি সিলেক্ট করতে ক্লিক করুন' : 'Click to select banner image'}
                          </span>
                          <span style={{ fontSize: '0.70rem', color: '#94A3B8' }}>
                            {isBangla ? 'PNG, JPG, WebP (সিলেক্টে আপলোড হবে না, সাবমিটে কম্প্রেস হয়ে আপলোড হবে)' : 'Deferred upload on submit with auto-compression'}
                          </span>
                        </div>
                      )}
                      {sponsorFormErrors.image && (
                        <span style={{ display: 'block', color: '#EF4444', fontSize: '0.72rem', marginTop: '4px' }}>
                          {sponsorFormErrors.image}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={sponsorUploading || sponsorIsCompressing}
                      style={{
                        marginTop: '6px',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        background: sponsorUploading 
                          ? 'rgba(255, 107, 0, 0.5)' 
                          : 'linear-gradient(135deg, #FF6B00 0%, #F57F17 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '0.90rem',
                        fontWeight: 800,
                        cursor: sponsorUploading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 16px rgba(255, 107, 0, 0.35)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {sponsorUploading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>{isBangla ? 'কম্প্রেস ও আপলোড হচ্ছে...' : 'Compressing & Publishing...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>{isBangla ? 'ব্যানার প্রকাশ করুন' : 'Publish Sponsor Banner'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* RIGHT COLUMN: 7-IMAGE FIFO ROTATION MONITOR & LIVE LIST */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  padding: '22px',
                  borderRadius: '18px',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* FIFO Rules Notice */}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: 'rgba(255, 107, 0, 0.08)',
                    border: '1px solid rgba(255, 107, 0, 0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <AlertCircle size={18} color="#FF6B00" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.76rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                      <strong style={{ color: '#FF6B00', display: 'block', marginBottom: '2px' }}>
                        {isBangla ? '৭টি ছবির অটো-রোটেশন (FIFO নিয়ম):' : '7-Image FIFO Auto-Rotation:'}
                      </strong>
                      {isBangla 
                        ? 'নতুন ব্যানার যুক্ত হলে সেটি তালিকার ১ নম্বরে বসবে। কালেকশনে সর্বোচ্চ ৭টি ব্যানার থাকবে। নতুন ৮ নম্বর ব্যানার প্রকাশ হলে সবার পুরোনো ব্যানার ও স্টোরেজ ফাইল স্বয়ংক্রিয়ভাবে মুছে যাবে।'
                        : 'Newest banner is placed at #1. A maximum of 7 banners are kept in rotation. When an 8th banner is published, the oldest banner and its storage file are purged automatically.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {isBangla ? 'বর্তমান লাইভ ব্যানার তালিকা' : 'Active Rotating Banners'}
                    </h4>
                  </div>

                  {/* Real-time Stream of Banners directly from Firestore (Zero Dummy Data) */}
                  <FirestoreStreamBuilder collectionName={COLLECTIONS.SPONSOR_BANNERS}>
                    {({ data, loading }) => {
                      const banners = (data || [])
                        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .slice(0, 7);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '2px' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              padding: '2px 9px',
                              borderRadius: '20px',
                              background: banners.length > 0 ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                              color: banners.length > 0 ? '#FF6B00' : '#94A3B8',
                              border: `1px solid ${banners.length > 0 ? 'rgba(255, 107, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                            }}>
                              {banners.length} / 7 {isBangla ? 'সক্রিয়' : 'Active'}
                            </span>
                          </div>

                          {banners.length === 0 ? (
                            <div style={{
                              padding: '36px 16px',
                              textAlign: 'center',
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <ImageIcon size={28} color="#64748B" style={{ marginBottom: '4px' }} />
                              <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8', fontWeight: 700 }}>
                                {isBangla ? 'কোনো সক্রিয় স্পন্সর পোস্টার নেই' : 'No active sponsor posters'}
                              </p>
                              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                {isBangla ? 'বামে নতুন ব্যানার আপলোড করে লাইভ পোস্ট করুন' : 'Upload a banner on the left to publish live'}
                              </span>
                            </div>
                          ) : (
                            banners.map((item, idx) => {
                              const isNewest = idx === 0;
                              const isOldest = idx === banners.length - 1 && banners.length >= 7;

                              return (
                                <div
                                  key={item.id || idx}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: '14px',
                                    background: isNewest 
                                      ? 'rgba(255, 107, 0, 0.08)' 
                                      : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${isNewest ? 'rgba(255, 107, 0, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px'
                                  }}
                                >
                                  {/* Left: Position Badge & Thumbnail */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                    <div style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '8px',
                                      background: isNewest ? '#FF6B00' : (isOldest ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'),
                                      color: isNewest ? '#FFFFFF' : (isOldest ? '#EF4444' : '#94A3B8'),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.76rem',
                                      fontWeight: 900,
                                      flexShrink: 0
                                    }}>
                                      #{idx + 1}
                                    </div>

                                    <div style={{
                                      width: '54px',
                                      height: '38px',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      background: '#0B0F19',
                                      flexShrink: 0,
                                      border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                      <img
                                        src={item.imageUrl}
                                        alt={item.title || 'Banner'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = '/about.png'; }}
                                      />
                                    </div>

                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <h5 style={{
                                          margin: 0,
                                          fontSize: '0.84rem',
                                          fontWeight: 800,
                                          color: '#FFFFFF',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {item.title || 'Untitled Banner'}
                                        </h5>
                                        {isNewest && (
                                          <span style={{
                                            padding: '1px 6px',
                                            borderRadius: '6px',
                                            background: '#FF6B00',
                                            color: '#FFFFFF',
                                            fontSize: '0.58rem',
                                            fontWeight: 900
                                          }}>
                                            NEWEST
                                          </span>
                                        )}
                                        {isOldest && (
                                          <span style={{
                                            padding: '1px 6px',
                                            borderRadius: '6px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: '#EF4444',
                                            fontSize: '0.58rem',
                                            fontWeight: 900
                                          }}>
                                            NEXT TO ROTATE OUT
                                          </span>
                                        )}
                                      </div>
                                      <p style={{
                                        margin: '2px 0 0 0',
                                        fontSize: '0.70rem',
                                        color: '#94A3B8',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {item.description || 'No description'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Delete Action Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSponsorBanner(item.id, item.title, item.imageUrl)}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      border: '1px solid rgba(239, 68, 68, 0.25)',
                                      color: '#EF4444',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      flexShrink: 0,
                                      transition: 'all 0.2s ease'
                                    }}
                                    title={isBangla ? 'ব্যানার ডিলিট করুন' : 'Delete banner'}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    }}
                  </FirestoreStreamBuilder>
                </div>
              </div>
            </div>
          )}
          </motion.div>
        )}

        {/* Realtime Publishing Loading Feedback Modal */}
        <AnimatePresence>
          {isPublishingModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(3, 7, 18, 0.78)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '16px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                style={{
                  background: '#0B1329',
                  border: '1.5px solid rgba(0, 240, 255, 0.45)',
                  borderRadius: '20px',
                  padding: '30px 36px',
                  textAlign: 'center',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 240, 255, 0.25)',
                  maxWidth: '380px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '3px solid rgba(0, 240, 255, 0.2)',
                  borderTopColor: '#00F0FF',
                  animation: 'spin 0.9s linear infinite',
                  marginBottom: '18px'
                }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 800 }}>
                  {isBangla ? 'প্রজেক্ট পাবলিশ হচ্ছে...' : 'Publishing project, please wait...'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.80rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  {isBangla ? 'ইমেজ কম্প্রেশন, R2 আপলোড ও লাইভ পাবলিশিং সম্পন্ন হচ্ছে...' : 'Optimizing image, uploading to R2 and publishing project...'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Realtime Publish Success Feedback Modal */}
        <AnimatePresence>
          {publishSuccessModalData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPublishSuccessModalData(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(3, 7, 18, 0.82)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '16px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 12 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#0B1329',
                  border: '1.5px solid rgba(16, 185, 129, 0.55)',
                  borderRadius: '24px',
                  padding: '32px 36px',
                  textAlign: 'center',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(16, 185, 129, 0.28)',
                  maxWidth: '400px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  marginBottom: '16px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
                }}>
                  <CheckCircle size={36} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 800 }}>
                  {publishSuccessModalData.isUpdate 
                    ? (isBangla ? 'প্রজেক্ট সফলভাবে আপডেট হয়েছে!' : 'Project updated successfully!')
                    : (isBangla ? 'প্রজেক্ট সফলভাবে পাবলিশ হয়েছে!' : 'Project published successfully!')}
                </h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.4 }}>
                  "{publishSuccessModalData.title}" {isBangla ? 'লাইভ শোকেস সেকশনে যুক্ত হয়েছে।' : 'is now published and live in the showcase.'}
                </p>
                <button
                  type="button"
                  onClick={() => setPublishSuccessModalData(null)}
                  style={{
                    padding: '10px 28px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  {isBangla ? 'ঠিক আছে' : 'OK, Great'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminModal;
