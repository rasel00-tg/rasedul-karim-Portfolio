import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Code2, Smartphone, Terminal, Braces, X, Quote } from 'lucide-react';

const SceneBg = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00f0ff" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#ff007f" />
        <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#00f0ff" />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

const FloatingDomIcon = ({ icon, left, top, delay }) => (
  <motion.div
    animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 15, -10, 0] }}
    transition={{ duration: 6, repeat: Infinity, delay: delay, ease: "easeInOut" }}
    style={{
      position: 'absolute',
      left, top,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--glass-border)',
      padding: '12px',
      borderRadius: '50%',
      color: 'var(--primary-color)',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
      zIndex: 2,
    }}
  >
    {icon}
  </motion.div>
);

const HeroSection = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFloatingIcons, setShowFloatingIcons] = useState(true);
  const [isBroken, setIsBroken] = useState(false);

  const nameStr = "Rasedul Karim";
  const breakPositions = useRef(
    nameStr.split('').map(() => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      rotate: (Math.random() - 0.5) * 720
    }))
  ).current;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // If user scrolls, reassemble characters
      if (window.scrollY > 10 && isBroken) {
        setIsBroken(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBroken]);

  const contactLinks = [
    { src: '/Facebook.png', url: 'https://www.facebook.com/share/1CiNH7Gnt6/', alt: 'Facebook' },
    { src: '/emile.png', url: 'mailto:rasedul.karim.dev@gmail.com', alt: 'Email' },
    { src: '/whatsapp.png', url: 'https://wa.me/8801871176267', alt: 'WhatsApp' }
  ];

  return (
    <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <SceneBg />

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1200px',
        width: '100%',
        padding: '100px 5% 0 5%',
        gap: '60px',
        zIndex: 1,
        pointerEvents: 'auto'
      }}>

        {/* Left Side (Image) */}
        <motion.div
          style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', position: 'relative' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5, duration: 1 }}
        >
          {/* Lightning Flash Aura */}
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 0px rgba(0,255,255,0))",
                "drop-shadow(0 0 50px rgba(0,255,255,1))",
                "drop-shadow(0 0 0px rgba(0,255,255,0))",
                "drop-shadow(0 0 80px rgba(0,240,255,1))",
                "drop-shadow(0 0 0px rgba(0,255,255,0))",
                "drop-shadow(0 0 0px rgba(0,255,255,0))"
              ]
            }}
            transition={{
              duration: 4,
              times: [0, 0.02, 0.05, 0.08, 0.12, 1],
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ position: 'relative', width: '280px', height: '280px', borderRadius: '50%', zIndex: 3 }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'transparent', border: '2px solid rgba(0, 240, 255, 0.2)' }}>
              <img src="/profile.jpeg" alt="Rasedul Karim" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </motion.div>

          <FloatingDomIcon icon={<Smartphone size={24} />} left="-20px" top="20px" delay={0} />
          <FloatingDomIcon icon={<Code2 size={24} color="#ff007f" />} left="250px" top="40px" delay={1.5} />
          <FloatingDomIcon icon={<Braces size={24} />} left="-10px" top="200px" delay={3} />
          <FloatingDomIcon icon={<Terminal size={24} color="#ff007f" />} left="220px" top="220px" delay={4.5} />
        </motion.div>

        {/* Right Side (Text & Interactive Title) */}
        <motion.div
          style={{ flex: '1 1 400px', textAlign: 'center', userSelect: 'none' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1 }}
        >
          <motion.h1
            style={{ fontFamily: "'MyCustomFont', cursive", fontSize: 'clamp(3rem, 10vw, 6rem)', whiteSpace: 'nowrap', margin: '0 0 10px 0', fontWeight: 500, cursor: 'pointer', display: 'inline-block', letterSpacing: '2px', lineHeight: 1 }}
            onClick={() => setIsBroken(true)}
            animate={{
              filter: [
                "drop-shadow(0 0 0px rgba(0,255,255,0))",
                "drop-shadow(0 0 20px rgba(0,255,255,0.8))",
                "drop-shadow(0 0 0px rgba(0,255,255,0))",
                "drop-shadow(0 0 40px rgba(0,240,255,0.9))",
                "drop-shadow(0 0 0px rgba(0,255,255,0))"
              ]
            }}
            transition={{ duration: 4, times: [0, 0.05, 0.1, 0.15, 1], repeat: Infinity, ease: "linear", delay: 1 }}
          >
            {nameStr.split('').map((char, index) => {
              const pos = breakPositions[index];
              return (
                <motion.span
                  key={index}
                  style={{
                    display: 'inline-block',
                    minWidth: char === ' ' ? '1rem' : 'auto',
                    color: '#FFFFFF',
                    textShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff'
                  }}
                  animate={
                    isBroken
                      ? { x: pos.x, y: pos.y, rotate: pos.rotate, opacity: 0.9, scale: 1.2 }
                      : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
                  }
                  transition={
                    isBroken
                      ? { type: 'spring', damping: 10, stiffness: 50 }
                      : { type: 'spring', damping: 20, stiffness: 100 }
                  }
                  whileHover={!isBroken ? { scale: 1.2, color: '#FFFFFF', textShadow: '0 0 20px #ff007f, 0 0 40px #ff007f' } : {}}
                >
                  <motion.span
                    animate={!isBroken ? { y: [0, -5, 0] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.1, ease: 'easeInOut' }}
                    style={{ display: 'inline-block' }}
                  >
                    {char}
                  </motion.span>
                </motion.span>
              );
            })}
          </motion.h1>

          <div style={{ fontSize: 'clamp(1rem, 4vw, 2rem)', color: 'var(--text-secondary)', fontWeight: 300, minHeight: '40px', marginTop: '0px' }}>
            <TypeAnimation
              sequence={[
                "I'm a Software Developer", 2000,
                "I'm a Web Developer", 2000,
                "I'm a Photo Editor", 2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            <AnimatePresence mode="wait">
              {!isScrolled && (
                <motion.div
                  key="static-icons"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  style={{ display: 'flex', gap: '40px', justifyContent: 'center', paddingLeft: '10px' }}
                >
                  {contactLinks.map((link, i) => (
                    <motion.a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      whileHover={{ scale: 1.2 }}
                    >
                      <img src={link.src} alt={link.alt} style={{ width: '32px', height: '32px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>

      {/* Floating Draggable Contact Icons */}
      <AnimatePresence>
        {isScrolled && showFloatingIcons && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 100 }}
            drag
            dragConstraints={{ left: -1000, right: 0, top: -800, bottom: 0 }}
            className="glass-card"
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              padding: '15px 20px',
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              zIndex: 1000,
              cursor: 'grab'
            }}
          >
            <div
              onClick={() => setShowFloatingIcons(false)}
              style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--secondary-color)', borderRadius: '50%', padding: '5px', cursor: 'pointer', boxShadow: '0 0 10px rgba(255,0,127,0.5)' }}
            >
              <X size={14} color="#fff" />
            </div>

            {contactLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noreferrer" draggable="false">
                <motion.img
                  src={link.src}
                  alt={link.alt}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  style={{ width: '32px', height: '32px', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' }}
                  draggable="false"
                />
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
