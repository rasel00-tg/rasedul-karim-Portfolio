import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const DreamCard = ({ title, content, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Format multiline content by splitting \n
  const paragraphs = content.split('\n\n');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
      onClick={() => setIsOpen(!isOpen)}
      whileHover={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' }}
    >
      <motion.div layout style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: '#fff', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
          {title}
        </h3>
        {isOpen ? <ChevronUp color="#00f0ff" flexShrink={0} /> : <ChevronDown color="#00f0ff" flexShrink={0} />}
      </motion.div>
      <AnimatePresence>
        {isOpen && content && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '20px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem', textAlign: 'justify' }}
          >
            {paragraphs.map((p, i) => (
              <p key={i} style={{ marginBottom: i !== paragraphs.length - 1 ? '16px' : '0' }}>{p}</p>
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
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(11, 0, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '50px 20px',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            background: 'rgba(0, 20, 40, 0.7)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '800px',
            padding: '40px',
            paddingBottom: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff',
              background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '5px', display: 'flex'
            }}
          >
            <X size={24} />
          </button>
          
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '20px', marginTop: '10px', textShadow: '0 0 15px rgba(0,255,255,0.7)', letterSpacing: '1px' }}>
            My Dream & Vision
          </h2>

          <DreamCard 
            index={1}
            title="১. কর্মসংস্থান তৈরি (Employment Generation)" 
            content={"আমার সবচেয়ে বড় স্বপ্ন হলো আমার নিজ জন্মভূমি “নতুন পল্লান পাড়া”-কে এমন একটি জায়গায় রূপান্তর করা, যেখানে মানুষ আর শুধু বেঁচে থাকার জন্য সংগ্রাম করবে না—বরং সম্মানজনকভাবে, দক্ষতার সাথে এবং আধুনিক পদ্ধতিতে আয় করে নিজেদের স্বপ্ন বাস্তবায়ন করতে পারবে। আমি চাই, এই এলাকার মানুষ প্রযুক্তি ও স্মার্ট কাজের মাধ্যমে নিজেদের জীবন বদলে ফেলুক। তারা যেন ঘরে বসেই অনলাইন কাজ, ডিজিটাল স্কিল, ফ্রিল্যান্সিং, ছোট ব্যবসা বা উদ্ভাবনী উদ্যোগের মাধ্যমে আয় করতে পারে। নতুন প্রজন্ম যেন শুধু চাকরির পিছনে না ছুটে, বরং নিজেরাই কর্মসংস্থান তৈরি করতে শেখে—নিজের জন্য, এবং অন্যদের জন্যও।\n\nআমার লক্ষ্য হলো এমন একটি পরিবেশ তৈরি করা, যেখানে তরুণরা প্রশিক্ষণ পাবে, নতুন কিছু শিখবে, এবং নিজেদের দক্ষতাকে কাজে লাগিয়ে বাস্তব জীবনে সফল হতে পারবে। এখানে থাকবে সুযোগ, থাকবে দিকনির্দেশনা, এবং থাকবে একে অপরকে এগিয়ে নেওয়ার মানসিকতা।\n\n“নতুন পল্লান পাড়া” হবে এমন এক উদাহরণ, যেখানে একটি ছোট এলাকা থেকেও বড় পরিবর্তন সম্ভব—যেখানে মানুষ আধুনিক চিন্তা, পরিশ্রম এবং সঠিক পরিকল্পনার মাধ্যমে নিজেদের জীবন গড়ে তোলে, এবং একসাথে একটি শক্তিশালী ও সমৃদ্ধ সমাজ তৈরি করে।\n\nএই স্বপ্ন শুধু আমার একার নয়—এটি হবে আমাদের সবার, আমাদের ভবিষ্যতের, এবং আমাদের জন্মভূমির উন্নয়নের পথচলা।"}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default DreamModal;
