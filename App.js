/**
 * app.js - all the JavaScript of the "Favorite Subject" website in ONE file.
 * (index.html has the page + design, this file has everything that "works".)
 *
 * ---------------------------------------------------------------------------
 *  STEP 1 - PASTE YOUR GOOGLE APPS SCRIPT LINK HERE
 *
 *  Paste the "Web app" URL between the quotes below. It ends with /exec and
 *  looks like:   https://script.google.com/macros/s/AKfy.../exec
 *
 *  - Keep the quotes. Paste the link only, with no spaces.
 *  - Left empty = test mode: profiles are saved in this browser only.
 * ---------------------------------------------------------------------------
 */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySRiu393UE59Lz3bJgVsNmu1XABN90C0hv3o4dEbCmlO4dCrb2_Cnm0oJ66Sp8MEqj/exec';

/* Everything below this line can stay exactly as it is. */

// ===========================================================================
// PART 1 - The official subject list
// ===========================================================================

/**
 * subjects.js - the ONE official list of school subjects.
 *
 * The dropdown, icons, colors and the validation all read this one list,
 * so they can never disagree.
 *
 * Each subject has:
 *   name     the official Indonesian name. This is what gets SAVED (in the file or the Google Sheet)
 *   en       the English name shown when the site language is English
 *   shortId  a shorter Indonesian label for small stickers and filter chips
 *   shortEn  a shorter English label for small stickers and filter chips
 *   icon     an emoji, color = sticker color
 *   aliases  other spellings we also understand (for example the old English names)
 */

(function (root) {
  'use strict';

  const SUBJECTS = [
    { id: 'religion',   name: 'Pendidikan Agama dan Budi Pekerti', en: 'Religious Education and Character',
      shortId: 'Agama', shortEn: 'Religion', icon: '🕊️', color: '#9BE8E8', aliases: ['Religion'] },
    { id: 'pancasila',  name: 'Pendidikan Pancasila', en: 'Pancasila Education',
      shortId: 'Pancasila', shortEn: 'Pancasila', icon: '🦅', color: '#FF7A93', aliases: [] },
    { id: 'indonesian', name: 'Bahasa Indonesia', en: 'Indonesian Language',
      shortId: 'B. Indonesia', shortEn: 'Indonesian', icon: '🌴', color: '#FF8A5C', aliases: ['Indonesian'] },
    { id: 'math',       name: 'Matematika', en: 'Mathematics',
      shortId: 'Matematika', shortEn: 'Math', icon: '🧮', color: '#4CC3FF', aliases: ['Math'] },
    { id: 'advmath',    name: 'Matematika Tingkat Lanjut', en: 'Advanced Mathematics',
      shortId: 'Mat. Lanjut', shortEn: 'Adv. Math', icon: '➗', color: '#33D6C7', aliases: [] },
    { id: 'english',    name: 'Bahasa Inggris', en: 'English',
      shortId: 'B. Inggris', shortEn: 'English', icon: '📖', color: '#C58BFF', aliases: [] },
    { id: 'advenglish', name: 'Bahasa Inggris Tingkat Lanjut', en: 'Advanced English',
      shortId: 'B. Inggris Lanjut', shortEn: 'Adv. English', icon: '📚', color: '#FF8AD8', aliases: [] },
    { id: 'pe',         name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)', en: 'Physical Education, Sports, and Health (PJOK)',
      shortId: 'PJOK', shortEn: 'PE', icon: '⚽', color: '#B5E655', aliases: ['PE', 'PJOK'] },
    { id: 'history',    name: 'Sejarah', en: 'History',
      shortId: 'Sejarah', shortEn: 'History', icon: '🏛️', color: '#FFB84D', aliases: [] },
    { id: 'art',        name: 'Seni Budaya / Prakarya dan Kewirausahaan (PKWU)', en: 'Arts & Culture / Crafts and Entrepreneurship (PKWU)',
      shortId: 'Seni Budaya / PKWU', shortEn: 'Arts & Crafts', icon: '🎨', color: '#FFD43B', aliases: ['Art', 'Arts', 'PKWU'] },
    { id: 'javanese',   name: 'Bahasa Jawa', en: 'Javanese Language',
      shortId: 'B. Jawa', shortEn: 'Javanese', icon: '🎭', color: '#E6C07B', aliases: [] },
    { id: 'geography',  name: 'Geografi', en: 'Geography',
      shortId: 'Geografi', shortEn: 'Geography', icon: '🌍', color: '#6FE0A0', aliases: [] },
    { id: 'sociology',  name: 'Sosiologi', en: 'Sociology',
      shortId: 'Sosiologi', shortEn: 'Sociology', icon: '👥', color: '#8AA9FF', aliases: [] },
    { id: 'economics',  name: 'Ekonomi', en: 'Economics',
      shortId: 'Ekonomi', shortEn: 'Economics', icon: '💰', color: '#FFCF33', aliases: [] },
  ];

  /**
   * Find a subject from whatever text we are given: the official name, the id,
   * the English name, a short label or an alias - ignoring upper/lower case.
   * Returns the subject object, or null if it is not one of ours.
   */
  function findSubject(value) {
    const wanted = String(value === null || value === undefined ? '' : value).trim().toLowerCase();
    if (!wanted) return null;
    return SUBJECTS.find((s) =>
      [s.name, s.id, s.en, s.shortId, s.shortEn, ...s.aliases].some((text) => text.toLowerCase() === wanted)
    ) || null;
  }

  root.FSSubjects = { SUBJECTS, findSubject };
})(window);

// ===========================================================================
// PART 2 - Language (Indonesian / English) and all texts
// ===========================================================================

/**
 * i18n.js - the language setting ("internationalization").
 *
 * How it works, in three steps:
 *   1. Every piece of text lives in the STRINGS table below, once in English (en)
 *      and once in Indonesian (id), under a short key like "nav.home".
 *   2. In the HTML we mark text with   data-i18n="nav.home"
 *      or an attribute with            data-i18n-attr="placeholder:input.name.placeholder"
 *      and apply() fills them in with the chosen language.
 *   3. The chosen language is remembered in the browser (localStorage). When it
 *      changes, we announce a "fs:langchange" event so pages can redraw their
 *      dynamic parts (cards, stats, ...).
 *
 * In JavaScript use:  I18N.t('key')  or  I18N.t('key', { name: 'Sam' })  for {name} placeholders.
 */

