import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';

// Lazy loading modals
const DreamModal = lazy(() => import('./components/DreamModal'));
const AboutModal = lazy(() => import('./components/AboutModal'));

function App() {
  const [showDream, setShowDream] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <Navbar onOpenDream={() => setShowDream(true)} onOpenAbout={() => setShowAbout(true)} />
      
      <Suspense fallback={null}>
        {showDream && <DreamModal onClose={() => setShowDream(false)} />}
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </Suspense>
      
      {/* 3D Background specifically for Hero Section mostly, but lives behind */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Pass down to pause WebGL rendering when any modal is open */}
        <HeroSection isDreamOpen={showDream || showAbout} />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </>
  );
}

export default App;
