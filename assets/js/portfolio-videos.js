/**
 * RWPST MOTION — Portfolio video storage (Supabase public bucket).
 * Single source of truth for portfolio showcase video URLs.
 */
(function () {
  'use strict';

  const PORTFOLIO_VIDEO_BASE_URL =
    'https://krxwcyfohwzmpovvxwhv.supabase.co/storage/v1/object/public/portfolio-assets/videos/';

  window.PORTFOLIO_VIDEO_BASE_URL = PORTFOLIO_VIDEO_BASE_URL;
})();
