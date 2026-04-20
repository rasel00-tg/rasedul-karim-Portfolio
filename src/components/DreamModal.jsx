import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, Languages, ChevronDown, ChevronUp } from 'lucide-react';

const DreamCard = ({ enTitle, bnTitle, enContent, bnContent, index, containerScrollY }) => {
  const [isBangla, setIsBangla] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);

  // Flying away animation logic (Corrected range to [0, 1])
  const yOffset = useTransform(containerScrollY, [0, 1], [0, -200 - index * 50]);
  const opacity = useTransform(containerScrollY, [0, 0.8], [1, 0.3]);

  const currentTitle = isBangla ? bnTitle : enTitle;
  const currentContent = isBangla ? bnContent || "" : enContent || "";
  
  // Truncate logic for Read More - with safety check
  const paragraphs = currentContent.split('\n\n');
  const truncatedContent = (paragraphs[0] || "").substring(0, 200) + '...';

  return (
    <motion.div 
      ref={cardRef}
      style={{
        y: yOffset,
        opacity,
        padding: '30px 20px',
        marginBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#fff', textShadow: '0 0 20px rgba(0,240,255,0.6)', letterSpacing: '1px' }}>
          {currentTitle}
        </h3>
        
        {/* Language Switcher */}
        <button
          onClick={() => setIsBangla(!isBangla)}
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '10px',
            padding: '8px 15px',
            color: '#00f0ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            transition: 'all 0.3s',
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)')}
        >
          <Languages size={18} />
          {isBangla ? 'English' : 'বাংলা করুন'}
        </button>
      </div>

      <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, #00f0ff, transparent)' }}></div>
      
      <div style={{ color: '#E0E0E0', lineHeight: '2.2', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', textAlign: 'justify', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={isBangla ? 'bn' : 'en'}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
          >
            {isExpanded ? (
              paragraphs.map((p, i) => (
                <p key={i} style={{ marginBottom: '20px' }}>{p}</p>
              ))
            ) : (
              <p>{truncatedContent}</p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Read More Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#00f0ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '1.1rem',
            padding: '10px 0',
            fontWeight: '600',
            textDecoration: 'underline'
          }}
        >
          {isExpanded ? (
            <><ChevronUp size={20} /> সংক্ষেপ করুন (Show Less)</>
          ) : (
            <><ChevronDown size={20} /> বিস্তারিত পড়ুন (Read More)</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const DreamModal = ({ onClose }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // Correctly call useTransform at the top level of DreamModal
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const dreamData = [
    {
      enTitle: "1. Employment Generation",
      bnTitle: "১. কর্মসংস্থান তৈরি",
      enContent: "My biggest dream is to transform my birthplace \"Notun Pollan Para\" into a model place where people no longer struggle just to survive, but can realize their dreams through dignified, skillful, and modern work. I want the people of this area to change their lives through technology and smart skills. They should be able to earn by working online, acquiring digital skills, freelancing, or starting innovative small businesses from home. The new generation should not just chase jobs but learn to create employment—for themselves and for others.\n\nMy goal is to create an environment where young people receive training, learn new things, and apply their skills to succeed in real life. There will be opportunity, guidance, and a mindset of collective progress.\n\n\"Notun Pollan Para\" will stand as an example that big changes are possible even from a small area—where people build their lives through modern thinking, hard work, and proper planning, together creating a strong and prosperous society.\n\nThis dream is not just mine—it belongs to all of us, our future, and the path of development for our motherland.",
      bnContent: "আমার সবচেয়ে বড় স্বপ্ন হলো আমার নিজ জন্মভূমি “নতুন পল্লান পাড়া”-কে এমন একটি জায়গায় রূপান্তর করা, যেখানে মানুষ আর শুধু বেঁচে থাকার সংগ্রাম করবে না—বরং সম্মানজনকভাবে, দক্ষতার সাথে এবং আধুনিক পদ্ধতিতে আয় করে নিজেদের স্বপ্ন বাস্তবায়ন করতে পারবে। আমি চাই, এই এলাকার মানুষ প্রযুক্তি ও স্মার্ট কাজের মাধ্যমে নিজেদের জীবন বদলে ফেলুক। তারা যেন ঘরে বসেই অনলাইন কাজ, ডিজিটাল স্কিল, ফ্রিল্যান্সিং, ছোট ব্যবসা বা উদ্ভাবনী উদ্যোগের মাধ্যমে আয় করতে পারে। নতুন প্রজন্ম যেন শুধু চাকরির পিছনে না ছুটে, বরং নিজেরাই কর্মসংস্থান তৈরি করতে শেখে—নিজের জন্য, এবং অন্যদের জন্যও।\n\nআমার লক্ষ্য হলো এমন একটি পরিবেশ তৈরি করা, যেখানে তরুণরা প্রশিক্ষণ পাবে, নতুন কিছু শিখবে, এবং নিজেদের দক্ষতাকে কাজে লাগিয়ে বাস্তব জীবনে সফল হতে পারবে। এখানে থাকবে সুযোগ, থাকবে দিকনির্দেশনা, এবং থাকবে একে অপরকে এগিয়ে নেওয়ার মানসিকতা।\n\n“নতুন পল্লান পাড়া” হবে এমন এক উদাহরণ, যেখানে একটি ছোট এলাকা থেকেও বড় পরিবর্তন সম্ভব—যেখানে মানুষ আধুনিক চিন্তা, পরিশ্রম এবং সঠিক পরিকল্পনার মাধ্যমে নিজেদের জীবন গড়ে তোলে, এবং একসাথে একটি শক্তিশালী ও সমৃদ্ধ সমাজ তৈরি করে।\n\nএই স্বপ্ন শুধু আমার একার নয়—এটি হবে আমাদের সবার, আমাদের ভবিষ্যতের, এবং আমাদের জন্মভূমির উন্নয়নের পথচলা।"
    },
    {
      enTitle: "2. Education",
      bnTitle: "২. শিক্ষা",
      enContent: "I want my birthplace to become an ideal place where every individual is well-educated and a society enlightened by knowledge is built. Education will not be limited to books—it will be the strong foundation of character building, ethics, humanity, and real-life skills. My dream is that the light of education reaches every home in \"Notun Pollan Para\". From young to old—everyone will understand the importance of education and accept the pursuit of knowledge as an essential part of their lives. No one should be left uneducated, no one should be left behind. I want the younger generation of this area to prove themselves by receiving proper education, understanding the difference between right and wrong, and contributing positively to society. They should contribute not just to their own improvement but to the development of the entire society. \"Notun Pollan Para\" will be an example where the light of education dispels darkness and opens new doors of possibility in people's lives. Where every person builds a beautiful, disciplined, and advanced society through knowledge, awareness, and ethics.",
      bnContent: "আমি চাই আমার জন্মভূমি এমন একটি আদর্শ স্থানে পরিণত হোক, যেখানে প্রতিটি মানুষ সুশিক্ষায় শিক্ষিত হবে এবং জ্ঞানের আলোতে আলোকিত একটি সমাজ গড়ে উঠবে। শিক্ষা শুধু বইয়ের মধ্যে সীমাবদ্ধ থাকবে না—এটি হবে চরিত্র গঠন, নৈতিকতা, মানবিকতা এবং বাস্তব জীবনের দক্ষতার একটি শক্ত ভিত্তি। আমার স্বপ্ন, “নতুন পল্লান পাড়া”-এর প্রতিটি ঘরে ঘরে শিক্ষার আলো পৌঁছে যাবে। ছোট থেকে বড়—সকলেই শিক্ষার গুরুত্ব বুঝবে, এবং জ্ঞান অর্জনকে নিজের জীবনের একটি অপরিহার্য অংশ হিসেবে গ্রহণ করবে। কেউ যেন অশিক্ষিত না থাকে, কেউ যেন পিছিয়ে না পড়ে। আমি চাই, এই এলাকার তরুণ প্রজন্ম সঠিক শিক্ষা পেয়ে নিজেদের যোগ্য করে তুলুক, ভালো-মন্দের পার্থক্য বুঝুক, এবং সমাজে ইতিবাচক পরিবর্তন আনতে সক্ষম হোক। তারা যেন শুধু নিজের উন্নতি নয়, বরং পুরো সমাজের উন্নয়নে অবদান রাখতে পারে। “নতুন পল্লান পাড়া” হবে এমন এক উদাহরণ, যেখানে শিক্ষার আলো অন্ধকার দূর করে মানুষের জীবনে নতুন সম্ভাবনার দ্বার খুলে দেয়। যেখানে প্রতিটি মানুষ জ্ঞান, সচেতনতা এবং নৈতিকতার মাধ্যমে একটি সুন্দর, সুশৃঙ্খল ও উন্নত সমাজ গড়ে তোলে।"
    },
    {
      enTitle: "3. Future Vision",
      bnTitle: "৩. ভবিষ্যৎ লক্ষ্য",
      enContent: "Alongside realizing these dreams, I have a continuous plan to do more for the next generation. Other goals will be added here progressively to ensure a lasting impact on our community's growth and stability.",
      bnContent: "এই স্বপ্নগুলি বাস্তবায়নের পাশাপাশি আগামী প্রজন্মের জন্য আরও নতুন কিছু করার একটি ধারাবাহিক পরিকল্পনা আমার রয়েছে। ভবিষ্যতে অন্যান্য লক্ষ্যগুলোও এখানে ক্রমান্বয়ে যুক্ত করা হবে।"
    }
  ];

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
          background: 'rgba(5, 0, 15, 0.98)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '50px 0',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
        ref={containerRef}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '50px 20px 100px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'fixed', top: '30px', right: '30px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff',
              borderRadius: '50%', padding: '15px', display: 'flex', transition: 'all 0.3s', zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.color = '#00f0ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <X size={28} />
          </button>
          
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '50px', marginTop: '10px', textShadow: '0 0 30px rgba(0,240,255,0.8)', letterSpacing: '2px', lineHeight: 1 }}>
            My Dream & Vision
          </h2>

          {dreamData.map((dream, i) => (
            <DreamCard 
              key={i}
              index={i}
              containerScrollY={scrollYProgress}
              {...dream}
            />
          ))}

          {/* Frameless Floating Caption Image with scroll effect */}
          <motion.div
            style={{ 
              marginTop: '60px',
              width: '100%',
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              y: imageY // Use the correctly initialized motion value
            }}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, rgba(255,0,127,0.05) 70%)',
              filter: 'blur(50px)',
              zIndex: 0
            }}></div>
            
            <img 
              src="/caption.png" 
              alt="Vision Highlight" 
              loading="lazy"
              style={{ 
                height: 'auto', 
                width: '100%', 
                maxWidth: '100vw',
                maxHeight: '60vh',
                objectFit: 'contain', 
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
                position: 'relative',
                zIndex: 1,
                willChange: 'transform'
              }} 
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DreamModal;
