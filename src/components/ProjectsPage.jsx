import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Smartphone, Globe, ExternalLink, Search, Sparkles, ArrowLeft, X, Layers } from 'lucide-react';

export default function ProjectsPage({ items = [], loading = false, onClose }) {
  const [activeCategory, setActiveCategory] = useState('apps'); // 'apps' | 'website'
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  // Pure dynamic Firestore source items (zero dummy/demo data)
  const sourceItems = Array.isArray(items) ? items : [];

  // Resolve apps & websites
  const rawApps = sourceItems.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat === 'apps' || cat === 'app';
  });

  const rawWebsites = sourceItems.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat === 'website' || cat === 'web';
  });

  // Filter based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredApps = rawApps.filter(app => {
    if (!query) return true;
    const title = (app.title || app.name || app.headline || '').toLowerCase();
    const tag = (app.subCategory || app.tagline || app.category || app.platform || '').toLowerCase();
    const desc = (app.description || '').toLowerCase();
    return title.includes(query) || tag.includes(query) || desc.includes(query);
  });

  const filteredWebsites = rawWebsites.filter(site => {
    if (!query) return true;
    const title = (site.title || site.name || site.headline || '').toLowerCase();
    const tag = (site.subCategory || site.category || site.platform || '').toLowerCase();
    const desc = (site.description || '').toLowerCase();
    return title.includes(query) || tag.includes(query) || desc.includes(query);
  });

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      height: '100%',
      backgroundColor: isDark ? '#050B14' : '#F8FAFC',
      color: isDark ? '#F1F5F9' : '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      {/* ─── Full-Width Edge-to-Edge Sticky Top Header Bar ─── */}
      <header style={{
        width: '100%',
        padding: '12px 20px',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        backgroundColor: isDark ? 'rgba(11, 19, 35, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 50,
        position: 'sticky',
        top: 0
      }}>
        {/* Left: Back Button, Glowing Icon, Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onClose && (
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
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                color: isDark ? '#FFFFFF' : '#0F172A',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              title="Back to Home"
              aria-label="Back"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}>
            <Globe size={20} strokeWidth={2.4} />
          </div>

          <div>
            <h1 style={{
              fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.2
            }}>
              <span>Featured</span>
              <span style={{
                background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Projects
              </span>
            </h1>
            <p style={{
              fontSize: '0.72rem',
              color: isDark ? '#94A3B8' : '#64748B',
              margin: '2px 0 0 0',
              fontWeight: 500
            }}>
              Production-ready mobile applications & modern web solutions
            </p>
          </div>
        </div>

        {/* Center/Right Controls: Search Box, Category Filter Switch & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: isDark ? '#64748B' : '#94A3B8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #CBD5E1',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#FFFFFF',
                color: isDark ? '#F1F5F9' : '#0F172A',
                fontSize: '0.82rem',
                outline: 'none',
                width: '160px',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94A3B8' : '#64748B',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Clear Search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Toggle Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#E2E8F0',
            padding: '3px',
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
          }}>
            {/* Apps Category Tab */}
            <button
              type="button"
              onClick={() => setActiveCategory('apps')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.80rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeCategory === 'apps' ? '#10B981' : 'transparent',
                color: activeCategory === 'apps' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#475569'),
                boxShadow: activeCategory === 'apps' ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
              }}
            >
              <Smartphone size={14} />
              <span>Apps</span>
              <span style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '9999px',
                fontWeight: 800,
                backgroundColor: activeCategory === 'apps' ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1'),
                color: activeCategory === 'apps' ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#475569'),
              }}>
                {rawApps.length}
              </span>
            </button>

            {/* Websites Category Tab */}
            <button
              type="button"
              onClick={() => setActiveCategory('website')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.80rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeCategory === 'website' ? '#06B6D4' : 'transparent',
                color: activeCategory === 'website' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#475569'),
                boxShadow: activeCategory === 'website' ? '0 4px 12px rgba(6, 182, 212, 0.35)' : 'none',
              }}
            >
              <Globe size={14} />
              <span>Websites</span>
              <span style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '9999px',
                fontWeight: 800,
                backgroundColor: activeCategory === 'website' ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1'),
                color: activeCategory === 'website' ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#475569'),
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
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
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
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ─── Full-Width Responsive Project Cards Container ─── */}
      <main style={{
        width: '100%',
        flex: 1,
        overflowY: 'auto',
        padding: '20px 20px 40px 20px',
        boxSizing: 'border-box',
        margin: 0
      }}>
        {/* Apps Category Grid */}
        {activeCategory === 'apps' && (
          <>
            {filteredApps.length === 0 ? (
              <EmptyState
                isDark={isDark}
                color="#10B981"
                icon={<Smartphone size={32} />}
                message={searchQuery ? "No matching apps found" : "No Mobile Apps Available"}
                sub={searchQuery ? "Try searching with a different keyword" : "Mobile applications published via Firestore will appear here in real-time."}
              />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '18px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {filteredApps.map((app, index) => (
                  <AppCard key={app.id || index} app={app} isDark={isDark} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Website Category Grid */}
        {activeCategory === 'website' && (
          <>
            {filteredWebsites.length === 0 ? (
              <EmptyState
                isDark={isDark}
                color="#06B6D4"
                icon={<Globe size={32} />}
                message={searchQuery ? "No matching websites found" : "No Websites Available"}
                sub={searchQuery ? "Try searching with a different keyword" : "Websites published via Firestore will appear here in real-time."}
              />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {filteredWebsites.map((site, index) => (
                  <WebsiteCard key={site.id || index} site={site} isDark={isDark} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── Compact Premium AppCard Component with Circular Logo & "Visit Now" Button ─── */
function AppCard({ app, isDark }) {
  const [hovered, setHovered] = useState(false);

  const title = app.title || app.name || app.headline || 'Untitled App';
  const tagline = app.description || app.subCategory || app.tagline || app.platform || 'Production mobile application';
  const categoryTag = app.subCategory || app.category || 'Mobile App';
  const iconUrl = app.mediaUrl || app.icon || app.logo || app.thumbnail?.imageUrl || '/app1.png';
  const actionUrl = app.actionUrl || app.projectUrl || app.playStoreUrl || app.liveUrl || '';

  const handleVisit = () => {
    if (actionUrl && actionUrl !== '#') {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
        borderRadius: '18px',
        padding: '18px 20px',
        border: hovered
          ? '1.5px solid rgba(16, 185, 129, 0.55)'
          : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'),
        boxShadow: hovered
          ? (isDark
            ? '0 14px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(16, 185, 129, 0.18)'
            : '0 12px 30px rgba(0, 0, 0, 0.08)')
          : (isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.03)'),
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Top Header: Circular Logo + Title + Category Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Circular Professional Logo with Ring & Pulse Online Dot */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              padding: '2px',
              border: hovered ? '2px solid #10B981' : '2px solid rgba(16, 185, 129, 0.3)',
              boxShadow: hovered ? '0 4px 16px rgba(16, 185, 129, 0.35)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              transition: 'all 0.25s ease',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={iconUrl}
                alt={title}
                loading="lazy"
                decoding="async"
                width="64"
                height="64"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  aspectRatio: '1 / 1'
                }}
                onError={(e) => { e.target.src = '/app1.png'; }}
              />
            </div>
            {/* Green Online Dot */}
            <span style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '12px',
              height: '12px',
              backgroundColor: '#10B981',
              border: `2px solid ${isDark ? '#0F172A' : '#FFFFFF'}`,
              borderRadius: '50%',
              boxShadow: '0 0 6px #10B981'
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '1.02rem',
              fontWeight: 800,
              margin: 0,
              color: hovered ? '#10B981' : (isDark ? '#FFFFFF' : '#0F172A'),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 0.2s ease',
              letterSpacing: '-0.2px'
            }}>
              {title}
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2px',
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              {categoryTag}
            </span>
          </div>
        </div>

        {/* Structured Description (2-line clean clamp) */}
        {tagline && (
          <p style={{
            fontSize: '0.80rem',
            color: isDark ? '#94A3B8' : '#64748B',
            marginTop: '12px',
            marginBottom: '4px',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {tagline}
          </p>
        )}
      </div>

      {/* Action Button: Premium "Visit Now" Button */}
      <div style={{
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #F1F5F9',
      }}>
        <button
          type="button"
          onClick={handleVisit}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            background: hovered 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
              : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.82rem',
            border: 'none',
            boxShadow: hovered 
              ? '0 6px 18px rgba(16, 185, 129, 0.45)' 
              : '0 4px 12px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
          title={`Visit ${title}`}
        >
          <span>Visit Now</span>
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Compact Premium WebsiteCard Component with Cover Banner & "Visit Now" Button ─── */
function WebsiteCard({ site, isDark }) {
  const [hovered, setHovered] = useState(false);

  const title = site.title || site.name || site.headline || 'Untitled Website';
  const description = site.description || site.shortDescription || 'Full-stack modern web application.';
  const platform = site.subCategory || site.platform || site.category || 'Web Application';
  const bannerUrl = site.mediaUrl || site.banner || site.imageUrl || site.thumbnail?.imageUrl || '/add1.png';
  const actionUrl = site.actionUrl || site.projectUrl || site.link || site.liveUrl || '';

  const handleVisit = () => {
    if (actionUrl && actionUrl !== '#') {
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
        borderRadius: '18px',
        border: hovered
          ? '1.5px solid rgba(6, 182, 212, 0.55)'
          : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'),
        boxShadow: hovered
          ? (isDark
            ? '0 14px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(6, 182, 212, 0.18)'
            : '0 12px 30px rgba(0, 0, 0, 0.08)')
          : (isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.03)'),
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Cover Banner with Subtle Gradient Overlay & Category Tag */}
        <div style={{
          width: '100%',
          height: '165px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
          position: 'relative',
        }}>
          <img
            src={bannerUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.4s ease',
              display: 'block',
              aspectRatio: '16 / 9'
            }}
            onError={(e) => { e.target.src = '/add1.png'; }}
          />
          {/* Subtle Dark Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '10px 14px',
            boxSizing: 'border-box'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#FFFFFF',
              background: 'rgba(6, 182, 212, 0.85)',
              padding: '2px 8px',
              borderRadius: '6px',
              backdropFilter: 'blur(4px)'
            }}>
              {platform}
            </span>

            <span style={{
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              opacity: hovered ? 1 : 0.85,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Live Web</span>
              <ExternalLink size={12} />
            </span>
          </div>
        </div>

        {/* Content Details: Title & Description */}
        <div style={{ padding: '14px 18px 10px 18px' }}>
          <h3 style={{
            fontSize: '1.02rem',
            fontWeight: 800,
            margin: '0 0 6px 0',
            color: hovered ? '#06B6D4' : (isDark ? '#FFFFFF' : '#0F172A'),
            lineHeight: 1.35,
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '0.80rem',
            color: isDark ? '#94A3B8' : '#64748B',
            margin: 0,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {description}
          </p>
        </div>
      </div>

      {/* Action Button: Premium "Visit Now" Button */}
      <div style={{
        padding: '0 18px 18px 18px',
      }}>
        <button
          type="button"
          onClick={handleVisit}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            background: hovered 
              ? 'linear-gradient(135deg, #06B6D4 0%, #0D9488 100%)' 
              : 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.82rem',
            border: 'none',
            boxShadow: hovered
              ? '0 6px 18px rgba(6, 182, 212, 0.45)'
              : '0 4px 12px rgba(6, 182, 212, 0.25)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
          title={`Visit ${title}`}
        >
          <span>Visit Now</span>
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Compact Empty State Component ─── */
function EmptyState({ isDark, color, icon, message, sub }) {
  return (
    <div style={{
      width: '100%',
      padding: '48px 20px',
      textAlign: 'center',
      borderRadius: '18px',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#FFFFFF',
      border: isDark ? '1px dashed rgba(255, 255, 255, 0.12)' : '1px dashed #CBD5E1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        backgroundColor: `${color}18`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px',
        boxShadow: `0 0 16px ${color}20`
      }}>
        {icon}
      </div>
      <h3 style={{
        margin: '0 0 6px 0',
        fontSize: '1.05rem',
        fontWeight: 800,
        color: isDark ? '#FFFFFF' : '#0F172A'
      }}>
        {message}
      </h3>
      <p style={{
        margin: 0,
        fontSize: '0.80rem',
        color: isDark ? '#94A3B8' : '#64748B',
        maxWidth: '380px'
      }}>
        {sub}
      </p>
    </div>
  );
}
