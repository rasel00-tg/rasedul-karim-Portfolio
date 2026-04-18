import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const ContactSection = () => {
  const [senderEmail, setSenderEmail] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    const mailto = `mailto:rasedul.karim.dev@gmail.com?subject=Contact from Portfolio (${senderEmail})&body=${encodeURIComponent(messageContent)}`;
    window.location.href = mailto;
  };

  return (
    <section id="contact" style={{ padding: '100px 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: 'linear-gradient(to top, rgba(11,0,26,1), transparent)' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.5, duration: 1 }}
        className="glass-card contact-card"
        style={{ width: '100%', maxWidth: '600px', padding: '40px' }}
      >
        <h2 style={{ fontSize: '3rem', marginBottom: '20px', textAlign: 'center' }}>
          <span className="text-gradient">Let's Connect</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.2rem', lineHeight: 1.6, textAlign: 'center' }}>
          Send me a message directly. I'll get back to you as soon as possible!
        </p>

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            To:
            <input type="text" value="rasedul.karim.dev@gmail.com" readOnly style={{ width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', outline: 'none', marginTop: '8px', fontSize: '1rem' }} />
          </label>
          
          <label style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Sender's Email:
            <input type="email" required value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-color)', color: 'white', borderRadius: '8px', outline: 'none', marginTop: '8px', fontSize: '1rem' }} />
          </label>

          <label style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Message:
            <textarea required value={messageContent} onChange={e => setMessageContent(e.target.value)} rows={5} placeholder="Write your message here..." style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--primary-color)', color: 'white', borderRadius: '8px', outline: 'none', marginTop: '8px', resize: 'none', fontSize: '1rem' }} />
          </label>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            className="neo-button" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', width: '100%', padding: '15px', fontSize: '1.2rem' }}
          >
            <Send size={20} /> Send Message
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default ContactSection;
