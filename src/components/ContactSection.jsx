import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail } from 'lucide-react';

const ContactSection = () => {
  const [senderEmail, setSenderEmail] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    const mailto = `mailto:rasedul.karim.dev@gmail.com?subject=Contact from Portfolio (${senderEmail})&body=${encodeURIComponent(messageContent)}`;
    window.location.href = mailto;
  };

  return (
    <section 
      id="contact" 
      style={{ 
        padding: '60px 5% 70px 5%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh', 
        position: 'relative',
        zIndex: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        style={{ 
          width: '100%', 
          maxWidth: '620px', 
          padding: '36px 28px',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            textTransform: 'uppercase'
          }}>
            <Mail size={16} /> Direct Message
          </div>

          <h2 style={{ 
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
            color: 'var(--text-primary)',
            fontWeight: 800,
            margin: 0
          }}>
            LET'S <span style={{ color: 'var(--primary-color)' }}>CONNECT</span>
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginTop: '8px', 
            fontSize: '0.95rem', 
            lineHeight: 1.5 
          }}>
            Send me a message directly. I'll get back to you promptly!
          </p>
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              To:
            </label>
            <input 
              type="text" 
              value="rasedul.karim.dev@gmail.com" 
              readOnly 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                background: 'var(--glass-bg)', 
                border: '1px solid var(--card-border)', 
                color: 'var(--text-primary)', 
                borderRadius: '12px', 
                outline: 'none', 
                fontSize: '0.92rem' 
              }} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Your Email:
            </label>
            <input 
              type="email" 
              required 
              value={senderEmail} 
              onChange={e => setSenderEmail(e.target.value)} 
              placeholder="your@email.com" 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                background: 'var(--input-bg)', 
                border: '1px solid var(--input-border)', 
                color: 'var(--text-primary)', 
                borderRadius: '12px', 
                outline: 'none', 
                fontSize: '0.92rem' 
              }} 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Message:
            </label>
            <textarea 
              required 
              value={messageContent} 
              onChange={e => setMessageContent(e.target.value)} 
              rows={4} 
              placeholder="Write your message here..." 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                background: 'var(--input-bg)', 
                border: '1px solid var(--input-border)', 
                color: 'var(--text-primary)', 
                borderRadius: '12px', 
                outline: 'none', 
                resize: 'none', 
                fontSize: '0.92rem' 
              }} 
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '10px', 
              width: '100%', 
              padding: '13px', 
              fontSize: '0.96rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
              color: '#000000',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
            }}
          >
            <Send size={17} /> Send Message
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};

export default ContactSection;
