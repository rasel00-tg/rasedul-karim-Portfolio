import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectsPage from './ProjectsPage';
import { FirestoreStreamBuilder } from '../firebase/FirestoreStreamBuilder';
import { useTheme } from '../context/ThemeContext';

const ProjectsModal = ({ onClose }) => {
  const { isDark } = useTheme();

  // Intercept Browser Back (PopScope) to return to Homebar
  useEffect(() => {
    window.history.pushState({ modal: 'projects' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          zIndex: 999999,
          margin: 0,
          padding: 0,
          backgroundColor: isDark ? '#050B14' : '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <FirestoreStreamBuilder collectionName="projects">
          {({ data, loading }) => (
            <ProjectsPage items={data || []} loading={loading} onClose={onClose} />
          )}
        </FirestoreStreamBuilder>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectsModal;
