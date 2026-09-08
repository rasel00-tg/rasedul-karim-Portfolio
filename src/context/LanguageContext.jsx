import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    isDefault: true,
    font: "'DM Serif Display', serif"
  },
  bn: {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    font: "'Anek Bangla', 'LiAdorNoirrit', sans-serif"
  }
};

export const translations = {
  en: {
    nav: {
      about: 'ABOUT',
      aboutSub: 'Biography & Journey',
      skill: 'SKILL',
      skillSub: 'Technical Expertise',
      dream: 'DREAM',
      dreamSub: 'Vision & Future Goals',
      setting: 'SETTING',
      settingSub: 'Preferences & Tools',
      selectLanguage: 'Select Language',
      languageTitle: 'Language Selection',
      philosophy: 'Always serve humanity.',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',
      adminPanel: 'Admin Dashboard',
      qrScanner: 'Scan QR Code'
    },
    hero: {
      name: 'Rasedul Karim',
      bio: 'Just a simple human. Still learning.',
      location: "Natun Pollan Para, Teknaf, Cox's Bazar",
      chatInMail: 'Chat in Mail',
      subscribe: 'Subscribe',
      visitors: 'Visitors',
      subscribers: 'Subscribers',
      verified: 'Verified Profile'
    },
    stackedLinks: {
      webAppsTitle: 'Web Apps & Projects',
      webAppsSub: 'Live Apps & Websites Portfolio',
      aboutTitle: 'About Me',
      aboutSub: 'Education, Skills & Experience',
      dreamTitle: 'My Dream & Goals',
      dreamSub: 'Vision for Notun Pollan Para',
      futureTitle: 'Future Projects (Apps & Websites)',
      futureSub: 'Upcoming Systems & Architecture'
    },
    skillsSection: {
      tag: 'Tech Expertise',
      my: 'MY',
      skills: 'SKILLS'
    },
    projects: {
      tag: 'Portfolio Highlights',
      title: 'WEB APPS & PROJECTS',
      webApps: 'WEB APPS &',
      projects: 'PROJECTS',
      desc: 'Selected mobile applications and live production websites.',
      appsTab: 'Mobile Apps',
      webTab: 'Websites & Portals'
    },
    subscribeModal: {
      title: 'Stay Updated',
      note: 'If any new updates or projects are released, you will be notified directly via email.',
      placeholder: 'Enter your email address',
      cancel: 'Cancel',
      confirm: 'Confirm Subscription',
      subscribing: 'Subscribing...',
      alreadySubscribed: 'Your email is already subscribed!',
      invalidEmail: 'Please enter a valid email address.',
      successTitle: 'Subscription Confirmed',
      successMsg: 'Thank you! You have successfully subscribed to all future updates.',
      awesome: 'Awesome',
      ok: 'OK'
    },
    common: {
      close: 'Close',
      done: 'Done / Explore Portfolio',
      readNotice: 'Read Notice',
      selectLanguageModal: 'Select Language / ভাষা নির্বাচন করুন'
    }
  },
  bn: {
    nav: {
      about: 'ABOUT',
      aboutSub: 'প্রোফাইল, শিক্ষা ও পরিচিতি',
      skill: 'SKILL',
      skillSub: 'টেকনিক্যাল দক্ষতা ও অগ্রগতি',
      dream: 'DREAM',
      dreamSub: 'উন্নয়ন দর্শন ও ভবিষ্যৎ লক্ষ্য',
      setting: 'SETTING',
      settingSub: 'অ্যাপ কন্ট্রোল ও সেটিংস',
      selectLanguage: 'Select Language',
      languageTitle: 'ভাষা নির্বাচন (Language)',
      philosophy: 'Always serve humanity.',
      themeDark: 'ডার্ক মোড',
      themeLight: 'লাইট মোড',
      adminPanel: 'এডমিন ড্যাশবোর্ড',
      qrScanner: 'QR কোড স্ক্যানার'
    },
    hero: {
      name: 'রাশেদুল করিম',
      bio: 'একজন সাধারণ মানুষ। এখনও শিখছি।',
      location: 'নতুন পল্লান পাড়া, টেকনাফ, কক্সবাজার',
      chatInMail: 'মেইলে বার্তা পাঠান',
      subscribe: 'সাবস্ক্রাইব করুন',
      visitors: 'ভিজিটর',
      subscribers: 'সাবস্ক্রাইবার',
      verified: 'ভেরিফায়েড প্রোফাইল'
    },
    stackedLinks: {
      webAppsTitle: 'ওয়েব অ্যাপস ও প্রজেক্ট',
      webAppsSub: 'লাইভ অ্যাপস ও ওয়েবসাইট পোর্টফোলিও',
      aboutTitle: 'আমার পরিচিতি',
      aboutSub: 'শিক্ষা, দক্ষতা ও অভিজ্ঞতা',
      dreamTitle: 'আমার স্বপ্ন ও লক্ষ্য',
      dreamSub: 'টেকনাফ ও নতুন পল্লান পাড়ার উন্নয়ন রূপরেখা',
      futureTitle: 'ভবিষ্যৎ পরিকল্পনা (অ্যাপস ও ওয়েবসাইট)',
      futureSub: 'আসন্ন সিস্টেম ও প্রযুক্তি আর্কিটেকচার'
    },
    skillsSection: {
      tag: 'টেকনিক্যাল দক্ষতা',
      my: 'আমার',
      skills: 'দক্ষতা ও প্রযুক্তি'
    },
    projects: {
      tag: 'পোর্টফোলিও হাইলাইটস',
      title: 'ওয়েব অ্যাপস ও প্রজেক্ট',
      webApps: 'ওয়েব অ্যাপস ও',
      projects: 'প্রজেক্টস',
      desc: 'নির্বাচিত মোবাইল অ্যাপ্লিকেশন এবং লাইভ প্রোডাকশন ওয়েবসাইট।',
      appsTab: 'মোবাইল অ্যাপস',
      webTab: 'ওয়েবসাইট ও পোর্টাল'
    },
    subscribeModal: {
      title: 'যুক্ত থাকুন',
      note: 'কোনো নতুন আপডেট বা প্রজেক্ট এলে আপনাকে সরাসরি ইমেইলে জানিয়ে দেওয়া হবে।',
      placeholder: 'আপনার ইমেইল অ্যাড্রেস লিখুন',
      cancel: 'বাতিল',
      confirm: 'সাবস্ক্রাইব কনফার্ম করুন',
      subscribing: 'যুক্ত হচ্ছে...',
      alreadySubscribed: 'আপনার ইমেইলটি আগেই সাবস্ক্রাইব করা হয়েছে!',
      invalidEmail: 'দয়া করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন।',
      successTitle: 'সাবস্ক্রিপশন সম্পন্ন হয়েছে',
      successMsg: 'ধন্যবাদ! আপনি সফলভাবে ভবিষ্যৎ সকল আপডেটের জন্য যুক্ত হয়েছেন।',
      awesome: 'ঠিক আছে',
      ok: 'ঠিক আছে'
    },
    common: {
      close: 'বন্ধ করুন',
      done: 'সম্পন্ন / পোর্টফোলিও দেখুন',
      readNotice: 'বার্তা দেখুন',
      selectLanguageModal: 'Select Language / ভাষা নির্বাচন করুন'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('portfolio_lang');
    return saved === 'bn' || saved === 'en' ? saved : 'en';
  });

  const currentLang = languages[language] || languages.en;
  const isBangla = language === 'bn';
  const isEnglish = language === 'en';
  const isRTL = false; // strictly LTR for EN and BN

  const setLanguage = (langCode) => {
    const code = langCode === 'bn' ? 'bn' : 'en';
    setLanguageState(code);
    localStorage.setItem('portfolio_lang', code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      document.documentElement.setAttribute('data-lang', code);
      if (document.body) {
        document.body.setAttribute('data-lang', code);
        document.body.classList.toggle('bangla-mode', code === 'bn');
        document.body.classList.toggle('english-mode', code === 'en');
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-lang', language);
      if (document.body) {
        document.body.setAttribute('data-lang', language);
        document.body.classList.toggle('bangla-mode', language === 'bn');
        document.body.classList.toggle('english-mode', language === 'en');
      }
    }
  }, [language]);

  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.');
    let current = translations[language] || translations.en;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let fb = translations.en;
        for (const k of keys) {
          fb = fb ? fb[k] : undefined;
        }
        return fb || fallback || keyPath;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      currentLocale: language,
      currentLang,
      setLanguage,
      changeLanguage: setLanguage,
      toggleLanguage,
      isBangla,
      isEnglish,
      isRTL,
      t,
      languagesList: [languages.en, languages.bn]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
