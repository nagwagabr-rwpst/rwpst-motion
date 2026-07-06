/**
 * RWPST MOTION — Project Request Form configuration
 */
(function () {
  'use strict';

  const SESSION_KEYS = {
    lastSubmissionId: 'rwpst_last_submission_id',
    lastRequestNumber: 'rwpst_last_request_number',
  };

  /**
   * Payment gateway — disabled until integrated.
   * Future flow: payment → redirect with ?payment_ref=… → form pre-filled status.
   */
  const PAYMENT = {
    enabled: false,
    provider: null,
    checkoutUrl: '',
    returnParam: 'payment_ref',
    statusParam: 'payment_status',
    packages: {
      starter: { id: 'starter', labelAr: 'باقة البداية', amountEgp: 199 },
      growth: { id: 'growth', labelAr: 'باقة النمو', amountEgp: 499 },
      custom: { id: 'custom', labelAr: 'باقة مخصصة', amountEgp: null },
    },
  };

  window.RWPST_ProjectRequestConfig = {
    SESSION_KEYS,
    PAYMENT,
  };
})();
