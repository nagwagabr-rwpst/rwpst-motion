/**
 * RWPST MOTION — Bilingual i18n (Arabic default)
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'rwpst-lang';
  const DEFAULT_LANG = 'ar';
  const WHATSAPP_NUMBER = '+201006786392';

  const WHATSAPP_MESSAGE =
    'مرحباً RWPST MOTION،\n\n' +
    'أرغب في أول فيديو إعلاني لمطعمي (عرض 199 جنيه).\n\n' +
    'اسم المطعم:\n' +
    '....................\n\n' +
    'أريد معرفة التفاصيل والبدء.';

  const translations = {
    ar: {
      meta: {
        title: 'RWPST MOTION — فيديوهات إعلانية للمطاعم تجذب الطلبات',
        description: 'RWPST MOTION — فيديوهات إعلانية احترافية للمطاعم في مصر. أول فيديو لمطعمك — 199 جنيه فقط. تسليم سريع خلال 48 ساعة.',
      },
      nav: {
        portfolio: 'أعمالنا',
        pricing: 'الباقات',
        services: 'خدماتنا',
        contact: 'راسلنا على واتساب',
        toggleMenu: 'فتح القائمة',
        home: 'RWPST MOTION الرئيسية',
      },
      lang: {
        switcher: 'تبدل اللغة',
        ar: 'العربية',
        en: 'EN',
      },
      whatsapp: {
        message:
          'مرحباً RWPST MOTION،\n\n' +
          'أرغب في أول فيديو إعلاني لمطعمي (عرض 199 جنيه).\n\n' +
          'اسم المطعم:\n' +
          '....................\n\n' +
          'أريد معرفة التفاصيل والبدء.',
      },
      hero: {
        title: 'عندك مطعم؟',
        subtitle: 'حوّل صور أطباقك إلى فيديوهات إعلانية جاهزة للنشر.',
        offer: '🎬 أول فيديو إعلاني تجريبي — 199 جنيه فقط',
        ctaPrimary: 'اطلب فيديو مطعمك الآن',
        ctaSecondary: 'شاهد نماذج المطاعم',
        highlight1: 'فيديو حتى 30 ثانية',
        highlight2: 'باستخدام صور أطباقك الحالية',
        highlight3: 'تسليم سريع خلال 48 ساعة',
        highlight4: 'تعديل واحد',
        highlight5: 'جاهز للنشر',
        scrollTo: 'الانتقال إلى أعمالنا',
      },
      pricing: {
        tag: 'الباقات',
        title: 'ابدأ بفيديو التجربة',
        starter: {
          name: 'أول فيديو تجريبي',
          price: '199 جنيه',
          f1: 'فيديو إعلاني واحد',
          f2: 'حتى 30 ثانية',
          f3: 'باستخدام صورك الحالية',
          f4: 'تسليم سريع خلال 48 ساعة',
          f5: 'تعديل واحد',
          cta: 'ابدأ التجربة الآن',
        },
        growth: {
          badge: 'الخطوة التالية',
          name: 'Growth',
          price: '750 جنيه',
          f1: '4 فيديوهات شهرياً',
          f2: 'محتوى مستمر للسوشيال ميديا',
          f3: 'تسليم سريع',
          f4: 'دعم مباشر',
          cta: 'استفسر عن الباقة الشهرية',
        },
        custom: {
          name: 'Custom',
          price: 'حسب الطلب',
          f1: 'حملات كاملة',
          f2: 'فيديوهات متعددة',
          f3: 'محتوى مخصص',
          f4: 'حلول تسويقية متكاملة',
          cta: 'راسلنا على واتساب',
        },
      },
      portfolio: {
        featured: {
          title: 'نماذج من إعلانات المطاعم',
          desc: 'فيديوهات حقيقية صنعناها لمطاعم في مصر — اضغط تشغيل للمشاهدة.',
        },
        tag: 'أعمالنا',
        title: 'أعمالنا',
        desc: 'نماذج حقيقية من إعلانات مطاعم في مصر. اضغط تشغيل للمشاهدة.',
        addVideo: 'أضف فيديو',
        tabs: {
          all: 'الكل',
          businessGrowth: 'نمو الأعمال',
          restaurants: 'مطاعم',
          clinics: 'عيادات',
          realEstate: 'عقارات',
          products: 'منتجات',
          social: 'سوشيال ميديا',
          other: 'أخرى',
        },
        categories: {
          businessGrowth: {
            title: 'كيف يمكن لفيديو واحد أن يغيّر طريقة ظهور مشروعك؟',
            desc: 'نماذج حقيقية توضح تأثير المحتوى المرئي على جذب العملاء.',
          },
          restaurants: {
            title: 'مطاعم',
            desc: 'فيديوهات طعام تجذب الانتباه وتزيد الطلبات والحجوزات.',
            verticalTitle: 'إعلانات قصيرة للمطاعم',
            verticalDesc: 'نماذج فيديوهات عمودية مخصصة للإعلانات الممولة وReels.',
          },
          clinics: {
            title: 'عيادات',
            desc: 'فيديوهات تبني الثقة وتزيد استفسارات المرضى والحجوزات.',
          },
          realEstate: {
            title: 'عقارات',
            desc: 'فيديوهات عقارية تعرض المشروع بشكل احترافي وتجذب المشترين.',
          },
          products: {
            title: 'منتجات',
            desc: 'فيديوهات منتجات تبرز المميزات وتزيد الرسائل والمبيعات.',
          },
          social: {
            title: 'سوشيال ميديا',
            desc: 'محتوى فيديو قصير جاهز للنشر على إنستغرام وتيك توك وفيسبوك.',
            empty: 'قريباً — نماذج جديدة من محتوى السوشيال ميديا',
          },
          other: {
            title: 'أخرى',
            desc: 'فيديوهات لأنشطة تجارية متنوعة.',
            empty: 'قريباً — نماذج إضافية',
          },
        },
        tags: {
          businessGrowth: 'نمو الأعمال',
          product: 'منتجات',
          luxury: 'فاخر',
          restaurant: 'مطاعم',
          healthcare: 'رعاية صحية',
          realEstate: 'عقارات',
        },
        play: {
          businessGrowth: 'تشغيل نمو الأعمال',
          watch: 'تشغيل إعلان الساعة',
          perfume: 'تشغيل إعلان العطر',
          burger: 'تشغيل إعلان البرجر',
          clinic: 'تشغيل إعلان العيادة',
          realestate: 'تشغيل إعلان العقارات',
        },
        aria: {
          businessGrowth: 'فيديو نمو الأعمال',
          watch: 'فيديو إعلان الساعة',
          perfume: 'فيديو إعلان العطر',
          burger: 'فيديو إعلان البرجر',
          clinic: 'فيديو إعلان عيادة علاج النطق',
          realestate: 'فيديو إعلان العقارات',
        },
      },
      whyVideo: {
        tag: 'لماذا الفيديو',
        title: 'لماذا الفيديو أفضل من الصور؟',
        f1: {
          title: 'يجذب الانتباه أسرع',
          desc: 'الفيديو يوقف التمرير ويجعل جمهورك يلاحظ عرضك قبل المنافسين.',
        },
        f2: {
          title: 'يزيد فرص الرسائل والاستفسارات',
          desc: 'زبائنا يطلبون أكثر عندما يشوفون أطباقك وعروضك في فيديو شهي.',
        },
        f3: {
          title: 'يعرض الخدمة بشكل احترافي',
          desc: 'فيديو منظم يوضح قيمة نشاطك ويبني انطباعاً قوياً من أول ثانية.',
        },
        f4: {
          title: 'يمنح مشروعك صورة أقوى',
          desc: 'علامتك تبدو أكبر وأكثر جدية — وهذا يساعدك على كسب ثقة العملاء.',
        },
      },
      services: {
        tag: 'ما نقدمه',
        title: 'خدماتنا',
        desc: 'فيديوهات إعلانية للمطاعم تجذب الانتباه وتزيد الطلبات والحجوزات.',
        productTitle: 'إعلانات المنتجات',
        productDesc: 'اعرض منتجاتك بطريقة تجذب الانتباه وتزيد الرسائل والطلبات على متجرك.',
        restaurantTitle: 'إعلانات المطاعم',
        restaurantDesc: 'فيديوهات طعام شهية تجذب الزوار وتزيد الحجوزات وطلبات التوصيل.',
        clinicTitle: 'إعلانات العيادات',
        clinicDesc: 'قدّم خدماتك بشكل احترافي يبني الثقة ويزيد استفسارات المرضى.',
        realEstateTitle: 'إعلانات العقارات',
        realEstateDesc: 'أبرز عقاراتك بفيديو يجذب المشترين الجادين ويزيد الاستفسارات.',
        socialTitle: 'محتوى وسائل التواصل',
        socialDesc: 'محتوى فيديو مستمر يبقي نشاطك ظاهراً ويزيد التفاعل والرسائل على كل منصة.',
      },
      restaurantProof: {
        tag: 'أعمال حقيقية',
        title: 'إعلانات مطاعم نفذناها',
        desc: 'نماذج من فيديوهات صنعناها لمطاعم في مصر — بدون مجاملة واهتمالات.',
        cta: 'شاهد المزيد في الأعمال',
        whatsappCta: 'اطلب فيديو مطعمك — 199 جنيه',
      },
      finalCta: {
        title: 'جاهز لأول فيديو إعلاني لمطعمك؟',
        desc: 'راسلنا على واتساب وابدأ بعرض 199 جنيه لأول فيديو.',
        cta: 'راسلنا على واتساب',
        whatsappAria: 'تواصل معنا عبر واتساب',
      },
      contact: {
        tag: 'تواصل معنا',
        title: 'دعنا نصنع إعلان مطعمك التالي',
        desc: 'اضغط بوتون واتساب أدناه — نرد عليك بتفاصيل عرض 199 جنيه ونبدأ فوراً.',
        whatsapp: 'RWPST Motion',
        whatsappSub: 'راسلنا الآن على واتساب',
        whatsappAria: 'تواصل مع RWPST Motion عبر واتساب',
        floatTooltip: 'تواصل معنا عبر واتساب',
        floatAria: 'تواصل معنا عبر واتساب',
        email: 'البريد الإلكتروني',
        emailAddress: 'info.rwpst@gmail.com',
        emailAria: 'راسلنا على info.rwpst@gmail.com',
        copyEmailAria: 'نسخ عنوان البريد الإلكتروني',
        copyEmailSuccess: 'تم نسخ البريد الإلكتروني',
        emailSubject: 'استفسار عن فيديو إعلاني',
      },
      footer: {
        tagline: 'إعلانات فيديو للمطاعم',
        rights: 'جميع الحقوق محفوظة.',
      },
      modal: {
        player: 'مشغل الفيديو',
        close: 'إغلاق الفيديو',
      },
    },
    en: {
      meta: {
        title: 'RWPST MOTION — Restaurant Video Ads That Drive Orders',
        description: 'RWPST MOTION — Professional restaurant video ads in Egypt. First ad for your restaurant — 199 EGP only. Fast delivery within 48 hours.',
      },
      nav: {
        portfolio: 'Portfolio',
        pricing: 'Pricing',
        services: 'Services',
        contact: 'WhatsApp Us',
        toggleMenu: 'Toggle menu',
        home: 'RWPST MOTION home',
      },
      lang: {
        switcher: 'Language switcher',
        ar: 'العربية',
        en: 'EN',
      },
      whatsapp: {
        message:
          'Hi RWPST MOTION,\n\n' +
          'I want my first restaurant video ad (199 EGP offer).\n\n' +
          'Restaurant name:\n' +
          '....................\n\n' +
          'Please send details to get started.',
      },
      hero: {
        title: 'Own a restaurant?',
        subtitle: 'Turn your dish photos into video ads ready to publish.',
        offer: '🎬 First trial video ad — 199 EGP only',
        ctaPrimary: 'Order Your Restaurant Video',
        ctaSecondary: 'See Restaurant Samples',
        highlight1: 'Video up to 30 seconds',
        highlight2: 'Using your current dish photos',
        highlight3: 'Fast delivery within 48 hours',
        highlight4: 'One revision',
        highlight5: 'Ready to publish',
        scrollTo: 'Scroll to portfolio',
      },
      pricing: {
        tag: 'Pricing',
        title: 'Start with the trial video',
        starter: {
          name: 'First trial video',
          price: '199 EGP',
          f1: 'One video ad',
          f2: 'Up to 30 seconds',
          f3: 'Using your current photos',
          f4: 'Fast delivery within 48 hours',
          f5: 'One revision',
          cta: 'Start the trial now',
        },
        growth: {
          badge: 'Next step',
          name: 'Growth',
          price: '750 EGP',
          f1: '4 videos per month',
          f2: 'Ongoing social media content',
          f3: 'Fast delivery',
          f4: 'Direct support',
          cta: 'Ask about the monthly plan',
        },
        custom: {
          name: 'Custom',
          price: 'On request',
          f1: 'Full campaigns',
          f2: 'Multiple videos',
          f3: 'Custom content',
          f4: 'Integrated marketing solutions',
          cta: 'Message on WhatsApp',
        },
      },
      portfolio: {
        featured: {
          title: 'Restaurant Ad Samples',
          desc: 'Real ads we produced for restaurants in Egypt — tap play to watch.',
        },
        tag: 'Our Work',
        title: 'Portfolio',
        desc: 'Real restaurant ad samples from Egypt. Click play to watch.',
        addVideo: 'Add Video',
        tabs: {
          all: 'All',
          businessGrowth: 'Business Growth',
          restaurants: 'Restaurants',
          clinics: 'Clinics',
          realEstate: 'Real Estate',
          products: 'Products',
          social: 'Social Media',
          other: 'Other',
        },
        categories: {
          businessGrowth: {
            title: 'How can one video change how your business appears?',
            desc: 'Real examples showing how visual content attracts customers.',
          },
          restaurants: {
            title: 'Restaurants',
            desc: 'Food videos that grab attention and increase orders and reservations.',
            verticalTitle: 'Short Restaurant Ads',
            verticalDesc: 'Vertical video samples for paid ads and Reels.',
          },
          clinics: {
            title: 'Clinics',
            desc: 'Videos that build trust and increase patient inquiries and bookings.',
          },
          realEstate: {
            title: 'Real Estate',
            desc: 'Property videos that showcase projects professionally and attract buyers.',
          },
          products: {
            title: 'Products',
            desc: 'Product videos that highlight features and drive messages and sales.',
          },
          social: {
            title: 'Social Media',
            desc: 'Short video content ready to post on Instagram, TikTok, and Facebook.',
            empty: 'Coming soon — new social media content samples',
          },
          other: {
            title: 'Other',
            desc: 'Videos for diverse business activities.',
            empty: 'Coming soon — additional samples',
          },
        },
        tags: {
          businessGrowth: 'Business Growth',
          product: 'Product',
          luxury: 'Luxury',
          restaurant: 'Restaurant',
          healthcare: 'Healthcare',
          realEstate: 'Real Estate',
        },
        play: {
          businessGrowth: 'Play Business Growth video',
          watch: 'Play Watch Ad',
          perfume: 'Play Perfume Ad',
          burger: 'Play Burger Ad',
          clinic: 'Play Speech Therapy Clinic Ad',
          realestate: 'Play Real Estate Ad',
        },
        aria: {
          businessGrowth: 'Business Growth video',
          watch: 'Watch Ad video',
          perfume: 'Perfume Ad video',
          burger: 'Burger Ad video',
          clinic: 'Speech Therapy Clinic Ad video',
          realestate: 'Real Estate Ad video',
        },
      },
      whyVideo: {
        tag: 'Why Video',
        title: 'Why is video better than images?',
        f1: {
          title: 'Grabs attention faster',
          desc: 'Video stops the scroll and gets your audience to notice your offer before competitors.',
        },
        f2: {
          title: 'Increases messages and inquiries',
          desc: 'Customers reach out more when they see your service or product in clear motion.',
        },
        f3: {
          title: 'Presents your service professionally',
          desc: 'A polished video shows your value and builds a strong impression from the first second.',
        },
        f4: {
          title: 'Gives your business a stronger image',
          desc: 'Your brand looks bigger and more credible — helping you earn customer trust.',
        },
      },
      services: {
        tag: 'What We Do',
        title: 'Services',
        desc: 'Video ads designed to grab attention, increase inquiries, and present your business at its best.',
        productTitle: 'Product Ads',
        productDesc: 'Showcase your products in a way that grabs attention and increases messages and store orders.',
        restaurantTitle: 'Restaurant Ads',
        restaurantDesc: 'Appetizing food videos that attract visitors and boost reservations and delivery orders.',
        clinicTitle: 'Clinic Ads',
        clinicDesc: 'Present your services professionally to build trust and increase patient inquiries.',
        realEstateTitle: 'Real Estate Ads',
        realEstateDesc: 'Highlight properties with videos that attract serious buyers and increase inquiries.',
        socialTitle: 'Social Media Content',
        socialDesc: 'Consistent video content that keeps your business visible and drives engagement and messages.',
      },
      restaurantProof: {
        tag: 'Real Work',
        title: 'Restaurant Ads We Produced',
        desc: 'Samples from videos we made for restaurants in Egypt — no stock quotes, just real work.',
        cta: 'See more in portfolio',
        whatsappCta: 'Order your restaurant video — 199 EGP',
      },
      finalCta: {
        title: 'Ready for your restaurant\'s first video ad?',
        desc: 'Message us on WhatsApp and start with the 199 EGP first-video offer.',
        cta: 'Message us on WhatsApp',
        whatsappAria: 'Contact us on WhatsApp',
      },
      contact: {
        tag: 'Get In Touch',
        title: 'Let\'s create your restaurant\'s next ad',
        desc: 'Tap WhatsApp below — we\'ll reply with 199 EGP offer details and next steps.',
        whatsapp: 'RWPST Motion',
        whatsappSub: 'Message us on WhatsApp now',
        whatsappAria: 'Contact RWPST Motion on WhatsApp',
        floatTooltip: 'Chat with RWPST Motion',
        floatAria: 'Chat with RWPST Motion',
        email: 'Email',
        emailAddress: 'info.rwpst@gmail.com',
        emailAria: 'Email us at info.rwpst@gmail.com',
        copyEmailAria: 'Copy email address',
        copyEmailSuccess: 'Email copied',
        emailSubject: 'Video Ad Inquiry',
      },
      footer: {
        tagline: 'Restaurant Video Ad Studio',
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

  function buildWhatsAppUrl(text) {
    const encoded = encodeURIComponent(text ?? WHATSAPP_MESSAGE);
    return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encoded}`;
  }

  function getWhatsAppMessage(lang) {
    const t = translations[lang || currentLang];
    return t?.whatsapp?.message || WHATSAPP_MESSAGE;
  }

  function getWhatsAppUrl(lang) {
    return buildWhatsAppUrl(getWhatsAppMessage(lang));
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

    const waUrl = getWhatsAppUrl(lang);

    document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
      link.href = waUrl;
    });

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

  window.RWPST_i18n = {
    applyLanguage,
    getLang: () => currentLang,
    translations,
    WHATSAPP_NUMBER,
    WHATSAPP_MESSAGE,
    getWhatsAppUrl,
    buildWhatsAppUrl,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
