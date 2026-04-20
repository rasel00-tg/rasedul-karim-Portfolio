import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Code2, GitBranch, PenTool, Globe, Database, Cpu, Layers } from 'lucide-react';

const skills = [
  { name: 'Flutter', icon: <Smartphone size={16} color="#00f0ff" /> },
  { name: 'React.js', icon: <Globe size={16} color="#00f0ff" /> },
  { name: 'Firebase', icon: <Database size={16} color="#00f0ff" /> },
  { name: 'Dart', icon: <Code2 size={16} color="#ff007f" /> },
  { name: 'JS', icon: <Cpu size={16} color="#ff007f" /> },
  { name: 'Git', icon: <GitBranch size={16} color="#00f0ff" /> },
  { name: 'UI/UX', icon: <PenTool size={16} color="#ff007f" /> },
  { name: 'Stack', icon: <Layers size={16} color="#00f0ff" /> }
];

const SkillChip = ({ skill, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '30px',
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: 'default',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        whiteSpace: 'nowrap',
        willChange: 'transform'
      }}
      whileHover={{ 
        scale: 1.05, 
        borderColor: '#00f0ff',
        background: 'rgba(0, 240, 255, 0.05)'
      }}
    >
      {skill.icon}
      <span>{skill.name}</span>
    </motion.div>
  );
};

const AboutSection = () => {
  return (
    <section id="skills" style={{ 
      padding: '80px 20px', 
      minHeight: '60vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '1000px' }}
      >
        <h2 style={{ 
          fontSize: 'clamp(2rem, 4vw, 3rem)', 
          marginBottom: '50px', 
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 0 15px rgba(0,240,255,0.4)'
        }}>
          My <span style={{ color: '#00f0ff' }}>Skills</span>
        </h2>

        {/* Organized Wrap Layout for Mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {skills.map((skill, index) => (
            <SkillChip key={index} skill={skill} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
