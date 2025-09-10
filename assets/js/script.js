// script.js
// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    // Close mobile menu
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');

    // Remove active from all links, add to clicked
    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    // Smooth scroll for navigation
    if (this.hash !== '') {
      e.preventDefault();
      const hash = this.hash;
      document.querySelector(hash).scrollIntoView({
        behavior: 'smooth'
      });
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
        if (link.hash === '#' + section.id) {
          link.classList.add('active');
        }
      });
      found = true;
    }
  });
  // Remove highlight if not in any section
  if (!found) navLinks.forEach(link => link.classList.remove('active'));
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Animate on scroll (AOS)
AOS.init({
  duration: 800,
  once: true
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
