import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Smartphone, Globe, Layers } from 'lucide-react';
import { usePortfolioStream } from '../firebase/usePortfolioStream';
import { getOptimizedImageUrl } from '../services/cloudinaryService';
import { useLanguage } from '../context/LanguageContext';

const fallbackApps = [
  {
    id: 'app-1',
    title: 'FifaLive Score App',
    domain: 'fifalive.click',
    icon: '/app1.png',
    link: 'https://fifalive.click',
    tag: 'Sports App',
    category: 'apps',
    displayOrder: 1
  },
  {
    id: 'app-2',
    title: 'Media Pro Studio',
    domain: 'mediapro.app',
    icon: '/app2.png',
    link: 'https://github.com/rasel00-tg',
    tag: 'Photo Editor',
    category: 'apps',
    displayOrder: 2
  },
  {
    id: 'app-3',
    title: 'Community Chat',
    domain: 'connect.community',
    icon: '/app3.png',
    link: 'https://t.me/rasedulkarim',
    tag: 'Social Platform',
    category: 'apps',
    displayOrder: 3
  },
  {
    id: 'app-4',
    title: 'Fast Tools Pro',
    domain: 'tools.rasedulkarim.dev',
    icon: '/app4.png',
    link: 'https://github.com/rasel00-tg',
    tag: 'Utility Tool',
    category: 'apps',
    displayOrder: 4
  }
];

const fallbackWeb = [
  {
    id: 'web-1',
    title: 'Personal Portfolio 3D',
    domain: 'rasedulkarim.dev',
    icon: '/app1.png',
    link: 'https://rasedulkarim.dev',
    tag: 'React 3D & Vite',
    category: 'web',
    displayOrder: 1
  },
  {
    id: 'web-2',
    title: 'FIFA Live Streaming Portal',
    domain: 'fifalive.click',
    icon: '/app2.png',
    link: 'https://fifalive.click',
    tag: 'Live Web App',
    category: 'web',
    displayOrder: 2
  },
  {
    id: 'web-3',
    title: 'Creative Art & Photo Showcase',
    domain: 'art.rasedul.click',
    icon: '/caption.png',
    link: 'https://instagram.com/rasedul.karim.dev',
    tag: 'Visual Showcase',
    category: 'web',
    displayOrder: 3
  },
  {
    id: 'web-4',
    title: 'Modern E-Commerce Hub',
    domain: 'shop-next.click',
    icon: '/app1.png',
    link: 'https://github.com/rasel00-tg',
    tag: 'Fullstack Web',
    category: 'web',
    displayOrder: 4
  }
];

const ProjectCard = ({ project, type }) => {
  const [imgError, setImgError] = useState(false);

  // Determine image source: Cloudinary optimized URL or local fallback
  const rawImageSrc = project.thumbnail?.imageUrl || project.icon || (type === 'apps' ? '/app1.png' : '/app2.png');
  const imageSrc = getOptimizedImageUrl(rawImageSrc);
  const projectLink = project.liveUrl || project.link || '#';
  const displayTag = project.tag || (Array.isArray(project.technologies) ? project.technologies[0] : 'Project');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.015 }}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform' // RepaintBoundary GPU acceleration
      }}
    >
      {/* Accent side indicator */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: '20%',
        height: '60%',
        width: '3px',
        background: type === 'apps' ? 'var(--primary-color)' : 'var(--accent-pink)',
        borderRadius: '0 4px 4px 0',
        boxShadow: `0 0 10px ${type === 'apps' ? 'var(--primary-color)' : 'var(--accent-pink)'}`
      }} />

      {/* Left Icon + Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: type === 'apps' ? '12px' : '10px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {!imgError ? (
            <img 
              src={imageSrc} 
              alt={project.title}
              onError={() => setImgError(true)}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            type === 'apps' ? <Smartphone size={22} color="var(--primary-color)" /> : <Globe size={22} color="var(--accent-pink)" />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '0.98rem',
              color: 'var(--text-primary)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {project.title}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{
              fontSize: '0.8rem',
              color: type === 'apps' ? 'var(--primary-color)' : 'var(--accent-pink)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {project.domain || (type === 'apps' ? 'App Project' : 'Website')}
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              background: 'var(--glass-bg)',
              padding: '2px 8px',
              borderRadius: '10px',
              border: '1px solid var(--card-border)'
            }}>
              {displayTag}
            </span>
          </div>
        </div>
      </div>

      {/* Right Redirection Button */}
      <motion.a
        href={projectLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: type === 'apps' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 0, 127, 0.12)',
          border: `1px solid ${type === 'apps' ? 'var(--primary-color)' : 'var(--accent-pink)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: type === 'apps' ? 'var(--primary-color)' : 'var(--accent-pink)',
          textDecoration: 'none',
          flexShrink: 0,
          cursor: 'pointer',
          boxShadow: `0 0 12px ${type === 'apps' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 0, 127, 0.2)'}`
        }}
        title="Open Project"
      >
        <ExternalLink size={17} />
      </motion.a>
    </motion.div>
  );
};

