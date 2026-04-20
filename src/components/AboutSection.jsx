import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Code2, GitBranch, PenTool, Globe, Database, Cpu, Layers } from 'lucide-react';

const skills = [
  { name: 'Flutter', icon: <Smartphone size={18} color="#00f0ff" /> },
  { name: 'React.js', icon: <Globe size={18} color="#00f0ff" /> },
  { name: 'Firebase', icon: <Database size={18} color="#00f0ff" /> },
  { name: 'Dart', icon: <Code2 size={18} color="#ff007f" /> },
  { name: 'JavaScript', icon: <Cpu size={18} color="#ff007f" /> },
  { name: 'Git & GitHub', icon: <GitBranch size={18} color="#00f0ff" /> },
  { name: 'UI/UX Design', icon: <PenTool size={18} color="#ff007f" /> },
  { name: 'Full Stack', icon: <Layers size={18} color="#00f0ff" /> }
];

const SkillChip = ({ skill, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.5 
      }}
      animate={{
        y: [0, -10, 0],
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
        gap: '12px',
        padding: '12px 25px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '50px',
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: '500',
        cursor: 'default',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 240, 255, 0.1)',
        whiteSpace: 'nowrap',
        willChange: 'transform'
      }}
      whileHover={{ 
        scale: 1.1, 
        borderColor: '#00f0ff',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
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
      padding: '100px 5%', 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      alignItems: 'center',
      background: 'transparent',
      overflow: 'hidden'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: '1200px' }}
      >
        <h2 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          marginBottom: '80px', 
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 0 20px rgba(0, 240, 255, 0.6)'
        }}>
          My <span style={{ color: '#00f0ff' }}>Skills & Expertise</span>
        </h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
          alignItems: 'center'
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