const I18N = (() => {
  'use strict';

  const STORAGE_KEY = 'fs-lang';
  const LANGS = ['id', 'en'];

  const STRINGS = {
    en: {
      // ---- Navigation, badge, footer (all pages) ----
      'nav.label': 'Main',
      'nav.brand': 'Fav Subject',
      'nav.home': 'Home',
      'nav.fillIn': 'Fill In',
      'nav.profiles': 'Profiles',
      'skip': 'Skip to content',
      'lang.label': 'Language',
      'mode.title': 'Where profiles are saved',
      'mode.checking': 'Checking...',
      'mode.local': 'Saved in this browser only',
      'mode.sheets': 'Connected to Google Sheets',
      'mode.error': 'Google Sheets unreachable',
      'footer.home': 'Home',
      'footer.fill': 'Fill in your profile',
      'footer.all': 'See all profiles',

      // ---- Homepage ----
      'home.docTitle': 'Favorite Subject - Class Yearbook',
      'home.desc': "Tell the class your favorite school subject and see everyone else's profile card.",
      'home.kicker': '★ Class Yearbook Project ★',
      'home.title1': "What's your",
      'home.title2': 'Favorite',
      'home.title3': 'Subject?',
      'home.lead': 'Make your own profile card, rate your favorite class and tell us why you love it. Then meet the whole school in the gallery!',
      'home.ctaFill': 'Fill In Your Profile',
      'home.ctaSee': "See Everyone's Profiles",
      'stat.title': 'Live Scoreboard',
      'stat.students': 'Students so far',
      'stat.top': 'Most popular subject',
      'stat.rating': 'Average rating',
      'stat.pickedOne': '{n} student picked it',
      'stat.pickedMany': '{n} students picked it',
      'stat.first': 'Be the first to pick one!',
      'stat.error': 'Could not load the scoreboard right now. Please try again in a moment.',
      'how.title': 'How It Works',
      'how.1.title': 'Fill in the card',
      'how.1.text': 'Add your name, class and favorite subject. Rating and a note are optional.',
      'how.2.title': 'Get your profile',
      'how.2.text': 'Your card pops up in the gallery with a colorful avatar made from your initials.',
      'how.3.title': 'Meet the class',
      'how.3.text': 'Search, filter by subject and sort to find friends who love the same class.',
      'how.cta': 'Add my card',
      'footer.big': 'Made for our class ❤',
      'footer.small': 'A school project built with HTML, CSS, JavaScript and Google Sheets.',

      // ---- Input page ----
      'input.docTitle': 'Fill In Your Profile - Favorite Subject',
      'input.desc': 'Fill in your profile card: name, class, favorite subject, rating and a note.',
      'input.title1': 'Your Profile',
      'input.title2': 'Card',
      'input.lead': 'Two minutes, five little questions. Only the first three are required.',
      'input.tab': '★ My Profile Card',
      'input.required': 'required',
      'input.optional': 'optional',
      'input.name.label': "What's your name?",
      'input.name.placeholder': 'e.g. Aisyah Putri',
      'input.class.label': 'Which class are you in?',
      'input.class.placeholder': 'e.g. 7A or 8B',
      'input.subject.label': 'Your favorite subject',
      'input.subject.choose': 'Choose a subject...',
      'input.rating.label': 'How much do you like it?',
      'input.rating.hint': 'Tap a star, or skip this one.',
      'input.rating.chosen': '{n} out of 5 - nice!',
      'input.rating.clear': 'Clear rating',
      'input.rating.star1': '1 star',
      'input.rating.starN': '{n} stars',
      'input.note.label': 'Why do you like it?',
      'input.note.placeholder': 'Why do you like it?',
      'input.submit': 'Add me to the gallery!',
      'input.sending': 'Sending...',
      'input.lookAround': 'Just want to look around?',
      'input.seeGallery': 'See the profile gallery',
      'input.preview': 'Live preview',
      'input.preview.name': 'Your Name',
      'input.preview.class': '7A',
      'input.preview.subject': 'Subject',
      'input.preview.note': 'Your note will show up here.',
      'success.title': 'Woohoo, {name}!',
      'success.text': 'Your profile card is now in the gallery. Go say hi to the class!',
      'success.gallery': 'See the gallery',
      'success.another': 'Add another profile',
      'form.oops': 'Oops! {message}',

      // ---- Form and server error messages ----
      'err.name.required': 'Please tell us your name.',
      'err.name.tooLong': 'Name can be at most 40 characters.',
      'err.className.required': 'Please enter your class, like 7A.',
      'err.className.tooLong': 'Class can be at most 20 characters.',
      'err.subject.required': 'Please pick your favorite subject.',
      'err.subject.invalid': 'Please choose a subject from the list.',
      'err.note.tooLong': 'The note can be at most 200 characters.',
      'err.rating.invalid': 'The rating must be a whole number from 1 to 5.',
      'api.validation': 'Please fix the highlighted fields.',
      'api.rateLimited': 'Too many submissions. Please wait a minute and try again.',
      'api.unsupportedType': 'Something went wrong. Please try again.',
      'api.tooBig': 'That was too much text. Please shorten it.',
      'api.badJson': 'Something went wrong. Please try again.',
      'api.saveFailed': 'Your profile could not be saved. Please try again in a moment.',
      'api.loadFailed': 'Could not load the profiles right now.',
      'api.network': 'Could not reach Google Sheets. Please check your internet and try again.',
      'api.generic': 'Something went wrong. Please try again.',

      // ---- Gallery page ----
      'profiles.docTitle': 'Profile Gallery - Favorite Subject',
      'profiles.desc': "Meet the class! Every student's favorite subject as a profile card.",
      'profiles.title1': 'Meet The',
      'profiles.title2': 'Class',
      'profiles.lead': "Everyone's favorite subject in one place. Tap a card to see the full profile.",
      'profiles.searchLabel': 'Search by name',
      'profiles.searchPlaceholder': 'Search by name...',
      'profiles.sortBy': 'Sort by',
      'profiles.sort.newest': 'Newest first',
      'profiles.sort.name': 'Name A-Z',
      'profiles.sort.rating': 'Highest rated',
      'profiles.chipsLabel': 'Filter by favorite subject',
      'profiles.all': 'All',
      'profiles.showingOne': 'Showing {shown} of {total} profile',
      'profiles.showingMany': 'Showing {shown} of {total} profiles',
      'profiles.loading': 'Loading profiles',
      'profiles.empty.title': 'No profiles yet, be the first!',
      'profiles.empty.text': 'The gallery is waiting for its very first card.',
      'profiles.empty.cta': 'Fill in your profile',
      'profiles.none.title': 'Nobody matches that',
      'profiles.none.text': 'Try a different name or pick another subject.',
      'profiles.none.cta': 'Show everyone',
      'profiles.error.title': 'Could not load the profiles',
      'profiles.error.text': 'Something went wrong talking to Google Sheets.',
      'profiles.error.cta': 'Try again',
      'profiles.updated': 'Updated {time}',
      'profiles.close': 'Close profile',
      'card.open': "Open {name}'s profile",
      'card.demo': 'Demo',
      'card.joined': 'Joined {date}',
      'card.stars': '{n} out of 5 stars',
      'detail.rating': 'Rating',
      'detail.about': 'About',
      'detail.noRating': 'No rating given.',
      'detail.noNote': 'No note shared.',
      'detail.demo': 'This is a demo profile.',
    },

    id: {
      // ---- Navigasi, lencana, footer (semua halaman) ----
      'nav.label': 'Utama',
      'nav.brand': 'Mapel Favorit',
      'nav.home': 'Beranda',
      'nav.fillIn': 'Isi Profil',
      'nav.profiles': 'Profil',
      'skip': 'Langsung ke konten',
      'lang.label': 'Bahasa',
      'mode.title': 'Tempat profil disimpan',
      'mode.checking': 'Memeriksa...',
      'mode.local': 'Disimpan di browser ini saja',
      'mode.sheets': 'Terhubung ke Google Sheets',
      'mode.error': 'Google Sheets tidak terjangkau',
      'footer.home': 'Beranda',
      'footer.fill': 'Isi profilmu',
      'footer.all': 'Lihat semua profil',

      // ---- Beranda ----
      'home.docTitle': 'Mapel Favorit - Buku Tahunan Kelas',
      'home.desc': 'Ceritakan pelajaran favoritmu ke teman sekelas dan lihat kartu profil semua orang.',
      'home.kicker': '★ Proyek Buku Tahunan Kelas ★',
      'home.title1': 'Apa pelajaran',
      'home.title2': 'Favorit',
      'home.title3': 'kamu?',
      'home.lead': 'Buat kartu profilmu sendiri, beri nilai pelajaran favoritmu, dan ceritakan kenapa kamu suka. Lalu kenalan dengan seluruh sekolah di galeri!',
      'home.ctaFill': 'Isi Profilmu',
      'home.ctaSee': 'Lihat Profil Semua Orang',
      'stat.title': 'Papan Skor Langsung',
      'stat.students': 'Jumlah siswa',
      'stat.top': 'Pelajaran terpopuler',
      'stat.rating': 'Rata-rata rating',
      'stat.pickedOne': '{n} siswa memilihnya',
      'stat.pickedMany': '{n} siswa memilihnya',
      'stat.first': 'Jadilah yang pertama memilih!',
      'stat.error': 'Papan skor belum bisa dimuat. Coba lagi sebentar lagi.',
      'how.title': 'Cara Kerja',
      'how.1.title': 'Isi kartunya',
      'how.1.text': 'Tulis nama, kelas, dan pelajaran favoritmu. Rating dan catatan boleh dikosongkan.',
      'how.2.title': 'Dapatkan profilmu',
      'how.2.text': 'Kartumu muncul di galeri dengan avatar warna-warni dari inisial namamu.',
      'how.3.title': 'Kenalan dengan kelas',
      'how.3.text': 'Cari, saring berdasarkan pelajaran, dan urutkan untuk menemukan teman yang suka pelajaran yang sama.',
      'how.cta': 'Tambah kartuku',
      'footer.big': 'Dibuat untuk kelas kita ❤',
      'footer.small': 'Proyek sekolah yang dibuat dengan HTML, CSS, JavaScript, dan Google Sheets.',

      // ---- Halaman isi profil ----
      'input.docTitle': 'Isi Profilmu - Mapel Favorit',
      'input.desc': 'Isi kartu profilmu: nama, kelas, pelajaran favorit, rating, dan catatan.',
      'input.title1': 'Kartu Profil',
      'input.title2': 'Kamu',
      'input.lead': 'Dua menit, lima pertanyaan singkat. Hanya tiga yang pertama wajib diisi.',
      'input.tab': '★ Kartu Profilku',
      'input.required': 'wajib',
      'input.optional': 'opsional',
      'input.name.label': 'Siapa namamu?',
      'input.name.placeholder': 'mis. Aisyah Putri',
      'input.class.label': 'Kamu kelas berapa?',
      'input.class.placeholder': 'mis. 7A atau 8B',
      'input.subject.label': 'Pelajaran favoritmu',
      'input.subject.choose': 'Pilih pelajaran...',
      'input.rating.label': 'Seberapa kamu suka?',
      'input.rating.hint': 'Ketuk bintang, atau lewati saja.',
      'input.rating.chosen': '{n} dari 5 - keren!',
      'input.rating.clear': 'Hapus rating',
      'input.rating.star1': '1 bintang',
      'input.rating.starN': '{n} bintang',
      'input.note.label': 'Kenapa kamu suka?',
      'input.note.placeholder': 'Kenapa kamu suka pelajaran ini?',
      'input.submit': 'Masukkan aku ke galeri!',
      'input.sending': 'Mengirim...',
      'input.lookAround': 'Hanya ingin melihat-lihat?',
      'input.seeGallery': 'Lihat galeri profil',
      'input.preview': 'Pratinjau langsung',
      'input.preview.name': 'Namamu',
      'input.preview.class': '7A',
      'input.preview.subject': 'Pelajaran',
      'input.preview.note': 'Catatanmu akan muncul di sini.',
      'success.title': 'Hore, {name}!',
      'success.text': 'Kartu profilmu sudah ada di galeri. Yuk, sapa teman-teman sekelas!',
      'success.gallery': 'Lihat galeri',
      'success.another': 'Tambah profil lain',
      'form.oops': 'Ups! {message}',

      // ---- Pesan kesalahan formulir dan server ----
      'err.name.required': 'Tolong isi namamu.',
      'err.name.tooLong': 'Nama paling banyak 40 karakter.',
      'err.className.required': 'Tolong isi kelasmu, misalnya 7A.',
      'err.className.tooLong': 'Kelas paling banyak 20 karakter.',
      'err.subject.required': 'Tolong pilih pelajaran favoritmu.',
      'err.subject.invalid': 'Tolong pilih pelajaran dari daftar.',
      'err.note.tooLong': 'Catatan paling banyak 200 karakter.',
      'err.rating.invalid': 'Rating harus bilangan bulat dari 1 sampai 5.',
      'api.validation': 'Tolong perbaiki kolom yang ditandai.',
      'api.rateLimited': 'Terlalu banyak kiriman. Tunggu semenit lalu coba lagi.',
      'api.unsupportedType': 'Terjadi masalah. Silakan coba lagi.',
      'api.tooBig': 'Teksnya terlalu panjang. Tolong dipersingkat.',
      'api.badJson': 'Terjadi masalah. Silakan coba lagi.',
      'api.saveFailed': 'Profilmu belum bisa disimpan. Coba lagi sebentar lagi.',
      'api.loadFailed': 'Profil belum bisa dimuat sekarang.',
      'api.network': 'Tidak bisa terhubung ke Google Sheets. Periksa internetmu lalu coba lagi.',
      'api.generic': 'Terjadi masalah. Silakan coba lagi.',

      // ---- Halaman galeri ----
      'profiles.docTitle': 'Galeri Profil - Mapel Favorit',
      'profiles.desc': 'Kenalan dengan kelas! Pelajaran favorit setiap siswa dalam bentuk kartu profil.',
      'profiles.title1': 'Kenalan dengan',
      'profiles.title2': 'Kelas',
      'profiles.lead': 'Pelajaran favorit semua orang di satu tempat. Ketuk kartu untuk melihat profil lengkap.',
      'profiles.searchLabel': 'Cari berdasarkan nama',
      'profiles.searchPlaceholder': 'Cari berdasarkan nama...',
      'profiles.sortBy': 'Urutkan',
      'profiles.sort.newest': 'Terbaru dulu',
      'profiles.sort.name': 'Nama A-Z',
      'profiles.sort.rating': 'Rating tertinggi',
      'profiles.chipsLabel': 'Saring berdasarkan pelajaran favorit',
      'profiles.all': 'Semua',
      'profiles.showingOne': 'Menampilkan {shown} dari {total} profil',
      'profiles.showingMany': 'Menampilkan {shown} dari {total} profil',
      'profiles.loading': 'Memuat profil',
      'profiles.empty.title': 'Belum ada profil, jadilah yang pertama!',
      'profiles.empty.text': 'Galeri ini masih menunggu kartu pertamanya.',
      'profiles.empty.cta': 'Isi profilmu',
      'profiles.none.title': 'Tidak ada yang cocok',
      'profiles.none.text': 'Coba nama lain atau pilih pelajaran lain.',
      'profiles.none.cta': 'Tampilkan semua',
      'profiles.error.title': 'Profil tidak bisa dimuat',
      'profiles.error.text': 'Ada masalah saat menghubungi Google Sheets.',
      'profiles.error.cta': 'Coba lagi',
      'profiles.updated': 'Diperbarui {time}',
      'profiles.close': 'Tutup profil',
      'card.open': 'Buka profil {name}',
      'card.demo': 'Contoh',
      'card.joined': 'Bergabung {date}',
      'card.stars': '{n} dari 5 bintang',
      'detail.rating': 'Rating',
      'detail.about': 'Tentang',
      'detail.noRating': 'Belum memberi rating.',
      'detail.noNote': 'Belum ada catatan.',
      'detail.demo': 'Ini adalah profil contoh.',
    },
  };

  // -------------------------------------------------------------------------
  // Choosing and remembering the language
  // -------------------------------------------------------------------------

  /** Saved choice first; otherwise Indonesian if the browser is set to Indonesian; otherwise English. */
  function detectLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (LANGS.includes(saved)) return saved;
    } catch (err) { /* storage blocked: just continue */ }
    return String(navigator.language || '').toLowerCase().startsWith('id') ? 'id' : 'en';
  }

  let currentLang = detectLanguage();

  function lang() { return currentLang; }

  /** Locale code for dates: "id-ID" or "en-US". */
  function locale() { return currentLang === 'id' ? 'id-ID' : 'en-US'; }

  // -------------------------------------------------------------------------
  // Translating
  // -------------------------------------------------------------------------

  /** Look up a key in the current language (English if missing) and fill in {placeholders}. */
  function t(key, vars) {
    let text = (STRINGS[currentLang] && STRINGS[currentLang][key]) ?? STRINGS.en[key] ?? key;
    if (vars) {
      text = text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] !== undefined ? String(vars[name]) : match));
    }
    return text;
  }

  /**
   * Fill in every marked element inside `root`:
   *   data-i18n="key"                       -> replaces the text
   *   data-i18n-attr="attr:key;attr2:key2"  -> sets attributes (placeholder, aria-label, title, content)
   */
  function apply(root = document) {
    document.documentElement.lang = currentLang;

    root.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });

    root.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      node.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((part) => part.trim());
        if (attr && key) node.setAttribute(attr, t(key));
      });
    });

    // The language switch buttons show which language is active.
    document.querySelectorAll('.lang-switch__btn').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === currentLang));
    });
  }

  /** Switch language, remember it, update the page and tell everyone. */
  function setLang(newLang) {
    if (!LANGS.includes(newLang) || newLang === currentLang) return;
    currentLang = newLang;
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch (err) { /* ignore */ }
    apply();
    document.dispatchEvent(new CustomEvent('fs:langchange', { detail: { lang: newLang } }));
  }

  // Wire up the ID / EN buttons in the navigation bar and translate the static text.
  document.querySelectorAll('.lang-switch__btn').forEach((button) => {
    button.addEventListener('click', () => setLang(button.dataset.lang));
  });
  apply();

  return { t, lang, locale, setLang, apply };
})();

