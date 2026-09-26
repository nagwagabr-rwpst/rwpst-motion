/**
 * RWPST MOTION — 199 EGP restaurant trial order form
 */
(function () {
  'use strict';

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_IMAGES = 8;
  const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);
  const SUBMIT_LABEL = 'إرسال طلب الفيديو';

  const form = document.getElementById('trialOrderForm');
  const submitBtn = document.getElementById('submitBtn');
  const formError = document.getElementById('formError');
  const fileInput = document.getElementById('dishImages');
  const fileList = document.getElementById('dishFileList');
  const progress = document.getElementById('orderProgress');
  const progressText = document.getElementById('orderProgressText');
  const progressFill = document.getElementById('orderProgressFill');

  /** @type {{ file: File, previewUrl: string }[]} */
  let selected = [];

  function init() {
    if (!form) return;
    setYear();
    initHeaderScroll();
    fileInput?.addEventListener('change', onFilesPicked);
    fileList?.addEventListener('click', onRemoveClick);
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

  function onFilesPicked() {
    const incoming = Array.from(fileInput.files || []);
    fileInput.value = '';
    clearError();

    for (const file of incoming) {
      if (selected.length >= MAX_IMAGES) {
        showError('يمكنك رفع 8 صور كحد أقصى.', 'dishImages');
        break;
      }
      const error = validateImage(file);
      if (error) {
        showError(error, 'dishImages');
        continue;
      }
      selected.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    renderFiles();
  }

  function onRemoveClick(event) {
    const button = event.target.closest('[data-remove-index]');
    if (!button) return;
    const index = Number(button.getAttribute('data-remove-index'));
    const item = selected[index];
    if (!item) return;
    URL.revokeObjectURL(item.previewUrl);
    selected.splice(index, 1);
    clearError();
    renderFiles();
  }

  function renderFiles() {
    if (!fileList) return;
    fileList.replaceChildren();

    selected.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'order-file';

      const img = document.createElement('img');
      img.className = 'order-file__preview';
      img.src = item.previewUrl;
      img.alt = '';

      const meta = document.createElement('div');
      meta.className = 'order-file__meta';

      const name = document.createElement('span');
      name.className = 'order-file__name';
      name.textContent = item.file.name;

      const size = document.createElement('span');
      size.className = 'order-file__size';
      size.textContent = formatBytes(item.file.size);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'order-file__remove';
      remove.setAttribute('data-remove-index', String(index));
      remove.textContent = 'حذف';
      remove.setAttribute('aria-label', `حذف ${item.file.name}`);

      meta.append(name, size);
      li.append(img, meta, remove);
      fileList.appendChild(li);
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    clearError();

    const fields = readFields();
    const validation = validateFields(fields, selected);
    if (validation) {
      showError(validation.message, validation.fieldId);
      return;
    }

    const service = window.RWPST_ProjectRequestService;
    if (!service?.submitTrialOrder) {
      showError('خدمة الإرسال غير متاحة. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      return;
    }

    setLoading(true);

    try {
      const result = await service.submitTrialOrder(
        {
          customerName: fields.customerName,
          businessName: fields.businessName,
          whatsapp: normalizeWhatsApp(fields.whatsapp),
          city: fields.city,
          email: fields.email,
          videoType: fields.videoType,
          videoDescription: fields.videoDescription,
          hasScriptOrIdea: fields.hasScript === 'yes',
          notes: fields.notes,
        },
        selected.map((item) => item.file),
        updateProgress
      );

      sessionStorage.setItem('rwpst_last_request_number', result.requestNumber);
      sessionStorage.setItem('rwpst_last_submission_id', result.id);
      window.location.href = '../order-success/';
    } catch (err) {
      console.error('[RWPST] Trial order submission failed:', err);
      showError(mapErrorMessage(err));
      setLoading(false);
      hideProgress();
    }
  }

  function readFields() {
    const data = new FormData(form);
    return {
      customerName: trim(data.get('customerName')),
      businessName: trim(data.get('businessName')),
      whatsapp: trim(data.get('whatsapp')),
      city: trim(data.get('city')),
      email: trim(data.get('email')),
      videoType: trim(data.get('videoType')),
      videoDescription: trim(data.get('videoDescription')),
      hasScript: trim(data.get('hasScript')) || 'no',
      notes: trim(data.get('notes')),
    };
  }

  function validateFields(fields, files) {
    if (!fields.customerName) {
      return { message: 'من فضلك أدخل اسم العميل.', fieldId: 'customerName' };
    }
    if (!fields.businessName) {
      return { message: 'من فضلك أدخل اسم المطعم.', fieldId: 'businessName' };
    }
    if (!fields.whatsapp) {
      return { message: 'من فضلك أضف رقم واتساب.', fieldId: 'whatsapp' };
    }
    if (!normalizeWhatsApp(fields.whatsapp)) {
      return { message: 'من فضلك أدخل رقم واتساب صحيح.', fieldId: 'whatsapp' };
    }
    if (!fields.city) {
      return { message: 'من فضلك أدخل المحافظة أو المدينة.', fieldId: 'city' };
    }
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      return { message: 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.', fieldId: 'email' };
    }
    if (!fields.videoType) {
      return { message: 'من فضلك اختر نوع الفيديو.', fieldId: 'videoTypeDish' };
    }
    if (!files.length) {
      return { message: 'من فضلك ارفع صورة واحدة على الأقل.', fieldId: 'dishImages' };
    }
    for (const item of files) {
      const imageError = validateImage(item.file);
      if (imageError) return { message: imageError, fieldId: 'dishImages' };
    }
    return null;
  }

  function mimeMatchesExtension(ext, mime) {
    if (!mime || mime === 'application/octet-stream') return true;
    if (ext === 'jpg' || ext === 'jpeg') {
      return mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/pjpeg';
    }
    if (ext === 'png') return mime === 'image/png';
    if (ext === 'webp') return mime === 'image/webp';
    return false;
  }

  function validateImage(file) {
    const ext = fileExtension(file.name);
    const mime = file.type || '';

    if (!ALLOWED_EXT.has(ext) || !mimeMatchesExtension(ext, mime) || /\.(exe|bat|cmd|com|msi|js|html?|svg|php)$/i.test(file.name)) {
      return 'صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP.';
    }
    if (!file.size) {
      return 'الملف فارغ. اختر صورة أخرى.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `حجم الصورة "${file.name}" أكبر من 10 ميجا.`;
    }
    return null;
  }

  function normalizeWhatsApp(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (/^01[0125]\d{8}$/.test(digits)) digits = `20${digits.slice(1)}`;
    return /^20(10|11|12|15)\d{8}$/.test(digits) ? digits : '';
  }

  function fileExtension(name) {
    const base = String(name || '').split(/[/\\]/).pop() || '';
    const dot = base.lastIndexOf('.');
    if (dot <= 0 || dot === base.length - 1) return '';
    return base.slice(dot + 1).toLowerCase();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  }

  function updateProgress(state) {
    if (!progress || !progressText || !progressFill) return;
    progress.hidden = false;

    if (state.phase === 'saving') {
      progressText.textContent = 'جاري إرسال الطلب...';
      progressFill.style.width = '18%';
      return;
    }

    if (state.phase === 'uploading') {
      const ratio = state.total ? state.current / state.total : 1;
      progressText.textContent = `جاري رفع الصور (${state.current} من ${state.total})...`;
      progressFill.style.width = `${Math.max(18, Math.round(ratio * 100))}%`;
      return;
    }

    progressText.textContent = 'تم الإرسال';
    progressFill.style.width = '100%';
  }

  function hideProgress() {
    if (!progress) return;
    progress.hidden = true;
    if (progressFill) progressFill.style.width = '0';
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    submitBtn.textContent = isLoading ? 'جاري الإرسال...' : SUBMIT_LABEL;
  }

  function mapErrorMessage(err) {
    const message = err?.message || '';
    if (
      message.startsWith('من فضلك') ||
      message.startsWith('حجم') ||
      message.startsWith('نوع') ||
      message.startsWith('فشل') ||
      message.startsWith('يمكنك') ||
      message.startsWith('صيغة') ||
      message.startsWith('يرجى') ||
      message.startsWith('وصف') ||
      message.startsWith('الملاحظات')
    ) {
      return message;
    }
    if (/create_trial_order|schema cache|Could not find the function|PGRST202/i.test(message)) {
      return 'تعذر حفظ الطلب لأن إعداد استقبال الطلبات لم يكتمل بعد. تواصل معنا على واتساب.';
    }
    return 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.';
  }

  function showError(message, fieldId) {
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });

    let focusedField = false;
    if (fieldId && fieldId !== 'dishImages') {
      const field = document.getElementById(fieldId);
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
        focusedField = true;
      }
    }

    if (!formError) return;
    formError.textContent = message;
    formError.hidden = false;
    if (!focusedField) formError.focus();
  }

  function clearError() {
    if (!formError) return;
    formError.hidden = true;
    formError.textContent = '';
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  }

  function trim(value) {
    return String(value || '').trim();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
