// script.js
// Hamburger Menu (click & keyboard, ARIA expanded)
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  const expanded = hamburger.classList.contains('active');
  hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  // When menu opens, refresh highlight based on current scroll position
  if (expanded) {
    window.dispatchEvent(new Event('scroll'));
  }
}

hamburger.addEventListener('click', toggleMenu);
hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMenu();
  }
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('nav a');
// Short lock so tap highlight stays until section reached
let navActiveLock = null; // { hash: '#id', until: timestamp }

function setActiveLinkByHash(hash) {
  navLinks.forEach(l => {
    if (l.hash === hash) {
      l.classList.add('active');
      l.setAttribute('aria-current', 'page');
    } else {
      l.classList.remove('active');
      l.removeAttribute('aria-current');
    }
  });
}

function smoothScrollWithStabilize(targetEl) {
  if (!targetEl) return;
  // Use CSS scroll-margin-top to handle header offset
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // After layout/animations settle, snap precisely again
  let lastTop = null;
  let stableFrames = 0;
  let tries = 0;
  function check() {
    const topNow = targetEl.getBoundingClientRect().top;
    if (lastTop !== null && Math.abs(topNow - lastTop) < 0.5) {
      stableFrames++;
    } else {
      stableFrames = 0;
    }
    lastTop = topNow;
    tries++;
    if (stableFrames >= 3 || tries > 40) {
      targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }
    requestAnimationFrame(check);
  }
  requestAnimationFrame(check);
}
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    // Close mobile menu
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');

  // Remove active from all links, add to clicked
  navLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
  this.classList.add('active');
  this.setAttribute('aria-current', 'page');
  // Lock highlight briefly so scroll handler doesn't clear it immediately
  navActiveLock = { hash: this.hash, until: Date.now() + 1500 };

    // Smooth scroll for navigation
  if (this.hash !== '') {
      e.preventDefault();
      const hash = this.hash;
      const target = document.querySelector(hash);
      smoothScrollWithStabilize(target);
    }
  });
});

