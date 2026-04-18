import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import DreamModal from './components/DreamModal';

function App() {
  const [showDream, setShowDream] = useState(false);

  return (
    <>
      <Navbar onOpenDream={() => setShowDream(true)} />
      {showDream && <DreamModal onClose={() => setShowDream(false)} />}
      
      {/* 3D Background specifically for Hero Section mostly, but lives behind */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </>
  );
}

export default App;
