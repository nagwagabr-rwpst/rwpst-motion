/**
 * RWPST MOTION — Bilingual i18n (Arabic default)
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'rwpst-lang';
  const DEFAULT_LANG = 'ar';

  const translations = {
    ar: {
      meta: {
        title: 'RWPST MOTION — إعلانات فيديو بالذكاء الاصطناعي للشركات والمتاجر',
        description: 'RWPST MOTION — استوديو إبداعي مدعوم بالذكاء الاصطناعي متخصص في إعلانات فيديو جذابة للشركات الصغيرة.',
      },
      nav: {
        portfolio: 'أعمالنا',
        services: 'خدماتنا',
        whyUs: 'لماذا نحن',
        contact: 'تواصل معنا',
        toggleMenu: 'فتح القائمة',
        home: 'RWPST MOTION الرئيسية',
      },
      lang: {
        switcher: 'تبديل اللغة',
        ar: 'العربية',
        en: 'EN',
      },
      hero: {
        badge: 'استوديو إبداعي مدعوم بالذكاء الاصطناعي',
        titleHtml: 'إعلانات فيديو بالذكاء الاصطناعي<br><span class="hero__title-accent">للشركات والمتاجر</span>',
        subtitle: 'حوّل منتجاتك وخدماتك إلى فيديوهات تجذب الانتباه وتزيد التفاعل',
        viewPortfolio: 'شاهد أعمالنا',
        contactUs: 'تواصل معنا',
        statDelivery: 'تسليم سريع',
        statPowered: 'إنتاج مدعوم',
        statIndustry: 'متعدد القطاعات',
        statLibrary: 'مكتبة متنامية',
        scrollTo: 'الانتقال إلى الأعمال',
      },
      portfolio: {
        tag: 'أعمالنا',
        title: 'أعمالنا',
        desc: 'إعلانات جذابة صُنعت لشركات حقيقية. اضغط تشغيل للمشاهدة.',
        addVideo: 'أضف فيديو',
        tags: {
          product: 'منتجات',
          luxury: 'فاخر',
          restaurant: 'مطاعم',
          healthcare: 'رعاية صحية',
          realEstate: 'عقارات',
        },
        play: {
          watch: 'تشغيل إعلان الساعة',
          perfume: 'تشغيل إعلان العطر',
          burger: 'تشغيل إعلان البرجر',
          clinic: 'تشغيل إعلان العيادة',
          realestate: 'تشغيل إعلان العقارات',
        },
        aria: {
          watch: 'فيديو إعلان الساعة',
          perfume: 'فيديو إعلان العطر',
          burger: 'فيديو إعلان البرجر',
          clinic: 'فيديو إعلان عيادة علاج النطق',
          realestate: 'فيديو إعلان العقارات',
        },
      },
      services: {
        tag: 'ما نقدمه',
        title: 'خدماتنا',
        desc: 'إعلانات فيديو احترافية مصممة لقطاعك وجمهورك.',
        productTitle: 'إعلانات المنتجات',
        productDesc: 'اعرض منتجاتك بمشاهد سينمائية مولّدة بالذكاء الاصطناعي تزيد النقرات والمبيعات.',
        restaurantTitle: 'إعلانات المطاعم',
        restaurantDesc: 'فيديوهات طعام شهية تجذب الزوار وتزيد طلبات التوصيل.',
        clinicTitle: 'إعلانات العيادات',
        clinicDesc: 'ابنِ الثقة بفيديوهات رعاية صحية احترافية تعكس الاهتمام والخبرة.',
        realEstateTitle: 'إعلانات العقارات',
        realEstateDesc: 'أبرز عقاراتك بفيديوهات جولة مذهلة تجذب المشترين الجادين.',
        socialTitle: 'محتوى وسائل التواصل',
        socialDesc: 'محتوى متسق وجاهز للمنصات يبقي علامتك ظاهرة ومتفاعلة على كل قناة.',
      },
      whyUs: {
        tag: 'ميزة RWPST',
        title: 'لماذا نحن',
        desc: 'جودة عالية بدون سعر وكالة باهظ.',
        fastTitle: 'تسليم سريع',
        fastDesc: 'احصل على إعلانك جاهزاً خلال 48 ساعة. بدون انتظار طويل أو تأخير.',
        aiTitle: 'إنتاج مدعوم بالذكاء الاصطناعي',
        aiDesc: 'أدوات ذكاء اصطناعي متطورة مع إبداع بشري لنتائج مذهلة وفريدة.',
        editingTitle: 'مونتاج احترافي',
        editingDesc: 'كل لقطة تُصقلها محترفون يعرفون ما يجعل الإعلانات تحقق النتائج.',
        affordableTitle: 'باقات مناسبة',
        affordableDesc: 'أسعار مرنة للشركات الصغيرة. تأثير كبير بدون تكلفة باهظة.',
      },
      contact: {
        tag: 'تواصل معنا',
        title: 'جاهز لإنشاء إعلانك؟',
        desc: 'أخبرنا عن نشاطك وسنصنع فيديو يوقف التمرير. تواصل اليوم لاستشارة مجانية.',
        whatsapp: 'RWPST Motion',
        whatsappSub: '',
        whatsappAria: 'تواصل مع RWPST Motion عبر واتساب',
        floatTooltip: 'تواصل معنا عبر واتساب',
        floatAria: 'تواصل معنا عبر واتساب',
        email: 'البريد الإلكتروني',
        emailAddress: 'info.rwpst@gmail.com',
        emailAria: 'راسلنا على info.rwpst@gmail.com',
        copyEmailAria: 'نسخ عنوان البريد الإلكتروني',
        copyEmailSuccess: 'تم نسخ البريد الإلكتروني',
        waText: 'مرحباً RWPST MOTION، أود مناقشة إعلانات فيديو بالذكاء الاصطناعي لنشاطي.',
        emailSubject: 'استفسار عن إعلان فيديو بالذكاء الاصطناعي',
      },
      footer: {
        tagline: 'استوديو إبداعي مدعوم بالذكاء الاصطناعي',
        rights: 'جميع الحقوق محفوظة.',
      },
      modal: {
        player: 'مشغل الفيديو',
        close: 'إغلاق الفيديو',
      },
    },
    en: {
      meta: {
        title: 'RWPST MOTION — AI Video Ads for Small Businesses',
        description: 'RWPST MOTION — AI-powered creative studio specializing in scroll-stopping video ads for small businesses.',
      },
      nav: {
        portfolio: 'Portfolio',
        services: 'Services',
        whyUs: 'Why Us',
        contact: 'Contact',
        toggleMenu: 'Toggle menu',
        home: 'RWPST MOTION home',
      },
      lang: {
        switcher: 'Language switcher',
        ar: 'العربية',
        en: 'EN',
      },
      hero: {
        badge: 'AI-Powered Creative Studio',
        titleHtml: 'AI Video Ads for<br><span class="hero__title-accent">Small Businesses</span>',
        subtitle: 'Turn your products and services into scroll-stopping videos.',
        viewPortfolio: 'View Portfolio',
        contactUs: 'Contact Us',
        statDelivery: 'Fast Delivery',
        statPowered: 'Powered Production',
        statIndustry: 'Multi-Industry',
        statLibrary: 'Growing Library',
        scrollTo: 'Scroll to portfolio',
      },
      portfolio: {
        tag: 'Our Work',
        title: 'Portfolio',
        desc: 'Scroll-stopping ads crafted for real businesses. Click play to watch.',
        addVideo: 'Add Video',
        tags: {
          product: 'Product',
          luxury: 'Luxury',
          restaurant: 'Restaurant',
          healthcare: 'Healthcare',
          realEstate: 'Real Estate',
        },
        play: {
          watch: 'Play Watch Ad',
          perfume: 'Play Perfume Ad',
          burger: 'Play Burger Ad',
          clinic: 'Play Speech Therapy Clinic Ad',
          realestate: 'Play Real Estate Ad',
        },
        aria: {
          watch: 'Watch Ad video',
          perfume: 'Perfume Ad video',
          burger: 'Burger Ad video',
          clinic: 'Speech Therapy Clinic Ad video',
          realestate: 'Real Estate Ad video',
        },
      },
      services: {
        tag: 'What We Do',
        title: 'Services',
        desc: 'Professional video ads tailored to your industry and audience.',
        productTitle: 'Product Ads',
        productDesc: 'Showcase your products with cinematic AI-generated visuals that drive clicks and conversions.',
        restaurantTitle: 'Restaurant Ads',
        restaurantDesc: 'Make mouths water with appetizing food videos that fill tables and boost delivery orders.',
        clinicTitle: 'Clinic Ads',
        clinicDesc: 'Build trust with professional healthcare videos that communicate care and expertise.',
        realEstateTitle: 'Real Estate Ads',
        realEstateDesc: 'Highlight properties with stunning walkthrough-style videos that attract serious buyers.',
        socialTitle: 'Social Media Content',
        socialDesc: 'Consistent, platform-ready content that keeps your brand visible and engaging across every channel.',
      },
      whyUs: {
        tag: 'The RWPST Advantage',
        title: 'Why Choose Us',
        desc: 'Premium quality without the premium agency price tag.',
        fastTitle: 'Fast Delivery',
        fastDesc: 'Get your finished ad in as little as 48 hours. No long waits, no missed deadlines.',
        aiTitle: 'AI-Powered Production',
        aiDesc: 'Cutting-edge AI tools combined with human creativity for stunning, unique results.',
        editingTitle: 'Professional Editing',
        editingDesc: 'Every frame is polished by experienced editors who know what makes ads convert.',
        affordableTitle: 'Affordable Packages',
        affordableDesc: 'Flexible pricing designed for small businesses. Big impact without breaking the bank.',
      },
      contact: {
        tag: 'Get In Touch',
        title: 'Ready to Create Your Ad?',
        desc: "Tell us about your business and we'll craft a video that stops the scroll. Reach out today for a free consultation.",
        whatsapp: 'RWPST Motion',
        whatsappSub: '',
        whatsappAria: 'Contact RWPST Motion on WhatsApp',
        floatTooltip: 'Chat with RWPST Motion',
        floatAria: 'Chat with RWPST Motion',
        email: 'Email',
        emailAddress: 'info.rwpst@gmail.com',
        emailAria: 'Email us at info.rwpst@gmail.com',
        copyEmailAria: 'Copy email address',
        copyEmailSuccess: 'Email copied',
        waText: "Hi RWPST MOTION, I'd like to discuss AI video ads for my business.",
        emailSubject: 'AI Video Ad Inquiry',
      },
      footer: {
        tagline: 'AI-Powered Creative Studio',
        rights: 'All rights reserved.',
      },
      modal: {
        player: 'Video player',
        close: 'Close video',
      },
    },
  };

  let currentLang = DEFAULT_LANG;

  function getStoredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' || stored === 'en') return stored;
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function getNested(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  function applyLanguage(lang) {
    if (!translations[lang]) lang = DEFAULT_LANG;
    currentLang = lang;
    const t = translations[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = getNested(t, key);
      if (value != null) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const value = getNested(t, key);
      if (value != null) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const value = getNested(t, key);
      if (value != null) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getNested(t, key);
      if (value != null) el.setAttribute('placeholder', value);
    });

    document.title = t.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t.meta.description;

    const waUrl = 'https://wa.me/01006786392';

    const waLink = document.getElementById('whatsappLink');
    if (waLink) {
      waLink.href = waUrl;
    }

    const waFloat = document.getElementById('whatsappFloat');
    if (waFloat) {
      waFloat.href = waUrl;
    }

    const contactEmail = t.contact.emailAddress || 'info.rwpst@gmail.com';

    const emailLink = document.getElementById('emailLink');
    if (emailLink) {
      emailLink.href = `mailto:${contactEmail}?subject=${encodeURIComponent(t.contact.emailSubject)}`;
    }

    const emailCopyBtn = document.getElementById('emailCopyBtn');
    if (emailCopyBtn) {
      emailCopyBtn.dataset.copySuccess = t.contact.copyEmailSuccess;
    }

    document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}

    document.documentElement.style.setProperty(
      '--placeholder-add-video',
      `"${t.portfolio.addVideo}"`
    );

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  function initLanguageSwitcher() {
    document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang && lang !== currentLang) applyLanguage(lang);
      });
    });
  }

  function init() {
    applyLanguage(getStoredLang());
    initLanguageSwitcher();
  }

  window.RWPST_i18n = { applyLanguage, getLang: () => currentLang, translations };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