const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' or 'web'
  const { items: streamProjects } = usePortfolioStream();
  const { isBangla, t } = useLanguage();

  // Filter and sort stream projects, fallback to default lists if stream is empty
  const dbApps = (streamProjects || [])
    .filter(p => p.category === 'apps' || !p.category)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const dbWeb = (streamProjects || [])
    .filter(p => p.category === 'web')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const activeAppsList = dbApps.length > 0 ? dbApps : fallbackApps;
  const activeWebList = dbWeb.length > 0 ? dbWeb : fallbackWeb;

  return (
    <section 
      id="projects" 
      style={{ 
        padding: '50px 5% 60px 5%', 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ width: '100%', maxWidth: '1000px' }}
      >
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '30px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--primary-color)',
            fontSize: '0.85rem',
            fontWeight: '600',
            letterSpacing: '1px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
          }}>
            <Layers size={16} /> {t('projects.tag', 'Portfolio Highlights')}
          </div>

          <h2 style={{ 
            fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', 
            color: 'var(--text-primary)', 
            margin: 0,
            fontWeight: 800,
            letterSpacing: '1.5px',
            fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif"
          }}>
            {t('projects.webApps', 'WEB APPS &')} <span style={{ color: 'var(--primary-color)' }}>{t('projects.projects', 'PROJECTS')}</span>
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.88rem, 2vw, 1rem)',
            marginTop: '8px',
            fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
          }}>
            {t('projects.desc', 'Selected mobile applications and live production websites.')}
          </p>
        </div>
        
        {/* Category Tabs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px', 
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('apps')}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '30px',
              border: activeTab === 'apps' ? '1px solid var(--primary-color)' : '1px solid var(--card-border)',
              background: activeTab === 'apps' ? 'rgba(0, 240, 255, 0.15)' : 'var(--glass-bg)',
              color: activeTab === 'apps' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontSize: '0.92rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'apps' ? '0 0 20px rgba(0,240,255,0.2)' : 'none',
              backdropFilter: 'blur(10px)',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
            }}
          >
            <Smartphone size={18} /> {t('projects.appsTab', 'Mobile Apps')}
          </button>

          <button 
            onClick={() => setActiveTab('web')}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '30px',
              border: activeTab === 'web' ? '1px solid var(--accent-pink)' : '1px solid var(--card-border)',
              background: activeTab === 'web' ? 'rgba(255, 0, 127, 0.15)' : 'var(--glass-bg)',
              color: activeTab === 'web' ? 'var(--accent-pink)' : 'var(--text-secondary)',
              fontSize: '0.92rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'web' ? '0 0 20px rgba(255,0,127,0.2)' : 'none',
              backdropFilter: 'blur(10px)',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
            }}
          >
            <Globe size={18} /> {t('projects.webTab', 'Websites & Portals')}
          </button>
        </div>

        {/* Dynamic Project List from Firestore Stream with Cloudinary f_auto,q_auto */}
        <AnimatePresence mode="wait">
          {activeTab === 'apps' && (
            <motion.div
              key="apps-list"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
                width: '100%'
              }}
            >
              {activeAppsList.map(item => (
                <ProjectCard key={item.id} project={item} type="apps" />
              ))}
            </motion.div>
          )}

          {activeTab === 'web' && (
            <motion.div
              key="web-list"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
                width: '100%'
              }}
            >
              {activeWebList.map(item => (
                <ProjectCard key={item.id} project={item} type="web" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
      </motion.div>
    </section>
  );
};

export default ProjectsSection;
