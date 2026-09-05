import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';

const socialItems = [
  {
    id: 'facebook',
    name: 'Facebook Profile',
    handle: 'Rasedul Karim',
    subtitle: '12K+ Followers • Connect & Follow',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    badgeColor: '#1877F2',
    btnText: 'Follow',
    btnBg: '#1877F2',
    link: 'https://www.facebook.com/share/1CiNH7Gnt6/'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Community',
    handle: '+880 1871-176267',
    subtitle: 'Direct Messaging • Quick Response',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    ),
    badgeColor: '#25D366',
    btnText: 'Message',
    btnBg: '#25D366',
    link: 'https://wa.me/8801871176267'
  },
  {
    id: 'telegram',
    name: 'Telegram Channel',
    handle: '@rasedulkarim',
    subtitle: 'Tech Community • Code & Updates',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#229ED9">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.34-.635.34l.213-3.053 5.56-5.023c.24-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.894z"/>
      </svg>
    ),
    badgeColor: '#229ED9',
    btnText: 'Join',
    btnBg: '#229ED9',
    link: 'https://t.me/rasedulkarim'
  },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    handle: 'Rasedul Karim',
    subtitle: 'Tech Tutorials • UI/UX & Coding',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    badgeColor: '#FF0000',
    btnText: 'Subscribe',
    btnBg: '#FF0000',
    link: 'https://youtube.com/@its.rasel.bro143?feature=shared'
  },
  {
    id: 'instagram',
    name: 'Instagram Profile',
    handle: '@rasedulkarim.00',
    subtitle: 'Visual Aesthetics & Highlights',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#E1306C">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    badgeColor: '#E1306C',
    btnText: 'Follow',
    btnBg: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
    link: 'https://www.instagram.com/rasedulkarim.00?stkn=MWZ3ZHZiYm15dW12cA=='
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    handle: '@rasedulkarim0',
    subtitle: 'Tech Tweets & Industry Trends',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    badgeColor: '#71767B',
    btnText: 'Follow',
    btnBg: '#0f1419',
    link: 'https://x.com/rasedulkarim0'
  }
];

const SocialCommunitySection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = isExpanded ? socialItems : socialItems.slice(0, 4);

  return (
    <section 
      id="community" 
      style={{ 
        padding: '50px 5% 60px 5%', 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '30px' }}
      >
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
          textTransform: 'uppercase'
        }}>
          <Users size={16} /> Community & Socials
        </div>

        <h2 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
          color: 'var(--text-primary)',
          margin: 0,
          fontWeight: 800,
          letterSpacing: '1.5px'
        }}>
          SOCIAL <span style={{ color: 'var(--primary-color)' }}>COMMUNITY</span>
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'clamp(0.88rem, 2vw, 1rem)',
          marginTop: '8px',
          maxWidth: '600px',
          margin: '8px auto 0 auto'
        }}>
          Stay connected for updates, collaboration, and tech discussions.
        </p>
      </motion.div>

      {/* Cards Container - Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <AnimatePresence>
          {displayedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
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
                willChange: 'transform' // Low-RAM lag-free optimization
              }}
            >
              {/* Subtle neon left accent */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: '20%',
                height: '60%',
                width: '3px',
                background: item.badgeColor,
                borderRadius: '0 4px 4px 0',
                boxShadow: `0 0 10px ${item.badgeColor}`
              }} />

              {/* Left: Icon & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '0.96rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </h3>
                  <span style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {/* Right: Action Button */}
              <motion.a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: item.btnBg,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  padding: '8px 16px',
                  borderRadius: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  flexShrink: 0,
                  cursor: 'pointer',
                  border: 'none',
                  letterSpacing: '0.5px'
                }}
              >
                <span>{item.btnText}</span>
                <ExternalLink size={13} />
              </motion.a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More / Show Less Button */}
      {socialItems.length > 4 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--primary-color)',
              padding: '10px 24px',
              borderRadius: '30px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.15)'
            }}
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>Show More</span>
                <ChevronDown size={16} />
              </>
            )}
          </motion.button>
        </div>
      )}
    </section>
  );
};

export default SocialCommunitySection;
