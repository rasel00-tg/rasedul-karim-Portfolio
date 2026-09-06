import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    isDefault: true
  },
  bn: {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    direction: 'ltr',
    font: "'LiAdorNoirrit', sans-serif"
  },
  ar: {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    font: "'Amiri', 'Segoe UI', Tahoma, sans-serif"
  },
  hi: {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    font: "'Noto Sans Devanagari', sans-serif"
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
      philosophy: 'Always serve humanity.'
    },
    common: {
      close: 'Close',
      done: 'Done / Explore Portfolio',
      readNotice: 'Read Notice',
      selectLanguageModal: 'Select Language / भाषा নির্বাচন করুন'
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
      philosophy: 'Always serve humanity.'
    },
    common: {
      close: 'বন্ধ করুন',
      done: 'সম্পন্ন / পোর্টফোলিও দেখুন',
      readNotice: 'বার্তা দেখুন',
      selectLanguageModal: 'Select Language / ভাষা নির্বাচন করুন'
    }
  },
  ar: {
    nav: {
      about: 'ABOUT',
      aboutSub: 'السيرة الذاتية والمسيرة المهنية',
      skill: 'SKILL',
      skillSub: 'الخبرات التقنية والمهارات',
      dream: 'DREAM',
      dreamSub: 'الرؤية والأهداف المستقبلية',
      setting: 'SETTING',
      settingSub: 'التفضيلات والإعدادات',
      selectLanguage: 'Select Language',
      philosophy: 'Always serve humanity.'
    },
    common: {
      close: 'إغلاق',
      done: 'تم / استكشاف المعرض',
      readNotice: 'قراءة الإشعار',
      selectLanguageModal: 'Select Language / اختر اللغة'
    }
  },
  hi: {
    nav: {
      about: 'ABOUT',
      aboutSub: 'जीवनी और करियर यात्रा',
      skill: 'SKILL',
      skillSub: 'तकनीकी दक्षता और कौशल',
      dream: 'DREAM',
      dreamSub: 'विजन और भविष्य के लक्ष्य',
      setting: 'SETTING',
      settingSub: 'प्राथमिकताएं और सेटिंग्स',
      selectLanguage: 'Select Language',
      philosophy: 'Always serve humanity.'
    },
    common: {
      close: 'बंद करें',
      done: 'पूर्ण / पोर्टफोलियो देखें',
      readNotice: 'सूचना पढ़ें',
      selectLanguageModal: 'Select Language / भाषा का चयन करें'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('portfolio_lang') || 'en';
  });

  const currentLang = languages[language] || languages.en;
  const isRTL = currentLang.direction === 'rtl';

  const setLanguage = (langCode) => {
    if (languages[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('portfolio_lang', langCode);
      document.documentElement.lang = langCode;
      document.documentElement.dir = languages[langCode].direction;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = currentLang.direction;
  }, [language, currentLang.direction]);

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
      currentLang,
      setLanguage,
      isRTL,
      t,
      languagesList: Object.values(languages)
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
