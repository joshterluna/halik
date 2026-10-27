// 1. Target Element Selection (HTML -> JS) - Original IDs Intact
const yearSpan = document.getElementById('year');
const themeBtn = document.getElementById('theme-btn');
const contactBtn = document.getElementById('contact-btn');

// 2. Dynamic Content Injection (JS -> HTML)
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// 3. Event Handling and Class Toggling (JS -> HTML/CSS)
function syncThemeUI(isDark) {
  const themeText = themeBtn ? themeBtn.querySelector('.theme-text') : null;
  if (isDark) {
    document.body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeText) themeText.textContent = 'Toggle Sky Mode';
  } else {
    document.body.classList.remove('dark-mode');
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeText) themeText.textContent = 'Toggle Dark Mode';
  }
}

// Restore saved theme preference if available
const savedTheme = localStorage.getItem('portfolio-theme-aero');
if (savedTheme === 'dark') {
  syncThemeUI(true);
} else {
  syncThemeUI(false);
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    // Toggles .dark-mode defined in style.css on the <body> tag (original behavior intact)
    const isDark = document.body.classList.toggle('dark-mode');

    // Synchronize data-theme and persist choice
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('portfolio-theme-aero', isDark ? 'dark' : 'light');

    const themeText = themeBtn.querySelector('.theme-text');
    if (themeText) {
      themeText.textContent = isDark ? 'Toggle Sky Mode' : 'Toggle Dark Mode';
    }

    // Glass toast notification
    showToast(isDark ? '🌌 Aurora Midnight theme activated' : '☀️ Sky Blue Day theme activated', 'info');
  });
}

// 4. Interactive Feedback (Original alert preserved + enhanced with Aero Glass Toast)
if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    // Original alert modal
    alert('Thank you for reaching out! Contact form coming soon.');

    // Glass pill toast notification
    showToast('Transmission received! Thank you for reaching out.', 'success');
  });
}

/* ==========================================================================
   5. AERO WATER BUBBLES GENERATOR (Interactive & Floating)
   ========================================================================== */
function initAeroBubbles() {
  const container = document.getElementById('bubblesContainer');
  if (!container) return;

  const bubbleCount = 18;

  function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // Randomize diameter between 18px and 55px
    const size = Math.floor(Math.random() * 37) + 18;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Random horizontal starting position
    const leftPercent = Math.random() * 100;
    bubble.style.left = `${leftPercent}%`;

    // Random upward float speed (10s to 20s) and delay
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 6;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    // Interactive Pop Feature: click bubble to pop it with a tactile scale-out!
    bubble.addEventListener('click', () => {
      bubble.style.transform = 'scale(1.5)';
      bubble.style.opacity = '0';
      setTimeout(() => {
        bubble.remove();
        createBubble(); // Spawn a fresh bubble
      }, 200);
    });

    container.appendChild(bubble);
  }

  for (let i = 0; i < bubbleCount; i++) {
    createBubble();
  }
}

/* ==========================================================================
   6. AERO GLASS TOAST NOTIFICATION SYSTEM
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '💧' : (type === 'error' ? '⚠️' : '✨');
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  // Auto dismiss after 3.8s
  setTimeout(() => {
    toast.style.animation = 'fadeOutToast 0.35s ease-out forwards';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 350);
  }, 3800);
}

/* ==========================================================================
   7. NAVIGATION SCROLL & ACTIVE LINK HIGHLIGHT
   ========================================================================== */
function initNavigationScroll() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scrollspy active indicator
    let current = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initAeroBubbles();
  initNavigationScroll();
});