// Highlight nav on scroll + compact header
const sections = document.querySelectorAll('section[id]');
const headerEl = document.querySelector('header');
window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY || window.pageYOffset;
  // Toggle compact header when scrolling
  if (headerEl) {
    const isScrolled = scrollPos > 10;
    if (isScrolled !== headerEl.classList.contains('scrolled')) {
      headerEl.classList.toggle('scrolled', isScrolled);
    }
  }
  let offset = 120; // adjust for header height
  let found = false;

  // If user just tapped a nav link, keep it highlighted until we arrive (or timeout)
  if (navActiveLock) {
    const { hash, until } = navActiveLock;
    const targetId = hash ? hash.replace('#','') : '';
    const targetSection = targetId ? document.getElementById(targetId) : null;
    if (targetSection) {
      const top = targetSection.offsetTop - offset;
      const bottom = top + targetSection.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        // Arrived at target; clear lock and proceed with normal handling
        navActiveLock = null;
      }
    }
    if (navActiveLock && Date.now() < until) {
      // Enforce tapped highlight and skip automatic recalculation for now
      setActiveLinkByHash(hash);
      return;
    }
    // Lock expired; proceed
    navActiveLock = null;
  }
  sections.forEach(section => {
    const top = section.offsetTop - offset;
    const bottom = top + section.offsetHeight;
    if (scrollPos >= top && scrollPos < bottom) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link.hash === '#' + section.id) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
      found = true;
    }
  });
  // If no section matched, check if we're at (or near) the bottom, then highlight Portfolio
  if (!found) {
    const nearBottom = window.innerHeight + scrollPos >= (document.documentElement.scrollHeight - 2);
    if (nearBottom) {
      navLinks.forEach(link => {
        if (link.hash === '#portfolio') {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
    // Otherwise, preserve current active instead of clearing everything to avoid flicker gaps
  }
});

// Initialize nav state and header style on load
window.dispatchEvent(new Event('scroll'));

// Correct hash scroll on initial load (direct link like /#skills)
window.addEventListener('load', () => {
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
  // slight delay to allow AOS/paint
  setTimeout(() => smoothScrollWithStabilize(target), 100);
    }
  }
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Animate on scroll (AOS)
// Respect reduced motion for AOS
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
AOS.init({
  duration: prefersReducedMotion ? 0 : 800,
  once: true,
  disable: prefersReducedMotion
});

// Typing effect for hero tagline
const typingElement = document.querySelector('.typing-dynamic');
if (typingElement) {
  const words = [
    'Data Enthusiast',
    'Data Cleansing Engineer',
    'Data Analyst'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentWord = '';

  function type() {
    currentWord = words[wordIndex];
    if (isDeleting) {
      typingElement.textContent = currentWord.substring(0, charIndex--);
    } else {
      typingElement.textContent = currentWord.substring(0, charIndex++);
    }

    if (!isDeleting && charIndex === currentWord.length + 1) {
      isDeleting = true;
      setTimeout(type, 1200);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(type, 400);
    } else {
      setTimeout(type, isDeleting ? 60 : 100);
    }
  }
  type();
}

// Theme toggle logic (switch-style inside nav)
(function() {
  const html = document.documentElement;
  const toggles = () => document.querySelectorAll('[data-theme-toggle]');

  // Swap themed assets (e.g., Power BI icon) based on current mode
  function updateThemedAssets(mode) {
    const themedImgs = document.querySelectorAll('img[data-src-light][data-src-dark]');
    themedImgs.forEach(img => {
      const lightSrc = img.getAttribute('data-src-light');
      const darkSrc = img.getAttribute('data-src-dark');
      const target = mode === 'dark' ? darkSrc : lightSrc;
      if (target && img.getAttribute('src') !== target) {
        img.setAttribute('src', target);
      }
      // Mark current variant for CSS fine-tuning
      img.setAttribute('data-variant', mode === 'dark' ? 'dark' : 'light');
      // Reset visibility and rewire fallback handling for this image
      const li = img.closest('li.has-icon');
      const fallback = li ? li.querySelector('.si.si-fallback') : null;
      if (fallback) fallback.style.display = 'none';
      img.style.display = '';
      img.onerror = () => {
        if (fallback) fallback.style.display = 'inline-flex';
        img.style.display = 'none';
      };
    });
  }

  function syncToggleUI(mode) {
    toggles().forEach(input => { input.checked = (mode === 'dark'); });
  }

  function applyMode(mode, persist) {
    if (mode === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
    if (persist) {
      try { localStorage.setItem('theme', mode); } catch {}
    }
    updateThemedAssets(mode);
    syncToggleUI(mode);
  }

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const currentModeFromSystem = () => (mq.matches ? 'dark' : 'light');
  const getUserChoice = () => { try { return localStorage.getItem('theme'); } catch { return null; } };

  // Initialize based on current state
  const initial = html.getAttribute('data-theme') || currentModeFromSystem();
  updateThemedAssets(initial);
  syncToggleUI(initial);

  // React to system scheme changes IF user hasn't chosen manually
  mq.addEventListener?.('change', (e) => {
    const userChoice = getUserChoice();
    if (!userChoice) {
      applyMode(e.matches ? 'dark' : 'light', false);
    }
  });

  // Wire all toggles (works for both desktop and mobile positions)
  toggles().forEach(input => {
    input.addEventListener('change', (e) => {
      const next = e.target.checked ? 'dark' : 'light';
      applyMode(next, true);
    });
  });
})();

// Basic i18n implementation
(function() {
  const translations = {
    id: {
  'skip': 'Lewati ke konten utama',
  'nav.home': 'Home',
  'nav.about': 'Tentang',
  'nav.skills': 'Keahlian',
  'nav.experience': 'Pengalaman',
  'nav.portfolio': 'Portofolio',
  'nav.service': 'Jasa',
      'theme.darkMode': '🌙 Mode Gelap',
      'hero.name': 'Muhammad Hanif Al-Azis',
      'hero.im': 'Saya ',
      'hero.desc': 'Profesional yang berorientasi detail dengan pengalaman di analisis data, pelaporan keuangan, dan pemasaran digital. Saat ini bekerja sebagai Data Cleansing Engineer dan berfokus pada penyediaan data yang bersih, akurat, serta terstruktur untuk mendukung transformasi digital dan pengambilan keputusan berbasis data.',
      'cta.downloadCv': 'Download CV',
      'cta.linkedin': 'LinkedIn',
      'cta.viewPortfolio': 'Lihat Portofolio',
      'about.title': 'Tentang Saya',
      'about.p1': 'Saya adalah seorang Data Engineer & Analyst dengan pengalaman lintas industri, mulai dari makanan & minuman, skincare, hingga properti. Saya terbiasa menangani pengelolaan data skala besar, termasuk akses dan analisis database perusahaan menggunakan DBeaver dan PostgreSQL.',
      'about.p2': 'Keahlian utama saya meliputi data cleansing, data analysis, visualisasi data, serta optimalisasi proses bisnis. Saya menguasai Python, SQL (MySQL & PostgreSQL), dan berbagai tools analitik modern seperti Power BI, Tableau, Looker Studio, serta DBeaver untuk eksplorasi dan manajemen database.',
      'about.p3': 'Saya terbiasa bekerja sama dengan tim lintas fungsi untuk menyusun laporan, membuat dashboard, dan memberikan insight yang mendukung keputusan strategis berbasis data.',
      'skills.title': 'Keahlian',
      'skills.dataTools': 'Alat Analisis Data',
      'skills.programming': 'Pemrograman',
      'skills.soft': 'Soft Skills',
      'skills.analytical': 'Pemikiran Analitis',
      'skills.problemSolving': 'Pemecahan Masalah',
      'skills.collaboration': 'Kolaborasi & Komunikasi',
      'experience.title': 'Pengalaman Kerja',
      'exp.1.title': 'Data Cleansing Engineer | PT Fan Integrasi Teknologi (Assigned to PT KAI)',
      'exp.1.period': 'Februari 2025 – Sekarang',
      'exp.1.li1': 'Memastikan kualitas dan konsistensi data material serta operasional.',
      'exp.1.li2': 'Melakukan mapping & standardisasi data historis ke format terkini.',
      'exp.1.li3': 'Menganalisis data penggunaan material 5 tahun terakhir.',
      'exp.1.li4': 'Merancang template checksheet standar untuk maintenance.',
      'exp.1.li5': 'Mendukung transformasi digital melalui data yang bersih & terstruktur.',
      'exp.2.title': 'Person in Charge (PIC) | Aetozee Aesthetic Galaxy – Skincare',
      'exp.2.period': 'Juni 2024 – September 2024',
      'exp.2.li1': 'Menyusun dan menganalisis laporan keuangan (laba rugi & neraca).',
      'exp.2.li2': 'Merancang sistem faktur yang efisien.',
      'exp.2.li3': 'Bekerja sama dengan distributor untuk optimalisasi supply chain.',
      'exp.3.title': 'Manajemen | Bakso Sehat Bakso Atom Galaxy – Restoran',
      'exp.3.period': 'September 2023 – September 2024',
      'exp.3.li1': 'Menganalisis data penjualan mingguan & bulanan untuk insight bisnis.',
      'exp.3.li2': 'Mengawasi SOP operasional restoran.',
      'exp.3.li3': 'Melakukan analisis inventaris untuk efisiensi stok & mengurangi pemborosan.',
      'exp.4.title': 'Co-Founder | Beifimil – Skincare',
      'exp.4.period': 'Oktober 2022 – Mei 2024',
      'exp.4.li1': 'Membuat rencana bisnis & menyiapkan kebutuhan perusahaan (HKI, cetak biru).',
      'exp.4.li2': 'Bekerja sama dengan maklon skincare untuk pengembangan produk.',
      'exp.5.title': 'Marketing | Unggul Generasi Propertindo – Developer Properti',
      'exp.5.period': 'Juli 2021 – Juni 2022',
      'exp.5.li1': 'Mengelola kampanye iklan Facebook & Instagram.',
      'exp.5.li2': 'Menganalisis performa iklan berbayar.',
      'exp.5.li3': 'Melatih karyawan baru di bidang pemasaran digital.',
      'portfolio.title': 'Portofolio (Projects)',
      'portfolio.p1.title': '📊 Aplikasi Akuntansi berbasis Google Spreadsheet',
      'portfolio.p1.d1': 'Fitur: Jurnal Kas, Jurnal Penjualan & Pembelian, Laporan Aset, Inventory, Laba Rugi, Neraca.',
      'portfolio.p1.d2': 'Rumus yang digunakan: INDEX MATCH, SUMIFS, QUERY, UNIQUE, FILTER, CHOOSECOLUMN, dll.',
      'portfolio.p1.cta': '🔗 Lihat Project',
      'portfolio.p2.title': '🐍 Analisis Data Python – Amazon Best Sellers (Valentine 2024)',
      'portfolio.p2.d1': 'Dataset: “2024 Amazon Best Sellers: Top Valentine Gifts”',
      'portfolio.p2.d2': 'Analisis tren & visualisasi dengan Python (Pandas, Matplotlib).',
      'portfolio.p2.cta': '🔗 Lihat Project',
      'footer.title': 'Tertarik untuk Bekerja Sama?',
      'footer.desc': 'Saya selalu terbuka untuk diskusi, proyek, atau peluang baru. Hubungi saya melalui:',
      'footer.email': 'hanif@hifaliz.com',
      'footer.phone': '0812-8053-4553'
    },
    en: {
  'skip': 'Skip to main content',
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.skills': 'Skills',
  'nav.experience': 'Experience',
  'nav.portfolio': 'Portfolio',
  'nav.service': 'Service',
      'theme.darkMode': '🌙 Dark Mode',
      'hero.name': 'Muhammad Hanif Al-Azis',
      'hero.im': "I'm ",
      'hero.desc': 'Detail-oriented professional with experience in data analysis, financial reporting, and digital marketing. Currently working as a Data Cleansing Engineer focused on delivering clean, accurate, and structured data to support digital transformation and data-driven decision making.',
      'cta.downloadCv': 'Download CV',
      'cta.linkedin': 'LinkedIn',
      'cta.viewPortfolio': 'View Portfolio',
      'about.title': 'About Me',
      'about.p1': 'I am a Data Engineer & Analyst with cross-industry experience, from F&B and skincare to real estate. I handle large-scale data management, including corporate database access and analysis using DBeaver and PostgreSQL.',
      'about.p2': 'My core skills include data cleansing, data analysis, data visualization, and business process optimization. I use Python, SQL (MySQL & PostgreSQL), and modern analytics tools like Power BI, Tableau, Looker Studio, and DBeaver for exploration and database management.',
      'about.p3': 'I often collaborate with cross-functional teams to prepare reports, build dashboards, and deliver insights that support data-driven strategic decisions.',
      'skills.title': 'Skills',
      'skills.dataTools': 'Data Analysis Tools',
      'skills.programming': 'Programming',
      'skills.soft': 'Soft Skills',
      'skills.analytical': 'Analytical Thinking',
      'skills.problemSolving': 'Problem Solving',
      'skills.collaboration': 'Collaboration & Communication',
      'experience.title': 'Work Experience',
  'exp.1.title': 'Data Cleansing Engineer | PT Fan Integrasi Teknologi (Assigned to PT KAI)',
  'exp.1.period': 'February 2025 – Present',
  'exp.1.li1': 'Ensure quality and consistency of material and operational data.',
  'exp.1.li2': 'Map and standardize historical data to the latest format.',
  'exp.1.li3': 'Analyze material usage data over the last 5 years.',
  'exp.1.li4': 'Design standard checksheet templates for maintenance.',
  'exp.1.li5': 'Support digital transformation through clean and structured data.',
  'exp.2.title': 'Person in Charge (PIC) | Aetozee Aesthetic Galaxy – Skincare',
  'exp.2.period': 'June 2024 – September 2024',
  'exp.2.li1': 'Prepare and analyze financial reports (P&L and balance sheet).',
  'exp.2.li2': 'Design an efficient invoicing system.',
  'exp.2.li3': 'Collaborate with distributors to optimize the supply chain.',
  'exp.3.title': 'Management | Bakso Sehat Bakso Atom Galaxy – Restaurant',
  'exp.3.period': 'September 2023 – September 2024',
  'exp.3.li1': 'Analyze weekly & monthly sales data for business insights.',
  'exp.3.li2': 'Oversee restaurant operational SOPs.',
  'exp.3.li3': 'Conduct inventory analysis to improve efficiency and reduce waste.',
  'exp.4.title': 'Co-Founder | Beifimil – Skincare',
  'exp.4.period': 'October 2022 – May 2024',
  'exp.4.li1': 'Create business plans and prepare company requirements (IPR, blueprints).',
  'exp.4.li2': 'Work with skincare manufacturers to develop products.',
  'exp.5.title': 'Marketing | Unggul Generasi Propertindo – Property Developer',
  'exp.5.period': 'July 2021 – June 2022',
  'exp.5.li1': 'Manage Facebook & Instagram ad campaigns.',
  'exp.5.li2': 'Analyze paid ads performance.',
  'exp.5.li3': 'Train new employees in digital marketing.',
      'portfolio.title': 'Portfolio (Projects)',
      'portfolio.p1.title': '📊 Accounting App using Google Spreadsheet',
      'portfolio.p1.d1': 'Features: Cash Journal, Sales & Purchase Journal, Asset Report, Inventory, Profit & Loss, Balance Sheet.',
      'portfolio.p1.d2': 'Functions used: INDEX MATCH, SUMIFS, QUERY, UNIQUE, FILTER, CHOOSECOLUMN, etc.',
      'portfolio.p1.cta': '🔗 View Project',
      'portfolio.p2.title': '🐍 Python Data Analysis – Amazon Best Sellers (Valentine 2024)',
      'portfolio.p2.d1': 'Dataset: “2024 Amazon Best Sellers: Top Valentine Gifts”',
      'portfolio.p2.d2': 'Trend analysis & visualization with Python (Pandas, Matplotlib).',
      'portfolio.p2.cta': '🔗 View Project',
      'footer.title': 'Interested in Working Together?',
      'footer.desc': "I'm always open to discussions, projects, or new opportunities. Reach me via:",
      'footer.email': 'hanif@hifaliz.com',
      'footer.phone': '+62 812-8053-4553'
    }
  };

  function applyLanguage(lang) {
    const dict = translations[lang] || translations.id;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        node.textContent = dict[key];
      }
    });
    // Update active state on buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    try { localStorage.setItem('lang', lang); } catch {}
  }

  // Initialize preferred language
  const saved = (() => { try { return localStorage.getItem('lang'); } catch { return null; } })();
  const initialLang = saved ? saved : ((navigator.language || 'id').toLowerCase().startsWith('en') ? 'en' : 'id');
  applyLanguage(initialLang);

  // Wire language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      applyLanguage(lang);
    });
  });
})();

// Replace broken brand icons with fallback monogram badges
(function() {
  const items = document.querySelectorAll('.skills-grid li.has-icon');
  items.forEach(li => {
    const img = li.querySelector('img.si-img');
    const fallback = li.querySelector('.si.si-fallback');
    if (img && fallback) {
      // Hide fallback by default; show only on error
      fallback.style.display = 'none';
      img.addEventListener('error', () => {
        fallback.style.display = 'inline-flex';
        img.style.display = 'none';
      }, { once: true });
      // If image already failed before JS ran
      if (img.complete && img.naturalWidth === 0) {
        fallback.style.display = 'inline-flex';
        img.style.display = 'none';
      }
    }
  });
})();
