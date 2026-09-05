import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Globe, 
  User, 
  Target, 
  FolderGit2, 
  ChevronRight, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

const StackedLinkCapsules = ({ onOpenAbout, onOpenDream }) => {
  const links = [
    {
      id: 'email',
      icon: <Mail size={18} color="#00f0ff" />,
      title: 'rasedul.karim.dev@gmail.com',
      subtitle: 'Official Contact Email',
      actionType: 'link',
      href: 'mailto:rasedul.karim.dev@gmail.com',
      badgeColor: '#00f0ff'
    },
    {
      id: 'projects',
      icon: <Globe size={18} color="#00f0ff" />,
      title: 'Web Apps & Projects',
      subtitle: 'Live Apps & Websites Portfolio',
      actionType: 'scroll',
      href: '#projects',
      badgeColor: '#00f0ff'
    },
    {
      id: 'about',
      icon: <User size={18} color="#ff007f" />,
      title: 'About Me',
      subtitle: 'Education, Skills & Experience',
      actionType: 'modal',
      onClick: onOpenAbout,
      badgeColor: '#ff007f'
    },
    {
      id: 'dream',
      icon: <Target size={18} color="#00f0ff" />,
      title: 'My Dream & Goals',
      subtitle: 'Vision for Notun Pollan Para',
      actionType: 'modal',
      onClick: onOpenDream,
      badgeColor: '#00f0ff'
    },
    {
      id: 'future-projects',
      icon: <FolderGit2 size={18} color="#ffaa00" />,
      title: 'Future Projects (Apps & Websites)',
      subtitle: 'Upcoming Systems & Architecture',
      actionType: 'scroll',
      href: '#projects',
      badgeColor: '#ffaa00'
    }
  ];

  return (
    <section style={{
      width: '100%',
      maxWidth: '720px',
      margin: '0 auto',
      padding: '16px 16px 28px 16px',
      position: 'relative',
      zIndex: 2
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%'
      }}>
        {links.map((item, index) => {
          const isLink = item.actionType === 'link' || item.actionType === 'scroll';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%' }}
            >
              {isLink ? (
                <a
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '50px',
                    background: 'var(--capsule-bg)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid var(--capsule-border)',
                    boxShadow: 'var(--card-shadow)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.badgeColor;
                    e.currentTarget.style.boxShadow = `0 10px 30px rgba(0, 240, 255, 0.25)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--capsule-border)';
                    e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--glass-bg)',
                      border: `1px solid ${item.badgeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                      <span style={{
                        fontSize: 'clamp(0.85rem, 2.6vw, 0.98rem)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.title}
                      </span>
                      <span style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.badgeColor,
                    flexShrink: 0
                  }}>
                    <ChevronRight size={18} />
                  </div>
                </a>
              ) : (
                <button
                  onClick={item.onClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '50px',
                    background: 'var(--capsule-bg)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid var(--capsule-border)',
                    boxShadow: 'var(--card-shadow)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.badgeColor;
                    e.currentTarget.style.boxShadow = `0 10px 30px rgba(0, 240, 255, 0.25)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--capsule-border)';
                    e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--glass-bg)',
                      border: `1px solid ${item.badgeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, textAlign: 'left' }}>
                      <span style={{
                        fontSize: 'clamp(0.85rem, 2.6vw, 0.98rem)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.title}
                      </span>
                      <span style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--glass-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.badgeColor,
                    flexShrink: 0
                  }}>
                    <ChevronRight size={18} />
                  </div>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default StackedLinkCapsules;
