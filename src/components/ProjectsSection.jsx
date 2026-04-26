import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Smartphone, Globe, Layers } from 'lucide-react';

// Pre-define automated image loading configuration
// Max items sets how many files the system should check for. E.g., app1.png up to app10.png
const MAX_APP_ITEMS = 10;
const MAX_WEB_ITEMS = 10;

// Helper to construct arrays from 1 to N
const appIndices = Array.from({ length: MAX_APP_ITEMS }, (_, i) => i + 1);
const webIndices = Array.from({ length: MAX_WEB_ITEMS }, (_, i) => i + 1);

// App Item component - specifically styled as a Smartphone App Icon
const AppProjectCard = ({ index }) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc = `/app${index}.png`;

  if (hasError) return null; // Hide automatically if image doesn't exist

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -10, scale: 1.05 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        cursor: 'pointer'
      }}
    >
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '30px', // Squircle iOS style
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.2)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease'
      }}>
        {/* Glow behind icon */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)',
          filter: 'blur(20px)', zIndex: 0
        }}></div>

        <img 
          src={imageSrc} 
          alt={`App Project ${index}`} 
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 1,
            borderRadius: 'inherit' // Ensures image rounds perfectly inside the squircle
          }}
        />
      </div>
      <h4 style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.5px', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>App {index}</h4>
    </motion.div>
  );
};

// Website Item component - rectangular glass cards with URL link placeholders
const WebProjectCard = ({ index }) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc = `/web${index}.png`;
  // Customizable default links. If you need dynamic links, these would come from a JSON file, 
  // but keeping it simple based on the prompt's request.
  const projectLink = `https://your-website-url-${index}.com`; // Replace with actual links if needed

  if (hasError) return null; // Hide automatically if image doesn't exist

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,240,255,0.2)' }}
      className="glass-card"
      style={{
        position: 'relative',
        width: '100%',
        height: '250px',
        overflow: 'hidden',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none'
      }}
    >
      <a href={projectLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'block' }}>
        <img 
          src={imageSrc}
          alt={`Web Project ${index}`}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {/* Hover Overlay with Link Icon */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, width: '100%', padding: '20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none' // Let clicks pass through to to 'a' tag
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Website {index}</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#00f0ff' }}>View Live Site</p>
          </div>
          <div style={{ 
            background: 'rgba(0, 240, 255, 0.2)', padding: '10px', borderRadius: '50%',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <ExternalLink size={18} color="#00f0ff" />
          </div>
        </div>
      </a>
    </motion.div>
  );
};

const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState('apps'); // 'apps' or 'web'

  return (
    <section id="projects" style={{ padding: '100px 5%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ width: '100%', maxWidth: '1200px' }}
      >
        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '50px', textAlign: 'center', color: '#fff', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
          Future <span style={{ color: '#00f0ff' }}>Projects</span>
        </h2>
        
        {/* Category Tabs */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '60px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('apps')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 30px',
              borderRadius: '50px',
              border: activeTab === 'apps' ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'apps' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'apps' ? '#00f0ff' : '#fff',
              fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'apps' ? '0 0 20px rgba(0,240,255,0.2)' : 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Smartphone size={20} /> Apps
          </button>

          <button 
            onClick={() => setActiveTab('web')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 30px',
              borderRadius: '50px',
              border: activeTab === 'web' ? '1px solid #ff007f' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'web' ? 'rgba(255, 0, 127, 0.1)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'web' ? '#ff007f' : '#fff',
              fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'web' ? '0 0 20px rgba(255,0,127,0.2)' : 'none',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Globe size={20} /> Websites
          </button>
        </div>

        {/* Dynamic Project Grids */}
        <AnimatePresence mode="wait">
          {activeTab === 'apps' && (
            <motion.div
              key="apps-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '40px',
                padding: '20px'
              }}
            >
              {/* Fallback info when no apps are loaded yet */}
              {appIndices.map(index => (
                <AppProjectCard key={`app-${index}`} index={index} />
              ))}
              
            </motion.div>
          )}

          {activeTab === 'web' && (
            <motion.div
              key="web-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '30px',
                width: '100%',
                padding: '20px 0'
              }}
            >
              {webIndices.map(index => (
                <WebProjectCard key={`web-${index}`} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
      </motion.div>
    </section>
  );
};

export default ProjectsSection;
