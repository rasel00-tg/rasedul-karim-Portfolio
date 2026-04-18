import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Lottie from 'lottie-react';
import { Smartphone, Code2, GitBranch, PenTool } from 'lucide-react';

const skills = [
  { name: 'Flutter', icon: <Smartphone size={40} color="#00f0ff" />, desc: 'Cross-platform Mobile UI' },
  { name: 'Dart', icon: <Code2 size={40} color="#ff007f" />, desc: 'Object-oriented Programming' },
  { name: 'Git', icon: <GitBranch size={40} color="#00f0ff" />, desc: 'Version Control & Workflow' },
  { name: 'UI/UX Design', icon: <PenTool size={40} color="#ff007f" />, desc: 'Figma & Wireframing' }
];

const TiltCard = ({ skill }) => {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const rotateX = useTransform(y, [0, 400], [15, -15]);
  const rotateY = useTransform(x, [0, 400], [-15, 15]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  return (
    <motion.div
      className="glass-card"
      style={{
        width: '280px',
        height: '320px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        cursor: 'pointer',
        perspective: 1000,
        rotateX,
        rotateY,
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
    >
      <div style={{ pointerEvents: 'none', marginBottom: '20px' }}>
        {skill.icon}
        {/* Placeholder for Lottie:
            <Lottie animationData={yourJsonFile} loop={true} style={{ width: 80, height: 80 }} /> 
        */}
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{skill.name}</h3>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        {skill.desc}
      </p>
    </motion.div>
  );
};

const AboutSection = () => {
  return (
    <section id="about" style={{ padding: '100px 10%', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          <span className="text-gradient">About Me & Skills</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '60px', lineHeight: 1.6 }}>
          I am a passionate Flutter and UI/UX Developer. I blend aesthetics with performance, building apps that not only work flawlessly but look breathtaking.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          justifyItems: 'center'
        }}>
          {skills.map((skill, index) => (
            <TiltCard key={index} skill={skill} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
