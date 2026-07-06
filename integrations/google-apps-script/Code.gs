/**
 * RWPST MOTION — Project Request → Google Sheets + Telegram
 *
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 * Set Script Properties: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WEBHOOK_SECRET (optional).
 *
 * @see integrations/google-apps-script/DEPLOYMENT.md
 */

var SHEET_NAME = 'Project Requests';
var COUNTER_KEY = 'LAST_REQUEST_NUMBER';
var REQUEST_PREFIX = 'RWPST';

/**
 * One-time setup: Extensions → Apps Script → Run setupSheet (authorize when prompted).
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  var headers = [
    'Request Number',
    'Submission ID',
    'Submitted At',
    'Full Name',
    'Phone',
    'Business Name',
    'Business Type',
    'Business Type Other',
    'Business Description',
    'Facebook',
    'Instagram',
    'Website',
    'Video Goal',
    'Video Goal Key',
    'Additional Notes',
    'Payment Status',
    'Payment Reference',
    'Payment Package',
    'Logo File',
    'Image Files',
    'Video Files',
    'Image Count',
    'Video Count',
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function doPost(e) {
  try {
    var body = parseRequestBody(e);
    verifySecret(body.secret);

    var row = body.row || {};
    var requestNumber = getNextRequestNumber();
    var submittedAt = row.submitted_at || new Date().toISOString();

    appendRow(requestNumber, submittedAt, row);
    notifyTelegram(requestNumber, submittedAt, row);

    return jsonResponse({
      ok: true,
      requestNumber: requestNumber,
      submissionId: row.submission_id || '',
      submittedAt: submittedAt,
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: String(err.message || err),
    });
  }
}

function doGet(e) {
  return jsonResponse({
    ok: true,
    service: 'RWPST Project Request Webhook',
    status: 'ready',
  });
}

function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Empty request body');
  }
  return JSON.parse(e.postData.contents);
}

function verifySecret(providedSecret) {
  var expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!expected) {
    return;
  }
  if (providedSecret !== expected) {
    throw new Error('Unauthorized');
  }
}

function getNextRequestNumber() {
  var props = PropertiesService.getScriptProperties();
  var last = parseInt(props.getProperty(COUNTER_KEY) || '0', 10);
  var next = last + 1;
  props.setProperty(COUNTER_KEY, String(next));
  var year = new Date().getFullYear();
  return REQUEST_PREFIX + '-' + year + '-' + padNumber(next, 4);
}

function padNumber(num, width) {
  var str = String(num);
  while (str.length < width) {
    str = '0' + str;
  }
  return str;
}

function appendRow(requestNumber, submittedAt, row) {
  var sheet = getOrCreateSheet();
  var imageFiles = row.image_files || '';
  var videoFiles = row.video_files || '';

  sheet.appendRow([
    requestNumber,
    row.submission_id || '',
    submittedAt,
    row.full_name || '',
    row.phone || '',
    row.business_name || '',
    row.business_type || '',
    row.business_type_other || '',
    row.business_description || '',
    row.facebook || '',
    row.instagram || '',
    row.website || '',
    row.video_goal || '',
    row.video_goal_key || '',
    row.additional_notes || '',
    row.payment_status || '',
    row.payment_reference || '',
    row.payment_package || '',
    row.logo_file || '',
    imageFiles,
    videoFiles,
    row.image_count || 0,
    row.video_count || 0,
  ]);
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  return sheet;
}

function notifyTelegram(requestNumber, submittedAt, row) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return;
  }

  var lines = [
    '<b>طلب مشروع جديد — RWPST MOTION</b>',
    '',
    '<b>رقم الطلب:</b> ' + escapeHtml(requestNumber),
    '<b>التاريخ:</b> ' + escapeHtml(submittedAt),
    '<b>الاسم:</b> ' + escapeHtml(row.full_name || ''),
    '<b>الهاتف:</b> ' + escapeHtml(row.phone || ''),
    '<b>النشاط:</b> ' + escapeHtml(row.business_name || ''),
    '<b>النوع:</b> ' + escapeHtml(row.business_type || ''),
    '<b>هدف الفيديو:</b> ' + escapeHtml(row.video_goal || ''),
  ];

  if (row.additional_notes) {
    lines.push('<b>ملاحظات:</b> ' + escapeHtml(row.additional_notes));
  }

  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
