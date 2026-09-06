import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ChevronDown, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Ban, 
  Trophy, 
  ShieldAlert, 
  Palmtree, 
  Users, 
  Trees, 
  Target, 
  Quote,
  Heart,
  Globe,
  Languages,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const visionPillars = [
  {
    id: 1,
    icon: Briefcase,
    color: '#00E5FF',
    en: {
      title: 'Job Creation & Eradicating Unemployment',
      shortDescription: 'Local employment pipelines, youth entrepreneurship & skill development.',
      paragraphs: [
        'Our region possesses many educated and energetic young men and women. However, due to a severe lack of employment opportunities, many remain unemployed or are forced to migrate elsewhere.',
        'My objective is to foster local employment, encourage micro and medium entrepreneurship, and establish skill development programs across key sectors.',
        'We must cultivate an entrepreneurial mindset rather than passive job-seeking. With targeted training in IT, freelancing, agriculture, fisheries, tourism, transport, and cottage commerce, our youth can build self-sustaining livelihoods.'
      ]
    },
    bn: {
      title: 'কর্মসংস্থান সৃষ্টি ও বেকারত্ব দূরীকরণ',
      shortDescription: 'স্থানীয় পর্যায়ে নতুন কর্মসংস্থান, যুব উদ্যোক্তা তৈরি ও কারিগরি প্রশিক্ষণ।',
      paragraphs: [
        'আমাদের এলাকায় অনেক শিক্ষিত ও কর্মক্ষম যুবক যুবতী রয়েছে। কিন্তু পর্যাপ্ত কর্মসংস্থানের সুযোগ না থাকায় অনেকেই বেকার হয়ে বসে আছে কিংবা বাধ্য হয়ে অন্যত্র পাড়ি জমাচ্ছে।',
        'আমার লক্ষ্য হলো স্থানীয় পর্যায়ে নতুন কর্মসংস্থানের সুযোগ তৈরি করা। ছোট ও মাঝারি উদ্যোক্তাদের উৎসাহিত করা, ব্যবসা বাণিজ্যের সুযোগ বাড়ানো এবং তরুণদের দক্ষতা উন্নয়নের জন্য প্রশিক্ষণের ব্যবস্থা করা।',
        'যুবকদের শুধু চাকরির অপেক্ষায় না রেখে উদ্যোক্তা হিসেবে গড়ে তোলার উদ্যোগ নেওয়া প্রয়োজন। প্রযুক্তি, ফ্রিল্যান্সিং, কৃষি, মৎস্য, পর্যটন, পরিবহন, ক্ষুদ্র ব্যবসা এবং অন্যান্য সম্ভাবনাময় খাতে প্রশিক্ষণ ও সুযোগ সৃষ্টি করা গেলে আমাদের অনেক তরুণ নিজের কর্মসংস্থান নিজেই তৈরি করতে পারবে।'
      ]
    }
  },
  {
    id: 2,
    icon: Building2,
    color: '#00E676',
    en: {
      title: 'Transforming Teknaf into a Commercial & Economic Hub',
      shortDescription: 'Modernized market centers, logistical infrastructure & legitimate commerce.',
      paragraphs: [
        'Teknaf’s geographical location is of paramount strategic value. Through calculated infrastructure planning and a transparent business environment, Teknaf can emerge as a premier commercial gateway.',
        'My dream is to facilitate corporate ventures, commercial warehouses, modernized marketplaces, and legitimate cross-border trade hubs.',
        'This will eliminate the necessity for locals to migrate for livelihood; instead, people from across the nation will arrive in Teknaf for commerce, investment, and fulfilling careers.'
      ]
    },
    bn: {
      title: 'টেকনাফকে বাণিজ্যিক ও অর্থনৈতিক শহর হিসেবে গড়ে তোলা',
      shortDescription: 'আধুনিক ব্যবসায়িক কেন্দ্র, অবকাঠামোগত উন্নয়ন ও বৈধ অর্থনৈতিক কার্যক্রম।',
      paragraphs: [
        'টেকনাফের ভৌগোলিক অবস্থান অত্যন্ত গুরুত্বপূর্ণ। সঠিক পরিকল্পনা, অবকাঠামোগত উন্নয়ন এবং আইনসম্মত ব্যবসা বাণিজ্যের পরিবেশ তৈরি করা গেলে টেকনাফকে একটি গুরুত্বপূর্ণ বাণিজ্যিক শহরে পরিণত করা সম্ভব।',
        'আমার স্বপ্ন হলো টেকনাফে বড় ও মাঝারি ব্যবসা প্রতিষ্ঠান, শিল্পপ্রতিষ্ঠান, গুদাম, আধুনিক বাজার, ব্যবসায়িক কেন্দ্র এবং অন্যান্য বৈধ অর্থনৈতিক কার্যক্রমের সুযোগ সৃষ্টি করা।',
        'এর মাধ্যমে শুধু ব্যবসা বাড়বে না, স্থানীয় মানুষের জন্য সরাসরি ও পরোক্ষভাবে ব্যাপক কর্মসংস্থানের সুযোগ তৈরি হবে। আমি চাই টেকনাফের মানুষ যেন কাজের সন্ধানে অন্য শহরে যেতে বাধ্য না হয়। বরং দেশের বিভিন্ন অঞ্চল থেকে মানুষ যেন কর্মসংস্থান ও ব্যবসার জন্য টেকনাফে আসে।'
      ]
    }
  },
  {
    id: 3,
    icon: GraduationCap,
    color: '#FFAA00',
    en: {
      title: 'Prioritizing Education Above All',
      shortDescription: 'Elevating academic enthusiasm, dropout reduction & modern tech fluency.',
      paragraphs: [
        'The destiny of any community is forged by its educated generation. Education must be the bedrock of Teknaf’s advancement. My goal is to elevate academic enthusiasm and build widespread community awareness.',
        'We must initiate support mechanisms for underprivileged students, rehabilitate dropouts, and expand female educational accessibility across the township.',
        'Beyond traditional certificates, our youth must be equipped with technological literacy, multilingual fluency, and practical technical competence to excel both nationally and globally.'
      ]
    },
    bn: {
      title: 'শিক্ষাকে সর্বোচ্চ গুরুত্ব দেওয়া',
      shortDescription: 'শিক্ষার হার বৃদ্ধি, ড্রপআউট রোধ এবং প্রযুক্তি ও কারিগরি শিক্ষার বিস্তার।',
      paragraphs: [
        'একটি জাতি বা এলাকার ভবিষ্যৎ নির্ধারণ করে তার শিক্ষিত প্রজন্ম। তাই টেকনাফের উন্নয়নের অন্যতম প্রধান ভিত্তি হতে হবে শিক্ষা। আমার লক্ষ্য হলো শিক্ষার প্রতি মানুষের আগ্রহ বৃদ্ধি করা এবং শিক্ষার হার বাড়ানোর জন্য সামাজিকভাবে সচেতনতা তৈরি করা।',
        'যেসব শিক্ষার্থী অর্থনৈতিক সমস্যার কারণে পড়াশোনা চালিয়ে যেতে পারে না, তাদের জন্য বিভিন্ন সহায়তার ব্যবস্থা করার উদ্যোগ নেওয়া প্রয়োজন। একই সঙ্গে ঝরে পড়া শিক্ষার্থীদের আবার শিক্ষার আওতায় ফিরিয়ে আনা এবং মেয়েদের শিক্ষার সুযোগ আরও বাড়ানো জরুরি।',
        'শুধু সার্টিফিকেট অর্জন নয়, শিক্ষার পাশাপাশি প্রযুক্তি, ভাষা, কারিগরি দক্ষতা ও বাস্তব জীবনের প্রয়োজনীয় জ্ঞান অর্জনের সুযোগ তৈরি করতে হবে। আমার স্বপ্ন হলো টেকনাফ থেকে এমন একটি প্রজন্ম তৈরি হবে, যারা দেশ ও বিদেশের যেকোনো জায়গায় নিজেদের যোগ্যতা দিয়ে প্রতিষ্ঠিত হতে পারবে।'
      ]
    }
  },
  {
    id: 4,
    icon: Ban,
    color: '#FF1744',
    en: {
      title: 'Building a Drug-Free Youth Society',
      shortDescription: 'Community vigilance, youth rehabilitation & healthy social engagement.',
      paragraphs: [
        'The youth represent our greatest asset, yet substance abuse threatens to dismantle this potential. I envision a Teknaf where our young generation stays entirely clear of narcotics to focus on building their futures.',
        'This battle requires more than law enforcement; it demands athletic initiatives, cultural engagement, employment pipelines, and rehabilitation for those affected.',
        'Families, institutions, and community organizations must unite. We want our youth holding books, technological devices, and sports equipment—never illicit drugs.'
      ]
    },
    bn: {
      title: 'মাদকমুক্ত যুবসমাজ গড়ে তোলা',
      shortDescription: 'সামাজিক প্রতিরোধ, যুব পুনর্বাসন এবং খেলাধুলা ও সংস্কৃতির বিকাশ।',
      paragraphs: [
        'একটি এলাকার সবচেয়ে বড় শক্তি হলো তার তরুণ সমাজ। কিন্তু মাদক একটি সম্ভাবনাময় প্রজন্মকে ধ্বংস করে দিতে পারে। আমি চাই টেকনাফের যুবসমাজ মাদক থেকে সম্পূর্ণ দূরে থাকুক এবং নিজেদের ভবিষ্যৎ গড়ার কাজে মনোযোগী হোক।',
        'শুধু আইন প্রয়োগের মাধ্যমে নয়, শিক্ষা, খেলাধুলা, সাংস্কৃতিক কর্মকাণ্ড, কর্মসংস্থান এবং সামাজিক সচেতনতার মাধ্যমে তরুণদের মাদক থেকে দূরে রাখতে হবে।',
        'মাদকের বিরুদ্ধে পরিবার, শিক্ষা প্রতিষ্ঠান, সামাজিক সংগঠন ও প্রশাসনের সমন্বিত ভূমিকা প্রয়োজন। একই সঙ্গে যারা মাদকের কারণে ক্ষতিগ্রস্ত হয়েছে, তাদের পুনর্বাসন ও স্বাভাবিক জীবনে ফিরিয়ে আনার বিষয়েও গুরুত্ব দিতে হবে। আমি এমন একটি টেকনাফ দেখতে চাই, যেখানে তরুণদের হাতে মাদক নয়, বই, প্রযুক্তি, খেলাধুলার সরঞ্জাম এবং কাজের সুযোগ থাকবে।'
      ]
    }
  },
  {
    id: 5,
    icon: Trophy,
    color: '#FFD700',
    en: {
      title: 'Elevating Teknaf on the National & Global Sports Stage',
      shortDescription: 'Grassroots talent scouting, professional training & competitive tournament hubs.',
      paragraphs: [
        'Our local youth possess tremendous innate athletic talent. What they require is professional talent scouting, systematic training, and institutional opportunities.',
        'My dream is to develop state-of-the-art sports ecosystems in Teknaf—organizing competitive football and cricket tournaments and providing modern gear.',
        'I look forward to the day when an athlete from Teknaf represents our national team on the global international stage.'
      ]
    },
    bn: {
      title: 'খেলাধুলায় টেকনাফকে জাতীয় ও বিশ্বমঞ্চে তুলে ধরা',
      shortDescription: 'তৃণমূল প্রতিভা অন্বেষণ, মানসম্মত একাডেমি ও টুর্নামেন্ট আয়োজন।',
      paragraphs: [
        'টেকনাফের তরুণদের মধ্যে অনেক প্রতিভা রয়েছে। প্রয়োজন শুধু তাদের খুঁজে বের করা এবং সঠিক প্রশিক্ষণ ও সুযোগ দেওয়া।',
        'আমার স্বপ্ন হলো টেকনাফে আধুনিক ও মানসম্মত খেলাধুলার পরিবেশ তৈরি করা। ফুটবল, ক্রিকেটসহ বিভিন্ন খেলায় প্রতিভাবান খেলোয়াড়দের খুঁজে বের করে প্রশিক্ষণ, সরঞ্জাম ও প্রতিযোগিতার সুযোগ তৈরি করা।',
        'নিয়মিত স্থানীয় ও জাতীয় পর্যায়ের টুর্নামেন্ট আয়োজন করা, প্রশিক্ষক তৈরি করা এবং প্রতিভাবান খেলোয়াড়দের উন্নত প্রশিক্ষণের জন্য প্রয়োজনীয় সহযোগিতা নিশ্চিত করা প্রয়োজন। আমি চাই একদিন টেকনাফের কোনো তরুণ জাতীয় দলের হয়ে খেলবে, আন্তর্জাতিক প্রতিযোগিতায় দেশের প্রতিনিধিত্ব করবে এবং বিশ্বমঞ্চে টেকনাফের নাম তুলে ধরবে।'
      ]
    }
  },
  {
    id: 6,
    icon: ShieldAlert,
    color: '#FF007F',
    en: {
      title: 'Preventing Human Trafficking, Kidnapping & Illicit Trade',
      shortDescription: 'Social deterrence, community awareness & citizen security coalitions.',
      paragraphs: [
        'Illicit activities and organized crime represent the most detrimental roadblocks to our progress. We must build profound social vigilance against human trafficking, extortion, and smuggling while working cooperatively with law enforcement.',
        'Empowering vulnerable families through community awareness and strict collective deterrence will build an environment where law-abiding citizens walk freely without fear.'
      ]
    },
    bn: {
      title: 'মানবপাচার, অপহরণ, মাদক পাচারসহ অপরাধ প্রতিরোধ',
      shortDescription: 'সামাজিক সচেতনতা, নাগরিক ঐক্য এবং অপরাধের বিরুদ্ধে দৃঢ় প্রতিরোধ।',
      paragraphs: [
        'টেকনাফের উন্নয়নের পথে অন্যতম বড় বাধা হলো বিভিন্ন ধরনের অপরাধ ও অবৈধ কর্মকাণ্ড। মানবপাচার, অপহরণ, মাদক পাচারসহ যেকোনো অপরাধের বিরুদ্ধে সামাজিক সচেতনতা বৃদ্ধি এবং আইনশৃঙ্খলা রক্ষাকারী বাহিনীর সঙ্গে সমন্বিতভাবে কাজ করা প্রয়োজন।',
        'বিশেষ করে তরুণ ও ঝুঁকিপূর্ণ পরিবারগুলোকে সচেতন করতে হবে, যাতে তারা প্রতারণামূলক প্রলোভনের শিকার না হয়। অপরাধ প্রতিরোধে স্থানীয় জনগণ, জনপ্রতিনিধি, প্রশাসন, শিক্ষক, অভিভাবক ও সামাজিক সংগঠনগুলোর মধ্যে সমন্বয় গড়ে তোলা জরুরি।',
        'আমার লক্ষ্য হলো এমন একটি পরিবেশ তৈরি করা, যেখানে সাধারণ মানুষ নিরাপদে চলাফেরা করতে পারবে এবং অপরাধীরা কোনোভাবেই সামাজিকভাবে প্রশ্রয় পাবে না।'
      ]
    }
  },
  {
    id: 7,
    icon: Palmtree,
    color: '#00F0FF',
    en: {
      title: 'Sustainable Tourism & Eco-Friendly Destination Development',
      shortDescription: 'Safe tourist transit, pristine environment & local revenue ecosystems.',
      paragraphs: [
        'Endowed with breathtaking coastlines, rivers, hills, and wildlife, Teknaf can stand as one of the country’s safest and most attractive tourism destinations.',
        'We must ensure robust tourist security, superior sanitation, eco-conscious infrastructure, and reliable traveler guidance.',
        'Tourism must become a primary driver of local prosperity—directly benefiting residents through transport, hospitality, culinary services, guided tours, and local artisan crafts.'
      ]
    },
    bn: {
      title: 'পর্যটন ও দর্শনীয় স্থান উন্নয়ন',
      shortDescription: 'নিরাপদ পর্যটন, পরিচ্ছন্ন অবকাঠামো ও স্থানীয় আয়ের সুযোগ সৃষ্টি।',
      paragraphs: [
        'টেকনাফ প্রাকৃতিক সৌন্দর্যে সমৃদ্ধ একটি এলাকা। এখানে সমুদ্র, পাহাড়, নদী, বন এবং বিভিন্ন প্রাকৃতিক দর্শনীয় স্থান রয়েছে। এই সম্ভাবনাকে কাজে লাগিয়ে টেকনাফকে দেশের অন্যতম নিরাপদ ও আকর্ষণীয় পর্যটনকেন্দ্র হিসেবে গড়ে তোলা সম্ভব।',
        'আমার স্বপ্ন হলো দর্শনীয় স্থানগুলোতে পর্যটকদের নিরাপত্তা নিশ্চিত করা, পরিচ্ছন্নতা বৃদ্ধি করা, প্রয়োজনীয় অবকাঠামো তৈরি করা এবং পর্যটকদের জন্য তথ্য ও সহায়তা ব্যবস্থা উন্নত করা।',
        'পর্যটনকে শুধু বিনোদনের মাধ্যম হিসেবে না দেখে স্থানীয় মানুষের কর্মসংস্থান ও অর্থনৈতিক উন্নয়নের একটি বড় মাধ্যম হিসেবে বিবেচনা করতে হবে। স্থানীয় মানুষকে পর্যটনকেন্দ্রিক ব্যবসা, পরিবহন, খাবার, হোটেল, গাইড সার্ভিস, হস্তশিল্পসহ বিভিন্ন বৈধ অর্থনৈতিক কর্মকাণ্ডে যুক্ত করা গেলে পর্যটনের সুফল সরাসরি স্থানীয় জনগণের কাছে পৌঁছাবে।'
      ]
    }
  },
  {
    id: 8,
    icon: Users,
    color: '#A855F7',
    en: {
      title: 'Empowering Youth Leadership & Civic Participation',
      shortDescription: 'Civic volunteerism, community mobilization & youth-led regional reform.',
      paragraphs: [
        'The ultimate catalyst for generational reform in Teknaf is its young population. Rather than mere passive observers, youth must become active partners in regional development.',
        'Leading civic volunteerism, environmental conservation, educational mentorship, and community mobilization empowers them to identify local challenges and spearhead pragmatic solutions.'
      ]
    },
    bn: {
      title: 'তরুণদের নেতৃত্ব ও সামাজিক অংশগ্রহণ বৃদ্ধি',
      shortDescription: 'স্বেচ্ছাসেবা, জনসচেতনতা এবং সমাজ গঠনে তরুণদের অংশীদারিত্ব।',
      paragraphs: [
        'আমি বিশ্বাস করি, টেকনাফের পরিবর্তনের সবচেয়ে বড় শক্তি হলো এখানকার তরুণ সমাজ। তরুণদের শুধু দর্শক হিসেবে নয়, উন্নয়ন কর্মকাণ্ডের অংশীদার হিসেবে তৈরি করতে হবে।',
        'সামাজিক কাজ, স্বেচ্ছাসেবা, পরিবেশ রক্ষা, শিক্ষা সহায়তা, খেলাধুলা ও জনসচেতনতামূলক কার্যক্রমে তরুণদের সম্পৃক্ত করা প্রয়োজন। তাদের নেতৃত্বের সুযোগ দিলে তারা নিজেদের এলাকার সমস্যা নিজেরাই চিহ্নিত করতে এবং সমাধানের উদ্যোগ নিতে পারবে।'
      ]
    }
  },
  {
    id: 9,
    icon: Trees,
    color: '#10B981',
    en: {
      title: 'Planned, Clean & Eco-Conscious Urbanization',
      shortDescription: 'Waste management, public greening & sustainable balance with nature.',
      paragraphs: [
        'While pursuing economic growth, preserving Teknaf’s natural ecology is non-negotiable. Modernization must never come at the expense of our fragile environment.',
        'Rigorous waste management, public cleanliness drives, extensive tree plantation, and ecological preservation must be institutionalized with direct citizen participation to achieve a sustainable harmony between nature and urban progress.'
      ]
    },
    bn: {
      title: 'পরিচ্ছন্ন, পরিবেশবান্ধব ও পরিকল্পিত টেকনাফ',
      shortDescription: 'বর্জ্য ব্যবস্থাপনা, সবুজায়ন এবং উন্নয়ন ও প্রকৃতির সুষম ভারসাম্য।',
      paragraphs: [
        'উন্নয়নের পাশাপাশি টেকনাফের প্রাকৃতিক সৌন্দর্য ও পরিবেশ রক্ষা করাও অত্যন্ত গুরুত্বপূর্ণ। পর্যটন ও নগরায়নের কারণে যেন পরিবেশের ক্ষতি না হয়, সেদিকে বিশেষ নজর দিতে হবে।',
        'পরিচ্ছন্নতা, বর্জ্য ব্যবস্থাপনা, বৃক্ষরোপণ এবং প্রাকৃতিক সম্পদ সংরক্ষণে স্থানীয় জনগণকে সম্পৃক্ত করতে হবে। আমার স্বপ্ন হলো উন্নয়ন ও প্রকৃতির মধ্যে একটি সুন্দর ভারসাম্য তৈরি করা।'
      ]
    }
  }
];

