import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronUp, Sun, Moon, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onOpenDream, onOpenAbout, onOpenAdmin }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Secret Admin hotkey: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdmin && onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdmin]);

  const navItems = ['About', 'Skills', 'Community', 'Projects', 'Dream', 'Contact'];

  return (
    <>
      {/* Top Floating Corner Controls (Unobscured Cover Picture) */}
      <div style={{
        position: 'fixed',
        top: '14px',
        left: '14px',
        right: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none' // Let clicks pass through empty areas
      }}>
        {/* Top-Left: Minimalist Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.12, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            pointerEvents: 'auto',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--card-border)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s ease'
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {/* Top-Right: Sleek Floating Menu Button */}
        <motion.button
          onClick={() => setIsDrawerOpen(true)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          style={{
            pointerEvents: 'auto',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--card-border)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s ease'
          }}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </motion.button>
      </div>

      {/* Side Navigation Drawer Menu */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '280px',
              height: '100vh',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderLeft: '1px solid var(--card-border)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              padding: '30px 20px',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                alignSelf: 'flex-end',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'var(--primary-color)',
                marginBottom: '35px',
                transition: 'all 0.3s'
              }}
              aria-label="Close Menu"
            >
              <ChevronUp size={22} />
            </button>

            {/* Menu Links */}
            <ul style={{
              display: 'flex',
              flexDirection: 'column',
              listStyle: 'none',
              gap: '24px',
              margin: 0,
              padding: 0,
              alignItems: 'center'
            }}>
              {navItems.map((item, i) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  <a 
                    href={(item === 'Dream' || item === 'About') ? '#' : `#${item.toLowerCase()}`}
                    onClick={(e) => {
                      setIsDrawerOpen(false);
                      if (item === 'Dream') {
                        e.preventDefault();
                        onOpenDream && onOpenDream();
                      } else if (item === 'About') {
                        e.preventDefault();
                        onOpenAbout && onOpenAbout();
                      }
                    }}
                    style={{
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '1.15rem',
                      fontWeight: '700',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      display: 'block',
                      padding: '8px 0',
                      transition: 'color 0.3s, text-shadow 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'var(--primary-color)';
                      e.target.style.textShadow = '0 0 12px var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'var(--text-primary)';
                      e.target.style.textShadow = 'none';
                    }}
                  >
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
