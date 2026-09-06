import React, { useState, Suspense, lazy } from 'react';
import { FirestoreStreamBuilder } from './firebase/FirestoreStreamBuilder';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StackedLinkCapsules from './components/StackedLinkCapsules';
import NoticeSlider from './components/NoticeSlider';
import AboutSection from './components/AboutSection';
import SocialCommunitySection from './components/SocialCommunitySection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
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
            {/* 1. Digital NFC Business Card Cover & Profile */}
            <HeroSection 
              isDreamOpen={showDream || showAbout || showSkill || showAdmin || showQR} 
              onOpenQR={() => setShowQR(true)}
            />

            {/* 2. Stacked Link & Navigation Capsules */}
            <StackedLinkCapsules 
              onOpenAbout={() => setShowAbout(true)} 
              onOpenDream={() => setShowDream(true)} 
            />
            
            {/* 3. Notice Slider */}
            <NoticeSlider />
            
            {/* 4. My Skills Badges */}
            <AboutSection />
            
            {/* 5. Social Community Hub */}
            <SocialCommunitySection />
            
            {/* 6. Web Apps & Projects Section (Firestore StreamBuilder + Cloudinary) */}
            <ProjectsSection />
            
            {/* 7. Direct Contact Form */}
            <ContactSection />
            
            {/* 8. Clean Footer with Dashboard Login */}
            <Footer 
              onOpenDream={() => setShowDream(true)} 
              onOpenAbout={() => setShowAbout(true)}
              onOpenAdmin={() => setShowAdmin(true)}
            />
            
            {/* 9. Bottom-Right Floating Quick Actions */}
            <FloatingActionButtons />
          </div>
        </>
      )}
    </FirestoreStreamBuilder>
  );
}

export default App;
