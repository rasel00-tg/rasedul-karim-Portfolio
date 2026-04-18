import React from 'react';

const Navbar = ({ onOpenDream }) => {
  return (
    <nav style={{
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
    }}>
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
      <ul style={{
        display: 'flex',
        listStyle: 'none',
        gap: '40px',
        margin: 0,
        padding: 0
      }}>
        {['About', 'Skills', 'Projects', 'Dream', 'Contact'].map((item) => (
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
    </nav>
  );
};

export default Navbar;
