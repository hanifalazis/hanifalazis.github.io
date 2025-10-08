// script.js

// ===== CURSOR TRAIL EFFECT (Standard Cursor) =====
(function initCursorTrail() {
  // Check if device supports hover (skip on touch devices)
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!hasHover || prefersReducedMotion) {
    return; // Don't initialize cursor trail on touch devices or when reduced motion is preferred
  }
  
  // Cursor trail effect - positioned at the back of the cursor (tail)
  let lastTrailTime = 0;
  const trailDelay = 30; // milliseconds between trail particles
  
  // Track previous mouse positions for trail offset
  let prevMouseX = 0;
  let prevMouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < trailDelay) return;
    lastTrailTime = now;
    
    // Calculate direction vector from current to previous position
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    
    // Calculate distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalize and create offset (trail appears behind cursor)
    const offsetDistance = 12; // pixels behind the cursor
    let offsetX = 0;
    let offsetY = 0;
    
    if (distance > 0) {
      offsetX = -(deltaX / distance) * offsetDistance;
      offsetY = -(deltaY / distance) * offsetDistance;
    }
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = (e.clientX + offsetX) + 'px';
    trail.style.top = (e.clientY + offsetY) + 'px';
    document.body.appendChild(trail);
    
    // Update previous position
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    
    // Remove trail after animation
    setTimeout(() => {
      trail.remove();
    }, 600);
  });
})();

// ===== HAMBURGER MENU =====
// Enhanced Hamburger Menu with better accessibility and focus management
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
let menuFocusableElements = null;

function toggleMenu() {
  const wasExpanded = hamburger.classList.contains('active');
  
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  
  const isExpanded = hamburger.classList.contains('active');
  hamburger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  
  // Enhanced focus management
  if (isExpanded) {
    // Menu is opening - allow background scrolling
    
    // Get all focusable elements in the menu
    menuFocusableElements = navMenu.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    // Staggered animation for menu items
    const navLinks = navMenu.querySelectorAll('a, .nav-theme-toggle, .lang-dropdown');
    navLinks.forEach((link, index) => {
      link.style.opacity = '0';
      link.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        link.style.opacity = '1';
        link.style.transform = 'translateX(0)';
      }, 50 + (index * 50)); // Stagger delay
    });
    
    // Focus first menu item for better keyboard navigation
    if (menuFocusableElements.length > 0) {
      setTimeout(() => menuFocusableElements[0].focus(), 100);
    }
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
    
    // Refresh highlight based on current scroll position
    window.dispatchEvent(new Event('scroll'));
  } else {
    // Menu is closing - quick fade out
    const navLinks = navMenu.querySelectorAll('a, .nav-theme-toggle, .lang-dropdown');
    navLinks.forEach((link) => {
      link.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      link.style.opacity = '0';
      link.style.transform = 'translateX(-10px)';
    });
    
    hamburger.focus(); // Return focus to hamburger button
    document.removeEventListener('keydown', handleEscapeKey);
  }
}

function handleEscapeKey(e) {
  if (e.key === 'Escape' && hamburger.classList.contains('active')) {
    e.preventDefault();
    toggleMenu();
  }
}

// Enhanced keyboard navigation
hamburger.addEventListener('click', toggleMenu);
hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMenu();
  }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (hamburger.classList.contains('active') && 
      !navMenu.contains(e.target) && 
      !hamburger.contains(e.target)) {
    toggleMenu();
  }
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('nav a');
// Handle logo click: keep URL clean (no /#home)
const logoLink = document.querySelector('a.logo');
if (logoLink) {
  logoLink.addEventListener('click', (e) => {
    // If we are already on the root page, avoid reload and avoid adding #home
    const isRoot = location.pathname === '/' || location.pathname.endsWith('/index.html');
    if (isRoot) {
      e.preventDefault();
      if (hamburger.classList.contains('active')) {
        toggleMenu();
      }
      // ensure animations don't jump while scrolling to top
      suppressAOSUntilManualScroll();
      smoothScrollTo('home');
      // Remove any existing hash without reloading
      if (location.hash) {
        history.replaceState(null, '', '/');
      }
    }
    // If not on root (e.g., /service/), let the default href="/" navigate normally
  });
}

