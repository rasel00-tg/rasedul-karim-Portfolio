import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Smartphone, Globe, ExternalLink, Search, ArrowLeft, X } from 'lucide-react';
import { getCachedItems } from '../services/featuresService';

export default function ProjectsPage({ items = [], loading = false, onClose }) {
  // Dual Categories: Only Apps and Websites (Default: 'apps')
  const [activeCategory, setActiveCategory] = useState('apps'); // 'apps' | 'website'
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  // Instant zero-lag cache resolution
  const cachedProjects = getCachedItems('projects') || [];
  const sourceItems = Array.isArray(items) && items.length > 0 
    ? items 
    : (loading ? cachedProjects : (Array.isArray(items) ? items : []));

  // Categorize specifically into Apps and Websites
  const rawApps = sourceItems.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat === 'apps' || cat === 'app';
  });

  const rawWebsites = sourceItems.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat === 'website' || cat === 'web';
  });

  // Filter based on active category
  const displayedList = activeCategory === 'website' ? rawWebsites : rawApps;

  // Filter based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredProjects = displayedList.filter(project => {
    if (!query) return true;
    const title = (project.title || project.name || project.headline || '').toLowerCase();
    const tag = (project.subCategory || project.category || project.platform || '').toLowerCase();
    const desc = (project.description || '').toLowerCase();
    return title.includes(query) || tag.includes(query) || desc.includes(query);
  });

  return (
    <div 
      className="min-h-screen relative overflow-hidden select-none"
      style={{
        width: '100%',
        minHeight: '100vh',
        height: '100%',
        background: isDark 
          ? 'linear-gradient(135deg, #0B101B 0%, #0F172A 50%, #0B1324 100%)' 
          : 'linear-gradient(135deg, #F5F8FF 0%, #EEF3FD 50%, #E6EEFC 100%)',
        color: isDark ? '#FFFFFF' : '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* ─── Scoped Responsive CSS: 3-Col Mobile, Left-Aligned Desktop ─── */}
      <style>{`
        .projects-glass-grid {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 8px !important;
          width: 100% !important;
          justify-content: flex-start !important;
          box-sizing: border-box !important;
          position: relative !important;
          z-index: 10 !important;
        }
        @media (min-width: 640px) {
          .projects-glass-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 150px)) !important;
            gap: 12px !important;
          }
        }
        @media (min-width: 1024px) {
          .projects-glass-grid {
            grid-template-columns: repeat(auto-fill, minmax(135px, 155px)) !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 1280px) {
          .projects-glass-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 160px)) !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* ─── ভাসমান ব্লু অর্ব ও ট্রান্সলুসেন্ট গ্লাস বাবল (Floating Glass & Vivid Blue Orbs) ─── */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {/* ডানপাশের ভাইব্রেন্ট ব্লু স্ফিয়ার */}
        <div 
          style={{
            position: 'absolute',
            top: '110px',
            right: '40px',
            width: '180px',
            height: '180px',
            background: 'linear-gradient(135deg, #1D68FF 0%, #4F95FF 100%)',
            borderRadius: '50%',
            filter: 'blur(3px)',
            opacity: 0.9,
            boxShadow: '0 10px 35px rgba(29, 104, 255, 0.45)'
          }} 
        />

        {/* বাঁপাশের ছোট ভাইব্রেন্ট ব্লু স্ফিয়ার */}
        <div 
          style={{
            position: 'absolute',
            top: '46%',
            left: '-30px',
            width: '110px',
            height: '110px',
            backgroundColor: '#2563EB',
            borderRadius: '50%',
            filter: 'blur(2px)',
            opacity: 0.85,
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.4)'
          }} 
        />

        {/* বড় ফ্রস্টেড ট্রান্সলুসেন্ট গ্লাস বাবল ১ (টপ-রাইট ওভারল্যাপিং) */}
        <div 
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '440px',
            height: '440px',
            borderRadius: '50%',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid rgba(255, 255, 255, 0.7)',
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.25)'
          }} 
        />
        
        {/* বড় ফ্রস্টেড ট্রান্সলুসেন্ট গ্লাস বাবল ২ (মিড-রাইট) */}
        <div 
          style={{
            position: 'absolute',
            top: '180px',
            right: '-70px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.55)',
            background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)'
          }} 
        />

        {/* বড় ফ্রস্টেড ট্রান্সলুসেন্ট গ্লাস বাবল ৩ (বটম-লেফট) */}
        <div 
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.65)',
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)'
          }} 
        />
      </div>

      {/* ─── Sticky Translucent Header Bar ─── */}
      <header 
        style={{
          width: '100%',
          padding: '10px 16px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.8)',
          backgroundColor: isDark ? 'rgba(11, 16, 27, 0.85)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxSizing: 'border-box'
        }}
      >
        {/* Left: Back Button, Glowing Vivid Blue Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(29, 104, 255, 0.2)',
                color: isDark ? '#FFFFFF' : '#1D68FF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              title="Back to Home"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1D68FF 0%, #4F95FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(29, 104, 255, 0.4)',
            flexShrink: 0
          }}>
            <Globe size={18} strokeWidth={2.4} />
          </div>

          <div>
            <h1 style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              lineHeight: 1.2
            }}>
              <span style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>Featured</span>
              <span style={{
                background: 'linear-gradient(90deg, #1D68FF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Projects
              </span>
            </h1>
          </div>
        </div>

        {/* Center / Right: Search & Dual Category Filter (Apps & Websites) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '9px',
                color: '#64748B',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '5px 8px 5px 26px',
                borderRadius: '8px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(29, 104, 255, 0.2)',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontSize: '0.75rem',
                outline: 'none',
                width: '110px',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Clear"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Dual Category Filter: Only Apps & Websites */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)',
            padding: '2px',
            borderRadius: '10px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            {/* Apps Tab */}
            <button
              type="button"
              onClick={() => setActiveCategory('apps')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeCategory === 'apps' ? '#1D68FF' : 'transparent',
                color: activeCategory === 'apps' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                boxShadow: activeCategory === 'apps' ? '0 2px 10px rgba(29, 104, 255, 0.35)' : 'none',
              }}
            >
              <Smartphone size={12} />
              <span>Apps</span>
              <span style={{
                fontSize: '9px',
                padding: '0 5px',
                borderRadius: '9999px',
                fontWeight: 900,
                backgroundColor: activeCategory === 'apps' ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'),
                color: activeCategory === 'apps' ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#64748B'),
              }}>
                {rawApps.length}
              </span>
            </button>

            {/* Websites Tab */}
            <button
              type="button"
              onClick={() => setActiveCategory('website')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeCategory === 'website' ? '#1D68FF' : 'transparent',
                color: activeCategory === 'website' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                boxShadow: activeCategory === 'website' ? '0 2px 10px rgba(29, 104, 255, 0.35)' : 'none',
              }}
            >
              <Globe size={12} />
              <span>Websites</span>
              <span style={{
                fontSize: '9px',
                padding: '0 5px',
                borderRadius: '9999px',
                fontWeight: 900,
                backgroundColor: activeCategory === 'website' ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'),
                color: activeCategory === 'website' ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#64748B'),
              }}>
                {rawWebsites.length}
              </span>
            </button>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(226, 232, 240, 0.9)',
                color: isDark ? '#FFFFFF' : '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Close"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ─── Main Content: Left-Aligned on Desktop with max-w-7xl ─── */}
      <main 
        className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-left flex-1 overflow-y-auto"
        style={{
          width: '100%',
          maxWidth: '1440px',
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 60px 16px',
          textAlign: 'left',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div 
          className="projects-glass-grid text-left"
          style={{
            textAlign: 'left',
            boxSizing: 'border-box'
          }}
        >
          {/* Skeleton Shimmer UI in Left-Aligned Glassmorphic Grid */}
          {loading && filteredProjects.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.85)',
                  padding: '10px 8px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Circular Placeholder */}
                <div 
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(29, 104, 255, 0.12)',
                    margin: '2px auto 8px auto',
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    flexShrink: 0
                  }} 
                />
                <div style={{ width: '80%', height: '11px', borderRadius: '4px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)', marginBottom: '4px' }} />
                <div style={{ width: '50%', height: '9px', borderRadius: '4px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(29, 104, 255, 0.15)', marginBottom: '8px' }} />
                <div style={{ width: '100%', height: '26px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(29, 104, 255, 0.2)' }} />
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            /* Empty State */
            <div 
              style={{
                gridColumn: '1 / -1',
                padding: '50px 20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(29, 104, 255, 0.12)',
                  color: '#1D68FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}
              >
                {activeCategory === 'website' ? <Globe size={24} /> : <Smartphone size={24} />}
              </div>
              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: isDark ? '#FFFFFF' : '#0F172A',
                margin: '0 0 4px 0'
              }}>
                {searchQuery 
                  ? "No matching items found" 
                  : (activeCategory === 'website' ? "No Websites Available" : "No Mobile Apps Available")}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: isDark ? '#94A3B8' : '#64748B',
                maxWidth: '320px',
                margin: 0
              }}>
                {searchQuery 
                  ? "Try searching with a different keyword." 
                  : "Items published from the admin panel will appear here in real-time."}
              </p>
            </div>
          ) : (
            /* Left-Aligned Frosted Glassmorphic Project Cards */
            filteredProjects.map((project, index) => (
              <GlassmorphicProjectCard key={project.id || index} project={project} isDark={isDark} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Frosted Glassmorphism ProjectCard Component ─── */
function GlassmorphicProjectCard({ project, isDark }) {
  const [hovered, setHovered] = useState(false);

  const title = project.title || project.name || project.headline || 'Untitled';
  const category = project.category || project.platform || 'Project';
  const subCategory = project.subCategory || project.tagline || category;

  // Responsive Thumbnail Resolution
  const isApp = (category || '').toLowerCase().includes('app');
  const thumbnail = project.thumbnail?.imageUrl || 
                    project.thumbnail || 
                    project.mediaUrl || 
                    project.banner || 
                    project.imageUrl || 
                    project.icon || 
                    (isApp ? '/app1.png' : '/add1.png');

  // Action links
  const targetUrl = project.actionUrl || project.liveUrl || project.projectUrl || project.playStoreUrl || project.githubUrl || '';

  const handleVisit = (e) => {
    e.stopPropagation();
    if (targetUrl && targetUrl !== '#') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.12)] hover:border-blue-400/50 transition-all duration-300 relative z-10"
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: hovered
          ? '1px solid rgba(59, 130, 246, 0.55)'
          : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.85)'),
        boxShadow: hovered
          ? '0 12px 35px rgba(37, 99, 235, 0.16)'
          : '0 8px 30px rgba(0, 0, 0, 0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 8px',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* গোলাকার আইকন ফ্রেম (Circular Glass Icon Frame) */}
      <div 
        className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full overflow-hidden p-1 bg-white/90 dark:bg-slate-800/90 border border-blue-100 dark:border-blue-900/50 shadow-md flex items-center justify-center shrink-0"
        style={{
          width: '58px',
          height: '58px',
          minWidth: '58px',
          minHeight: '58px',
          maxWidth: '58px',
          maxHeight: '58px',
          margin: '2px auto 8px auto',
          borderRadius: '50%',
          overflow: 'hidden',
          padding: '2px',
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          border: hovered 
            ? '2px solid rgba(29, 104, 255, 0.6)' 
            : (isDark ? '2px solid rgba(59, 130, 246, 0.3)' : '2px solid #DBEAFE'),
          boxShadow: '0 4px 12px rgba(29, 104, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          transition: 'border-color 0.25s ease'
        }}
      >
        <img 
          src={thumbnail} 
          alt={title} 
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = isApp ? '/app1.png' : '/add1.png';
          }}
          className="w-full h-full rounded-full object-cover block pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: isApp ? 'contain' : 'cover',
            display: 'block',
            transition: 'transform 0.3s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)'
          }}
        />
      </div>

      {/* টাইটেল ও প্ল্যাটফর্ম মেটাডাটা */}
      <div style={{ width: '100%', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 
          style={{
            fontSize: '11px',
            fontWeight: 800,
            margin: '0 0 2px 0',
            color: isDark ? '#FFFFFF' : '#0F172A',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%'
          }}
          title={title}
        >
          {title}
        </h3>
        <span 
          style={{
            fontSize: '9px',
            fontWeight: 700,
            color: isDark ? '#94A3B8' : '#2563EB',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%'
          }}
        >
          {subCategory}
        </span>
      </div>

      {/* "Visit Now" অ্যাকশন বাটন - ভাইব্রেন্ট ব্লু গ্রেডিয়েন্ট */}
      <button
        type="button"
        onClick={handleVisit}
        className="w-full py-1.5 px-2 mt-2 bg-gradient-to-r from-[#1D68FF] to-[#3B82F6] hover:from-[#1554D8] hover:to-[#2563EB] text-white text-[10px] font-bold rounded-lg text-center flex items-center justify-center gap-1 shadow-md shadow-blue-500/25 transition-all active:scale-95"
        style={{
          width: '100%',
          padding: '6px 4px',
          marginTop: '8px',
          background: hovered 
            ? 'linear-gradient(135deg, #1554D8 0%, #2563EB 100%)' 
            : 'linear-gradient(135deg, #1D68FF 0%, #3B82F6 100%)',
          color: '#FFFFFF',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 700,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(29, 104, 255, 0.3)',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
        title={`Visit ${title}`}
      >
        <span>Visit Now</span>
        <ExternalLink size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}
