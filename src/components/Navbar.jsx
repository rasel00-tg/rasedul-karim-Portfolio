import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronUp } from 'lucide-react';

const Navbar = ({ onOpenDream }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['About', 'Skills', 'Projects', 'Dream', 'Contact'];

  return (
    <>
      <AnimatePresence>
        {!isScrolled && (
          <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              padding: '20px 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 100,
              background: 'rgba(11, 0, 26, 0.4)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid var(--glass-border)'
            }}
          >
            <div style={{
              fontSize: '24px',
              fontWeight: '800',
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#FFFFFF',
              letterSpacing: '2px',
              textShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
            }}>
              ASSALAMU ALIKUM
            </div>
            <ul className="full-nav-menu" style={{
              display: 'flex',
              listStyle: 'none',
              gap: '40px',
              margin: 0,
              padding: 0
            }}>
              {navItems.map((item) => (
                <li key={item}>
                  <a 
                    href={item === 'Dream' ? '#' : `#${item.toLowerCase()}`}
                    onClick={(e) => {
                      if (item === 'Dream') {
                        e.preventDefault();
                        onOpenDream && onOpenDream();
                      }
                    }}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'color 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Floating Menu Icon */}
      <AnimatePresence>
        {isScrolled && !isDrawerOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 110 }}
          >
            <button
              onClick={() => setIsDrawerOpen(true)}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#fff',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
              }}
            >
              <Menu size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Drawer Menu */}
      <AnimatePresence>
        {isScrolled && isDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '250px',
              height: '100vh',
              background: 'rgba(11, 0, 26, 0.95)',
              backdropFilter: 'blur(30px)',
              borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
              zIndex: 110,
              display: 'flex',
              flexDirection: 'column',
              padding: '30px 20px',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }}
          >
            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                alignSelf: 'center',
                padding: '8px 40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#00f0ff',
                marginBottom: '40px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                e.currentTarget.style.borderColor = '#00f0ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <ChevronUp size={24} />
            </button>

            <ul style={{
              display: 'flex',
              flexDirection: 'column',
              listStyle: 'none',
              gap: '30px',
              margin: 0,
              padding: 0,
              alignItems: 'center'
            }}>
              {navItems.map((item, i) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <a 
                    href={item === 'Dream' ? '#' : `#${item.toLowerCase()}`}
                    onClick={(e) => {
                      setIsDrawerOpen(false);
                      if (item === 'Dream') {
                        e.preventDefault();
                        onOpenDream && onOpenDream();
                      }
                    }}
                    style={{
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      transition: 'color 0.3s, text-shadow 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#00f0ff';
                      e.target.style.textShadow = '0 0 10px #00f0ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#ffffff';
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
