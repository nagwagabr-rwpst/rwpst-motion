/**
 * RWPST MOTION — Project Request Form
 */
(function () {
  'use strict';

  const config = window.RWPST_ProjectRequestConfig;
  const service = () => window.RWPST_ProjectRequestService;
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const SUBMIT_LABEL_DEFAULT = 'إرسال الطلب';
  const SUBMIT_LABEL_LOADING = 'جاري الإرسال...';

  const form = document.getElementById('projectRequestForm');
  const submitBtn = document.getElementById('submitBtn');
  const formError = document.getElementById('formError');
  const businessTypeOtherWrap = document.getElementById('businessTypeOtherWrap');
  const paymentBanner = document.getElementById('paymentBanner');

  function init() {
    if (!form) return;

    setYear();
    initHeaderScroll();
    initBusinessTypeToggle();
    initFileInputs();
    initPaymentPlaceholder();
    form.addEventListener('submit', onSubmit);
  }

  function setYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initBusinessTypeToggle() {
    form.querySelectorAll('input[name="businessType"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const isOther = form.querySelector('input[name="businessType"]:checked')?.value === 'other';
        if (businessTypeOtherWrap) {
          businessTypeOtherWrap.hidden = !isOther;
        }
      });
    });
  }

  function initFileInputs() {
    form.querySelectorAll('.pr-file-input').forEach((input) => {
      input.addEventListener('change', () => updateFileList(input));
    });
  }

  function updateFileList(input) {
    const listId = input.getAttribute('data-file-list');
    const listEl = listId ? document.getElementById(listId) : null;
    if (!listEl) return;

    listEl.innerHTML = '';
    Array.from(input.files).forEach((file) => {
      const li = document.createElement('li');
      li.className = 'pr-file-list__item';
      li.textContent = `${file.name} (${formatBytes(file.size)})`;
      listEl.appendChild(li);
    });
  }

  function initPaymentPlaceholder() {
    if (!paymentBanner || !config) return;

    const params = new URLSearchParams(window.location.search);
    const paymentRef = params.get(config.PAYMENT.returnParam);
    const paymentStatus = params.get(config.PAYMENT.statusParam);

    if (config.PAYMENT.enabled && paymentRef) {
      paymentBanner.hidden = false;
      paymentBanner.classList.add('pr-payment-banner--paid');
      paymentBanner.innerHTML =
        `<strong>تم تأكيد الدفع</strong><span>رقم العملية: ${escapeHtml(paymentRef)}</span>`;
      setHiddenField('paymentReference', paymentRef);
      setHiddenField('paymentStatus', paymentStatus || 'paid');
      return;
    }

    if (config.PAYMENT.enabled) {
      paymentBanner.hidden = false;
      paymentBanner.classList.add('pr-payment-banner--pending');
      paymentBanner.innerHTML =
        '<strong>الدفع مطلوب</strong><span>سيتم تفعيل بوابة الدفع قريباً. أكمل النموذج بعد الدفع.</span>';
      setHiddenField('paymentStatus', 'pending');
      return;
    }

    paymentBanner.hidden = false;
    paymentBanner.classList.add('pr-payment-banner--info');
    paymentBanner.innerHTML =
      '<strong>الخطوة التالية: الدفع</strong><span>بعد إرسال الطلب سنتواصل معك. بوابة الدفع الإلكتروني قيد التجهيز.</span>';
    setHiddenField('paymentStatus', 'not_required');
  }

  function setHiddenField(name, value) {
    let input = form.querySelector(`input[name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    submitBtn.textContent = isLoading ? SUBMIT_LABEL_LOADING : SUBMIT_LABEL_DEFAULT;
  }

  async function onSubmit(event) {
    event.preventDefault();
    clearError();

    const formData = new FormData(form);
    const validationError = validateForm(formData);
    if (validationError) {
      showError(validationError);
      return;
    }

    const projectRequestService = service();
    if (!projectRequestService?.submitProjectRequest) {
      showError('خدمة الإرسال غير متاحة. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      return;
    }

    setLoading(true);

    try {
      const result = await projectRequestService.submitProjectRequest(formData);

      sessionStorage.setItem(config.SESSION_KEYS.lastRequestNumber, result.requestNumber);
      sessionStorage.setItem(config.SESSION_KEYS.lastSubmissionId, result.id);
      window.location.href = 'success/index.html';
    } catch (err) {
      console.error('[RWPST] Project request submission failed:', err);
      showError(mapErrorMessage(err));
      setLoading(false);
    }
  }

  function mapErrorMessage(err) {
    const message = err?.message || '';
    if (message.includes('anon key')) {
      return 'النظام قيد الإعداد. يرجى المحاولة لاحقاً أو التواصل عبر واتساب.';
    }
    if (message.includes('request number') || message.includes('Invalid response')) {
      return 'تعذر إنشاء رقم الطلب. يرجى المحاولة مرة أخرى.';
    }
    if (message.startsWith('يرجى')) {
      return message;
    }
    return 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.';
  }

  function validateForm(formData) {
    const required = [
      ['fullName', 'يرجى إدخال الاسم الكامل'],
      ['phone', 'يرجى إدخال رقم الهاتف'],
      ['businessName', 'يرجى إدخال اسم النشاط'],
      ['businessDescription', 'يرجى إدخال وصف النشاط'],
    ];

    for (const [field, message] of required) {
      if (!trim(formData.get(field))) return message;
    }

    if (!formData.get('businessType')) return 'يرجى اختيار نوع النشاط';
    if (formData.get('businessType') === 'other' && !trim(formData.get('businessTypeOther'))) {
      return 'يرجى تحديد نوع النشاط';
    }
    if (!formData.get('videoGoal')) return 'يرجى اختيار هدف الفيديو';

    const phone = trim(formData.get('phone'));
    if (!/^[\d\s+()-]{8,20}$/.test(phone)) return 'يرجى إدخال رقم هاتف صحيح';

    for (const [field, label] of [
      ['facebookUrl', 'فيسبوك'],
      ['instagramUrl', 'انستغرام'],
      ['websiteUrl', 'الموقع'],
    ]) {
      const value = trim(formData.get(field));
      if (value && !isValidUrl(value)) return `رابط ${label} غير صحيح`;
    }

    const logo = formData.get('logo');
    if (logo && logo.size > MAX_FILE_SIZE) {
      return `حجم الشعار يتجاوز الحد المسموح (${formatBytes(MAX_FILE_SIZE)})`;
    }

    for (const field of ['images', 'videos']) {
      const fileList = formData.getAll(field);
      for (const file of fileList) {
        if (file.size > MAX_FILE_SIZE) {
          return `الملف "${file.name}" يتجاوز الحد المسموح (${formatBytes(MAX_FILE_SIZE)})`;
        }
      }
    }

    return null;
  }

  function trim(value) {
    return String(value || '').trim();
  }

  function isValidUrl(value) {
    const v = trim(value);
    if (!v) return true;
    const normalized = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      const url = new URL(normalized);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.hidden = false;
    formError.focus();
  }

  function clearError() {
    if (!formError) return;
    formError.hidden = true;
    formError.textContent = '';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
