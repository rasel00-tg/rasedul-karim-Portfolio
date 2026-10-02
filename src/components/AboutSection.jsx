import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Code2, GitBranch, PenTool, Globe, Database, Cpu, Layers, Sparkles, Terminal, FileCode, Palette } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const skills = [
  { name: 'Flutter', icon: <Smartphone size={16} color="#00f0ff" />, glow: 'rgba(0, 240, 255, 0.4)' },
  { name: 'React.js', icon: <Globe size={16} color="#00f0ff" />, glow: 'rgba(0, 240, 255, 0.4)' },
  { name: 'Firebase', icon: <Database size={16} color="#ffaa00" />, glow: 'rgba(255, 170, 0, 0.4)' },
  { name: 'Dart', icon: <Code2 size={16} color="#00d2ff" />, glow: 'rgba(0, 210, 255, 0.4)' },
  { name: 'JavaScript', icon: <Cpu size={16} color="#f7df1e" />, glow: 'rgba(247, 223, 30, 0.4)' },
  { name: 'Git / GitHub', icon: <GitBranch size={16} color="#ff007f" />, glow: 'rgba(255, 0, 127, 0.4)' },
  { name: 'UI / UX Design', icon: <PenTool size={16} color="#a855f7" />, glow: 'rgba(168, 85, 247, 0.4)' },
  { name: 'Photo Editing', icon: <Palette size={16} color="#ff007f" />, glow: 'rgba(255, 0, 127, 0.4)' },
  { name: 'Node / REST APIs', icon: <Terminal size={16} color="#22c55e" />, glow: 'rgba(34, 197, 94, 0.4)' },
  { name: 'HTML5 / CSS3', icon: <FileCode size={16} color="#00f0ff" />, glow: 'rgba(0, 240, 255, 0.4)' }
];

const SkillChip = ({ skill, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ 
        scale: 1.06, 
        y: -3,
        borderColor: '#00f0ff',
        boxShadow: `0 0 15px ${skill.glow}`
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px 16px',
        background: 'var(--chip-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--card-border)',
        borderRadius: '24px',
        color: 'var(--text-primary)',
        fontSize: '0.88rem',
        fontWeight: '600',
        cursor: 'default',
        boxShadow: 'var(--card-shadow)',
        whiteSpace: 'nowrap',
        willChange: 'transform' // Low-RAM device optimization
      }}
    >
      {skill.icon}
      <span>{skill.name}</span>
    </motion.div>
  );
};

const AboutSection = () => {
  const { isBangla, t } = useLanguage();

  return (
    <section 
      id="skills" 
      style={{ 
        padding: '40px 5% 50px 5%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '850px', textAlign: 'center' }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--card-border)',
          color: 'var(--primary-color)',
          fontSize: '0.85rem',
          fontWeight: '600',
          letterSpacing: '1px',
          marginBottom: '12px',
          textTransform: 'uppercase',
          fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
        }}>
          <Sparkles size={16} /> {t('skillsSection.tag', 'Tech Expertise')}
        </div>

        <h2 style={{ 
          fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', 
          marginBottom: '24px', 
          color: 'var(--text-primary)',
          fontWeight: 800,
          letterSpacing: '1.5px',
          fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif"
        }}>
          {t('skillsSection.my', 'MY')} <span style={{ color: 'var(--primary-color)' }}>{t('skillsSection.skills', 'SKILLS')}</span>
        </h2>

        {/* Compact Grid/Wrap Badges with subtle glowing borders */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '750px',
          margin: '0 auto'
        }}>
          {skills.map((skill, index) => (
            <SkillChip key={skill.name} skill={skill} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