// Track whether the user has performed a manual scroll
let hasManualScrolled = false;
// Global AOS suppression flag: when true, AOS remains disabled until manual scroll occurs
let aosSuppressed = false;
// Track ongoing scroll - managed for smooth transitions
let isScrolling = false;
let scrollTimeout = null;
// Smart throttling for rapid clicks
let lastClickTime = 0;
let clickThrottleDelay = 100; // Allow new clicks every 100ms for responsiveness
// Pre-calculated positions cache to eliminate calculation delays
let positionCache = new Map();
let headerHeightCache = null;
let isInitialized = false;

function enableAOSIfNeeded() {
  if (!aosSuppressed) {
    document.body.classList.remove('aos-disabled');
  }
}

function suppressAOSUntilManualScroll() {
  aosSuppressed = true;
  document.body.classList.add('aos-suppressed');
  // Also disable during programmatic scrolls
  document.body.classList.add('aos-disabled');
}

function liftAOSSuppression() {
  if (aosSuppressed) {
    aosSuppressed = false;
    document.body.classList.remove('aos-suppressed');
    document.body.classList.remove('aos-disabled');
    // Optional: small timeout in case we are mid-scroll
    setTimeout(() => {
      document.body.classList.remove('aos-disabled');
    }, 50);
  }
}

function getHeaderHeight() {
    if (headerHeightCache !== null) {
        return headerHeightCache;
    }
    const header = document.querySelector('header');
    headerHeightCache = header ? header.offsetHeight : 60;
    return headerHeightCache;
}

function precalculatePositions() {
    // Pre-calculate all section positions to eliminate delays on first navigation
    positionCache.clear();
    headerHeightCache = null; // Reset cache to recalculate
    const offset = getHeaderHeight();
    
    sections.forEach(section => {
        const position = Math.max(0, section.offsetTop - offset);
        positionCache.set(section.id, position);
    });
    
    isInitialized = true;
}

function updatePositionCache() {
    // Update cache when layout might have changed
    if (isInitialized) {
        precalculatePositions();
    }
}

function smoothScrollTo(targetId) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  // Clear any pending timeout, but allow current smooth scroll to continue until new one starts
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }
  
  // Ensure positions are pre-calculated to eliminate delay
  if (!isInitialized) {
    precalculatePositions();
  }
  
  isScrolling = true;

  // Ensure AOS is disabled during programmatic scroll
  document.body.classList.add('aos-disabled');
  document.body.classList.add('aos-suppressed');

  // For initial load, use instant positioning to avoid jerky animation
  const isInitialLoad = window.pageYOffset === 0 && !hasManualScrolled;
  
  // Use cached position if available, otherwise calculate
  let targetPosition = positionCache.get(targetId);
  if (targetPosition === undefined) {
    const offset = getHeaderHeight();
    targetPosition = Math.max(0, targetElement.offsetTop - offset);
    positionCache.set(targetId, targetPosition);
  }
  
  if (isInitialLoad) {
    // Instant positioning for initial load - no animation, no delays
    window.scrollTo({ top: targetPosition, behavior: 'auto' });
    
    // Minimal correction using requestAnimationFrame for smooth execution
    requestAnimationFrame(() => {
      const gap = targetElement.getBoundingClientRect().top - getHeaderHeight();
      if (Math.abs(gap) > 2) {
        const correction = window.pageYOffset + gap;
        window.scrollTo({ top: Math.max(0, correction), behavior: 'auto' });
      }
      isScrolling = false;
    });
  } else {
    // Always use smooth scroll - let browser handle overlapping animations gracefully
    // This prevents choppy interruptions while still being responsive
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    
    // Longer timeout to let smooth scroll complete naturally - reduces choppiness
    scrollTimeout = setTimeout(() => {
      const currentTarget = targetElement.getBoundingClientRect().top - getHeaderHeight();
      
      // Only correct if there's significant offset (reduce unnecessary corrections)
      if (Math.abs(currentTarget) > 5) {
        const snapTarget = Math.max(0, window.pageYOffset + currentTarget);
        window.scrollTo({ top: snapTarget, behavior: 'smooth' }); // Keep smooth for consistency
      }
      
      isScrolling = false;
    }, 800); // Longer timeout allows smooth animation to complete naturally
  }
}

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const hash = this.hash;
        if (hash.startsWith('#')) {
            e.preventDefault();
            
            // Smart throttling - allow reasonable rapid clicking but prevent excessive spam
            const now = Date.now();
            if (now - lastClickTime < clickThrottleDelay) {
                // Still allow the click but update target - smooth transition to new destination
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = null;
                }
            }
            lastClickTime = now;
            
            const targetId = hash.substring(1);
            
            // Ensure initialization before any scroll action
            if (!isInitialized) {
                precalculatePositions();
            }
            
            // Close mobile menu if open
            if (hamburger.classList.contains('active')) {
                toggleMenu();
            }
            
            // ALWAYS suppress AOS during navigation clicks to prevent layout shifts
            suppressAOSUntilManualScroll();
            
      // Call scroll function - browser will handle smooth transition between targets
      smoothScrollTo(targetId);

      // Keep URL clean when navigating to Home: remove any existing hash
      if (targetId === 'home' && location.hash) {
        history.replaceState(null, '', '/');
      }
        }
    });
});

