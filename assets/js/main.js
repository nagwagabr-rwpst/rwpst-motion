/**
 * RWPST MOTION — Landing Page
 * Vanilla JS: navigation, scroll reveals, video playback, modal
 */

(function () {
  'use strict';

  /* --- DOM References --- */
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const yearEl = document.getElementById('year');
  const videoModal = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('modalPlayer');
  const revealElements = document.querySelectorAll('.reveal');
  const emailCopyBtn = document.getElementById('emailCopyBtn');

  const CONTACT_EMAIL = 'info.rwpst@gmail.com';
  const PORTFOLIO_VIDEO_BASE_URL = window.PORTFOLIO_VIDEO_BASE_URL || '';

  function getPortfolioVideoUrl(filename) {
    return PORTFOLIO_VIDEO_BASE_URL + filename;
  }

  function resolvePortfolioVideoSources() {
    document.querySelectorAll('.portfolio__video source[data-video]').forEach((source) => {
      const filename = source.getAttribute('data-video');
      if (!filename) return;

      const url = getPortfolioVideoUrl(filename);
      const video = source.closest('.portfolio__video');
      const isLazy = Boolean(video && video.closest('#portfolio'));

      if (isLazy) {
        source.setAttribute('data-src', url);
      } else {
        source.setAttribute('src', url);
      }
    });
  }

  function ensurePortfolioVideoSourceLoaded(video) {
    const source = video?.querySelector('source');
    if (!source) return;

    if (!source.getAttribute('src')) {
      const dataSrc = source.getAttribute('data-src');
      if (dataSrc) {
        source.setAttribute('src', dataSrc);
        video.load();
      }
    }
  }

  /* --- Init --- */
  function init() {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initSmoothNav();
    initRevealAnimations();
    resolvePortfolioVideoSources();
    initPortfolioVideos();
    initPortfolioTabs();
    initVideoModal();
    initFeaturedHoverPreview();
    initLazyVideos();
    checkVideoSources();
    initEmailCopy();
  }

  /* --- Footer year --- */
  function setYear() {
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* --- Header scroll effect --- */
  function initHeaderScroll() {
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile navigation --- */
  function initMobileNav() {
    if (!navToggle || !navLinks) return;

    const toggleMenu = () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    navToggle.addEventListener('click', toggleMenu);

    navLinks.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('is-open')) {
          toggleMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  }

  /* --- Smooth scroll for anchor links --- */
  function initSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const headerOffset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* --- Scroll reveal animations --- */
  function initRevealAnimations() {
    if (!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      revealElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* --- Check if video sources exist, apply orientation --- */
  function checkVideoSources() {
    const videos = [...document.querySelectorAll('.portfolio__video')];

    if (!videos.length) return;

    const onVideoReady = (video) => {
      const wrap = video.closest('.portfolio__video-wrap');
      if (wrap) wrap.classList.remove('is-placeholder');
      applyVideoOrientation(video);
      syncBlurVideo(video);
    };

    const tasks = videos.map((video) => new Promise((resolve) => {
      const source = video.querySelector('source');
      const srcPath = source?.getAttribute('src') || source?.getAttribute('data-src');

      const finish = () => resolve();

      if (!srcPath) {
        finish();
        return;
      }

      video.addEventListener('error', () => {
        markAsPlaceholder(video);
        finish();
      }, { once: true });

      video.addEventListener('loadedmetadata', () => {
        onVideoReady(video);
        finish();
      }, { once: true });

      if (source?.getAttribute('src')) {
        video.load();
      }
    }));

    Promise.all(tasks).catch(() => {});
  }

  function setupBlurVideo(video) {
    const wrap = video.closest('.portfolio__video-wrap');
    if (!wrap || wrap.querySelector('.portfolio__video-blur')) return;

    const blur = document.createElement('video');
    blur.className = 'portfolio__video-blur';
    blur.muted = true;
    blur.playsInline = true;
    blur.loop = true;
    blur.setAttribute('aria-hidden', 'true');
    blur.setAttribute('preload', 'metadata');

    const source = video.querySelector('source');
    if (source) {
      const blurSource = document.createElement('source');
      blurSource.type = source.type || 'video/mp4';
      blurSource.src = source.getAttribute('src') || source.getAttribute('data-src') || '';
      blur.appendChild(blurSource);
    }

    wrap.insertBefore(blur, video);
    return blur;
  }

  function syncBlurVideo(video) {
    const wrap = video.closest('.portfolio__video-wrap');
    if (!wrap) return;

    let blur = wrap.querySelector('.portfolio__video-blur');
    if (!blur && getVideoOrientation(video) === 'portrait') {
      blur = setupBlurVideo(video);
    }
    if (!blur) return;

    const mainSource = video.querySelector('source');
    const blurSource = blur.querySelector('source');
    if (mainSource && blurSource) {
      const src = mainSource.getAttribute('src') || mainSource.getAttribute('data-src');
      if (src && !blurSource.getAttribute('src')) {
        blurSource.src = src;
        blur.load();
      }
    }
  }

  function getVideoOrientation(video) {
    if (!video.videoWidth || !video.videoHeight) return 'portrait';
    return video.videoWidth > video.videoHeight ? 'landscape' : 'portrait';
  }

  function applyVideoOrientation(video) {
    const card = video.closest('.portfolio__card');
    const wrap = video.closest('.portfolio__video-wrap');
    if (!card || !wrap) return;

    const orientation = card.dataset.orientation || getVideoOrientation(video);

    card.classList.remove('portfolio__card--portrait', 'portfolio__card--landscape');
    card.classList.add(`portfolio__card--${orientation}`);
    if (!card.dataset.orientation) {
      card.dataset.orientation = orientation;
    }

    wrap.classList.remove('portfolio__video-wrap--portrait', 'portfolio__video-wrap--landscape');
    wrap.classList.add(`portfolio__video-wrap--${orientation}`);

    if (orientation === 'portrait') {
      setupBlurVideo(video);
      syncBlurVideo(video);
    }
  }

  function markAsPlaceholder(video) {
    const wrap = video.closest('.portfolio__video-wrap');
    if (wrap) wrap.classList.add('is-placeholder');
  }

  /* --- Portfolio category tabs --- */
  function initPortfolioTabs() {
    const tabs = document.querySelectorAll('.portfolio-tab');
    const categories = document.querySelectorAll('.portfolio-category');

    if (!tabs.length || !categories.length) return;

    const setActiveTab = (activeTab) => {
      const selected = activeTab.dataset.category;

      tabs.forEach((tab) => {
        const isActive = tab === activeTab;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      categories.forEach((category) => {
        const match = selected === 'all' || category.dataset.category === selected;
        category.hidden = !match;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => setActiveTab(tab));
    });

    const defaultTab =
      document.querySelector('.portfolio-tab[data-category="restaurants"]') ||
      document.querySelector('.portfolio-tab.is-active') ||
      tabs[0];
    if (defaultTab) setActiveTab(defaultTab);

    const proofPortfolioCta = document.getElementById('restaurantProofPortfolioCta');
    if (proofPortfolioCta) {
      proofPortfolioCta.addEventListener('click', () => {
        const restaurantsTab = document.querySelector('.portfolio-tab[data-category="restaurants"]');
        if (restaurantsTab) setActiveTab(restaurantsTab);
      });
    }
  }

  /* --- Lazy-load portfolio videos below the fold --- */
  function initLazyVideos() {
    const lazyVideos = [...document.querySelectorAll('#portfolio .portfolio__video')];

    if (!lazyVideos.length) return;

    lazyVideos.forEach((video) => {
      const source = video.querySelector('source');
      if (!source) return;

      const src = source.getAttribute('src');
      const dataSrc = source.getAttribute('data-src');

      if (src && !dataSrc) {
        source.setAttribute('data-src', src);
        source.removeAttribute('src');
      }

      if (dataSrc || src) {
        video.setAttribute('preload', 'none');
      }
    });

    const loadVideo = (video) => {
      const source = video.querySelector('source');
      const dataSrc = source?.getAttribute('data-src');
      if (!dataSrc || source.getAttribute('src')) return;

      source.setAttribute('src', dataSrc);
      video.setAttribute('preload', 'metadata');

      video.addEventListener('loadedmetadata', () => {
        const wrap = video.closest('.portfolio__video-wrap');
        if (wrap) wrap.classList.remove('is-placeholder');
        applyVideoOrientation(video);
        syncBlurVideo(video);
      }, { once: true });

      video.addEventListener('error', () => markAsPlaceholder(video), { once: true });
      video.load();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadVideo(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    lazyVideos.forEach((video) => observer.observe(video));
  }

  /* --- Featured cards: autoplay preview on hover --- */
  function initFeaturedHoverPreview() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    document.querySelectorAll('[data-featured-preview]').forEach((card) => {
      const video = card.querySelector('.portfolio__video');
      const blur = card.querySelector('.portfolio__video-blur');
      if (!video) return;

      const playPreview = () => {
        video.play().catch(() => {});
        if (blur) blur.play().catch(() => {});
        card.classList.add('is-previewing');
      };

      const stopPreview = () => {
        video.pause();
        video.currentTime = 0;
        if (blur) {
          blur.pause();
          blur.currentTime = 0;
        }
        card.classList.remove('is-previewing');
      };

      card.addEventListener('mouseenter', playPreview);
      card.addEventListener('mouseleave', stopPreview);
      card.addEventListener('focusin', playPreview);
      card.addEventListener('focusout', stopPreview);
    });
  }

  /* --- Portfolio video playback (modal) --- */
  function initPortfolioVideos() {
    document.querySelectorAll('.portfolio__card').forEach((card) => {
      const video = card.querySelector('.portfolio__video:not(.portfolio__video-blur)');
      const playBtn = card.querySelector('.portfolio__play');
      const wrap = card.querySelector('.portfolio__video-wrap');

      if (!video || !playBtn || !wrap) return;

      const openVideo = () => {
        ensurePortfolioVideoSourceLoaded(video);
        const orientation = card.dataset.orientation || getVideoOrientation(video);
        openModalWithVideo(video, orientation);
      };

      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openVideo();
      });

      wrap.addEventListener('click', openVideo);
    });
  }

  /* --- Video modal --- */
  function initVideoModal() {
    if (!videoModal || !modalPlayer) return;

    videoModal.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !videoModal.hidden) {
        closeModal();
      }
    });
  }

  function openModalWithVideo(sourceVideo, mode = 'portrait') {
    if (!videoModal || !modalPlayer) return;

    const orientation = mode === 'landscape' ? 'landscape' : 'portrait';
    const isLandscape = orientation === 'landscape';

    modalPlayer.innerHTML = '';

    videoModal.classList.remove('modal--portrait', 'modal--landscape');
    videoModal.classList.add(isLandscape ? 'modal--landscape' : 'modal--portrait');

    const clone = sourceVideo.cloneNode(true);
    clone.controls = true;
    clone.autoplay = true;
    clone.playsInline = true;
    clone.setAttribute('controlsList', 'nodownload');
    clone.classList.add('modal__video');
    modalPlayer.appendChild(clone);

    videoModal.hidden = false;
    document.body.style.overflow = 'hidden';

    clone.play().catch(() => {});
  }

  /* --- Email copy to clipboard --- */
  function initEmailCopy() {
    if (!emailCopyBtn) return;

    emailCopyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const copied = await copyToClipboard(CONTACT_EMAIL);
      if (!copied) return;

      emailCopyBtn.classList.add('is-copied');

      const label = emailCopyBtn.getAttribute('aria-label') || '';
      const successMsg = emailCopyBtn.dataset.copySuccess || 'Email copied';

      emailCopyBtn.setAttribute('aria-label', successMsg);

      setTimeout(() => {
        emailCopyBtn.classList.remove('is-copied');
        emailCopyBtn.setAttribute('aria-label', label);
      }, 2000);
    });
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    }
  }

  function closeModal() {
    if (!videoModal || !modalPlayer) return;

    const video = modalPlayer.querySelector('video');
    if (video) video.pause();

    modalPlayer.innerHTML = '';
    videoModal.classList.remove('modal--landscape', 'modal--portrait');
    videoModal.hidden = true;
    document.body.style.overflow = '';
  }

  /* --- Run --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
