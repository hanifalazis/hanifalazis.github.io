// script.js
// Hamburger Menu (click & keyboard, ARIA expanded)
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  const expanded = hamburger.classList.contains('active');
  hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
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
    navLinks.forEach(l => {
      l.classList.remove('active');
      l.removeAttribute('aria-current');
    });
    this.classList.add('active');
    this.setAttribute('aria-current', 'page');

    // Smooth scroll for navigation
    if (this.hash !== '') {
      e.preventDefault();
      const hash = this.hash;
      const target = document.querySelector(hash);
      smoothScrollWithStabilize(target);
    }
  });
});

// Highlight nav on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let scrollPos = window.scrollY || window.pageYOffset;
  let offset = 120; // adjust for header height
  let found = false;
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
    } else {
      navLinks.forEach(link => { link.classList.remove('active'); link.removeAttribute('aria-current'); });
    }
  }
});

// Initialize nav state on load
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

// Theme toggle logic
(function() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  function updateIcons(mode) {
    if (!iconSun || !iconMoon) return;
    if (mode === 'dark') {
      iconMoon.classList.add('hidden');
      iconSun.classList.remove('hidden');
    } else {
      iconSun.classList.add('hidden');
      iconMoon.classList.remove('hidden');
    }
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
      localStorage.setItem('theme', mode);
    }
    updateIcons(mode);
  }

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function currentModeFromSystem() {
    return mq.matches ? 'dark' : 'light';
  }

  function getUserChoice() {
    try { return localStorage.getItem('theme'); } catch { return null; }
  }

  // Initialize icons based on current state
  const initial = html.getAttribute('data-theme') || currentModeFromSystem();
  updateIcons(initial);

  // React to system scheme changes IF user hasn't chosen manually
  mq.addEventListener?.('change', (e) => {
    const userChoice = getUserChoice();
    if (!userChoice) {
      applyMode(e.matches ? 'dark' : 'light', false);
    }
  });

  if (btn) {
    btn.addEventListener('click', () => {
      const userChoice = getUserChoice();
      const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      // Persist explicit user choice
      applyMode(next, true);
    });
  }
})();
