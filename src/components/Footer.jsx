import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Shield } from 'lucide-react';

const Footer = ({ onOpenDream, onOpenAbout, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      width: '100%',
      position: 'relative',
      zIndex: 2,
      padding: '40px 20px 30px 20px',
      borderTop: '1px solid var(--card-border)',
      background: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      marginTop: '50px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center'
      }}>
        {/* Back to Top */}
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
            marginBottom: '5px'
          }}
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </motion.button>

        {/* Quick Links */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '0.9rem',
          color: '#94A3B8'
        }}>
          <a 
            href="#about" 
            onClick={(e) => { e.preventDefault(); onOpenAbout && onOpenAbout(); }}
            style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#00f0ff'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            About Me
          </a>
          <a 
            href="#skills" 
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('skills');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#00f0ff'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            My Skills
          </a>
          <a 
            href="#community" 
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('community');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#00f0ff'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            Community
          </a>
          <a 
            href="#projects" 
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('projects');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#00f0ff'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            Projects
          </a>
          <a 
            href="#dream" 
            onClick={(e) => { e.preventDefault(); onOpenDream && onOpenDream(); }}
            style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#00f0ff'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            My Dream
          </a>
          <a 
            href="#admin" 
            onClick={(e) => { e.preventDefault(); onOpenAdmin && onOpenAdmin(); }}
            style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
            onMouseEnter={e => e.target.style.color = '#00f0ff'}
            onMouseLeave={e => e.target.style.color = '#64748B'}
            title="Admin Management"
          >
            <Shield size={13} /> Admin
          </a>
        </div>

        {/* Location & Title Summary */}
        <div style={{
          fontSize: '0.85rem',
          color: '#64748B',
          letterSpacing: '0.5px'
        }}>
          📍 Natun Pollan Para, Teknaf, Cox's Bazar • Software & Web Developer | Photo Editor
        </div>

        {/* Strict Copyright Line */}
        <div style={{
          fontSize: '0.9rem',
          color: '#E2E8F0',
          fontWeight: 500,
          letterSpacing: '0.5px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '16px',
          width: '100%',
          maxWidth: '500px'
        }}>
          © 2026 Rasedul Karim. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
