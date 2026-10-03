import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Smartphone, Globe, ExternalLink, Search, Sparkles } from 'lucide-react';

export default function ProjectsPage({ items = [], apps: initialApps = [], websites: initialWebsites = [], loading = false }) {
  const [activeCategory, setActiveCategory] = useState('apps'); // 'apps' | 'website'
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  // Dynamically resolve apps & websites from realtime Firestore items if available
  const rawApps = items.length > 0 
    ? items.filter(p => (p.category || '').toLowerCase() === 'apps' || (p.category || '').toLowerCase() === 'app')
    : initialApps;

  const rawWebsites = items.length > 0
    ? items.filter(p => (p.category || '').toLowerCase() === 'website' || (p.category || '').toLowerCase() === 'web')
    : initialWebsites;

  // Filter based on search query
  const query = searchQuery.trim().toLowerCase();
  const filteredApps = rawApps.filter(app => {
    if (!query) return true;
    const title = (app.title || app.name || '').toLowerCase();
    const tag = (app.subCategory || app.tagline || app.category || '').toLowerCase();
    const desc = (app.description || '').toLowerCase();
    return title.includes(query) || tag.includes(query) || desc.includes(query);
  });

  const filteredWebsites = rawWebsites.filter(site => {
    if (!query) return true;
    const title = (site.title || site.name || '').toLowerCase();
    const tag = (site.subCategory || site.category || site.platform || '').toLowerCase();
    const desc = (site.description || '').toLowerCase();
    return title.includes(query) || tag.includes(query) || desc.includes(query);
  });

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: isDark ? '#050B14' : '#F8FAFC',
      color: isDark ? '#F1F5F9' : '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* ─── Compact Top Header Bar ─── */}
      <div style={{
        width: '100%',
        padding: '14px 24px',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
        backgroundColor: isDark ? 'rgba(11, 19, 35, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        zIndex: 10,
        position: 'sticky',
        top: 0
      }}>
        {/* Left: Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.25rem, 2.4vw, 1.6rem)',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
              fontSize: '0.76rem',
              color: isDark ? '#94A3B8' : '#64748B',
              margin: '2px 0 0 0',
              fontWeight: 500
            }}>
              Production-ready mobile applications and modern web solutions
            </p>
          </div>
        </div>

        {/* Right: Search + Category Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #CBD5E1',
            width: '180px'
          }}>
            <Search size={14} color={isDark ? '#64748B' : '#94A3B8'} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDark ? '#FFFFFF' : '#0F172A',
                fontSize: '0.78rem',
                width: '100%'
              }}
            />
          </div>

          {/* Category Pill Switch */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : '#E2E8F0',
            borderRadius: '14px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #CBD5E1',
            gap: '4px',
          }}>
            {/* Apps Button */}
            <button
              type="button"
              onClick={() => setActiveCategory('apps')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeCategory === 'apps' ? '#10B981' : 'transparent',
                color: activeCategory === 'apps' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#475569'),
                boxShadow: activeCategory === 'apps' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              }}
            >
              <Smartphone size={15} />
              <span>Apps</span>
              <span style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontWeight: 800,
                backgroundColor: activeCategory === 'apps' ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1'),
                color: activeCategory === 'apps' ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#475569'),
              }}>
                {rawApps.length}
              </span>
            </button>

            {/* Websites Button */}
            <button
              type="button"
              onClick={() => setActiveCategory('website')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeCategory === 'website' ? '#06B6D4' : 'transparent',
                color: activeCategory === 'website' ? '#FFFFFF' : (isDark ? '#94A3B8' : '#475569'),
                boxShadow: activeCategory === 'website' ? '0 4px 14px rgba(6, 182, 212, 0.35)' : 'none',
              }}
            >
              <Globe size={15} />
              <span>Websites</span>
              <span style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: '9999px',
                fontWeight: 800,
                backgroundColor: activeCategory === 'website' ? 'rgba(255, 255, 255, 0.25)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1'),
                color: activeCategory === 'website' ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#475569'),
              }}>
                {rawWebsites.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Compact Content Area (Eliminating Empty Space) ─── */}
      <div style={{
        width: '100%',
        flex: 1,
        padding: '18px 22px 28px 22px',
        boxSizing: 'border-box',
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
                gap: '16px',
                width: '100%',
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
              }}>
                {filteredWebsites.map((site, index) => (
                  <WebsiteCard key={site.id || index} site={site} isDark={isDark} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Compact Premium AppCard Component ─── */
function AppCard({ app, isDark }) {
  const [hovered, setHovered] = useState(false);

  const title = app.title || app.name || 'Untitled App';
  const tagline = app.subCategory || app.tagline || app.platform || app.description || 'Mobile Application';
  const categoryTag = app.category || app.subCategory || 'Mobile App';
  const iconUrl = app.mediaUrl || app.icon || app.thumbnail?.imageUrl || '/icons/hisabnama-icon.png';
  const actionUrl = app.actionUrl || app.playStoreUrl || app.liveUrl || '#';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
        borderRadius: '18px',
        padding: '16px 18px',
        border: hovered
          ? '1.5px solid rgba(16, 185, 129, 0.45)'
          : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'),
        boxShadow: hovered
          ? (isDark
            ? '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15)'
            : '0 12px 30px rgba(0, 0, 0, 0.08)')
          : (isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.03)'),
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Header: App Icon + Name + Category Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Circular Premium App Icon with Ring & Status Indicator */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              padding: '2px',
              border: hovered ? '2px solid #10B981' : '2px solid rgba(16, 185, 129, 0.25)',
              boxShadow: hovered ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
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
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                onError={(e) => { e.target.src = '/app1.png'; }}
              />
            </div>
            {/* Green Online / Live Dot */}
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
              fontSize: '0.98rem',
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
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              {categoryTag}
            </span>
          </div>
        </div>

        {/* Tagline / Subtitle (Compact 2-line clamp) */}
        {tagline && (
          <p style={{
            fontSize: '0.78rem',
            color: isDark ? '#94A3B8' : '#64748B',
            marginTop: '10px',
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

      {/* Google Play Store Action Button */}
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #F1F5F9',
      }}>
        <a
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '9px 14px',
            borderRadius: '12px',
            backgroundColor: hovered ? '#10B981' : (isDark ? '#1E293B' : '#0F172A'),
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.78rem',
            textDecoration: 'none',
            boxShadow: hovered ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          <svg style={{ width: 14, height: 14, flexShrink: 0 }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-.61-.926V2.74c0-.353.224-.68.609-.926zm11.233 11.235l2.253 2.254-11.7 6.643 9.447-8.897zm0-2.098L5.395 2.054l11.7 6.643-2.253 2.254zm1.488 1.049l3.415 1.938c.84.477.84 1.258 0 1.735l-3.415 1.938-2.124-2.123 2.124-2.124z" />
          </svg>
          <span>Google Play Store</span>
        </a>
      </div>
    </div>
  );
}

/* ─── Compact Premium WebsiteCard Component ─── */
function WebsiteCard({ site, isDark }) {
  const [hovered, setHovered] = useState(false);

  const title = site.title || site.name || 'Untitled Website';
  const description = site.description || site.shortDescription || 'Full-stack modern web application.';
  const platform = site.subCategory || site.platform || site.category || 'Web Application';
  const bannerUrl = site.mediaUrl || site.banner || site.thumbnail?.imageUrl || '/banners/madrasah-banner.jpg';
  const actionUrl = site.actionUrl || site.link || site.liveUrl || '#';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : '#FFFFFF',
        borderRadius: '18px',
        overflow: 'hidden',
        border: hovered
          ? '1.5px solid rgba(6, 182, 212, 0.45)'
          : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0'),
        boxShadow: hovered
          ? (isDark
            ? '0 14px 34px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.15)'
            : '0 14px 34px rgba(0, 0, 0, 0.08)')
          : (isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.03)'),
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* 16:9 Banner Image with Hover Zoom Effect */}
      <div style={{
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
        position: 'relative',
      }}>
        <img
          src={bannerUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => { e.target.src = '/add1.png'; }}
        />
        {/* Subtle Dark Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '10px 12px',
          boxSizing: 'border-box'
        }}>
          <span style={{
            fontSize: '10px',
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
            opacity: hovered ? 1 : 0.8,
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

      {/* Content Details */}
      <div style={{ padding: '14px 16px 12px 16px', flex: 1 }}>
        <h3 style={{
          fontSize: '0.98rem',
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
          fontSize: '0.78rem',
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

      {/* Visit Website Action Button */}
      <div style={{
        padding: '0 16px 16px 16px',
      }}>
        <a
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            background: hovered 
              ? 'linear-gradient(135deg, #06B6D4 0%, #0D9488 100%)' 
              : 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.82rem',
            textDecoration: 'none',
            boxShadow: hovered
              ? '0 6px 18px rgba(6, 182, 212, 0.4)'
              : '0 4px 12px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <span>Visit Website</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

/* ─── Compact EmptyState ─── */
function EmptyState({ isDark, color, icon, message, sub }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '220px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: isDark ? '2px dashed rgba(255, 255, 255, 0.1)' : '2px dashed #E2E8F0',
      borderRadius: '18px',
      padding: '30px',
      textAlign: 'center',
      boxSizing: 'border-box',
      background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.5)'
    }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        backgroundColor: `${color}18`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '0.98rem',
        fontWeight: 700,
        margin: '0 0 4px 0',
        color: isDark ? '#E2E8F0' : '#334155',
      }}>
        {message}
      </h3>
      <p style={{
        fontSize: '0.78rem',
        color: isDark ? '#64748B' : '#94A3B8',
        margin: 0,
        maxWidth: '320px',
      }}>
        {sub}
      </p>
    </div>
  );
}
