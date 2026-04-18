import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Quote } from 'lucide-react';

const DreamCard = ({ title, content, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format multiline content by splitting \n
  const paragraphs = content.split('\n\n');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '20px',
        padding: '30px',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
      }}
      onClick={() => setIsOpen(!isOpen)}
      whileHover={{ boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)', border: '1px solid rgba(0, 240, 255, 0.5)' }}
    >
      <motion.div layout style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#fff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
          {title}
        </h3>
        {isOpen ? <ChevronUp color="#00f0ff" flexShrink={0} size={32} /> : <ChevronDown color="#00f0ff" flexShrink={0} size={32} />}
      </motion.div>
      <AnimatePresence>
        {isOpen && content && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '25px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.4 }}
            style={{ color: 'var(--text-secondary)', lineHeight: '2', fontSize: '1.2rem', textAlign: 'justify' }}
          >
            {paragraphs.map((p, i) => (
              <p key={i} style={{ marginBottom: i !== paragraphs.length - 1 ? '20px' : '0' }}>{p}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DreamModal = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 0, 15, 0.9)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '50px 20px',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          style={{
            background: 'linear-gradient(145deg, rgba(0, 30, 50, 0.8), rgba(0, 10, 20, 0.9))',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '30px',
            width: '100%',
            maxWidth: '1200px',
            padding: '50px',
            paddingBottom: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(255,255,255,0.05)'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '30px', right: '30px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff',
              borderRadius: '50%', padding: '10px', display: 'flex', transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.color = '#00f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <X size={28} />
          </button>
          
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '30px', marginTop: '10px', textShadow: '0 0 20px rgba(0,255,255,0.8)', letterSpacing: '2px' }}>
            My Dream & Vision
          </h2>

          <DreamCard 
            index={1}
            title="১. কর্মসংস্থান তৈরি (Employment Generation)" 
            content={"আমার সবচেয়ে বড় স্বপ্ন হলো আমার নিজ জন্মভূমি “নতুন পল্লান পাড়া”-কে এমন একটি জায়গায় রূপান্তর করা, যেখানে মানুষ আর শুধু বেঁচে থাকার সংগ্রাম করবে না—বরং সম্মানজনকভাবে, দক্ষতার সাথে এবং আধুনিক পদ্ধতিতে আয় করে নিজেদের স্বপ্ন বাস্তবায়ন করতে পারবে। আমি চাই, এই এলাকার মানুষ প্রযুক্তি ও স্মার্ট কাজের মাধ্যমে নিজেদের জীবন বদলে ফেলুক। তারা যেন ঘরে বসেই অনলাইন কাজ, ডিজিটাল স্কিল, ফ্রিল্যান্সিং, ছোট ব্যবসা বা উদ্ভাবনী উদ্যোগের মাধ্যমে আয় করতে পারে। নতুন প্রজন্ম যেন শুধু চাকরির পিছনে না ছুটে, বরং নিজেরাই কর্মসংস্থান তৈরি করতে শেখে—নিজের জন্য, এবং অন্যদের জন্যও।\n\nআমার লক্ষ্য হলো এমন একটি পরিবেশ তৈরি করা, যেখানে তরুণরা প্রশিক্ষণ পাবে, নতুন কিছু শিখবে, এবং নিজেদের দক্ষতাকে কাজে লাগিয়ে বাস্তব জীবনে সফল হতে পারবে। এখানে থাকবে সুযোগ, থাকবে দিকনির্দেশনা, এবং থাকবে একে অপরকে এগিয়ে নেওয়ার মানসিকতা।\n\n“নতুন পল্লান পাড়া” হবে এমন এক উদাহরণ, যেখানে একটি ছোট এলাকা থেকেও বড় পরিবর্তন সম্ভব—যেখানে মানুষ আধুনিক চিন্তা, পরিশ্রম এবং সঠিক পরিকল্পনার মাধ্যমে নিজেদের জীবন গড়ে তোলে, এবং একসাথে একটি শক্তিশালী ও সমৃদ্ধ সমাজ তৈরি করে।\n\nএই স্বপ্ন শুধু আমার একার নয়—এটি হবে আমাদের সবার, আমাদের ভবিষ্যতের, এবং আমাদের জন্মভূমির উন্নয়নের পথচলা।"}
          />
          <DreamCard 
            index={2}
            title="২. শিক্ষা (Education)" 
            content={"আমি চাই আমার জন্মভূমি এমন একটি আদর্শ স্থানে পরিণত হোক, যেখানে প্রতিটি মানুষ সুশিক্ষায় শিক্ষিত হবে এবং জ্ঞানের আলোতে আলোকিত একটি সমাজ গড়ে উঠবে। শিক্ষা শুধু বইয়ের মধ্যে সীমাবদ্ধ থাকবে না—এটি হবে চরিত্র গঠন, নৈতিকতা, মানবিকতা এবং বাস্তব জীবনের দক্ষতার একটি শক্ত ভিত্তি। আমার স্বপ্ন, “নতুন পল্লান পাড়া”-এর প্রতিটি ঘরে ঘরে শিক্ষার আলো পৌঁছে যাবে। ছোট থেকে বড়—সকলেই শিক্ষার গুরুত্ব বুঝবে, এবং জ্ঞান অর্জনকে নিজের জীবনের একটি অপরিহার্য অংশ হিসেবে গ্রহণ করবে। কেউ যেন অশিক্ষিত না থাকে, কেউ যেন পিছিয়ে না পড়ে। আমি চাই, এই এলাকার তরুণ প্রজন্ম সঠিক শিক্ষা পেয়ে নিজেদের যোগ্য করে তুলুক, ভালো-মন্দের পার্থক্য বুঝুক, এবং সমাজে ইতিবাচক পরিবর্তন আনতে সক্ষম হোক। তারা যেন শুধু নিজের উন্নতি নয়, বরং পুরো সমাজের উন্নয়নে অবদান রাখতে পারে। “নতুন পল্লান পাড়া” হবে এমন এক উদাহরণ, যেখানে শিক্ষার আলো অন্ধকার দূর করে মানুষের জীবনে নতুন সম্ভাবনার দ্বার খুলে দেয়। যেখানে প্রতিটি মানুষ জ্ঞান, সচেতনতা এবং নৈতিকতার মাধ্যমে একটি সুন্দর, সুশৃঙ্খল ও উন্নত সমাজ গড়ে তোলে।"}
          />
          <DreamCard 
            index={3}
            title="৩. ভবিষ্যৎ লক্ষ্য (Future Vision)" 
            content={"এই স্বপ্নগুলি বাস্তবায়নের পাশাপাশি আগামী প্রজন্মের জন্য আরও নতুন কিছু করার একটি ধারাবাহিক পরিকল্পনা আমার রয়েছে। ভবিষ্যতে অন্যান্য লক্ষ্যগুলোও এখানে ক্রমান্বয়ে যুক্ত করা হবে।"}
          />

          {/* Sponsor Style Caption Image block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            style={{ 
              marginTop: '40px',
              width: '100%',
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.05) 0%, rgba(255, 0, 127, 0.05) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.2)', 
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.02)'
            }}
          >
            <div style={{
              width: '100%', 
              padding: '60px 40px',
              display: 'flex',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Subtle background glow behind the image */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(0,240,255,0.2) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(30px)',
                zIndex: 0
              }}></div>
              
              <img 
                src="/caption.png" 
                alt="Vision Highlight" 
                style={{ 
                  height: 'auto', 
                  width: '100%', 
                  maxWidth: '1000px', // Increased max size for sponsor impact
                  objectFit: 'contain', 
                  filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 10px rgba(255,255,255,0.1))',
                  position: 'relative',
                  zIndex: 1
                }} 
              />
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default DreamModal;
