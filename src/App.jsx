import React, { useState, Suspense, lazy } from 'react';
import { FirestoreStreamBuilder } from './firebase/FirestoreStreamBuilder';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

// Lazy loading modals for maximum performance
const DreamModal = lazy(() => import('./components/DreamModal'));
const AboutModal = lazy(() => import('./components/AboutModal'));
const SkillModal = lazy(() => import('./components/SkillModal'));
const AdminModal = lazy(() => import('./components/AdminModal'));
const QRCodeModal = lazy(() => import('./components/QRCodeModal'));
const ReviewModal = lazy(() => import('./components/ReviewModal'));
const ProjectsModal = lazy(() => import('./components/ProjectsModal'));

function App() {
  const [showProjects, setShowProjects] = useState(false);
  const [showDream, setShowDream] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSkill, setShowSkill] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <FirestoreStreamBuilder collectionName="portfolio">
      {({ data, loading, error }) => (
        <>
          {/* Navigation Header */}
          <Navbar 
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            onOpenDream={() => setShowDream(true)} 
            onOpenAbout={() => setShowAbout(true)}
            onOpenSkill={() => setShowSkill(true)}
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenQR={() => setShowQR(true)}
            onOpenReview={() => setShowReview(true)}
          />
          
          {/* Full-Screen Lazy Modals */}
          <Suspense fallback={null}>
            {showProjects && <ProjectsModal onClose={() => setShowProjects(false)} />}
            {showDream && <DreamModal onClose={() => setShowDream(false)} />}
            {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
            {showSkill && <SkillModal onClose={() => setShowSkill(false)} />}
            {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
            {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
            {showReview && <ReviewModal onClose={() => setShowReview(false)} />}
          </Suspense>
          
          {/* Main Mobile-First Digital Business Card Layout - Clean & Unobstructed */}
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Digital Profile, Metrics, Social Icons & Bento Cards */}
            <HeroSection 
              isDreamOpen={showProjects || showDream || showAbout || showSkill || showAdmin || showQR || showReview} 
              onOpenProjects={() => setShowProjects(true)}
              onOpenAbout={() => setShowAbout(true)}
              onOpenDream={() => setShowDream(true)}
              onOpenSkill={() => setShowSkill(true)}
              onOpenAdmin={() => setShowAdmin(true)}
              onOpenReview={() => setShowReview(true)}
              onOpenQR={() => setShowQR(true)}
              onOpenDrawer={() => setIsDrawerOpen(true)}
            />
          </div>
        </>
      )}
    </FirestoreStreamBuilder>
  );
}

export default App;

