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
