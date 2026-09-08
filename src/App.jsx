import React, { useState, Suspense, lazy } from 'react';
import { FirestoreStreamBuilder } from './firebase/FirestoreStreamBuilder';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FloatingActionButtons from './components/FloatingActionButtons';

// Lazy loading modals for maximum performance
const DreamModal = lazy(() => import('./components/DreamModal'));
const AboutModal = lazy(() => import('./components/AboutModal'));
const SkillModal = lazy(() => import('./components/SkillModal'));
const AdminModal = lazy(() => import('./components/AdminModal'));
const QRCodeModal = lazy(() => import('./components/QRCodeModal'));

function App() {
  const [showDream, setShowDream] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSkill, setShowSkill] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQR, setShowQR] = useState(false);

  return (
    <FirestoreStreamBuilder collectionName="portfolio">
      {({ data, loading, error }) => (
        <>
          {/* Navigation Header */}
          <Navbar 
            onOpenDream={() => setShowDream(true)} 
            onOpenAbout={() => setShowAbout(true)}
            onOpenSkill={() => setShowSkill(true)}
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenQR={() => setShowQR(true)}
          />
          
          {/* Full-Screen Lazy Modals */}
          <Suspense fallback={null}>
            {showDream && <DreamModal onClose={() => setShowDream(false)} />}
            {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
            {showSkill && <SkillModal onClose={() => setShowSkill(false)} />}
            {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
            {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
          </Suspense>
          
          {/* Main Mobile-First Digital Business Card Layout */}
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 1. Digital NFC Business Card Cover, Profile, Metrics & Social Icons */}
            <HeroSection 
              isDreamOpen={showDream || showAbout || showSkill || showAdmin || showQR} 
              onOpenQR={() => setShowQR(true)}
            />

            {/* Bottom-Right Floating Quick Actions */}
            <FloatingActionButtons />
          </div>
        </>
      )}
    </FirestoreStreamBuilder>
  );
}

export default App;
