import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  LogOut,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { createProject, updateProject, deleteProject } from '../services/adminService';
import { usePortfolioStream } from '../firebase/usePortfolioStream';
import { firebaseConfig } from '../firebase/config';

const AdminModal = ({ onClose }) => {
  const { items: streamProjects } = usePortfolioStream();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [idToken, setIdToken] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Form State
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

  // Firebase Email/Password Auth via REST
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          returnSecureToken: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Authentication failed. Please verify credentials.');
      }

      setIdToken(data.idToken);
      setIsAuthenticated(true);
      setStatusMessage({ type: 'success', text: `Logged in successfully as ${authEmail}` });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
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
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 0, 15, 0.98)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '20px 10px',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '1000px',
            background: 'rgba(15, 23, 42, 0.94)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '24px',
            padding: '30px 24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.2)',
            position: 'relative',
            color: '#FFFFFF'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
                <Lock size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '1px' }}>
                  ADMIN <span style={{ color: '#00f0ff' }}>PANEL</span>
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Secure Cloudinary & Firestore Management</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {isAuthenticated && (
                <button
                  onClick={() => { setIsAuthenticated(false); setIdToken(null); }}
                  style={{ background: 'rgba(255, 0, 127, 0.1)', border: '1px solid rgba(255, 0, 127, 0.3)', color: '#ff007f', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              )}
              <button
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {statusMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${statusMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
              color: statusMessage.type === 'success' ? '#4ade80' : '#f87171',
              fontSize: '0.9rem'
            }}>
              {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* View 1: Login Form */}
          {!isAuthenticated ? (
            <form onSubmit={handleLogin} style={{ maxWidth: '420px', margin: '30px auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>Sign in to authenticate secure Cloudinary signatures and manage projects.</p>
              </div>

              {authError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {authError}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Admin Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="rasedul.karim.dev@gmail.com"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{ marginTop: '10px', padding: '12px', background: 'linear-gradient(90deg, #00f0ff, #0080ff)', color: '#00f0ff', background: 'rgba(0,240,255,0.15)', border: '1px solid #00f0ff', fontWeight: 700, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {authLoading ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                <span>Authenticate Admin</span>
              </button>
            </form>
          ) : (
            /* View 2: Project Management Workspace */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              
              {/* Form Column */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
                  <span>{isEditing ? 'Edit Project' : 'Add New Project'}</span>
                </h3>

                <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Project Title</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., FifaLive Score App"
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
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
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
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
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Live URL</label>
                    <input
                      type="url"
                      value={formLiveUrl}
                      onChange={(e) => setFormLiveUrl(e.target.value)}
                      placeholder="https://fifalive.click"
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>

                  {/* 1. Thumbnail Image Upload */}
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
                        <Upload size={16} />
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

                  {/* 2. Multiple Screenshots Upload */}
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
                      <ImageIcon size={16} />
                      <span>{uploadingScreenshots ? 'Uploading Screenshots...' : 'Add Screenshots (Multiple)'}</span>
                      <input type="file" multiple accept="image/*" onChange={handleScreenshotsChange} style={{ display: 'none' }} />
                    </label>

                    {/* Screenshot Previews List */}
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
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#00f0ff" />
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
                          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || 'Untitled'}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#00f0ff' }}>{p.domain || p.category}</span>
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
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminModal;
