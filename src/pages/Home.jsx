import React from 'react';
import HeroSection from '../components/HeroSection';

const Home = (props) => {
  return (
    <div 
      id="main-homepage-container"
      className="min-h-screen w-full overflow-y-auto overflow-x-hidden relative flex flex-col"
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <main className="w-full max-w-md lg:max-w-6xl mx-auto px-4 pb-32 pt-2 flex flex-col flex-1">
        {/* Digital Profile, Metrics, Social Icons & Bento Cards */}
        <HeroSection {...props} />
      </main>
    </div>
  );
};

export default Home;

