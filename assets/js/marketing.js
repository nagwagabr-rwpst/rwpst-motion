/**
 * RWPST MOTION — first-party marketing session and funnel events.
 * Tracking failures are logged and never thrown to the page.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'rwpst_mkt_session';
  const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const REQUEST_NUMBER_RE = /^RWPST-TRL-[0-9]{8}-[0-9]{4}$/;
  const CTA_BINDINGS = [
    ['heroOrderCta', 'hero_trial'],
    ['pricingStarterOrderCta', 'pricing_trial'],
    ['restaurantProofOrderCta', 'proof_trial'],
  ];

  let supabaseClient = null;
  let pageViewSent = false;
  let orderFormViewSent = false;
  let booted = false;

  function trimControl(value) {
    if (value == null) return null;
    const cleaned = String(value).replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!cleaned) return null;
    return cleaned.slice(0, 200);
  }

  function readUtm() {
    const params = new URLSearchParams(window.location.search);
    return {
      source: trimControl(params.get('utm_source')),
      medium: trimControl(params.get('utm_medium')),
      campaign: trimControl(params.get('utm_campaign')),
      content: trimControl(params.get('utm_content')),
      term: trimControl(params.get('utm_term')),
    };
  }

  function hasTouch(utm) {
    return Boolean(
      utm.campaign ||
      utm.content ||
      utm.term ||
      (utm.source && utm.source !== 'direct') ||
      (utm.medium && utm.medium !== 'none')
    );
  }

  function currentPath() {
    const path = window.location.pathname || '/';
    return (path.charAt(0) === '/' ? path : `/${path}`).slice(0, 300);
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data.id !== 'string' || !UUID_RE.test(data.id)) return null;
      if (typeof data.createdAt !== 'number' || !Number.isFinite(data.createdAt)) return null;
      if (Date.now() - data.createdAt >= SESSION_TTL_MS) return null;
      return {
        id: data.id,
        createdAt: data.createdAt,
        landingPage: typeof data.landingPage === 'string' && data.landingPage
          ? data.landingPage.slice(0, 300)
          : currentPath(),
        source: data.source ?? null,
        medium: data.medium ?? null,
        campaign: data.campaign ?? null,
        content: data.content ?? null,
        term: data.term ?? null,
      };
    } catch (err) {
      console.error('[RWPST] Marketing session unreadable:', err);
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      id: session.id,
      createdAt: session.createdAt,
      landingPage: session.landingPage,
      source: session.source,
      medium: session.medium,
      campaign: session.campaign,
      content: session.content,
      term: session.term,
    }));
  }

  function applyUtm(session, utm, isNew) {
    const touch = hasTouch(utm);
    if (isNew) {
      session.source = touch ? utm.source : (utm.source || 'direct');
      session.medium = touch ? utm.medium : (utm.medium || 'none');
      session.campaign = utm.campaign;
      session.content = utm.content;
      session.term = utm.term;
      return;
    }
    if (!touch) return;
    if (utm.source) session.source = utm.source;
    if (utm.medium) session.medium = utm.medium;
    if (utm.campaign) session.campaign = utm.campaign;
    if (utm.content) session.content = utm.content;
    if (utm.term) session.term = utm.term;
  }

  function ensureSession() {
    const utm = readUtm();
    const existing = loadSession();
    if (existing) {
      applyUtm(existing, utm, false);
      saveSession(existing);
      return existing;
    }
    if (!window.crypto?.randomUUID) {
      throw new Error('crypto.randomUUID is unavailable');
    }
    const session = {
      id: window.crypto.randomUUID(),
      createdAt: Date.now(),
      landingPage: currentPath(),
      source: null,
      medium: null,
      campaign: null,
      content: null,
      term: null,
    };
    applyUtm(session, utm, true);
    saveSession(session);
    return session;
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;
    const env = window.RWPST_SUPABASE;
    if (!env?.url || !env?.anonKey || env.anonKey === 'USE_ENV_PLACEHOLDER') {
      throw new Error('Supabase configuration is missing.');
    }
    if (!window.supabase?.createClient) {
      throw new Error('Supabase client library is not loaded.');
    }
    supabaseClient = window.supabase.createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return supabaseClient;
  }

  async function syncSession(session) {
    const utm = readUtm();
    const { error } = await getClient().rpc('record_marketing_session', {
      p_session_id: session.id,
      p_landing_page: session.landingPage,
      p_source: utm.source,
      p_medium: utm.medium,
      p_campaign: utm.campaign,
      p_content: utm.content,
      p_term: utm.term,
    });
    if (error) throw new Error(error.message || 'record_marketing_session failed');
  }

  async function recordEvent(eventName, metadata) {
    const session = ensureSession();
    const { error } = await getClient().rpc('record_marketing_event', {
      p_session_id: session.id,
      p_event_name: eventName,
      p_page: currentPath(),
      p_metadata: metadata,
    });
    if (error) throw new Error(error.message || 'record_marketing_event failed');
  }

  function isLandingPage() {
    return Boolean(document.getElementById('heroOrderCta'));
  }

  function isOrderPage() {
    return Boolean(document.getElementById('trialOrderForm'));
  }

  function bindCtas() {
    CTA_BINDINGS.forEach(([id, cta]) => {
      const link = document.getElementById(id);
      if (!link || link.dataset.mktCtaBound === '1') return;
      link.dataset.mktCtaBound = '1';
      link.addEventListener('click', (event) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target === '_blank') return;
        event.preventDefault();
        const href = link.href;
        let left = false;
        const go = () => {
          if (left) return;
          left = true;
          window.location.href = href;
        };
        const timer = window.setTimeout(go, 4000);
        trackCta(cta).finally(() => {
          window.clearTimeout(timer);
          go();
        });
      });
    });
  }

  async function trackCta(cta) {
    try {
      await syncSession(ensureSession());
      await recordEvent('cta_click', { cta });
    } catch (err) {
      console.error('[RWPST] Marketing cta_click failed:', err);
    }
  }

  async function recordOrderSubmit(result) {
    try {
      await ready;
      const requestId = result?.id;
      const requestNumber = result?.requestNumber;
      if (typeof requestId !== 'string' || !UUID_RE.test(requestId)) return;
      if (typeof requestNumber !== 'string' || !REQUEST_NUMBER_RE.test(requestNumber)) return;
      await syncSession(ensureSession());
      await recordEvent('order_submit', {
        request_id: requestId,
        request_number: requestNumber,
      });
    } catch (err) {
      console.error('[RWPST] Marketing order_submit failed:', err);
    }
  }

  async function boot() {
    if (booted) return;
    booted = true;

    let session;
    try {
      session = ensureSession();
    } catch (err) {
      console.error('[RWPST] Marketing session failed:', err);
      return;
    }

    if (isLandingPage()) bindCtas();

    try {
      await syncSession(session);
      if (isOrderPage() && !orderFormViewSent) {
        await recordEvent('order_form_view', {});
        orderFormViewSent = true;
      } else if (isLandingPage() && !pageViewSent) {
        await recordEvent('page_view', {});
        pageViewSent = true;
      }
    } catch (err) {
      console.error('[RWPST] Marketing tracking failed:', err);
    }
  }

  function getSessionId() {
    try {
      return ensureSession().id;
    } catch (err) {
      console.error('[RWPST] Marketing session failed:', err);
      return null;
    }
  }

  const ready = new Promise((resolve) => {
    const start = () => {
      boot().finally(resolve);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  });

  window.RWPST_Marketing = {
    getSessionId,
    whenReady: () => ready,
    recordOrderSubmit,
  };
})();
