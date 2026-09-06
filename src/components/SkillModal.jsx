import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Info, 
  Globe, 
  Smartphone, 
  Bot, 
  Palette, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ label, percentage, subtitle, tags = [], color = '#00E5FF' }) => {
  const { isDark } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: '0.88rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '0.2px'
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.86rem',
          fontWeight: 800,
          fontFamily: "'Space Grotesk', sans-serif",
          color: color,
          letterSpacing: '0.5px'
        }}>
          {percentage}%
        </span>
      </div>

      {/* Slim Sleek 5px Progress Bar */}
      <div style={{
        width: '100%',
        height: '5px',
        borderRadius: '10px',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: '10px',
            background: `linear-gradient(90deg, #00E5FF 0%, #10B981 100%)`,
            boxShadow: `0 0 10px rgba(0, 229, 255, 0.45)`
          }}
        />
      </div>

      {/* Subtitle / Description */}
      {subtitle && (
        <span style={{
          fontSize: '0.76rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          marginTop: '1px'
        }}>
          {subtitle}
        </span>
      )}

      {/* Sub-tag pills if available */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '2px' }}>
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)'}`,
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SkillDomainCard = ({ title, icon: Icon, color = '#00E5FF', overview, skills = [] }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        background: isDark ? '#161B22' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? `${color}30` : 'rgba(0, 0, 0, 0.09)'}`,
        borderRadius: '18px',
        padding: '22px 20px',
        boxShadow: isDark 
          ? `0 12px 30px rgba(0, 0, 0, 0.5), 0 0 1px ${color}40` 
          : '0 8px 24px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative vertical accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        background: `linear-gradient(180deg, ${color}, transparent)`
      }} />

      {/* Domain Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: isDark ? `${color}18` : `${color}12`,
          border: `1px solid ${color}45`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          boxShadow: `0 0 16px ${color}30`,
          flexShrink: 0
        }}>
          <Icon size={20} />
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '1.06rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          letterSpacing: '0.4px',
          color: 'var(--text-primary)',
          lineHeight: 1.25
        }}>
          {title}
        </h3>
      </div>

      {/* Overview */}
      {overview && (
        <p style={{
          margin: 0,
          fontSize: '0.83rem',
          lineHeight: 1.55,
          color: 'var(--text-secondary)'
        }}>
          {overview}
        </p>
      )}

      {/* Progress Bars Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingTop: '8px',
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`
      }}>
        {skills.map((item, idx) => (
          <ProgressBar
            key={idx}
            label={item.label}
            percentage={item.percentage}
            subtitle={item.subtitle}
            tags={item.tags}
            color={color}
          />
        ))}
      </div>
    </motion.div>
  );
};

const SkillModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const [showNoticeModal, setShowNoticeModal] = useState(true);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          background: isDark ? 'rgba(5, 8, 16, 0.96)' : 'rgba(240, 246, 252, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0'
        }}
      >
        {/* ========================================================================= */}
        {/* 1. On-Entry Dismissible Notice Modal ("PLEASE READ THIS FIRST")           */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showNoticeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowNoticeModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.78)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 100002,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '540px',
                  background: isDark ? '#111722' : '#FFFFFF',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  borderRadius: '24px',
                  padding: '28px 24px 24px 24px',
                  boxShadow: isDark 
                    ? '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 229, 255, 0.25)' 
                    : '0 20px 50px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Crisp Glowing Top-Right Close (X) Button */}
                <motion.button
                  onClick={() => setShowNoticeModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(0, 229, 255, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  aria-label="Close Notice"
                >
                  <X size={18} />
                </motion.button>

                {/* Notice Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid rgba(0, 229, 255, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00E5FF',
                    boxShadow: '0 0 16px rgba(0, 229, 255, 0.35)',
                    flexShrink: 0
                  }}>
                    <Info size={22} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '1.5px',
                      color: 'var(--primary-color)',
                      textTransform: 'uppercase'
                    }}>
                      Authentic Self-Assessment
                    </span>
                    <h2 style={{
                      margin: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
                      fontWeight: 900,
                      letterSpacing: '0.8px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.2
                    }}>
                      PLEASE READ THIS FIRST
                    </h2>
                  </div>
                </div>

                {/* Notice Body */}
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: isDark ? 'rgba(0, 229, 255, 0.04)' : 'rgba(0, 119, 182, 0.04)',
                  border: '1px solid rgba(0, 229, 255, 0.15)'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    color: 'var(--text-primary)',
                    fontStyle: 'italic'
                  }}>
                    "Learning has no end. I do not claim to know or master everything. We are all on a continuous journey of learning and personal growth. I consider myself a very ordinary person and make no claims to extraordinary skills. Below is simply a modest overview of the technical areas and creative workflows I am steadily working on."
                  </p>
                </div>

                {/* Dismiss Action Button */}
                <motion.button
                  onClick={() => setShowNoticeModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #00E5FF 0%, #10B981 100%)',
                    border: 'none',
                    color: '#000000',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    letterSpacing: '0.4px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>I Understand & Continue to Skills</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 2. Main Page Content (Categorized Skill Dashboard)                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            width: '100%',
            maxWidth: '820px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '36px 18px 80px 18px'
          }}
        >
          {/* Top Floating Close Button for the Page */}
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed', 
              top: '20px', 
              right: '20px', 
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', 
              border: '1px solid var(--card-border)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              borderRadius: '50%', 
              width: '42px',
              height: '42px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 100000,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </motion.button>

          {/* Section Header Title */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: '20px',
            marginTop: '8px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--primary-color)',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              <Sparkles size={14} />
              <span>Technical Skills & Expertise</span>
            </div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              fontWeight: 900,
              letterSpacing: '0.8px',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2
            }}>
              Skills & Practical Capabilities
            </h1>
          </div>

          {/* Re-open Philosophy Notice Strip */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowNoticeModal(true)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '16px',
              background: isDark ? 'rgba(0, 229, 255, 0.06)' : 'rgba(0, 119, 182, 0.06)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: '20px',
              boxShadow: '0 4px 15px rgba(0, 229, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} color="#00E5FF" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Guiding Mindset & Humility Notice (Click to read again)
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--primary-color)', fontWeight: 700 }}>
              Read Notice
            </span>
          </motion.div>

          {/* Individual Categorized Skill Cards (4 Separate Cards) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '100%'
          }}>

            {/* Card 1: Modern Web Engineering & Responsive Platforms */}
            <SkillDomainCard
              title="Modern Web Engineering & Responsive Platforms"
              icon={Globe}
              color="#00E5FF"
              overview="Foundational practices for building responsive, cross-device websites and performant web interfaces."
              skills={[
                {
                  label: 'Frontend UI & Responsive Layouts',
                  percentage: 65,
                  subtitle: 'Modern Flexbox, CSS Grid & mobile-first viewports.',
                  tags: ['HTML5', 'CSS3', 'Flexbox', 'Tailwind CSS']
                },
                {
                  label: 'Interactive Logic & Component Systems',
                  percentage: 58,
                  subtitle: 'Component state handling, DOM events & API consumption.',
                  tags: ['JavaScript ES6+', 'React.js Fundamentals']
                },
                {
                  label: 'CMS Integration & Deployment',
                  percentage: 54,
                  subtitle: 'CMS content structuring and cloud hosting setups.',
                  tags: ['WordPress', 'Netlify', 'Web Hosting Management']
                }
              ]}
            />

            {/* Card 2: Mobile Application & Software Development */}
            <SkillDomainCard
              title="Mobile Application & Software Development"
              icon={Smartphone}
              color="#10B981"
              overview="Cross-platform mobile solutions and cloud-connected application architecture."
              skills={[
                {
                  label: 'Cross-Platform Development',
                  percentage: 62,
                  subtitle: 'Clean UI hierarchy, widget management & responsive rendering.',
                  tags: ['Flutter & Dart Widget Architecture']
                },
                {
                  label: 'Backend as a Service (BaaS)',
                  percentage: 60,
                  subtitle: 'Real-time database streams, security rules & auth flows.',
                  tags: ['Firebase Firestore', 'Real-time Streams', 'Auth']
                },
                {
                  label: 'Local Storage & State Persistence',
                  percentage: 55,
                  subtitle: 'Offline caching, structured key-value & database storage.',
                  tags: ['SQLite', 'SharedPreferences', 'Cache Handling']
                }
              ]}
            />

            {/* Card 3: Applied Generative AI & Prompt Engineering */}
            <SkillDomainCard
              title="Applied Generative AI & Prompt Engineering"
              icon={Bot}
              color="#A855F7"
              overview="Leveraging artificial intelligence systems and precision prompting to accelerate engineering workflows and creative synthesis."
              skills={[
                {
                  label: 'Structured Prompt Architecture',
                  percentage: 74,
                  subtitle: 'Context engineering, system role framing & chained prompting.',
                  tags: ['Context Engineering', 'System Role Framing', 'Chained Prompting']
                },
                {
                  label: 'AI-Assisted Development Workflows',
                  percentage: 70,
                  subtitle: 'Rapid debugging, code optimization & IDE AI integrations.',
                  tags: ['Windsurf', 'Trae', 'Cursor', 'VS Code AI']
                },
                {
                  label: 'Generative Media & Creative Direction',
                  percentage: 66,
                  subtitle: 'High-fidelity visual asset drafting and prompt refinement.',
                  tags: ['AI Visual Asset Drafting', 'Parameter Refinement']
                }
              ]}
            />

            {/* Card 4: Visual Media Branding & Creative Design */}
            <SkillDomainCard
              title="Visual Media Branding & Creative Design"
              icon={Palette}
              color="#F43F5E"
              overview="Crafting impactful digital graphics, social media banners, and brand visual identities for community platforms."
              skills={[
                {
                  label: 'Editorial & News Banner Design',
                  percentage: 72,
                  subtitle: 'Proven editorial designs for local media platforms.',
                  tags: ['Naf Vision News', 'Naf Sports Media']
                },
                {
                  label: 'Digital Photo Retouching & Compositing',
                  percentage: 65,
                  subtitle: 'Portrait lighting adjustment, color grading & canvas balancing.',
                  tags: ['Adobe Photoshop Principles', 'Lightroom', 'Canva Pro']
                },
                {
                  label: 'Brand Typography & Logo Concepts',
                  percentage: 58,
                  subtitle: 'Vector badges, minimal icon marks & social identity systems.',
                  tags: ['Vector Badges', 'Minimal Icon Marks', 'Social Identity']
                }
              ]}
            />

          </div>

          {/* Bottom Close / Dismiss Action */}
          <div style={{ marginTop: '32px', width: '100%', maxWidth: '320px' }}>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #00E5FF 0%, #10B981 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 229, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Done / Explore Portfolio</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SkillModal;
