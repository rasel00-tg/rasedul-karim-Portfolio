import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Download, Share2, Sparkles } from 'lucide-react';

const QRCodeModal = ({ onClose }) => {
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:Rasedul Karim
TITLE:Software & Web Developer | Photo Editor
TEL:+8801871176267
EMAIL:rasedul.karim.dev@gmail.com
ADR:;;Natun Pollan Para, Teknaf;Cox's Bazar;;;Bangladesh
URL:https://rasedul-karim-portfolio.firebaseapp.com
END:VCARD`;

  const downloadVCard = () => {
    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Rasedul_Karim.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // QR Code pointing to profile / vCard URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent('https://wa.me/8801871176267')}&color=00f0ff&bgcolor=0b001a`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 0, 15, 0.95)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '380px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.25)',
            textAlign: 'center',
            position: 'relative',
            color: '#FFFFFF'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#00f0ff',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          {/* Title */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00f0ff', marginBottom: '8px' }}>
            <QrCode size={20} />
            <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              Digital Contact QR
            </span>
          </div>

          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800 }}>
            RASEDUL KARIM
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.82rem', color: '#94A3B8' }}>
            Scan to instantly connect on WhatsApp or save contact
          </p>

          {/* QR Code Container */}
          <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto 20px auto',
            padding: '12px',
            background: '#0b001a',
            border: '2px solid #00f0ff',
            borderRadius: '16px',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src={qrCodeUrl} 
              alt="Rasedul Karim Contact QR Code" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <motion.button
              onClick={downloadVCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(90deg, #00f0ff, #0080ff)',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
              }}
            >
              <Download size={16} /> Save Contact Card (.vcf)
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeModal;
