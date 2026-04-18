import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    title: 'Apps Bazar Admin',
    desc: 'React-based admin dashboard with Firebase, featuring glassmorphism and real-time updates.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
  },
  {
    title: 'Naf Sports Live',
    desc: 'Flutter app for real-time cricket scoring and schedules with custom dark theme.',
    img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=600',
  },
  {
    title: 'Amar Elaka',
    desc: 'Community engagement mobile app built with Flutter and Firestore sync.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
  }
];

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: index * 0.1 }}
      className="glass-card"
      style={{
        position: 'relative',
        height: '400px',
        overflow: 'hidden',
        borderRadius: '24px',
        cursor: 'pointer',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${project.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.4 }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileHover={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '30px',
          background: 'linear-gradient(to top, rgba(11,0,26,0.9), transparent)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          height: '100%',
        }}
      >
        <h3 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary-color)' }}>{project.title}</h3>
        <p style={{ color: 'var(--text-primary)', fontWeight: 300, lineHeight: 1.5 }}>{project.desc}</p>
      </motion.div>
    </motion.div>
  );
};

const ProjectsSection = () => {
  return (
    <section id="projects" style={{ padding: '100px 10%', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '60px', textAlign: 'center' }}>
          <span className="text-gradient">Featured Projects</span>
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {projects.map((proj, i) => (
            <ProjectCard key={i} project={proj} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ProjectsSection;