const AccordionCard = ({ pillar, isBangla, isOpen, onToggle }) => {
  const { isDark } = useTheme();
  const Icon = pillar.icon;
  const content = isBangla ? pillar.bn : pillar.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      style={{
        width: '100%',
        background: isDark ? '#111722' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isOpen ? pillar.color : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)')}`,
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: isOpen 
          ? `0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${pillar.color}25` 
          : (isDark ? '0 6px 20px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.05)'),
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Clickable Card Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px 18px',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
          {/* Circular Glowing Icon Box */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: isDark ? `${pillar.color}15` : `${pillar.color}12`,
            border: `1px solid ${pillar.color}45`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: pillar.color,
            boxShadow: `0 0 14px ${pillar.color}30`,
            flexShrink: 0
          }}>
            <Icon size={20} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: pillar.color,
                padding: '2px 7px',
                borderRadius: '8px',
                background: `${pillar.color}15`,
                border: `1px solid ${pillar.color}35`,
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                Pillar 0{pillar.id}
              </span>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(0.95rem, 2.8vw, 1.08rem)',
                fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif",
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3
              }}>
                {content.title}
              </h3>
            </div>
            {!isOpen && (
              <span style={{
                fontSize: '0.78rem',
                fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                {content.shortDescription}
              </span>
            )}
          </div>
        </div>

        {/* Animated Rotating Chevron Indicator */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isOpen ? `${pillar.color}20` : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
            border: `1px solid ${isOpen ? pillar.color : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOpen ? pillar.color : 'var(--text-secondary)',
            flexShrink: 0
          }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      {/* Expandable Detail Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '4px 18px 20px 18px',
              borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
            }}>
              {content.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    lineHeight: isBangla ? '1.85' : '1.65',
                    color: 'var(--text-primary)',
                    textAlign: 'justify'
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DreamModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isBangla = language === 'bn';

  // On-entry patriotic notice popup
  const [showNoticePopup, setShowNoticePopup] = useState(true);
  // Manage expanded accordion card (Pillar 1 open by default)
  const [openPillarId, setOpenPillarId] = useState(1);

  const togglePillar = (id) => {
    setOpenPillarId(prev => (prev === id ? null : id));
  };

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
          width: '100vw', 
          height: '100vh',
          background: isDark ? 'rgba(5, 8, 16, 0.96)' : 'rgba(240, 246, 252, 0.96)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0'
        }}
      >
        {/* Custom Bangla Font Style Injection */}
        <style>{`
          @font-face {
            font-family: 'LiAdorNoirrit';
            src: url('/dream_font/dream-bangla.ttf') format('truetype'),
                 url('/dream-font/dream-bangla.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `}</style>

        {/* ========================================================================= */}
        {/* 1. On-Entry Patriotic Bangla Notice Popup                                  */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showNoticePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowNoticePopup(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 100002,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  background: isDark ? '#111722' : '#FFFFFF',
                  border: '1px solid rgba(255, 0, 127, 0.4)',
                  borderRadius: '24px',
                  padding: '28px 24px 24px 24px',
                  boxShadow: isDark 
                    ? '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 0, 127, 0.25)' 
                    : '0 20px 50px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Crisp Glowing Top-Right Close (X) Button */}
                <motion.button
                  onClick={() => setShowNoticePopup(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 0, 127, 0.3)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(255, 0, 127, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  aria-label="Close Notice"
                >
                  <X size={18} />
                </motion.button>

                {/* Patriotic Icon & Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255, 0, 127, 0.15)',
                    border: '1px solid rgba(255, 0, 127, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF007F',
                    boxShadow: '0 0 16px rgba(255, 0, 127, 0.35)',
                    flexShrink: 0
                  }}>
                    <Flag size={22} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '1.2px',
                      color: '#FF007F',
                      textTransform: 'uppercase'
                    }}>
                      দেশপ্রেম ও নাগরিক বার্তা
                    </span>
                    <h2 style={{
                      margin: 0,
                      fontFamily: "'LiAdorNoirrit', sans-serif",
                      fontSize: 'clamp(1.1rem, 4vw, 1.35rem)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2
                    }}>
                      জন্মভূমি রক্ষার দ্বায়িত্ব
                    </h2>
                  </div>
                </div>

                {/* Exact Requested Bengali Notice Content */}
                <div style={{
                  padding: '18px 16px',
                  borderRadius: '16px',
                  background: isDark ? 'rgba(255, 0, 127, 0.05)' : 'rgba(255, 0, 127, 0.04)',
                  border: '1px solid rgba(255, 0, 127, 0.2)',
                  textAlign: 'center'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    fontFamily: "'LiAdorNoirrit', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '0.3px'
                  }}>
                    "অন্যায় দেখে নীরব থাকা মানেই অন্যায়কে সমর্থন করা। তাই জন্মভূমি রক্ষা করা আপনারও দ্বায়িত্ব।"
                  </p>
                </div>

                {/* Dismiss Action Button */}
                <motion.button
                  onClick={() => setShowNoticePopup(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #FF007F 0%, #00F0FF 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    letterSpacing: '0.4px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(255, 0, 127, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>আমি বুঝেছি ও এগিয়ে যাই</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 2. Main Page Layout                                                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          style={{
            width: '100%',
            maxWidth: '860px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '36px 18px 80px 18px'
          }}
        >
          {/* Top Controls Container (Close Button & Language Switcher) */}
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100000
          }}>
            {/* Language Switcher Pill */}
            <motion.button
              onClick={() => setLanguage(isBangla ? 'en' : 'bn')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              style={{
                background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--primary-color)',
                borderRadius: '20px',
                padding: '8px 14px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)'
              }}
              title={isBangla ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Languages size={16} color="var(--primary-color)" />
              <span>{isBangla ? 'EN' : 'বাং'}</span>
            </motion.button>

            {/* Top Floating Close Button */}
            <motion.button 
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', 
                border: '1px solid var(--card-border)', 
                cursor: 'pointer', 
                color: 'var(--text-primary)',
                borderRadius: '50%', 
                width: '42px',
                height: '42px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Header Title */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: '24px',
            marginTop: '8px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--primary-color)',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              <Target size={14} />
              <span>{isBangla ? 'ভিশন ও সামাজিক রূপরেখা' : 'Vision & Community Roadmaps'}</span>
            </div>
            <h1 style={{
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.7rem, 5.2vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '0.8px',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2
            }}>
              {isBangla ? 'টেকনাফ নিয়ে আমার স্বপ্ন ও লক্ষ্য' : 'My Dream & Goals for Teknaf'}
            </h1>
          </div>

          {/* Re-open Patriotic Notice Strip */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowNoticePopup(true)}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '16px',
              background: isDark ? 'rgba(255, 0, 127, 0.06)' : 'rgba(255, 0, 127, 0.05)',
              border: '1px solid rgba(255, 0, 127, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: '20px',
              boxShadow: '0 4px 15px rgba(255, 0, 127, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flag size={18} color="#FF007F" />
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit'
              }}>
                {isBangla 
                  ? 'জন্মভূমি রক্ষার দেশপ্রেমিক বার্তা (পুনরায় পড়তে ক্লিক করুন)' 
                  : 'Patriotic Civic Message (Click to read again)'}
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#FF007F', fontWeight: 700 }}>
              {isBangla ? 'বার্তা দেখুন' : 'Read Notice'}
            </span>
          </motion.div>

          {/* ========================================================================= */}
          {/* 3. Opening Manifesto Card                                                 */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%',
              padding: '24px 22px',
              borderRadius: '22px',
              background: isDark 
                ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(16, 185, 129, 0.06) 100%)' 
                : 'linear-gradient(135deg, rgba(0, 240, 255, 0.07) 0%, rgba(16, 185, 129, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: isDark 
                ? '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(0, 240, 255, 0.15)' 
                : '0 10px 25px rgba(0, 119, 182, 0.1)',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                flexShrink: 0
              }}>
                <Quote size={18} />
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.05rem',
                fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif",
                fontWeight: 700,
                color: 'var(--primary-color)'
              }}>
                {isBangla ? 'উদ্বোধনী মূল দর্শন ও প্রত্যয়' : 'Opening Strategic Manifesto'}
              </h2>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              lineHeight: isBangla ? '1.85' : '1.65',
              textAlign: 'justify'
            }}>
              {isBangla ? (
                <>
                  <p style={{ margin: 0 }}>
                    "আমি বিশ্বাস করি, একটি এলাকার উন্নয়ন শুধু রাস্তা ঘাট, ভবন কিংবা বড় বড় প্রকল্পের মধ্যে সীমাবদ্ধ নয়। প্রকৃত উন্নয়ন হলো মানুষের কর্মসংস্থান সৃষ্টি করা, শিক্ষার সুযোগ বাড়ানো, তরুণদের সঠিক পথে পরিচালিত করা, অপরাধ কমানো, পর্যটন ও অর্থনীতির বিকাশ ঘটানো এবং সর্বোপরি মানুষের জন্য একটি নিরাপদ ও সুন্দর পরিবেশ নিশ্চিত করা।"
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    "টেকনাফের রয়েছে অপার সম্ভাবনা। সমুদ্র, পাহাড়, সীমান্ত, পর্যটন এবং ভৌগোলিক অবস্থানের কারণে টেকনাফকে সঠিক পরিকল্পনায় উন্নয়ন করা গেলে এটি দেশের অন্যতম গুরুত্বপূর্ণ অর্থনৈতিক ও পর্যটনকেন্দ্রে পরিণত হতে পারে।"
                  </p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0 }}>
                    "I believe that the development of a region is not limited to roads, buildings, or large construction projects. Real progress means creating sustainable employment, expanding quality education, guiding the youth toward purposeful lives, reducing crime, fostering tourism and economic opportunities, and above all, ensuring a safe, dignified, and thriving environment for everyone."
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    "Teknaf holds boundless potential. With its unique confluence of the sea, hills, borders, tourism, and strategic geographical location, proper planning can transform Teknaf into one of the country's most vital economic and travel hubs."
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* 4. Interactive 9 Vision Cards (Accordion List)                           */}
          {/* ========================================================================= */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '26px'
          }}>
            {visionPillars.map((pillar) => (
              <AccordionCard
                key={pillar.id}
                pillar={pillar}
                isBangla={isBangla}
                isOpen={openPillarId === pillar.id}
                onToggle={() => togglePillar(pillar.id)}
              />
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 5. Closing Core Manifesto Summary Card                                   */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%',
              padding: '26px 22px',
              borderRadius: '22px',
              background: isDark 
                ? 'linear-gradient(135deg, rgba(255, 0, 127, 0.08) 0%, rgba(0, 240, 255, 0.08) 100%)' 
                : 'linear-gradient(135deg, rgba(255, 0, 127, 0.06) 0%, rgba(0, 240, 255, 0.06) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 0, 127, 0.35)',
              boxShadow: isDark 
                ? '0 15px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 0, 127, 0.2)' 
                : '0 10px 30px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 0, 127, 0.15)',
                border: '1px solid rgba(255, 0, 127, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF007F',
                flexShrink: 0
              }}>
                <Heart size={18} />
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.08rem',
                fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : "'Space Grotesk', sans-serif",
                fontWeight: 700,
                color: '#FF007F'
              }}>
                {isBangla ? 'সমাপনী মূল লক্ষ্য ও অঙ্গীকার' : 'Closing Core Manifesto Summary'}
              </h2>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontFamily: isBangla ? "'LiAdorNoirrit', sans-serif" : 'inherit',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              lineHeight: isBangla ? '1.85' : '1.65',
              textAlign: 'justify'
            }}>
              {isBangla ? (
                <>
                  <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
                    "আমার মূল লক্ষ্য: আমি এমন একটি টেকনাফ দেখতে চাই, যেখানে বেকার যুবকের হাতে কাজ থাকবে, যেখানে প্রতিটি শিশুর শিক্ষার সুযোগ থাকবে, যেখানে তরুণ সমাজ মাদক থেকে দূরে থাকবে, যেখানে খেলাধুলার প্রতিভা বিকশিত হবে, যেখানে মানুষ নিরাপদে চলাফেরা করবে, যেখানে মানবপাচার ও অপরাধের বিরুদ্ধে শক্ত অবস্থান থাকবে, যেখানে পর্যটকরা নিরাপদে টেকনাফ ভ্রমণ করবে এবং যেখানে টেকনাফ একটি আধুনিক, সমৃদ্ধ ও বাণিজ্যিক শহর হিসেবে দেশের মানচিত্রে আরও শক্ত অবস্থান তৈরি করবে।"
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    "আমার স্বপ্ন শুধু নিজের জন্য নয়, আমার এলাকার মানুষের জন্য। আমি বিশ্বাস করি, পরিবর্তন একদিনে আসে না। পরিবর্তনের জন্য প্রয়োজন সততা, ধৈর্য, পরিকল্পনা, পরিশ্রম এবং মানুষের সম্মিলিত প্রচেষ্টা।"
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    "আমি সবকিছু জানি বা পারি এমন দাবি করি না। শেখার কোনো শেষ নেই। তবে আমি বিশ্বাস করি, ভালো কিছু করার ইচ্ছা এবং মানুষের পাশে থাকার মানসিকতা থাকলে ছোট ছোট উদ্যোগ থেকেই বড় পরিবর্তনের সূচনা করা সম্ভব।"
                  </p>
                  <div style={{
                    marginTop: '6px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 119, 182, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: 'var(--primary-color)',
                    boxShadow: isDark ? '0 0 20px rgba(0, 240, 255, 0.15)' : 'none'
                  }}>
                    "আমার স্বপ্ন একটি সুন্দর, নিরাপদ, শিক্ষিত, কর্মমুখী, মাদকমুক্ত ও সমৃদ্ধ টেকনাফ।"
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
                    "My Core Mission: I envision a Teknaf where every unemployed youth secures meaningful work, every child enjoys access to quality education, youth remain free from narcotics, athletic talent thrives, citizens walk safely without fear, crime and trafficking meet uncompromising resistance, visitors explore with absolute security, and Teknaf cements its identity as a progressive, modern economic city on the map of Bangladesh."
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    "This dream is not for myself—it belongs to the people of my soil. Change never occurs overnight; it demands honesty, resilience, deliberate strategy, hard work, and collective will."
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    "I do not claim mastery over everything, but I have an unwavering desire to stand beside humanity. Small, dedicated initiatives can trigger monumental positive transformations."
                  </p>
                  <div style={{
                    marginTop: '6px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 119, 182, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: 'var(--primary-color)',
                    boxShadow: isDark ? '0 0 20px rgba(0, 240, 255, 0.15)' : 'none'
                  }}>
                    "My dream is a peaceful, educated, productive, drug-free, and prosperous Teknaf."
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Bottom Close / Dismiss Action */}
          <div style={{ marginTop: '30px', width: '100%', maxWidth: '320px' }}>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #FF007F 0%, #00F0FF 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 0, 127, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{isBangla ? 'সম্পন্ন / পোর্টফোলিও দেখুন' : 'Done / Explore Portfolio'}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DreamModal;
