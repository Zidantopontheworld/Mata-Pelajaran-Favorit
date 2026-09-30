/**
 * Code.gs - backend Google Apps Script untuk survei "Mata Pelajaran Favorit".
 * Letakkan di dalam Google Sheet (Extensions > Apps Script).
 *
 *   POST -> doPost(e)  menambah satu baris jawaban
 *   GET  -> doGet(e)   mengirim data ringkas (mapel + rating) untuk papan skor
 *
 * Tab dan baris judul dibuat OTOMATIS kalau belum ada, jadi tidak perlu disiapkan manual.
 * Setelah mengubah file ini: Deploy > Manage deployments > pensil > Version: New version > Deploy.
 */

var SHEET_NAME = 'Favorite Subject';
var HEADERS = ['Timestamp', 'Name', 'Class', 'FavoriteSubject', 'Rating', 'Note'];
var LIMITS = { name: 40, className: 20, subject: 60, note: 200 };

/** Ambil tab data; buat tab + baris judul kalau belum ada. */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonReply_(object) {
  return ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanText_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Cegah teks diawali = + - @ dibaca sebagai rumus spreadsheet. */
function safeCell_(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function validate_(d) {
  if (!d.name) return 'Name is required.';
  if (d.name.length > LIMITS.name) return 'Name is too long.';
  if (!d.className) return 'Class is required.';
  if (d.className.length > LIMITS.className) return 'Class is too long.';
  if (!d.favoriteSubject) return 'Favorite subject is required.';
  if (d.favoriteSubject.length > LIMITS.subject) return 'Subject is too long.';
  if (d.note.length > LIMITS.note) return 'Note is too long.';
  if (d.rating !== '' && !/^[1-5]$/.test(d.rating)) return 'Rating must be 1 to 5 or empty.';
  return '';
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var raw = JSON.parse(e.postData.contents);
    var d = {
      name: cleanText_(raw.name),
      className: cleanText_(raw.className),
      favoriteSubject: cleanText_(raw.favoriteSubject),
      rating: raw.rating === null || raw.rating === undefined ? '' : cleanText_(raw.rating),
      note: cleanText_(raw.note)
    };
    var problem = validate_(d);
    if (problem) return jsonReply_({ ok: false, error: problem });

    var sheet = getSheet_();
    var row = sheet.getLastRow() + 1;
    var range = sheet.getRange(row, 1, 1, 6);
    range.setNumberFormat('@'); // simpan sebagai teks
    range.setValues([[new Date().toISOString(), safeCell_(d.name), safeCell_(d.className),
      d.favoriteSubject, d.rating, safeCell_(d.note)]]);
    SpreadsheetApp.flush();
    return jsonReply_({ ok: true });
  } catch (err) {
    return jsonReply_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** GET: hanya mapel + rating + waktu (tanpa nama), cukup untuk papan skor. */
function doGet(e) {
  try {
    var sheet = getSheet_();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return jsonReply_({ ok: true, students: [] });
    var rows = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    var students = rows
      .filter(function (r) { return String(r[3]) !== ''; })
      .map(function (r) {
        var rating = Number(r[4]);
        return {
          timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
          favoriteSubject: String(r[3]),
          rating: rating >= 1 && rating <= 5 ? rating : null
        };
      });
    return jsonReply_({ ok: true, students: students });
  } catch (err) {
    return jsonReply_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}
