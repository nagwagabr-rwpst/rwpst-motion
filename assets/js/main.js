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
  const portfolioCards = document.querySelectorAll('.portfolio__card');
  const revealElements = document.querySelectorAll('.reveal');
  const emailCopyBtn = document.getElementById('emailCopyBtn');

  const CONTACT_EMAIL = 'info.rwpst@gmail.com';

  let currentlyPlaying = null;

  /* --- Init --- */
  function init() {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initSmoothNav();
    initRevealAnimations();
    initPortfolioVideos();
    initVideoModal();
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

  /* --- Check if video sources exist, show placeholder if not --- */
  function checkVideoSources() {
    document.querySelectorAll('.portfolio__video').forEach((video) => {
      const source = video.querySelector('source');
      const srcPath = source?.getAttribute('src');
      const wrap = video.closest('.portfolio__video-wrap');

      if (!srcPath) {
        markAsPlaceholder(video);
        return;
      }

      video.addEventListener('error', () => markAsPlaceholder(video));
      video.addEventListener('loadedmetadata', () => {
        if (wrap) wrap.classList.remove('is-placeholder');
      });

      video.load();
    });
  }

  function markAsPlaceholder(video) {
    const wrap = video.closest('.portfolio__video-wrap');
    if (wrap) wrap.classList.add('is-placeholder');
  }

  /* --- Portfolio inline video playback --- */
  function initPortfolioVideos() {
    portfolioCards.forEach((card) => {
      const video = card.querySelector('.portfolio__video');
      const playBtn = card.querySelector('.portfolio__play');
      const wrap = card.querySelector('.portfolio__video-wrap');

      if (!video || !playBtn || !wrap) return;

      const isWideCard = card.classList.contains('portfolio__card--wide');

      const playVideo = () => {
        if (isWideCard) {
          openModalWithVideo(video, 'landscape');
          return;
        }

        if (wrap.classList.contains('is-placeholder')) {
          openModalWithVideo(video, 'portrait');
          return;
        }

        pauseCurrentVideo();

        if (video.paused) {
          video.play().then(() => {
            card.classList.add('is-playing');
            currentlyPlaying = video;
          }).catch(() => {
            openModalWithVideo(video, 'portrait');
          });
        } else {
          video.pause();
          card.classList.remove('is-playing');
          currentlyPlaying = null;
        }
      };

      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playVideo();
      });

      wrap.addEventListener('click', () => {
        if (!video.paused) {
          video.pause();
          card.classList.remove('is-playing');
          currentlyPlaying = null;
        } else {
          playVideo();
        }
      });

      video.addEventListener('ended', () => {
        card.classList.remove('is-playing');
        currentlyPlaying = null;
      });

      video.addEventListener('pause', () => {
        if (video.currentTime > 0 && !video.ended) return;
        card.classList.remove('is-playing');
      });

      wrap.addEventListener('dblclick', () => {
        openModalWithVideo(video, isWideCard ? 'landscape' : 'portrait');
      });
    });
  }

  function pauseCurrentVideo() {
    if (currentlyPlaying) {
      currentlyPlaying.pause();
      const card = currentlyPlaying.closest('.portfolio__card');
      if (card) card.classList.remove('is-playing');
      currentlyPlaying = null;
    }
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

    const isLandscape = mode === 'landscape';

    pauseCurrentVideo();
    modalPlayer.innerHTML = '';

    videoModal.classList.toggle('modal--landscape', isLandscape);

    const clone = sourceVideo.cloneNode(true);
    clone.controls = true;
    clone.autoplay = true;
    clone.playsInline = true;
    clone.setAttribute('controlsList', 'nodownload');
    clone.classList.add('modal__video');
    if (isLandscape) {
      clone.classList.add('modal__video--landscape');
    }
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
    videoModal.classList.remove('modal--landscape');
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