// Highlight nav on scroll + compact header
const sections = document.querySelectorAll('section[id], footer[id]');
const headerEl = document.querySelector('header');

function updateActiveNav() {
    let scrollPos = window.scrollY || window.pageYOffset;
    const offset = getHeaderHeight() + 20; // Add a small buffer
    let currentSectionId = '';

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop - offset) {
            currentSectionId = section.id;
        }
    });

    // Special case for reaching the very bottom of the page
    if (window.innerHeight + scrollPos >= document.documentElement.scrollHeight - 2) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
            currentSectionId = lastSection.id;
        }
    }

    navLinks.forEach(link => {
        const linkHash = link.hash.substring(1);
        if (linkHash === currentSectionId) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

window.addEventListener('scroll', () => {
    // Toggle compact header when scrolling
    if (headerEl) {
        const isScrolled = (window.scrollY || window.pageYOffset) > 10;
        headerEl.classList.toggle('scrolled', isScrolled);
    }
    updateActiveNav();
  // Show/hide Back-to-Top button
  const btt = document.getElementById('back-to-top');
  if (btt) {
    const show = (window.scrollY || window.pageYOffset) > 300;
    if (show) {
      btt.classList.add('btt-visible');
      btt.removeAttribute('aria-hidden');
      btt.removeAttribute('tabindex');
    } else {
      btt.classList.remove('btt-visible');
      btt.setAttribute('aria-hidden', 'true');
      btt.setAttribute('tabindex', '-1');
    }
  }
});

// Correct hash scroll on initial load (direct link like /#skills)
window.addEventListener('load', () => {
    if (location.hash) {
        const targetId = location.hash.substring(1);
        // On direct hash load, suppress AOS so first view doesn't animate/shift
        suppressAOSUntilManualScroll();
        
        // Wait for all content to load, then position instantly (no animation)
        setTimeout(() => {
            smoothScrollTo(targetId);
        }, 150); // Reduced delay for faster positioning
    }
    // Initial nav highlight
    updateActiveNav();
    // Back-to-Top wiring
    const btt = document.getElementById('back-to-top');
    if (btt) {
      // Ensure initial state hidden (no flash)
      btt.classList.remove('btt-visible');
      btt.setAttribute('aria-hidden', 'true');
      btt.setAttribute('tabindex', '-1');
      btt.addEventListener('click', (e) => {
        e.preventDefault();
        // Keep URL clean, no hash
        suppressAOSUntilManualScroll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (location.hash) history.replaceState(null, '', '/');
      });
    }
});

// Detect manual scrolling to lift suppression
function markManualScroll() {
  if (!hasManualScrolled) {
    hasManualScrolled = true;
    liftAOSSuppression();
    // Remove listeners after first manual scroll
    window.removeEventListener('wheel', onWheel, { passive: true });
    window.removeEventListener('touchstart', onTouchStart, { passive: true });
    window.removeEventListener('keydown', onKeydown, true);
  }
}

function onWheel() { markManualScroll(); }
function onTouchStart() { markManualScroll(); }
function onKeydown(e) {
  // Keys that typically cause scrolling
  const keys = ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End','Space'];
  if (keys.includes(e.key)) markManualScroll();
}

window.addEventListener('wheel', onWheel, { passive: true });
window.addEventListener('touchstart', onTouchStart, { passive: true });
window.addEventListener('keydown', onKeydown, true);

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

// Typing effect for hero tagline (i18n-aware)
(function initTyping(){
  const typingElement = document.querySelector('.typing-dynamic');
  if (!typingElement) return;

  let words = ['Data Enthusiast','Data Cleansing Engineer','Data Analyst'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let rafId = null;
  let timerId = null;

  function clearTimers(){
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (timerId) { clearTimeout(timerId); timerId = null; }
  }

  function setWordsFromDict(dict){
    const arr = dict && Array.isArray(dict['hero.words']) ? dict['hero.words'] : null;
    if (arr && arr.length) {
      words = arr;
      wordIndex = 0;
      charIndex = 0;
      isDeleting = false;
      typingElement.textContent = '';
    }
  }

  function step(){
    const currentWord = words[wordIndex];
    typingElement.textContent = isDeleting
      ? currentWord.substring(0, Math.max(0, --charIndex))
      : currentWord.substring(0, Math.min(currentWord.length, ++charIndex));

    if (!isDeleting && charIndex === currentWord.length) {
      timerId = setTimeout(() => { isDeleting = true; rafId = requestAnimationFrame(step); }, 800);
      return;
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      timerId = setTimeout(() => { rafId = requestAnimationFrame(step); }, 300);
      return;
    }
    timerId = setTimeout(() => { rafId = requestAnimationFrame(step); }, isDeleting ? 55 : 95);
  }

  // If i18n is ready, use its dict
  if (window.__i18n && window.__i18n.currentDict) {
    setWordsFromDict(window.__i18n.currentDict);
  }
  // Listen for language changes
  window.addEventListener('i18n:changed', (e) => {
    setWordsFromDict(e.detail.dict);
  });

  rafId = requestAnimationFrame(step);
})();

// Theme toggle logic (switch-style inside nav)
(function() {
  const html = document.documentElement;
  const toggles = () => document.querySelectorAll('[data-theme-toggle]');
  const transitionOverlay = document.querySelector('.theme-transition');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const transitionDuration = 2500; // ms; keep in sync with CSS animations
  let transitionCleanupTimer = null;

  function clearTransitionTimer() {
    if (transitionCleanupTimer) {
      clearTimeout(transitionCleanupTimer);
      transitionCleanupTimer = null;
    }
  }

  function stopThemeTransition() {
    clearTransitionTimer();
    if (transitionOverlay) {
      transitionOverlay.classList.remove('is-active', 'to-dark', 'to-light');
    }
  }

  function playThemeTransition(targetMode) {
    if (!transitionOverlay || reducedMotionQuery.matches) {
      return;
    }

    clearTransitionTimer();
    transitionOverlay.classList.remove('is-active', 'to-dark', 'to-light');

    // Force reflow so the animation restarts on successive toggles
    void transitionOverlay.offsetWidth; // eslint-disable-line no-unused-expressions

    const stateClass = targetMode === 'dark' ? 'to-dark' : 'to-light';
    transitionOverlay.classList.add('is-active', stateClass);

    transitionCleanupTimer = window.setTimeout(() => {
      transitionOverlay.classList.remove('is-active', stateClass);
      transitionCleanupTimer = null;
    }, transitionDuration);
  }

  const handleReducedMotionChange = (event) => {
    if (event.matches) {
      stopThemeTransition();
    }
  };

  reducedMotionQuery.addEventListener?.('change', handleReducedMotionChange);
  reducedMotionQuery.addListener?.(handleReducedMotionChange);

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
    playThemeTransition(mode);
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

// Basic i18n implementation (external JSON with inline fallback)
(function() {
  const translations = {
    id: {
  'skip': 'Lewati ke konten utama',
  'nav.home': 'Home',
  'nav.about': 'Tentang',
  'nav.contact': 'Kontak',
  'nav.skills': 'Keahlian',
  'nav.experience': 'Pengalaman',
  'nav.portfolio': 'Portofolio',
  'nav.service': 'Jasa',
  'theme.darkMode': 'Mode Gelap',
    // Back to Top (titles/aria)
    'backToTop.title': 'Kembali ke atas',
    'backToTop.aria': 'Kembali ke atas',
      'hero.name': 'Muhammad Hanif Al Azis',
      'hero.im': 'Saya ',
      'hero.desc': 'Profesional yang berorientasi detail dengan pengalaman di analisis data, pelaporan keuangan, dan pemasaran digital. Saat ini bekerja sebagai Data Cleansing Engineer dan berfokus pada penyediaan data yang bersih, akurat, serta terstruktur untuk mendukung transformasi digital dan pengambilan keputusan berbasis data.',
      'cta.downloadCv': 'Download CV',
      'cta.linkedin': 'LinkedIn',
      'cta.viewPortfolio': 'Lihat Portofolio',
      'about.title': 'Tentang Saya',
      'about.p1': 'Saya adalah seorang Data Analyst dengan pengalaman lintas industri, mulai dari makanan & minuman, skincare, hingga properti. Saya terbiasa menangani pengelolaan data skala besar, termasuk akses dan analisis database perusahaan menggunakan DBeaver dan PostgreSQL.',
      'about.p2': 'Keahlian utama saya meliputi data cleansing, data analysis, visualisasi data, serta optimalisasi proses bisnis. Saya menguasai Python, SQL (MySQL & PostgreSQL), dan berbagai tools analitik modern seperti Power BI, Tableau, Looker Studio, serta DBeaver untuk eksplorasi dan manajemen database.',
      'about.p3': 'Saya terbiasa bekerja sama dengan tim lintas fungsi untuk menyusun laporan, membuat dashboard, dan memberikan insight yang mendukung keputusan strategis berbasis data.',
      'skills.title': 'Keahlian',
  'skills.techTitle': 'My Tech Stack',
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
  'portfolio.filter.all': 'Semua',
  'portfolio.category.dataAnalysis': 'Analisis Data',
  'portfolio.category.dashboard': 'Dashboard',
  'portfolio.p1.title': '📊 Aplikasi Akuntansi berbasis Google Spreadsheet',
  'portfolio.p1.d1': 'Fitur: Jurnal Kas, Jurnal Penjualan & Pembelian, Laporan Aset, Inventory, Laba Rugi, Neraca.',
  'portfolio.p1.d2': 'Rumus yang digunakan: INDEX MATCH, SUMIFS, QUERY, UNIQUE, FILTER, CHOOSECOLUMN, dll.',
  'portfolio.p1.cta': '🔗 Lihat Project',
  'portfolio.p2.title': '🐍 Analisis Data Python – Amazon Best Sellers (Valentine 2024)',
  'portfolio.p2.d1': 'Dataset: “2024 Amazon Best Sellers: Top Valentine Gifts”',
  'portfolio.p2.d2': 'Analisis tren & visualisasi dengan Python (Pandas, Matplotlib).',
  'portfolio.p2.cta': '🔗 Lihat Project',
  'portfolio.p3.title': 'Dashboard Consumer Complaints CFPB',
  'portfolio.p3.d1': 'Dashboard interaktif untuk visualisasi data keluhan konsumen CFPB menggunakan Decap CMS dan Google Looker Studio.',
  'portfolio.p4.title': 'Demographics and Member Distribution Dashboard',
  'portfolio.p4.d1': 'Dashboard interaktif untuk visualisasi demografi dan distribusi anggota menggunakan Google Looker Studio.',
  'portfolio.p5.title': 'Dashboard Analisis Tingkat Pengangguran di Indonesia',
  'portfolio.p5.d1': 'Dashboard interaktif untuk analisis Tingkat Pengangguran Terbuka (TPT) di Indonesia, menampilkan tren waktu, perbandingan wilayah, dan demografi.',
      'footer.title': 'Tertarik untuk Bekerja Sama?',
      'footer.desc': 'Saya selalu terbuka untuk diskusi, proyek, atau peluang baru. Hubungi saya melalui:',
      'footer.email': 'hanif@hifaliz.com',
      'footer.phone': '0812-8053-4553'
    },
  en: {
  'skip': 'Skip to main content',
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.skills': 'Skills',
  'nav.experience': 'Experience',
  'nav.portfolio': 'Portfolio',
  'nav.service': 'Service',
  'theme.darkMode': 'Dark Mode',
    // Back to Top (titles/aria)
    'backToTop.title': 'Back to top',
    'backToTop.aria': 'Back to top',
      'hero.name': 'Muhammad Hanif Al Azis',
      'hero.im': "I'm ",
      'hero.desc': 'Detail-oriented professional with experience in data analysis, financial reporting, and digital marketing. Currently working as a Data Cleansing Engineer focused on delivering clean, accurate, and structured data to support digital transformation and data-driven decision making.',
      'cta.downloadCv': 'Download CV',
      'cta.linkedin': 'LinkedIn',
      'cta.viewPortfolio': 'View Portfolio',
      'about.title': 'About Me',
      'about.p1': 'I am a Data Analyst with cross-industry experience, from F&B and skincare to real estate. I handle large-scale data management, including corporate database access and analysis using DBeaver and PostgreSQL.',
      'about.p2': 'My core skills include data cleansing, data analysis, data visualization, and business process optimization. I use Python, SQL (MySQL & PostgreSQL), and modern analytics tools like Power BI, Tableau, Looker Studio, and DBeaver for exploration and database management.',
      'about.p3': 'I often collaborate with cross-functional teams to prepare reports, build dashboards, and deliver insights that support data-driven strategic decisions.',
      'skills.title': 'Skills',
  'skills.techTitle': 'My Tech Stack',
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
  'portfolio.filter.all': 'All',
  'portfolio.category.dataAnalysis': 'Data Analysis',
  'portfolio.category.dashboard': 'Dashboard',
  'portfolio.p1.title': '📊 Accounting App using Google Spreadsheet',
  'portfolio.p1.d1': 'Features: Cash Journal, Sales & Purchase Journal, Asset Report, Inventory, Profit & Loss, Balance Sheet.',
  'portfolio.p1.d2': 'Functions used: INDEX MATCH, SUMIFS, QUERY, UNIQUE, FILTER, CHOOSECOLUMN, etc.',
  'portfolio.p1.cta': '🔗 View Project',
  'portfolio.p2.title': '🐍 Python Data Analysis – Amazon Best Sellers (Valentine 2024)',
  'portfolio.p2.d1': 'Dataset: “2024 Amazon Best Sellers: Top Valentine Gifts”',
  'portfolio.p2.d2': 'Trend analysis & visualization with Python (Pandas, Matplotlib).',
  'portfolio.p2.cta': '🔗 View Project',
  'portfolio.p3.title': 'Consumer Complaints CFPB Dashboard',
  'portfolio.p3.d1': 'Interactive dashboard to visualize CFPB consumer complaints using Decap CMS and Google Looker Studio.',
  'portfolio.p4.title': 'Demographics and Member Distribution Dashboard',
  'portfolio.p4.d1': 'Interactive dashboard for visualizing demographics and member distribution using Google Looker Studio.',
  'portfolio.p5.title': 'Indonesia Unemployment Rate Analysis Dashboard',
  'portfolio.p5.d1': 'Interactive dashboard analyzing Indonesia’s Open Unemployment Rate (TPT), showing time trends, regional comparisons, and demographics.',
      'footer.title': 'Interested in Working Together?',
      'footer.desc': "I'm always open to discussions, projects, or new opportunities. Reach me via:",
      'footer.email': 'hanif@hifaliz.com',
      'footer.phone': '+62 812-8053-4553'
    }
  };

  // Cache for externally loaded dictionaries
  const externalDicts = { id: null, en: null };

  async function loadExternalDict(lang) {
    try {
      if (externalDicts[lang]) return externalDicts[lang];
      const res = await fetch(`/assets/i18n/${lang}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error('i18n fetch failed');
      const data = await res.json();
      externalDicts[lang] = data;
      return data;
    } catch (e) {
      // Fallback to inline translations
      externalDicts[lang] = translations[lang] || translations.id;
      return externalDicts[lang];
    }
  }

  async function applyLanguage(lang) {
    const dict = await loadExternalDict(lang);
    // Update <html lang>
    try { document.documentElement.setAttribute('lang', lang); } catch {}
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        node.textContent = dict[key];
      }
    });
    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(node => {
      const key = node.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        node.setAttribute('title', dict[key]);
      }
    });
    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(node => {
      const key = node.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) {
        node.setAttribute('aria-label', dict[key]);
      }
    });
    
    // Update dropdown display
    const langCurrent = document.getElementById('lang-current');
    const langText = langCurrent?.querySelector('.lang-text');
    const flagIcon = langCurrent?.querySelector('.flag-icon');
    
    if (langText && flagIcon) {
      langText.textContent = lang.toUpperCase();
      flagIcon.src = `assets/icons/flag-${lang}.svg`;
      flagIcon.alt = lang === 'id' ? 'Indonesia' : 'English';
    }
    
    // Update active state on dropdown options
    document.querySelectorAll('.lang-option').forEach(option => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });
    
    try { localStorage.setItem('lang', lang); } catch {}
    // Expose current dict and dispatch change event for listeners (e.g., typing)
    window.__i18n = window.__i18n || {};
    window.__i18n.currentLang = lang;
    window.__i18n.currentDict = dict;
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang, dict } }));
  }

  // Expose to global so dynamic sections can re-apply translations
  window.applyLanguage = applyLanguage;

  // Initialize preferred language
  const saved = (() => { try { return localStorage.getItem('lang'); } catch { return null; } })();
  const initialLang = saved ? saved : ((navigator.language || 'id').toLowerCase().startsWith('en') ? 'en' : 'id');
  applyLanguage(initialLang);

  // Language dropdown functionality
  const langDropdown = document.querySelector('.lang-dropdown');
  const langCurrent = document.getElementById('lang-current');
  const langOptions = document.getElementById('lang-options');

  if (langCurrent && langOptions) {
    // Check if mobile (simplified check)
    function isMobile() {
      return window.innerWidth <= 900;
    }

    // Toggle dropdown (works on both desktop and mobile)
    langCurrent.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = langDropdown.classList.contains('active');
      langDropdown.classList.toggle('active');
      langCurrent.setAttribute('aria-expanded', !isOpen);
    });

    // Handle option selection
    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', async (e) => {
        e.stopPropagation();
        const lang = option.dataset.lang;
        await applyLanguage(lang);
        
        // Close dropdown on both desktop and mobile
        langDropdown.classList.remove('active');
        langCurrent.setAttribute('aria-expanded', 'false');
      });
    });

    // Close dropdown when clicking outside (desktop only)
    document.addEventListener('click', () => {
      if (!isMobile()) {
        langDropdown.classList.remove('active');
        langCurrent.setAttribute('aria-expanded', 'false');
      }
    });

    // Close dropdown on escape key (desktop only)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && langDropdown.classList.contains('active') && !isMobile()) {
        langDropdown.classList.remove('active');
        langCurrent.setAttribute('aria-expanded', 'false');
        langCurrent.focus();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (isMobile() && langDropdown.classList.contains('active')) {
        langDropdown.classList.remove('active');
        langCurrent.setAttribute('aria-expanded', 'false');
      }
    });
  }
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

// Initialize smooth navigation system
(function initializeNavigation() {
  // Pre-calculate positions as soon as DOM is ready to eliminate delays
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(precalculatePositions, 0); // Async to avoid blocking
    });
  } else {
    setTimeout(precalculatePositions, 0); // Async to avoid blocking
  }
  
  // Update position cache when layout changes
  window.addEventListener('resize', () => {
    clearTimeout(scrollTimeout);
    setTimeout(updatePositionCache, 100); // Debounce resize events
  });
  
  // Re-calculate after images load (could affect layout)
  window.addEventListener('load', () => {
    setTimeout(updatePositionCache, 100);
  });
  
  // Update cache when orientation changes on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(updatePositionCache, 200);
  });
})();

// Dark-mode chip hover: temporarily use light-variant icon
(function enableDarkHoverLightVariant(){
  const html = document.documentElement;
  const isDark = () => (html.getAttribute('data-theme') === 'dark' || html.classList.contains('dark'));

  function attachHoverHandlers(root){
    root.querySelectorAll('.stack-chip').forEach(chip => {
  const img = chip.querySelector('img.si-img[data-src-light][data-src-dark]');
      if (!img) return; // only for icons with both variants
  if (img.classList.contains('no-dark-filter')) return; // respect exception (e.g., Matplotlib)
      const toLight = () => {
        if (!isDark()) return;
        const lightSrc = img.getAttribute('data-src-light');
        if (lightSrc && img.getAttribute('src') !== lightSrc) {
          img.dataset.prevHoverSrc = img.getAttribute('src') || '';
          img.setAttribute('src', lightSrc);
        }
      };
      const toDark = () => {
        if (!isDark()) return;
        const darkSrc = img.getAttribute('data-src-dark') || img.dataset.prevHoverSrc;
        if (darkSrc && img.getAttribute('src') !== darkSrc) {
          img.setAttribute('src', darkSrc);
        }
      };
      chip.addEventListener('mouseenter', toLight);
      chip.addEventListener('mouseleave', toDark);
      chip.addEventListener('focusin', toLight);
      chip.addEventListener('focusout', toDark);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => attachHoverHandlers(document));
  } else {
    attachHoverHandlers(document);
  }
})();