// ===========================================================================
// PART 3 - Shared helpers and the connection to Google Sheets
// ===========================================================================

/**
 * common.js - helpers shared by all three pages, plus the connection to Google Sheets.
 *
 * Everything is grouped inside one object called `FS` (Favorite Subject),
 * so other files can call things like FS.createProfileCard(...).
 *
 * It relies on two files loaded before it:
 *   the subjects list -> FSSubjects  (the official subject list)
 *   the i18n section  -> I18N        (the language setting and translations)
 *
 * SAFETY RULE: text typed by students is NEVER put into the page with
 * innerHTML. We always use textContent, which treats it as plain text.
 */

const FS = (() => {
  'use strict';

  const t = I18N.t; // short name for "translate this key"

  // -------------------------------------------------------------------------
  // Subjects: name, icon and color, in the visitor's language
  // -------------------------------------------------------------------------

  /**
   * Everything needed to show a subject: { icon, color, short, full }.
   *   short = small label for stickers and chips, full = complete name.
   * Values that are not in our list (for example old rows in a Google Sheet)
   * are still shown, just with a plain star icon.
   */
  function subjectInfo(value) {
    const subject = FSSubjects.findSubject(value);
    if (!subject) {
      const text = String(value || '');
      return { icon: '⭐', color: '#FFD43B', short: text, full: text };
    }
    const indonesian = I18N.lang() === 'id';
    return {
      icon: subject.icon,
      color: subject.color,
      short: indonesian ? subject.shortId : subject.shortEn,
      full: indonesian ? subject.name : subject.en,
    };
  }

  /** One stable key per subject, so old spellings ("Math") and new ("Matematika") count together. */
  function subjectKey(value) {
    const subject = FSSubjects.findSubject(value);
    return subject ? subject.name : String(value || '');
  }

  // -------------------------------------------------------------------------
  // Tiny DOM helpers
  // -------------------------------------------------------------------------

  /** Create an element with an optional class name and plain-text content. */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text; // textContent = always safe
    return node;
  }

  // -------------------------------------------------------------------------
  // Talking to Google Sheets (through your Apps Script web app)
  //
  // The link is set at the very top of this file (APPS_SCRIPT_URL).
  // If it is empty, profiles are kept in THIS browser only (handy for testing).
  // -------------------------------------------------------------------------

  const LIMITS = { name: 40, className: 20, note: 200 };  // same numbers as Code.gs
  const LOCAL_KEY = 'fs-students-local';
  const CACHE_MS = 5 * 1000;       // remember the list for 5 seconds
  const TIMEOUT_MS = 25 * 1000;    // give Google this long to answer

  let cache = { at: 0, students: null };

  function sheetsEnabled() {
    return /^https:\/\/script\.google\.com\//.test(String(APPS_SCRIPT_URL || '').trim());
  }

  /** Turn any value into safe single-line text (same idea as cleanText_ in Code.gs). */
  function cleanText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Check a profile. Returns { codes, student }.
   * codes = { field: 'required' | 'tooLong' | 'invalid' } (empty when everything is fine).
   * The subject is always converted to the OFFICIAL Indonesian name before saving.
   */
  function validateStudent(input) {
    const codes = {};
    const body = input && typeof input === 'object' ? input : {};

    const name = cleanText(body.name);
    if (!name) codes.name = 'required';
    else if (name.length > LIMITS.name) codes.name = 'tooLong';

    const className = cleanText(body.className);
    if (!className) codes.className = 'required';
    else if (className.length > LIMITS.className) codes.className = 'tooLong';

    const subjectText = cleanText(body.favoriteSubject);
    const subject = FSSubjects.findSubject(subjectText);
    if (!subjectText) codes.favoriteSubject = 'required';
    else if (!subject) codes.favoriteSubject = 'invalid';

    let rating = null;
    const raw = body.rating;
    if (raw !== undefined && raw !== null && raw !== '') {
      const number = Number(raw);
      if (Number.isInteger(number) && number >= 1 && number <= 5) rating = number;
      else codes.rating = 'invalid';
    }

    const note = cleanText(body.note);
    if (note.length > LIMITS.note) codes.note = 'tooLong';

    return {
      codes,
      student: {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        name,
        className,
        favoriteSubject: subject ? subject.name : '',
        rating,
        note,
      },
    };
  }

  /** Call the Apps Script web app and make sure the answer is real JSON (not an HTML error page). */
  async function callAppsScript(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let text;
    try {
      const response = await fetch(url, { ...options, redirect: 'follow', signal: controller.signal });
      text = await response.text();
    } catch (err) {
      throw Object.assign(new Error('network'), { code: 'network' });
    } finally {
      clearTimeout(timer);
    }
    try {
      return JSON.parse(text);
    } catch (err) {
      // Usually: the deployment is not "Who has access: Anyone", or it was not redeployed.
      throw Object.assign(new Error('Google Sheets did not send back JSON.'), { code: 'badAnswer' });
    }
  }

  function readLocal() {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  }

  function normalizeRow(row, index) {
    const rating = Number(row.rating);
    return {
      id: `sheet-${index + 1}`,
      timestamp: String(row.timestamp === undefined || row.timestamp === null ? '' : row.timestamp),
      name: cleanText(String(row.name === undefined || row.name === null ? '' : row.name)),
      className: cleanText(String(row.className === undefined || row.className === null ? '' : row.className)),
      favoriteSubject: cleanText(String(row.favoriteSubject === undefined || row.favoriteSubject === null ? '' : row.favoriteSubject)),
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
      note: cleanText(String(row.note === undefined || row.note === null ? '' : row.note)),
    };
  }

  /** Load every student. Resolves to { mode, students }. */
  async function fetchStudents() {
    if (cache.students && Date.now() - cache.at < CACHE_MS) {
      return { mode: sheetsEnabled() ? 'sheets' : 'local', students: cache.students };
    }
    try {
      let students;
      if (sheetsEnabled()) {
        const url = new URL(String(APPS_SCRIPT_URL).trim());
        url.searchParams.set('action', 'list');
        const data = await callAppsScript(url.toString(), { method: 'GET' });
        if (!data || data.ok !== true || !Array.isArray(data.students)) {
          throw Object.assign(new Error((data && data.error) || 'Unexpected answer.'), { code: 'badAnswer' });
        }
        students = data.students.map(normalizeRow).filter((s) => s.name);
        setMode('sheets');
      } else {
        students = readLocal();
        setMode('local');
      }
      cache = { at: Date.now(), students };
      return { mode: sheetsEnabled() ? 'sheets' : 'local', students };
    } catch (err) {
      if (sheetsEnabled()) setMode('error');
      throw Object.assign(new Error(t('api.loadFailed')), { code: 'loadFailed' });
    }
  }

  /**
   * Validate and save a new profile.
   * Resolves to the saved student. On failure throws an Error with:
   *   error.code   "validation", "network", "saveFailed", ...
   *   error.codes  per-field reasons, e.g. { name: 'required' }, when code is "validation"
   */
  async function saveStudent(payload) {
    const { codes, student } = validateStudent(payload);
    if (Object.keys(codes).length > 0) {
      throw Object.assign(new Error('validation'), { code: 'validation', codes });
    }

    if (sheetsEnabled()) {
      // text/plain avoids a browser "preflight" request that Apps Script cannot answer.
      let data;
      try {
        data = await callAppsScript(String(APPS_SCRIPT_URL).trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(student),
        });
      } catch (err) {
        setMode(err.code === 'network' ? 'error' : 'sheets');
        throw Object.assign(new Error(err.message), { code: err.code === 'network' ? 'network' : 'saveFailed' });
      }
      if (!data || data.ok !== true) {
        throw Object.assign(new Error((data && data.error) || 'saveFailed'), { code: 'saveFailed' });
      }
      setMode('sheets');
    } else {
      try {
        const list = readLocal();
        list.push(student);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
      } catch (err) {
        throw Object.assign(new Error('saveFailed'), { code: 'saveFailed' });
      }
    }
    cache = { at: 0, students: null }; // force a fresh read next time
    return student;
  }

  // -------------------------------------------------------------------------
  // The storage badge in the navigation bar
  // -------------------------------------------------------------------------

  let currentMode = 'loading';

  /** Draw the badge text (there is one badge per page section) in the current language. */
  function paintModeBadge() {
    document.querySelectorAll('.mode-badge').forEach((badge) => {
      badge.dataset.mode = currentMode;
      badge.querySelector('.mode-badge__text').textContent = t(currentMode === 'loading' ? 'mode.checking' : `mode.${currentMode}`);
    });
  }

  /** "local", "sheets" or "error". */
  function setMode(mode) {
    currentMode = mode;
    paintModeBadge();
  }

  // -------------------------------------------------------------------------
  // Avatars: a pastel color that is random-looking but always the same per name
  // -------------------------------------------------------------------------

  /** Turn a name into a number. The same name always gives the same number. */
  function hashString(text) {
    let hash = 0;
    for (const char of String(text).toLowerCase()) {
      hash = (hash * 31 + char.codePointAt(0)) >>> 0;
    }
    return hash;
  }

  /** A soft pastel color for a name. */
  function avatarColor(name) {
    const hue = hashString(name) % 360;
    return `hsl(${hue} 85% 76%)`;
  }

  /** "Aisyah Putri" -> "AP", "Bima" -> "B" */
  function initials(name) {
    const words = String(name).trim().split(/\s+/).filter(Boolean);
    const letters = words.slice(0, 2).map((word) => Array.from(word)[0]);
    return letters.join('').toUpperCase() || '?';
  }

  // -------------------------------------------------------------------------
  // Stars
  // -------------------------------------------------------------------------

  const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z';

  /** Build a row of 5 SVG stars, `rating` of them filled. */
  function createStars(rating, extraClass) {
    const row = el('span', `stars ${extraClass || ''}`.trim());
    row.setAttribute('role', 'img');
    row.setAttribute('aria-label', t('card.stars', { n: rating }));
    for (let i = 1; i <= 5; i += 1) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('stars__star');
      if (i <= rating) svg.classList.add('is-on');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', STAR_PATH);
      svg.appendChild(path);
      row.appendChild(svg);
    }
    return row;
  }

  // -------------------------------------------------------------------------
  // Dates (formatted for the chosen language)
  // -------------------------------------------------------------------------

  /** "2026-09-29T08:00:00Z" -> "Sep 29, 2026" or "29 Sep 2026" (empty text if the date is broken) */
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(I18N.locale(), { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function joinedText(timestamp) {
    const formatted = formatDate(timestamp);
    return formatted ? t('card.joined', { date: formatted }) : '';
  }

  // -------------------------------------------------------------------------
  // Reusable building blocks
  // -------------------------------------------------------------------------

  /** The round avatar with initials. Pass "big" for the larger modal version. */
  function createAvatar(name, size) {
    const avatar = el('span', size === 'big' ? 'avatar avatar--big' : 'avatar', initials(name));
    avatar.style.setProperty('--av-bg', avatarColor(name));
    avatar.setAttribute('aria-hidden', 'true');
    return avatar;
  }

  /** The rotated class sticker, e.g. "8B". */
  function createClassSticker(className) {
    return el('span', 'sticker sticker--class', className);
  }

  /**
   * The colorful subject sticker with its icon.
   * options.full = true shows the complete subject name instead of the short label.
   */
  function createSubjectSticker(subject, options = {}) {
    const info = subjectInfo(subject);
    const sticker = el('span', 'sticker sticker--subject');
    sticker.style.setProperty('--tag-bg', info.color);
    const icon = el('span', 'sticker__icon', info.icon);
    icon.setAttribute('aria-hidden', 'true');
    sticker.append(icon, document.createTextNode(options.full ? info.full : info.short));
    return sticker;
  }

  /**
   * Build one profile card.
   *   options.interactive = true  -> a clickable <button> (gallery)
   *   options.interactive = false -> a plain <div> (live preview on the input page)
   * Missing rating / note are simply left out.
   */
  function createProfileCard(student, options = {}) {
    const interactive = options.interactive !== false;
    const card = el(interactive ? 'button' : 'div', 'pcard');
    if (interactive) {
      card.type = 'button';
      card.setAttribute('aria-label', t('card.open', { name: student.name }));
    }
    card.style.setProperty('--av-bg', avatarColor(student.name));

    if (student.demo) card.append(el('span', 'pcard__demo', t('card.demo')));

    card.append(createAvatar(student.name));
    card.append(el('span', 'pcard__name', student.name));

    const meta = el('span', 'pcard__meta');
    meta.append(createClassSticker(student.className), createSubjectSticker(student.favoriteSubject));
    card.append(meta);

    if (student.rating) card.append(createStars(student.rating));
    if (student.note) card.append(el('span', 'pcard__about', student.note));

    const joined = joinedText(student.timestamp);
    if (joined) card.append(el('span', 'pcard__date', joined));

    return card;
  }

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  /**
   * Count students per subject. Returns [{ key, count }], biggest first (ties A-Z).
   * `key` is the official subject name (see subjectKey).
   */
  function countBySubject(students) {
    const counts = new Map();
    students.forEach((s) => {
      const key = subjectKey(s.favoriteSubject);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts, ([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }

  /** True when the visitor asked their device to reduce animations. */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Show the storage badge right away, and redraw it when the language changes.
  setMode(sheetsEnabled() ? 'sheets' : 'local');
  document.addEventListener('fs:langchange', paintModeBadge);

  return {
    t,
    SUBJECTS: FSSubjects.SUBJECTS,
    subjectInfo,
    subjectKey,
    el,
    fetchStudents,
    saveStudent,
    createProfileCard,
    createAvatar,
    createClassSticker,
    createSubjectSticker,
    createStars,
    joinedText,
    formatDate,
    countBySubject,
    prefersReducedMotion,
  };
})();

// ===========================================================================
// PART 4 - Home page: the live scoreboard
// ===========================================================================

/**
 * home.js - fills in the "Live Scoreboard" on the homepage.
 * It asks the server for all students and works out three numbers:
 * how many students, the most popular subject and the average rating.
 */

(() => {
  'use strict';

  const totalEl = document.getElementById('statTotal');
  const topEl = document.getElementById('statTop');
  const topSubEl = document.getElementById('statTopSub');
  const ratingEl = document.getElementById('statRating');
  const errorEl = document.getElementById('statsError');

  let students = null; // remembered so we can redraw when the language changes

  /** Average of all ratings that exist (students without a rating are skipped). */
  function averageRating(list) {
    const ratings = list.map((s) => s.rating).filter((r) => Number.isInteger(r));
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  /** Make a number "count up" from 0 for a little celebration effect. */
  function countUp(element, target) {
    if (FS.prefersReducedMotion() || target === 0) {
      element.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /** The text parts of the scoreboard (they change with the language). */
  function showTexts() {
    const ranking = FS.countBySubject(students);
    if (ranking.length > 0) {
      const top = ranking[0];
      const info = FS.subjectInfo(top.key);
      topEl.textContent = `${info.icon} ${info.short}`;
      topSubEl.textContent = FS.t(top.count === 1 ? 'stat.pickedOne' : 'stat.pickedMany', { n: top.count });
    } else {
      topEl.textContent = '-';
      topSubEl.textContent = FS.t('stat.first');
    }
  }

  function showStats() {
    countUp(totalEl, students.length);
    showTexts();
    const average = averageRating(students);
    ratingEl.textContent = average === null ? '-' : `${average.toFixed(1)} ★`;
  }

  async function init() {
    try {
      students = (await FS.fetchStudents()).students;
      errorEl.hidden = true;
      showStats();
    } catch (err) {
      errorEl.hidden = false;
    }
  }

  // New language: only the words change, the numbers stay.
  document.addEventListener('fs:langchange', () => {
    if (students) showTexts();
  });

  // Reload the numbers every time the visitor opens the home page.
  document.addEventListener('fs:viewchange', (event) => {
    if (event.detail.view === 'home') init();
  });
})();

// ===========================================================================
// PART 5 - Input page: the profile form
// ===========================================================================

/**
 * input.js - the "Fill In Your Profile" form.
 *
 * Jobs of this file:
 *   1. Fill the subject dropdown from the official list (in the chosen language)
 *   2. Build and paint the star picker, and allow clearing the rating
 *   3. Count the note characters
 *   4. Validate before sending and show friendly messages
 *   5. Send the profile to the server and celebrate
 *   6. Keep a live preview card in sync with the form
 *   7. Redraw all the words when the language changes
 */

(() => {
  'use strict';

  const t = FS.t;

  const form = document.getElementById('profileForm');
  const nameInput = document.getElementById('name');
  const classInput = document.getElementById('className');
  const subjectSelect = document.getElementById('subject');
  const noteInput = document.getElementById('note');
  const noteCount = document.getElementById('note-count');
  const starPicker = document.getElementById('starPicker');
  const ratingHint = document.getElementById('ratingHint');
  const clearRatingBtn = document.getElementById('clearRating');
  const submitBtn = document.getElementById('submitBtn');
  const formError = document.getElementById('formError');
  const success = document.getElementById('success');
  const successTitle = document.getElementById('successTitle');
  const addAnotherBtn = document.getElementById('addAnother');
  const previewSlot = document.getElementById('previewSlot');

  const NOTE_MAX = 200;
  let isSending = false;
  let savedName = ''; // remembered so the success title can change language

  // -------------------------------------------------------------------------
  // Subject dropdown
  // -------------------------------------------------------------------------

  /**
   * (Re)build the subject options. The option VALUE is the official Indonesian name
   * (that is what gets saved); the visible TEXT follows the chosen language.
   */
  function populateSubjects() {
    const previous = subjectSelect.value;
    const indonesian = I18N.lang() === 'id';

    subjectSelect.replaceChildren();
    const placeholder = FS.el('option', '', t('input.subject.choose'));
    placeholder.value = '';
    subjectSelect.appendChild(placeholder);

    FS.SUBJECTS.forEach((subject) => {
      const option = FS.el('option', '', indonesian ? subject.name : subject.en);
      option.value = subject.name;
      subjectSelect.appendChild(option);
    });
    subjectSelect.value = previous; // keep the student's choice
  }

  // -------------------------------------------------------------------------
  // Stars: five radio buttons, highlighted on hover and on selection
  // -------------------------------------------------------------------------

  const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z';
  const starLabels = [];
  const starRadios = [];

  /** Build the five stars once. Their hidden text is set by refreshStarLabels(). */
  function buildStars() {
    for (let value = 1; value <= 5; value += 1) {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'rating';
      radio.id = `star${value}`;
      radio.value = String(value);
      radio.className = 'sr-only';

      const label = document.createElement('label');
      label.htmlFor = radio.id;

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', STAR_PATH);
      svg.appendChild(path);

      label.append(svg, FS.el('span', 'sr-only'));
      label.addEventListener('mouseenter', () => paintStars(value));

      starPicker.append(radio, label);
      starRadios.push(radio);
      starLabels.push(label);
    }
  }

  /** "1 star" / "3 stars" in the chosen language (also used as the tooltip). */
  function refreshStarLabels() {
    starLabels.forEach((label, index) => {
      const text = index === 0 ? t('input.rating.star1') : t('input.rating.starN', { n: index + 1 });
      label.querySelector('.sr-only').textContent = text;
      label.title = text;
    });
  }

  /** The rating as a number, or null if the student did not pick one. */
  function chosenRating() {
    const checked = starRadios.find((radio) => radio.checked);
    return checked ? Number(checked.value) : null;
  }

  /** Light up the first `count` stars. */
  function paintStars(count) {
    starLabels.forEach((label, index) => label.classList.toggle('is-on', index < count));
  }

  function refreshStars() {
    const rating = chosenRating() || 0;
    paintStars(rating);
    clearRatingBtn.hidden = rating === 0;
    ratingHint.textContent = rating === 0 ? t('input.rating.hint') : t('input.rating.chosen', { n: rating });
  }

  starPicker.addEventListener('mouseleave', refreshStars);
  starPicker.addEventListener('change', () => { refreshStars(); updatePreview(); });

  clearRatingBtn.addEventListener('click', () => {
    starRadios.forEach((radio) => { radio.checked = false; });
    refreshStars();
    updatePreview();
  });

  // -------------------------------------------------------------------------
  // Note counter
  // -------------------------------------------------------------------------

  function refreshNoteCounter() {
    const length = noteInput.value.length;
    noteCount.textContent = `${length} / ${NOTE_MAX}`;
    noteCount.classList.toggle('counter--warn', length >= NOTE_MAX - 20);
  }

  // -------------------------------------------------------------------------
  // Validation and error messages
  //
  // We remember the error CODE (not the words), so the message can be
  // translated again if the student switches language.
  // -------------------------------------------------------------------------

  const errorBoxes = {
    name: document.getElementById('name-error'),
    className: document.getElementById('className-error'),
    subject: document.getElementById('subject-error'),
    note: document.getElementById('note-error'),
  };

  const errorInputs = {
    name: [nameInput],
    className: [classInput],
    subject: [subjectSelect],
    note: [noteInput],
  };

  const fieldErrors = {};   // { name: 'required', ... }
  let formErrorCode = null; // top-of-button error, e.g. 'saveFailed'

  function showError(field, code) {
    fieldErrors[field] = code;
    errorBoxes[field].textContent = t(`err.${field}.${code}`);
    errorInputs[field].forEach((input) => input.setAttribute('aria-invalid', 'true'));
  }

  function clearError(field) {
    delete fieldErrors[field];
    errorBoxes[field].textContent = '';
    errorInputs[field].forEach((input) => input.removeAttribute('aria-invalid'));
  }

  function showFormError(code) {
    formErrorCode = code;
    formError.textContent = t('form.oops', { message: t(`api.${code}`) });
    formError.hidden = false;
  }

  function clearAllErrors() {
    Object.keys(errorBoxes).forEach(clearError);
    formErrorCode = null;
    formError.hidden = true;
    formError.textContent = '';
  }

  /** Write every visible message again in the current language. */
  function redrawErrors() {
    Object.keys(fieldErrors).forEach((field) => {
      errorBoxes[field].textContent = t(`err.${field}.${fieldErrors[field]}`);
    });
    if (formErrorCode) showFormError(formErrorCode);
  }

  /**
   * Check the required fields. Shows messages and returns true if everything is OK.
   * (The server checks again - this is just for quick, friendly feedback.)
   */
  function validateForm() {
    clearAllErrors();
    let firstBad = null;

    function fail(field, code, input) {
      showError(field, code);
      if (!firstBad) firstBad = input;
    }

    if (!nameInput.value.trim()) fail('name', 'required', nameInput);
    if (!classInput.value.trim()) fail('className', 'required', classInput);
    if (!subjectSelect.value) fail('subject', 'required', subjectSelect);

    if (firstBad) firstBad.focus();
    return firstBad === null;
  }

  // Remove an error as soon as the student starts fixing that field.
  nameInput.addEventListener('input', () => clearError('name'));
  classInput.addEventListener('input', () => clearError('className'));
  subjectSelect.addEventListener('change', () => clearError('subject'));
  noteInput.addEventListener('input', () => clearError('note'));

  // -------------------------------------------------------------------------
  // Live preview
  // -------------------------------------------------------------------------

  /** Rebuild the preview card from whatever is currently typed in the form. */
  function updatePreview() {
    const name = nameInput.value.trim();
    const student = {
      name: name || t('input.preview.name'),
      className: classInput.value.trim() || t('input.preview.class'),
      favoriteSubject: subjectSelect.value || t('input.preview.subject'),
      rating: chosenRating(),
      note: noteInput.value.trim() || (name ? '' : t('input.preview.note')),
      timestamp: new Date().toISOString(),
    };
    const card = FS.createProfileCard(student, { interactive: false });
    if (!name) card.classList.add('pcard--ghost'); // faded until the student types a name
    previewSlot.replaceChildren(card);
  }

  [nameInput, classInput, noteInput].forEach((input) => input.addEventListener('input', updatePreview));
  subjectSelect.addEventListener('change', updatePreview);
  noteInput.addEventListener('input', refreshNoteCounter);

  // -------------------------------------------------------------------------
  // Celebration
  // -------------------------------------------------------------------------

  /** Drop a few colorful confetti pieces. Skipped when animations are reduced. */
  function launchConfetti() {
    if (FS.prefersReducedMotion()) return;
    const colors = ['#FF5C7A', '#FFD43B', '#38B6FF', '#5BE08A', '#C58BFF'];
    const layer = FS.el('div', 'confetti');
    layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 40; i += 1) {
      const piece = FS.el('span', 'confetti__piece');
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--delay', `${Math.random() * 0.4}s`);
      piece.style.setProperty('--drift', `${Math.random() * 160 - 80}px`);
      piece.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      piece.style.background = colors[i % colors.length];
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3200);
  }

  function showSuccess(name) {
    savedName = name;
    successTitle.textContent = t('success.title', { name }); // textContent = safe
    success.hidden = false;
    success.scrollIntoView({ behavior: FS.prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    success.focus({ preventScroll: true });
    launchConfetti();
  }

  addAnotherBtn.addEventListener('click', () => {
    success.hidden = true;
    savedName = '';
    nameInput.focus();
  });

  // -------------------------------------------------------------------------
  // Submitting
  // -------------------------------------------------------------------------

  function refreshSubmitLabel() {
    submitBtn.querySelector('.btn__label').textContent = t(isSending ? 'input.sending' : 'input.submit');
  }

  function setSending(sending) {
    isSending = sending;
    submitBtn.disabled = sending;
    refreshSubmitLabel();
  }

  function resetForm() {
    form.reset();
    refreshStars();
    refreshNoteCounter();
    clearAllErrors();
    updatePreview();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSending) return; // already sending
    if (!validateForm()) return;

    const payload = {
      name: nameInput.value,
      className: classInput.value,
      favoriteSubject: subjectSelect.value,
      rating: chosenRating(),
      note: noteInput.value,
    };

    setSending(true);
    try {
      const saved = await FS.saveStudent(payload);
      resetForm();
      showSuccess(saved.name);
    } catch (err) {
      // The server may point at specific fields that need fixing.
      const fieldMap = { name: 'name', className: 'className', favoriteSubject: 'subject', note: 'note' };
      let showedField = false;
      Object.entries(err.codes || {}).forEach(([serverField, code]) => {
        const field = fieldMap[serverField];
        if (field) { showError(field, code); showedField = true; }
      });
      showFormError(showedField ? 'validation' : (err.code || 'generic'));
    } finally {
      setSending(false);
    }
  });

  // -------------------------------------------------------------------------
  // Language changes: redraw every word that JavaScript wrote
  // -------------------------------------------------------------------------

  document.addEventListener('fs:langchange', () => {
    populateSubjects();
    refreshStarLabels();
    refreshStars();
    refreshSubmitLabel();
    redrawErrors();
    updatePreview();
    if (!success.hidden && savedName) successTitle.textContent = t('success.title', { name: savedName });
  });

  // First paint
  populateSubjects();
  buildStars();
  refreshStarLabels();
  refreshStars();
  refreshNoteCounter();
  updatePreview();
})();

// ===========================================================================
// PART 6 - Gallery page: the profile cards
// ===========================================================================

/**
 * profiles.js - the profile gallery page.
 *
 * Flow:  load students -> apply search / subject filter / sort -> draw cards.
 * The list refreshes by itself every 30 seconds, and every word is redrawn
 * when the visitor changes the language.
 */

(() => {
  'use strict';

  const t = FS.t;
  const REFRESH_MS = 30 * 1000;

  // All the parts of the page we need to update
  const grid = document.getElementById('grid');
  const loadingEl = document.getElementById('loading');
  const emptyState = document.getElementById('emptyState');
  const noResults = document.getElementById('noResults');
  const errorState = document.getElementById('errorState');
  const chipsEl = document.getElementById('chips');
  const resultLine = document.getElementById('resultLine');
  const updatedEl = document.getElementById('updated');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort');
  const detailDialog = document.getElementById('detail');
  const detailBody = document.getElementById('detailBody');

  // The page's "memory": what data we have and what the visitor chose
  const state = {
    students: [],
    signature: '',      // used to notice when the data really changed
    query: '',
    subject: 'all',     // 'all' or an official subject name (see FS.subjectKey)
    sort: 'newest',
    lastUpdated: null,  // Date of the last successful load
    detail: null,       // the student shown in the open modal (if any)
  };

  // -------------------------------------------------------------------------
  // Filtering and sorting
  // -------------------------------------------------------------------------

  /** Newest first. Broken dates count as oldest. */
  function timeOf(student) {
    const time = new Date(student.timestamp).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  const sorters = {
    newest: (a, b) => timeOf(b) - timeOf(a),
    name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    // Highest rating first, students without a rating last, ties: newest first
    rating: (a, b) => (b.rating || 0) - (a.rating || 0) || timeOf(b) - timeOf(a),
  };

  /** The students that match the search text and the chosen subject, in the chosen order. */
  function visibleStudents() {
    const query = state.query.trim().toLowerCase();
    return state.students
      .filter((s) => !query || s.name.toLowerCase().includes(query))
      .filter((s) => state.subject === 'all' || FS.subjectKey(s.favoriteSubject) === state.subject)
      .sort(sorters[state.sort]);
  }

  // -------------------------------------------------------------------------
  // Drawing the page
  // -------------------------------------------------------------------------

  /** Show exactly one of: loading, grid, empty, no results or error. */
  function showOnly(which) {
    loadingEl.hidden = which !== 'loading';
    grid.hidden = which !== 'grid';
    emptyState.hidden = which !== 'empty';
    noResults.hidden = which !== 'noResults';
    errorState.hidden = which !== 'error';
  }

  /** Build the filter chips, like "Matematika (12)", from the data. */
  function renderChips() {
    const ranking = FS.countBySubject(state.students);
    chipsEl.replaceChildren();
    chipsEl.hidden = ranking.length === 0;

    function addChip(value, label, count, info) {
      const chip = FS.el('button', 'chip');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(state.subject === value));
      if (info) {
        chip.style.setProperty('--tag-bg', info.color);
        const icon = FS.el('span', 'chip__icon', info.icon);
        icon.setAttribute('aria-hidden', 'true');
        chip.append(icon);
      }
      chip.append(document.createTextNode(`${label} (${count})`));
      chip.addEventListener('click', () => {
        state.subject = value;
        render();
      });
      chipsEl.appendChild(chip);
    }

    addChip('all', t('profiles.all'), state.students.length, null);
    ranking.forEach(({ key, count }) => {
      const info = FS.subjectInfo(key);
      addChip(key, info.short, count, info);
    });
  }

  /** Draw everything. `animate` makes the cards pop in (used after loading new data). */
  function render(animate = false) {
    // If the chosen subject vanished (for example after a refresh), go back to "all".
    if (state.subject !== 'all' && !state.students.some((s) => FS.subjectKey(s.favoriteSubject) === state.subject)) {
      state.subject = 'all';
    }

    renderChips();

    if (state.students.length === 0) {
      resultLine.textContent = '';
      return showOnly('empty');
    }

    const list = visibleStudents();
    resultLine.textContent = t(state.students.length === 1 ? 'profiles.showingOne' : 'profiles.showingMany', {
      shown: list.length,
      total: state.students.length,
    });

    if (list.length === 0) return showOnly('noResults');

    const cards = document.createDocumentFragment();
    list.forEach((student, index) => {
      const card = FS.createProfileCard(student);
      card.style.setProperty('--i', String(Math.min(index, 12))); // stagger the pop-in
      card.addEventListener('click', () => openDetail(student));
      cards.appendChild(card);
    });
    grid.replaceChildren(cards);
    grid.classList.toggle('grid--animate', animate && !FS.prefersReducedMotion());
    showOnly('grid');
  }

  /** "Updated 9:05 AM" in the chosen language. */
  function renderUpdated() {
    updatedEl.textContent = state.lastUpdated
      ? t('profiles.updated', { time: state.lastUpdated.toLocaleTimeString(I18N.locale(), { hour: 'numeric', minute: '2-digit' }) })
      : '';
  }

  // -------------------------------------------------------------------------
  // The big detail view (modal)
  // -------------------------------------------------------------------------

  /** Fill the dialog with one student's full profile (in the current language). */
  function fillDetail(student) {
    const body = FS.el('div', 'detail');
    body.append(FS.createAvatar(student.name, 'big'));

    const name = FS.el('h2', 'detail__name', student.name);
    name.id = 'detailName';
    body.append(name);

    const meta = FS.el('div', 'detail__meta');
    meta.append(FS.createClassSticker(student.className), FS.createSubjectSticker(student.favoriteSubject, { full: true }));
    body.append(meta);

    const rating = FS.el('div', 'detail__block');
    rating.append(FS.el('h3', 'detail__heading', t('detail.rating')));
    if (student.rating) {
      rating.append(FS.createStars(student.rating, 'stars--big'));
    } else {
      rating.append(FS.el('p', 'detail__muted', t('detail.noRating')));
    }
    body.append(rating);

    const about = FS.el('div', 'detail__block');
    about.append(FS.el('h3', 'detail__heading', t('detail.about')));
    about.append(FS.el('p', student.note ? 'detail__note' : 'detail__muted', student.note || t('detail.noNote')));
    body.append(about);

    const joined = FS.joinedText(student.timestamp);
    if (joined) body.append(FS.el('p', 'detail__date', joined));
    if (student.demo) body.append(FS.el('p', 'detail__demo', t('detail.demo')));

    detailBody.replaceChildren(body);
  }

  function openDetail(student) {
    state.detail = student;
    fillDetail(student);
    detailDialog.showModal();
  }

  // Close by the X button (Escape is handled by <dialog> itself) ...
  document.getElementById('detailClose').addEventListener('click', () => detailDialog.close());
  // ... or by clicking the dark backdrop. Clicks on the panel have a different target.
  detailDialog.addEventListener('click', (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
  detailDialog.addEventListener('close', () => { state.detail = null; });

  // -------------------------------------------------------------------------
  // Loading data
  // -------------------------------------------------------------------------

  /**
   * Ask the server for students. On the automatic refresh (`quiet`) we keep
   * showing the old cards if something fails, instead of an error screen.
   */
  async function load({ quiet = false } = {}) {
    if (!quiet && state.students.length === 0) showOnly('loading');
    try {
      const { students } = await FS.fetchStudents();
      const signature = JSON.stringify(students);
      const changed = signature !== state.signature;
      state.students = students;
      state.signature = signature;
      if (changed) render(true); // only redraw when something really changed
      state.lastUpdated = new Date();
      renderUpdated();
    } catch (err) {
      if (!quiet || state.students.length === 0) showOnly('error');
    }
  }

  // -------------------------------------------------------------------------
  // Wiring up the controls
  // -------------------------------------------------------------------------

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    render();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    state.query = '';
    state.subject = 'all';
    searchInput.value = '';
    render();
  });

  document.getElementById('retry').addEventListener('click', () => load());

  // New language: redraw cards, chips, counters, and the open modal (if any).
  document.addEventListener('fs:langchange', () => {
    if (state.signature) render();
    renderUpdated();
    if (state.detail) fillDetail(state.detail);
  });

  // Load when the gallery is opened, refresh every 30 seconds while it stays open.
  let refreshTimer = null;
  document.addEventListener('fs:viewchange', (event) => {
    clearInterval(refreshTimer);
    refreshTimer = null;
    if (event.detail.view === 'profiles') {
      load();
      refreshTimer = setInterval(() => load({ quiet: true }), REFRESH_MS);
    } else if (detailDialog.open) {
      detailDialog.close();
    }
  });
})();

// ===========================================================================
// PART 8 - Page switching. The three "pages" (home, input, profiles) all live
// in index.html; the address (#home, #input, #profiles) decides which is shown.
// ===========================================================================

(() => {
  'use strict';

  const VIEWS = ['home', 'input', 'profiles'];
  const TITLE_KEYS = { home: 'home.docTitle', input: 'input.docTitle', profiles: 'profiles.docTitle' };
  let current = null;

  function viewFromHash() {
    const name = location.hash.replace(/^#\/?/, '');
    return VIEWS.includes(name) ? name : 'home';
  }

  function setTitle() {
    if (current) document.title = I18N.t(TITLE_KEYS[current]);
  }

  function show() {
    const view = viewFromHash();
    if (view === current) return;
    current = view;
    document.querySelectorAll('.view').forEach((section) => { section.hidden = section.dataset.view !== view; });
    setTitle();
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('fs:viewchange', { detail: { view } }));
  }

  // "Skip to content" link: jump to the visible page's <main>.
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.querySelector('.view:not([hidden]) main');
    if (main) { main.setAttribute('tabindex', '-1'); main.focus(); }
  });

  window.addEventListener('hashchange', show);
  document.addEventListener('fs:langchange', setTitle);
  show();
})();
