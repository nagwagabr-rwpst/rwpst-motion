/**
 * RWPST MOTION — Project Request Service (Supabase RPC + Storage)
 *
 * Isolated service layer for project request submission.
 * Swap this implementation for a Django API client without changing form UI code.
 */
(function () {
  'use strict';

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

  const ALLOWED_MIME_TYPES = {
    logo: new Set(['image/jpeg', 'image/png', 'image/webp']),
    image: new Set(['image/jpeg', 'image/png', 'image/webp']),
    video: new Set(['video/mp4', 'video/quicktime']),
  };

  const STORAGE_FOLDERS = {
    logo: 'logos',
    image: 'images',
    video: 'videos',
  };

  const FILE_TYPE_LABELS = {
    logo: 'الشعار',
    image: 'الصورة',
    video: 'الفيديو',
  };

  let supabaseClient = null;

  function getEnv() {
    const env = window.RWPST_SUPABASE;
    if (!env?.url || !env?.anonKey) {
      throw new Error('Supabase configuration is missing.');
    }
    if (env.anonKey === 'USE_ENV_PLACEHOLDER') {
      throw new Error('Supabase anon key is not configured. Set it in assets/js/supabase-env.js');
    }
    return env;
  }

  function getBucket() {
    return getEnv().storageBucket || 'project-assets';
  }

  function getClient() {
    if (supabaseClient) return supabaseClient;
    if (!window.supabase?.createClient) {
      throw new Error('Supabase client library is not loaded.');
    }
    const env = getEnv();
    supabaseClient = window.supabase.createClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return supabaseClient;
  }

  function trim(value) {
    return String(value || '').trim();
  }

  function normalizeUrl(value) {
    const v = trim(value);
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  }

  const RPC_VALIDATION_MESSAGES = {
    full_name: 'يرجى إدخال الاسم الكامل',
    phone: 'يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)',
    business_name: 'يرجى إدخال اسم النشاط',
    business_type: 'يرجى اختيار نوع النشاط',
    business_type_other: 'يرجى تحديد نوع النشاط',
    business_description: 'يرجى إدخال وصف النشاط',
    video_goal: 'يرجى اختيار هدف الفيديو',
    customer_name: 'من فضلك أدخل اسم العميل.',
    whatsapp: 'من فضلك أدخل رقم واتساب صحيح.',
    city: 'من فضلك أدخل المحافظة أو المدينة.',
    email: 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.',
    video_type: 'من فضلك اختر نوع الفيديو.',
    video_description: 'وصف الفيديو طويل جدًا.',
    notes: 'الملاحظات طويلة جدًا.',
  };

  function mapRpcError(message) {
    const match = String(message || '').match(/VALIDATION:([^:]+):/);
    if (match && RPC_VALIDATION_MESSAGES[match[1]]) {
      return RPC_VALIDATION_MESSAGES[match[1]];
    }
    return message || 'Failed to submit project request';
  }

  function isFile(value) {
    return typeof File !== 'undefined' && value instanceof File && value.size > 0;
  }

  function sanitizeFileName(name) {
    const base = String(name || 'file').split(/[/\\]/).pop() || 'file';
    const lastDot = base.lastIndexOf('.');
    const hasExtension = lastDot > 0 && lastDot < base.length - 1;
    const stem = hasExtension ? base.slice(0, lastDot) : base;
    const extension = hasExtension ? base.slice(lastDot) : '';

    // Keep storage object keys ASCII-safe to avoid Supabase InvalidKey errors.
    const safeStem = stem.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const normalizedStem = safeStem.replace(/_+/g, '_').replace(/^[_.-]+|[_.-]+$/g, '') || 'file';

    return `${normalizedStem.slice(0, 180)}${extension}`;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  }

  function validateFile(file, fileType) {
    const label = FILE_TYPE_LABELS[fileType] || 'الملف';

    if (!isFile(file)) {
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `حجم ${label} "${file.name}" يتجاوز الحد المسموح (${formatBytes(MAX_FILE_SIZE)})`;
    }

    const allowed = ALLOWED_MIME_TYPES[fileType];
    if (!allowed?.has(file.type)) {
      return `نوع ${label} "${file.name}" غير مدعوم. الأنواع المسموحة: ${
        fileType === 'video' ? 'MP4, MOV' : 'JPG, PNG, WEBP'
      }`;
    }

    return null;
  }

  function collectFilesFromForm(formData) {
    const items = [];

    const logo = formData.get('logo');
    if (isFile(logo)) {
      items.push({ file: logo, fileType: 'logo' });
    }

    formData.getAll('images').forEach((file) => {
      if (isFile(file)) {
        items.push({ file, fileType: 'image' });
      }
    });

    formData.getAll('videos').forEach((file) => {
      if (isFile(file)) {
        items.push({ file, fileType: 'video' });
      }
    });

    return items;
  }

  function buildStoragePath(requestId, fileType, fileName) {
    const folder = STORAGE_FOLDERS[fileType];
    const uniquePrefix =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `${folder}/${requestId}/${uniquePrefix}-${sanitizeFileName(fileName)}`;
  }

  function getPublicUrl(client, filePath) {
    const { data } = client.storage.from(getBucket()).getPublicUrl(filePath);
    return data?.publicUrl || null;
  }

  async function uploadFileToStorage(client, requestId, file, fileType) {
    const filePath = buildStoragePath(requestId, fileType, file.name);

    const { error } = await client.storage.from(getBucket()).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      throw new Error(`فشل رفع الملف "${file.name}": ${error.message}`);
    }

    const fileUrl = getPublicUrl(client, filePath);
    if (!fileUrl) {
      throw new Error(`تعذر إنشاء رابط عام للملف "${file.name}"`);
    }

    return { filePath, fileUrl };
  }

  async function insertRequestFile(client, requestId, file, fileType, filePath, fileUrl) {
    const { error } = await client.rpc('insert_request_file', {
      p_request_id: requestId,
      p_file_type: fileType,
      p_file_name: file.name,
      p_file_url: fileUrl,
      p_mime_type: file.type,
      p_file_size: file.size,
    });

    if (error) {
      throw new Error(`فشل حفظ بيانات الملف "${file.name}": ${error.message}`);
    }
  }

  async function removeStorageObjects(client, paths) {
    if (!paths.length) return;

    const { error } = await client.storage.from(getBucket()).remove(paths);
    if (error) {
      console.error('[RWPST] Storage cleanup failed:', error);
    }
  }

  async function rollbackRequest(client, requestId, uploadedPaths) {
    await removeStorageObjects(client, uploadedPaths);

    const { error } = await client.rpc('rollback_project_request', {
      p_request_id: requestId,
    });

    if (error) {
      console.error('[RWPST] Request rollback failed:', error);
      throw new Error('فشل التراجع عن الطلب بعد خطأ في رفع الملفات. يرجى التواصل مع الدعم.');
    }
  }

  async function uploadAndRecordFiles(client, requestId, fileItems) {
    const uploadedPaths = [];

    try {
      for (const { file, fileType } of fileItems) {
        const { filePath, fileUrl } = await uploadFileToStorage(client, requestId, file, fileType);
        uploadedPaths.push(filePath);

        await insertRequestFile(client, requestId, file, fileType, filePath, fileUrl);
      }
    } catch (err) {
      await rollbackRequest(client, requestId, uploadedPaths);
      throw err;
    }
  }

  /**
   * Submit project request via Supabase RPC, then upload assets to Storage.
   * @param {FormData} formData
   * @returns {Promise<{ id: string, requestNumber: string }>}
   */
  async function submitProjectRequest(formData) {
    const client = getClient();

    const fileItems = collectFilesFromForm(formData);
    for (const { file, fileType } of fileItems) {
      const validationError = validateFile(file, fileType);
      if (validationError) {
        throw new Error(validationError);
      }
    }

    const businessType = trim(formData.get('businessType'));
    const businessTypeOther = businessType === 'other' ? trim(formData.get('businessTypeOther')) : null;

    // Step 1: Create request via RPC
    const { data, error } = await client.rpc('create_project_request', {
      p_full_name: trim(formData.get('fullName')),
      p_phone: trim(formData.get('phone')),
      p_business_name: trim(formData.get('businessName')) || null,
      p_business_type: businessType || null,
      p_business_type_other: businessTypeOther,
      p_business_description: trim(formData.get('businessDescription')),
      p_facebook: normalizeUrl(formData.get('facebookUrl')),
      p_instagram: normalizeUrl(formData.get('instagramUrl')),
      p_website: normalizeUrl(formData.get('websiteUrl')),
      p_video_goal: trim(formData.get('videoGoal')),
      p_additional_notes: trim(formData.get('additionalNotes')) || null,
      p_payment_status: trim(formData.get('paymentStatus')) || 'not_required',
      p_payment_reference: trim(formData.get('paymentReference')) || null,
      p_payment_package: trim(formData.get('paymentPackage')) || null,
    });

    if (error) {
      throw new Error(mapRpcError(error.message));
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.id || !result?.request_number) {
      throw new Error('Invalid response from server');
    }

    const requestId = result.id;

    // Steps 2–4: Upload files → public URLs → request_files rows
    if (fileItems.length > 0) {
      await uploadAndRecordFiles(client, requestId, fileItems);
    }

    return {
      id: requestId,
      requestNumber: result.request_number,
    };
  }

  const TRIAL_IMAGE_MIME = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  const MAX_TRIAL_IMAGES = 8;

  function fileExtension(name) {
    const base = String(name || '').split(/[/\\]/).pop() || '';
    const dot = base.lastIndexOf('.');
    if (dot <= 0 || dot === base.length - 1) return '';
    return base.slice(dot + 1).toLowerCase();
  }

  function prepareTrialImage(file) {
    const ext = fileExtension(file.name);
    const mime = TRIAL_IMAGE_MIME[ext];
    const label = `نوع الصورة "${file.name}" غير مدعوم. الأنواع المسموحة: JPG, PNG, WEBP`;

    if (!mime || /\.(exe|bat|cmd|com|msi|js|mjs|html?|svg|php|sh|ps1|dll)(\.|$)/i.test(file.name)) {
      throw new Error(label);
    }

    const declared = file.type || '';
    const jpegAlias = mime === 'image/jpeg' && (declared === 'image/jpg' || declared === 'image/pjpeg');
    if (declared && declared !== 'application/octet-stream' && declared !== mime && !jpegAlias) {
      throw new Error(label);
    }

    if (file.type === mime) return file;
    return new File([file], file.name, { type: mime, lastModified: file.lastModified });
  }

  /**
   * Submit the 199 EGP restaurant trial order.
   * Price and offer type are fixed inside create_trial_order — the client cannot set them.
   * @param {object} fields
   * @param {File[]} files
   * @param {(progress: {phase: string, current: number, total: number, name?: string}) => void} [onProgress]
   * @returns {Promise<{ id: string, requestNumber: string }>}
   */
  async function submitTrialOrder(fields, files, onProgress) {
    const client = getClient();
    const imageFiles = (files || []).filter(isFile).map(prepareTrialImage);

    if (!imageFiles.length) {
      throw new Error('من فضلك ارفع صورة واحدة على الأقل.');
    }

    if (imageFiles.length > MAX_TRIAL_IMAGES) {
      throw new Error('يمكنك رفع 8 صور كحد أقصى.');
    }

    for (const file of imageFiles) {
      const validationError = validateFile(file, 'image');
      if (validationError) throw new Error(validationError);
    }

    const notify = typeof onProgress === 'function' ? onProgress : () => {};
    notify({ phase: 'saving', current: 0, total: imageFiles.length });

    const email = trim(fields.email);
    const description = trim(fields.videoDescription);
    const notes = trim(fields.notes);

    const { data, error } = await client.rpc('create_trial_order', {
      p_customer_name: trim(fields.customerName),
      p_business_name: trim(fields.businessName),
      p_whatsapp: trim(fields.whatsapp),
      p_city: trim(fields.city),
      p_email: email || null,
      p_business_type: 'restaurant',
      p_video_type: trim(fields.videoType) || 'dish_ad',
      p_video_description: description || null,
      p_has_script_or_idea: fields.hasScriptOrIdea === true,
      p_notes: notes || null,
    });

    if (error) {
      throw new Error(mapRpcError(error.message));
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.id || !result?.request_number) {
      throw new Error('Invalid response from server');
    }

    const requestId = result.id;
    const uploadedPaths = [];

    try {
      for (let index = 0; index < imageFiles.length; index += 1) {
        const file = imageFiles[index];
        notify({
          phase: 'uploading',
          current: index + 1,
          total: imageFiles.length,
          name: file.name,
        });

        const { filePath, fileUrl } = await uploadFileToStorage(client, requestId, file, 'image');
        uploadedPaths.push(filePath);
        await insertRequestFile(client, requestId, file, 'image', filePath, fileUrl);
      }
    } catch (err) {
      await rollbackRequest(client, requestId, uploadedPaths);
      throw err;
    }

    notify({ phase: 'done', current: imageFiles.length, total: imageFiles.length });

    return {
      id: requestId,
      requestNumber: result.request_number,
    };
  }

  window.RWPST_ProjectRequestService = {
    submitProjectRequest,
    submitTrialOrder,
  };
})();
