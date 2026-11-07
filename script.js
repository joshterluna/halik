 document.addEventListener('DOMContentLoaded', () => {
    initAeroBubbles();
    initThemeToggle();
    initNavigation();
    initProjectCarousel();
    initSkillsFilter();
    initPersonalGalleryFolder();
    initLightbox();
    initCustomNotification();
    initGames();
    setCurrentYear();
  });

  /* ==========================================================================
    CENTRALIZED DATA REPOSITORIES (EASY TO EDIT & EXPAND)
    ========================================================================== */

  // Easily add or customize projects here
  const portfolioData = {
    student: {
      name: "Iederf Sean Halik",
      status: "1st Year Information Technology Student",
      degree: "Bachelor of Science in Information Technology (BSIT)",
      college: "University of Immaculate Conception",
      seniorHigh: "Carlos P. Garcia Senior High School (STEM)",
      email: "shanghalik520@gmail.com"
    },
    
    projects: [
      {
        id: "mosquitect",
        title: "MosquiTect: A Multi-Sensor Automated System for Mosquito Detection and Environmental Surveillance",
        category: "Senior High School Research Project",
        publication: "International Journal of Scientific Research and Engineering Trends (IJSRET)",
        date: "February 5, 2026",
        link: "https://ijsret.com/2026/02/05/mosquitect-a-multi-sensor-automated-system-for-mosquito-detection-and-environmental-surveillance/",
        hardware: ["Arduino UNO R4", "Acoustic Frequency Sensor", "DHT Temp/Humidity", "Camera Module"]
      },
      {
        id: "aetherion",
        title: "Aetherion — Hobby-Shop Management System",
        category: "Java Command-Line-Based Management System",
        repository: "https://github.com/joshterluna/Hobby-Shop",
        tech: ["Java SE", "Methods", "File I/O", "CLI"]
      },
      {
        id: "bantaybarangay",
        title: "BantayBarangay — An Incident Reporting and Incident Tracker",
        category: "A high-fidelity Figma prototype for a barangay incident reporting and tracking platform",
        figma: "https://www.figma.com/proto/w4mVYhw2teGCd4moxDQtvQ/BantayBarangay?node-id=128-463&p=f&t=iFnBDPfAu5IuE4aB-1&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=128%3A463",
        tags: ["Figma", "High-Fidelity", "Incident Reporting", "Incident Tracking"]
      }
    ]
  };

  /* ==========================================================================
    1. AERO WATER BUBBLES GENERATOR (Interactive & Floating)
    ========================================================================== */
  function initAeroBubbles() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;

    const bubbleCount = 20;
    const POP_VOLUME = 0.3; // 30% of full volume
    const POP_MS = 340;     // keep in sync with the bubblePop animation in style.css

    /* ---- Pop sound: synthesised with Web Audio, so no audio file is needed ---- */
    let audioCtx = null;
    let noiseBuffer = null;

    function getAudio() {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function playPop(size) {
      try {
        const ctx = getAudio();
        if (!ctx) return;
        const t = ctx.currentTime;

        const master = ctx.createGain();
        master.gain.value = POP_VOLUME;
        master.connect(ctx.destination);

        // Smaller bubbles pop with a higher pitch
        const startFreq = 700 + (65 - size) * 14;

        // Body of the pop: a quick falling sine "bloop"
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);
        oscGain.gain.setValueAtTime(0.0001, t);
        oscGain.gain.exponentialRampToValueAtTime(0.9, t + 0.004);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(oscGain).connect(master);
        osc.start(t);
        osc.stop(t + 0.13);

        // Snap of the pop: a very short burst of filtered noise
        if (!noiseBuffer) {
          const len = Math.floor(ctx.sampleRate * 0.05);
          noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();
        noise.buffer = noiseBuffer;
        filter.type = 'highpass';
        filter.frequency.value = 1500;
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        noise.connect(filter).connect(noiseGain).connect(master);
        noise.start(t);
      } catch (err) {
        /* Audio is optional: never let it break the page */
      }
    }

    /* ---- Pop visuals: freeze the bubble where it is, then burst it ---- */
    function spawnBurst(x, y, size) {
      const burst = document.createElement('div');
      burst.className = 'bubble-burst';
      burst.style.left = `${x}px`;
      burst.style.top = `${y}px`;
      burst.style.setProperty('--burst-d', `${Math.round(size * 0.9)}px`);
      burst.style.setProperty('--burst-ring', `${size}px`);
      for (let i = 0; i < 8; i++) {
        const drop = document.createElement('i');
        drop.style.setProperty('--a', `${i * 45 + Math.random() * 20 - 10}deg`);
        burst.appendChild(drop);
      }
      container.appendChild(burst);
      setTimeout(() => burst.remove(), 600);
    }

    function popBubble(bubble) {
      if (bubble.classList.contains('popping')) return;

      const size = parseFloat(bubble.style.width) || 40;
      const rect = bubble.getBoundingClientRect();
      const box = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - box.left;
      const cy = rect.top + rect.height / 2 - box.top;

      // The float animation moves the bubble with a transform. Pin it to its
      // current spot so it pops where the player clicked instead of jumping.
      bubble.style.left = `${cx - size / 2}px`;
      bubble.style.top = `${cy - size / 2}px`;
      bubble.style.bottom = 'auto';
      bubble.style.setProperty('--pop-s', String(rect.width / size));
      bubble.style.setProperty('--pop-o', getComputedStyle(bubble).opacity);
      bubble.style.animationDuration = `${POP_MS}ms`;
      bubble.style.animationDelay = '0s';
      bubble.classList.add('popping');

      spawnBurst(cx, cy, size);
      playPop(size);

      setTimeout(() => {
        bubble.remove();
        createBubble(true);
      }, POP_MS);
    }

    function createBubble(isRespawn) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      // Randomize dimensions between 20px and 65px
      const size = Math.floor(Math.random() * 45) + 20;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Randomize horizontal origin
      const leftPercent = Math.random() * 100;
      bubble.style.left = `${leftPercent}%`;

      // Randomize animation speed and delay (replacements start sooner)
      const duration = Math.random() * 14 + 10; // 10s to 24s
      const delay = Math.random() * (isRespawn ? 3 : 8);
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;

      // Click a bubble directly to pop it
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        popBubble(bubble);
      });

      container.appendChild(bubble);
    }

    for (let i = 0; i < bubbleCount; i++) {
      createBubble(false);
    }

    // The bubbles live behind the page content, so most of the screen is covered
    // by section wrappers. Clicks on empty page space are hit-tested against the
    // bubbles so those can be popped too, without touching links, buttons,
    // glass cards, forms or panels.
    const SKIP_TARGETS = 'a, button, input, textarea, select, label, summary, canvas, img, ' +
      '.aero-glass, .aero-glass-subtle, .games-panel, .folder-window, .lightbox-overlay, .toast-container';

    document.addEventListener('click', (e) => {
      if (e.target.closest(SKIP_TARGETS)) return;
      const sel = window.getSelection && window.getSelection();
      if (sel && !sel.isCollapsed) return; // the player was selecting text

      let hit = null;
      let hitDist = Infinity;
      container.querySelectorAll('.bubble:not(.popping)').forEach((b) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist <= r.width / 2 && dist < hitDist) {
          hit = b;
          hitDist = dist;
        }
      });
      if (hit) popBubble(hit);
    });
  }

  /* ==========================================================================
    2. THEME TOGGLE (Sky Blue Day <-> Aurora Midnight Night)
    ========================================================================== */
  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlRoot = document.documentElement;

    // Retrieve saved theme or default to light (Sky Day)
    const savedTheme = localStorage.getItem('portfolio-theme-aero');
    const initialTheme = savedTheme || 'light';

    htmlRoot.setAttribute('data-theme', initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlRoot.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlRoot.setAttribute('data-theme', targetTheme);
        localStorage.setItem('portfolio-theme-aero', targetTheme);
      });
    }
  }

  /* ==========================================================================
    3. NAVIGATION & SCROLLSPY
    ========================================================================== */
  function initNavigation() {
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    let scrollAnimationFrame;

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;

        event.preventDefault();
        const headerOffset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 12;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        history.pushState(null, '', link.hash);
        cancelAnimationFrame(scrollAnimationFrame);

        const start = window.scrollY;
        const distance = top - start;
        const startTime = performance.now();
        const duration = reduceMotion ? 800 : 1200;

        function animateScroll(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = progress < 0.5
            ? 4 * progress ** 3
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          window.scrollTo(0, start + distance * eased);
          if (progress < 1) {
            scrollAnimationFrame = requestAnimationFrame(animateScroll);
          }
        }

        scrollAnimationFrame = requestAnimationFrame(animateScroll);
      });
    });

    // Header scroll shadow
    window.addEventListener('scroll', () => {
      if (window.scrollY > 25) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Scrollspy active indicator
      let scrollPos = window.scrollY + 180;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { passive: true });

    // Mobile menu toggle
    if (navToggle && navMenu) {
      const toggleMenu = () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      const closeMenu = () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      };

      navToggle.addEventListener('click', toggleMenu);

      navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('click', (e) => {
        if (
          navMenu.classList.contains('open') &&
          !navMenu.contains(e.target) &&
          !navToggle.contains(e.target)
        ) {
          closeMenu();
        }
      });
    }
  }

  /* ==========================================================================
    4. FEATURED PROJECTS CAROUSEL (Arrows, Dots, Dragging & Touch Swiping)
    ========================================================================== */
  function initProjectCarousel() {
    const track = document.getElementById('carouselTrack');
    const viewport = document.getElementById('carouselViewport');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    const slides = document.querySelectorAll('.project-slide');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const slideCount = slides.length;

    function updateCarousel(animate = true) {
      if (!animate) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.3, 1)';
      }

      // Slide track translate
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update slide active states
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentIndex);
        slide.setAttribute('aria-hidden', idx !== currentIndex);
      });

      // Update pagination dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot-bubble');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = slideCount - 1;
      } else if (index >= slideCount) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }
      updateCarousel(true);
    }

    // Navigation Arrow clicks
    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    // Pagination Dot clicks
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot-bubble');
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const targetSlide = parseInt(dot.getAttribute('data-slide'), 10);
          if (!isNaN(targetSlide)) {
            goToSlide(targetSlide);
          }
        });
      });
    }

    // Mouse Dragging on Desktop
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    viewport.addEventListener('mousedown', (e) => {
      // Prevent drag interference with buttons or links
      if (e.target.closest('a') || e.target.closest('button')) return;

      isDragging = true;
      startX = e.clientX;
      viewport.classList.add('is-dragging');
      track.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const diffX = currentX - startX;
      const offsetPercentage = (diffX / viewport.clientWidth) * 100;
      track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${offsetPercentage}%))`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('is-dragging');
      const diffX = e.clientX - startX;

      // Threshold of 50px to trigger next or previous
      if (diffX < -50) {
        goToSlide(currentIndex + 1);
      } else if (diffX > 50) {
        goToSlide(currentIndex - 1);
      } else {
        updateCarousel(true);
      }
    });

    // Touch Swiping on Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (diff < -45) {
        goToSlide(currentIndex + 1);
      } else if (diff > 45) {
        goToSlide(currentIndex - 1);
      }
    }, { passive: true });

    // Initialize
    updateCarousel(false);
  }

  /* ==========================================================================
    5. SKILLS FILTER
    ========================================================================== */
  function initSkillsFilter() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const skillCards = document.querySelectorAll('.skill-category-window');

    if (filterTabs.length === 0 || skillCards.length === 0) return;

    const showCategory = tab => {
      filterTabs.forEach(item => item.classList.toggle('active', item === tab));
      const targetCategory = tab.getAttribute('data-category');

      skillCards.forEach(card => {
        const isVisible = card.getAttribute('data-cat') === targetCategory;
        card.style.display = isVisible ? 'flex' : 'none';
        card.style.opacity = isVisible ? '1' : '0';
        card.style.transform = isVisible ? 'scale(1)' : 'scale(0.95)';
      });
    };

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => showCategory(tab));
    });

    showCategory(document.querySelector('.filter-tab[data-category="languages"]') || filterTabs[0]);
  }

  /* ==========================================================================
    6. FLOATING PICTURE FOLDER — PERSONAL GALLERY
    ========================================================================== */
  function initPersonalGalleryFolder() {
    const triggerBtn = document.getElementById('floatingFolderBtn');
    const folderWindow = document.getElementById('folderWindow');
    const closeBtn = document.getElementById('folderCloseBtn');
    const orbClose = document.getElementById('folderOrbClose');
    const categoryTabs = document.querySelectorAll('.folder-tab');
    const tabPanes = document.querySelectorAll('.folder-tab-pane');
    const openGalleryTriggers = document.querySelectorAll('.open-gallery-btn');

    if (!triggerBtn || !folderWindow) return;

    const openFolder = () => {
      folderWindow.classList.add('open');
      folderWindow.setAttribute('aria-hidden', 'false');
    };

    const closeFolder = () => {
      folderWindow.classList.remove('open');
      folderWindow.setAttribute('aria-hidden', 'true');
    };

    const toggleFolder = () => {
      if (folderWindow.classList.contains('open')) {
        closeFolder();
      } else {
        openFolder();
      }
    };

    triggerBtn.addEventListener('click', toggleFolder);

    if (closeBtn) closeBtn.addEventListener('click', closeFolder);
    if (orbClose) orbClose.addEventListener('click', closeFolder);

    // Close when clicking outside folder window
    document.addEventListener('click', (e) => {
      if (
        folderWindow.classList.contains('open') &&
        !folderWindow.contains(e.target) &&
        !triggerBtn.contains(e.target) &&
        !e.target.closest('.open-gallery-btn')
      ) {
        closeFolder();
      }
    });

    // Category Tab Switching
    function switchTab(category) {
      categoryTabs.forEach(tab => {
        const isTarget = tab.getAttribute('data-category') === category;
        tab.classList.toggle('active', isTarget);
        tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      });

      tabPanes.forEach(pane => {
        const paneId = `pane${category.charAt(0).toUpperCase() + category.slice(1)}`;
        pane.classList.toggle('active', pane.id === paneId);
      });
    }

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.getAttribute('data-category');
        switchTab(category);
      });
    });

    // Buttons inside project cards that direct to specific folder tab
    openGalleryTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabTarget = btn.getAttribute('data-gallery-tab') || 'achievements';
        switchTab(tabTarget);
        openFolder();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && folderWindow.classList.contains('open')) {
        closeFolder();
      }
    });
  }

  /* ==========================================================================
    7. LIGHTBOX / IMAGE PREVIEW MODAL
    ========================================================================== */
  function initLightbox() {
    const modal = document.getElementById('lightboxModal');
    const imgElement = document.getElementById('lightboxImage');
    const titleElement = document.getElementById('lightboxTitle');
    const captionTitle = document.getElementById('lightboxCaptionTitle');
    const captionDesc = document.getElementById('lightboxCaptionDesc');
    const closeBtn = document.getElementById('lightboxCloseBtn');
    const orbClose = document.getElementById('lightboxOrbClose');

    if (!modal) return;

    const previewItems = document.querySelectorAll('.previewable-item');

    function openLightbox(item) {
      const imgSrc = item.getAttribute('data-img');
      const title = item.getAttribute('data-title') || 'Preview';
      const desc = item.getAttribute('data-desc') || '';

      imgElement.src = imgSrc;
      imgElement.alt = title;
      titleElement.textContent = title;
      captionTitle.textContent = title;
      captionDesc.textContent = desc;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        imgElement.src = '';
      }, 200);
    }

    previewItems.forEach(item => {
      item.addEventListener('click', () => openLightbox(item));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (orbClose) orbClose.addEventListener('click', closeLightbox);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  /* ==========================================================================
    8. CUSTOM WEBSITE NOTIFICATION (AERO TOAST MODAL)
    Exact message: "Thank you for reaching out! Contact Form Coming soon"
    ========================================================================== */
  function initCustomNotification() {
    const triggers = document.querySelectorAll('.get-in-touch-trigger');
    const container = document.getElementById('toastContainer');

    if (!container) return;

    function showCustomToast() {
      // Clear any existing toasts for a crisp experience
      container.innerHTML = '';

      const toast = document.createElement('div');
      toast.className = 'aero-toast';
      toast.role = 'alert';

      toast.innerHTML = `
        <div class="toast-content-row">
          <div class="toast-icon-wrap" aria-hidden="true">
            <span>💧</span>
          </div>
          <div class="toast-text-col">
            <h4 class="toast-title">Transmission Status</h4>
            <p class="toast-msg">Thank you for reaching out! Contact Form Coming soon</p>
          </div>
          <button class="toast-dismiss-btn" aria-label="Dismiss Notification">✕</button>
        </div>
        <div class="toast-progress-bar"></div>
      `;

      // Progress bar animation (5 seconds)
      const progressBar = toast.querySelector('.toast-progress-bar');
      progressBar.style.transition = 'transform 5s linear';
      progressBar.style.transform = 'scaleX(1)';

      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });

      // Dismiss button
      const dismissBtn = toast.querySelector('.toast-dismiss-btn');
      const dismissToast = () => {
        toast.classList.add('closing');
        setTimeout(() => {
          toast.remove();
        }, 300);
      };

      dismissBtn.addEventListener('click', dismissToast);

      // Auto dismiss after 5 seconds
      const timeout = setTimeout(dismissToast, 5000);

      container.appendChild(toast);
    }

    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        showCustomToast();
      });
    });
  }

  /* ==========================================================================
   AERO GAMES — SUDOKU & SNAKE
   ========================================================================== */
function initGames() {
  const toggleBtn = document.getElementById('gamesToggle');
  const panel = document.getElementById('gamesPanel');
  if (!toggleBtn || !panel) return;

  const header = document.getElementById('header');
  const tabs = Array.from(panel.querySelectorAll('.games-tab'));
  const panes = Array.from(panel.querySelectorAll('.game-pane'));
  const sudoku = createSudokuGame(panel);
  const snake = createSnakeGame(panel);
  let activeGame = 'sudoku';

  const isOpen = () => panel.classList.contains('open');

  // Sit just below the (fixed) header, whatever its current height is
  function placePanel() {
    const top = header ? header.offsetHeight + 10 : 80;
    panel.style.setProperty('--games-top', `${top}px`);
  }

  function selectGame(name) {
    activeGame = name;
    tabs.forEach((tab) => {
      const on = tab.dataset.game === name;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    panes.forEach((pane) => {
      const on = pane.dataset.game === name;
      pane.hidden = !on;
      pane.classList.toggle('active', on);
    });
    if (name === 'snake') {
      snake.resize();
    } else {
      snake.pause();
    }
  }

  // Move keyboard focus into the dialog. The panel only becomes focusable once the
  // browser has applied its "open" styles, so retry for a few frames if needed.
  function focusActiveTab(attempt = 0) {
    const activeTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    if (!activeTab || !isOpen()) return;
    activeTab.focus({ preventScroll: true });
    if (document.activeElement !== activeTab && attempt < 8) {
      requestAnimationFrame(() => focusActiveTab(attempt + 1));
    }
  }

  function openPanel() {
    placePanel();
    sudoku.ensureReady(); // the puzzle is generated on first open, not at page load
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (activeGame === 'snake') snake.resize();

    focusActiveTab();
  }

  function closePanel(returnFocus) {
    if (!isOpen()) return;
    snake.pause(); // never leave the snake running in the background
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggleBtn.focus({ preventScroll: true });
  }

  toggleBtn.addEventListener('click', () => {
    if (isOpen()) {
      closePanel(true);
    } else {
      openPanel();
    }
  });

  panel.querySelectorAll('[data-games-close]').forEach((btn) => {
    btn.addEventListener('click', () => closePanel(true));
  });

  // Tabs: click, plus Left / Right / Home / End like a standard tablist
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectGame(tab.dataset.game));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      selectGame(tabs[next].dataset.game);
      tabs[next].focus();
    });
  });

  // Close on Escape, or when pressing anywhere outside the panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) closePanel(true);
  });

  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      closePanel(false);
    }
  });

  window.addEventListener('resize', () => {
    if (!isOpen()) return;
    placePanel();
    snake.resize();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) snake.pause();
  });

  // Redraw the snake board when the Sky / Aurora theme changes
  new MutationObserver(() => snake.redraw()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

/* --------------------------------------------------------------------------
   SUDOKU
   -------------------------------------------------------------------------- */
const SUDOKU_ROW = [];
const SUDOKU_COL = [];
const SUDOKU_BOX = [];
const SUDOKU_PEERS = [];
const SUDOKU_POPCOUNT = new Uint8Array(1024);

(function buildSudokuTables() {
  for (let mask = 1; mask < 1024; mask++) {
    SUDOKU_POPCOUNT[mask] = SUDOKU_POPCOUNT[mask >> 1] + (mask & 1);
  }
  for (let i = 0; i < 81; i++) {
    SUDOKU_ROW[i] = Math.floor(i / 9);
    SUDOKU_COL[i] = i % 9;
    SUDOKU_BOX[i] = Math.floor(SUDOKU_ROW[i] / 3) * 3 + Math.floor(SUDOKU_COL[i] / 3);
  }
  for (let i = 0; i < 81; i++) {
    const peers = [];
    for (let j = 0; j < 81; j++) {
      if (j !== i && (SUDOKU_ROW[j] === SUDOKU_ROW[i] || SUDOKU_COL[j] === SUDOKU_COL[i] || SUDOKU_BOX[j] === SUDOKU_BOX[i])) {
        peers.push(j);
      }
    }
    SUDOKU_PEERS[i] = peers;
  }
})();

function shuffleInPlace(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Backtracking solver (always tries the cell with the fewest options first).
// Stops once `limit` solutions are found, so limit = 2 is a fast uniqueness test.
function sudokuSearch(startGrid, limit, randomize) {
  const grid = startGrid.slice();
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);
  let count = 0;
  let firstSolution = null;

  for (let i = 0; i < 81; i++) {
    if (grid[i]) {
      const bit = 1 << grid[i];
      rows[SUDOKU_ROW[i]] |= bit;
      cols[SUDOKU_COL[i]] |= bit;
      boxes[SUDOKU_BOX[i]] |= bit;
    }
  }

  function recurse() {
    let bestCell = -1;
    let bestMask = 0;
    let bestCount = 10;

    for (let i = 0; i < 81; i++) {
      if (grid[i]) continue;
      const mask = ~(rows[SUDOKU_ROW[i]] | cols[SUDOKU_COL[i]] | boxes[SUDOKU_BOX[i]]) & 0x3fe;
      const options = SUDOKU_POPCOUNT[mask];
      if (options < bestCount) {
        bestCell = i;
        bestMask = mask;
        bestCount = options;
        if (options <= 1) break;
      }
    }

    if (bestCell === -1) {
      count++;
      if (!firstSolution) firstSolution = grid.slice();
      return count >= limit;
    }
    if (bestCount === 0) return false;

    const digits = [];
    for (let d = 1; d <= 9; d++) {
      if (bestMask & (1 << d)) digits.push(d);
    }
    if (randomize) shuffleInPlace(digits);

    const r = SUDOKU_ROW[bestCell];
    const c = SUDOKU_COL[bestCell];
    const b = SUDOKU_BOX[bestCell];

    for (const d of digits) {
      const bit = 1 << d;
      grid[bestCell] = d;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      const done = recurse();
      grid[bestCell] = 0;
      rows[r] &= ~bit;
      cols[c] &= ~bit;
      boxes[b] &= ~bit;
      if (done) return true;
    }
    return false;
  }

  recurse();
  return { count, solution: firstSolution };
}

// Builds a random complete grid, then removes numbers one at a time as long as
// the puzzle keeps exactly ONE solution.
function makeSudokuPuzzle(targetClues) {
  const solution = sudokuSearch(new Array(81).fill(0), 1, true).solution;
  const puzzle = solution.slice();
  const order = shuffleInPlace(Array.from({ length: 81 }, (_, i) => i));
  let clues = 81;

  for (const i of order) {
    if (clues <= targetClues) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (sudokuSearch(puzzle, 2, false).count === 1) {
      clues--;
    } else {
      puzzle[i] = keep;
    }
  }
  return { puzzle, solution };
}

function createSudokuGame(root) {
  const boardEl = root.querySelector('#sudokuBoard');
  const difficultyEl = root.querySelector('#sudokuDifficulty');
  const newBtn = root.querySelector('#sudokuNew');
  const resetBtn = root.querySelector('#sudokuReset');
  const statusEl = root.querySelector('#sudokuStatus');
  const winEl = root.querySelector('#sudokuWin');
  const CLUES = { easy: 40, medium: 32, hard: 27 };

  let puzzle = new Array(81).fill(0);
  let solution = new Array(81).fill(0);
  let values = new Array(81).fill(0);
  let selected = 0;
  let solved = false;
  let ready = false;
  const cells = [];
  const padButtons = root.querySelectorAll('[data-sudoku-digit]');

  // Build the 9 x 9 grid once
  for (let r = 0; r < 9; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'sudoku-row';
    rowEl.setAttribute('role', 'row');
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'sudoku-cell';
      if (c % 3 === 2 && c !== 8) cell.classList.add('box-right');
      if (r % 3 === 2 && r !== 8) cell.classList.add('box-bottom');
      cell.dataset.index = String(r * 9 + c);
      cell.setAttribute('role', 'gridcell');
      rowEl.appendChild(cell);
      cells.push(cell);
    }
    boardEl.appendChild(rowEl);
  }

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function emptyCount() {
    return values.filter((v) => v === 0).length;
  }

  function findConflicts() {
    const bad = new Set();
    for (let i = 0; i < 81; i++) {
      const v = values[i];
      if (!v) continue;
      for (const j of SUDOKU_PEERS[i]) {
        if (values[j] === v) {
          bad.add(i);
          break;
        }
      }
    }
    return bad;
  }

  function conflictScopes(i) {
    const v = values[i];
    const scopes = [];
    if (SUDOKU_PEERS[i].some((j) => SUDOKU_ROW[j] === SUDOKU_ROW[i] && values[j] === v)) scopes.push('row');
    if (SUDOKU_PEERS[i].some((j) => SUDOKU_COL[j] === SUDOKU_COL[i] && values[j] === v)) scopes.push('column');
    if (SUDOKU_PEERS[i].some((j) => SUDOKU_BOX[j] === SUDOKU_BOX[i] && values[j] === v)) scopes.push('box');
    return scopes;
  }

  // A digit is "complete" only when all nine of its solution cells hold that
  // digit. Derived from `values` + `solution` on every render, so a wrong
  // entry never counts and removing/correcting a cell un-grays the button.
  function completedDigits() {
    const done = new Set();
    for (let d = 1; d <= 9; d++) {
      let placed = 0;
      for (let i = 0; i < 81; i++) {
        if (solution[i] === d && values[i] === d) placed++;
      }
      if (placed === 9) done.add(d);
    }
    return done;
  }

  function renderPad() {
    const done = completedDigits();
    padButtons.forEach((btn) => {
      const d = Number(btn.dataset.sudokuDigit);
      if (d === 0) return; // erase button
      const isDone = done.has(d);
      btn.classList.toggle('complete', isDone);
      btn.setAttribute('aria-label', isDone ? `${d}, all placed` : `${d}`);
    });
  }

  function render() {
    renderPad();
    const conflicts = findConflicts();
    const peers = new Set(SUDOKU_PEERS[selected]);
    const selectedValue = values[selected];

    cells.forEach((cell, i) => {
      const v = values[i];
      const isGiven = puzzle[i] !== 0;
      const isBad = conflicts.has(i);

      cell.textContent = v ? String(v) : '';
      cell.classList.toggle('given', isGiven);
      cell.classList.toggle('selected', i === selected);
      cell.classList.toggle('peer', i !== selected && peers.has(i));
      cell.classList.toggle('same', i !== selected && v !== 0 && v === selectedValue);
      cell.classList.toggle('conflict', isBad);
      cell.tabIndex = i === selected ? 0 : -1;
      cell.setAttribute('aria-selected', i === selected ? 'true' : 'false');
      cell.setAttribute('aria-invalid', isBad ? 'true' : 'false');
      cell.setAttribute(
        'aria-label',
        `Row ${SUDOKU_ROW[i] + 1}, column ${SUDOKU_COL[i] + 1}, ${v ? v : 'empty'}${isGiven ? ', given' : ''}${isBad ? ', conflict' : ''}`
      );
    });
  }

  function select(index, focus) {
    selected = Math.max(0, Math.min(80, index));
    render();
    if (focus) cells[selected].focus({ preventScroll: true });
  }

  function enter(digit) {
    if (!ready) return;
    if (solved) {
      setStatus('This puzzle is solved. Press New puzzle to play again.');
      return;
    }
    if (puzzle[selected] !== 0) {
      setStatus('That number is part of the puzzle and cannot be changed.');
      return;
    }

    values[selected] = digit;
    render();

    if (digit === 0) {
      setStatus(`${emptyCount()} cells left.`);
      return;
    }

    if (findConflicts().has(selected)) {
      setStatus(`${digit} already appears in this ${conflictScopes(selected).join(' and ')}.`);
      return;
    }

    if (emptyCount() === 0 && findConflicts().size === 0) {
      solved = true;
      boardEl.classList.add('solved');
      winEl.hidden = false;
      setStatus('✓ Solved! Great job. Press New puzzle to play again.');
      return;
    }

    setStatus(`${emptyCount()} cells left.`);
  }

  function newGame() {
    const level = CLUES[difficultyEl.value] ? difficultyEl.value : 'medium';
    const made = makeSudokuPuzzle(CLUES[level]);
    puzzle = made.puzzle;
    solution = made.solution;
    values = puzzle.slice();
    solved = false;
    ready = true;
    boardEl.classList.remove('solved');
    winEl.hidden = true;
    selected = Math.max(0, values.indexOf(0));
    render();
    setStatus(`${level.charAt(0).toUpperCase() + level.slice(1)} puzzle ready. ${emptyCount()} cells to fill.`);
  }

  function reset() {
    if (!ready) return;
    values = puzzle.slice();
    solved = false;
    boardEl.classList.remove('solved');
    winEl.hidden = true;
    render();
    setStatus(`Puzzle reset. ${emptyCount()} cells to fill.`);
  }

  boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.sudoku-cell');
    if (cell) select(Number(cell.dataset.index), true);
  });

  // Keys are only handled while focus is inside the grid, so page scrolling and
  // navigation elsewhere are never affected.
  boardEl.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

    if (moves[e.key]) {
      e.preventDefault();
      const row = Math.max(0, Math.min(8, SUDOKU_ROW[selected] + moves[e.key][0]));
      const col = Math.max(0, Math.min(8, SUDOKU_COL[selected] + moves[e.key][1]));
      select(row * 9 + col, true);
    } else if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      enter(Number(e.key));
    } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      enter(0);
    }
  });

  padButtons.forEach((btn) => {
    btn.addEventListener('click', () => enter(Number(btn.dataset.sudokuDigit)));
  });

  newBtn.addEventListener('click', newGame);
  resetBtn.addEventListener('click', reset);

  return {
    ensureReady() {
      if (!ready) newGame();
    }
  };
}

/* --------------------------------------------------------------------------
   SNAKE
   -------------------------------------------------------------------------- */
function createSnakeGame(root) {
  const stage = root.querySelector('#snakeStage');
  const canvas = root.querySelector('#snakeCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = root.querySelector('#snakeOverlay');
  const overlayText = root.querySelector('#snakeOverlayText');
  const startBtn = root.querySelector('#snakeStart');
  const startLabel = root.querySelector('#snakeStartLabel');
  const restartBtn = root.querySelector('#snakeRestart');
  const scoreEl = root.querySelector('#snakeScore');
  const bestEl = root.querySelector('#snakeBest');
  const statusEl = root.querySelector('#snakeStatus');
  const pane = root.querySelector('#gamePaneSnake');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const GRID = 18;
  const START_DELAY = 150; // ms per step at the start; the snake speeds up as it grows
  const MIN_DELAY = 70;
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const KEY_TO_DIRECTION = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right'
  };
  const BEST_KEY = 'portfolio-snake-best';

  let state = 'idle'; // idle | running | paused | over
  let snake = [];
  let direction = DIRECTIONS.right;
  let directionQueue = [];
  let food = { x: 0, y: 0 };
  let score = 0;
  let best = 0;
  let stepDelay = START_DELAY;
  let accumulator = 0;
  let lastFrame = 0;
  let rafId = 0;
  let cssSize = 0;
  let pixelRatio = 1;

  try {
    best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch (err) {
    best = 0;
  }

  function directionName() {
    return Object.keys(DIRECTIONS).find((name) => DIRECTIONS[name] === direction);
  }

  function announce(message) {
    statusEl.textContent = message;
  }

  function updateHud() {
    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
  }

  function updateUi() {
    stage.dataset.state = state;
    stage.dataset.dir = directionName();
    stage.dataset.score = String(score);
    stage.dataset.head = `${snake[0].x},${snake[0].y}`;
    stage.dataset.food = `${food.x},${food.y}`;
    startLabel.textContent = { idle: 'Start', running: 'Pause', paused: 'Resume', over: 'Play again' }[state];
    overlay.hidden = state === 'running';
  }

  function placeFood() {
    const taken = new Set(snake.map((seg) => `${seg.x},${seg.y}`));
    const free = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!taken.has(`${x},${y}`)) free.push({ x, y });
      }
    }
    if (!free.length) return false;
    food = free[Math.floor(Math.random() * free.length)];
    return true;
  }

  function resetGame() {
    snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    direction = DIRECTIONS.right;
    directionQueue = [];
    score = 0;
    stepDelay = START_DELAY;
    accumulator = 0;
    placeFood();
    updateHud();
  }

  function finish(won) {
    state = 'over';
    cancelAnimationFrame(rafId);
    if (score > best) {
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch (err) { /* storage may be unavailable; the score still shows */ }
    }
    updateHud();
    overlayText.textContent = won ? `You filled the board! Score ${score}` : `Game over. Score ${score}`;
    announce(overlayText.textContent);
    updateUi();
    draw(performance.now());
  }

  function step() {
    if (directionQueue.length) direction = directionQueue.shift();
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
      finish(false);
      return;
    }

    const eating = head.x === food.x && head.y === food.y;
    // The tail moves away this step unless the snake is growing
    const body = eating ? snake : snake.slice(0, -1);
    if (body.some((seg) => seg.x === head.x && seg.y === head.y)) {
      finish(false);
      return;
    }

    snake.unshift(head);
    if (eating) {
      score++;
      stepDelay = Math.max(MIN_DELAY, START_DELAY - score * 4);
      updateHud();
      if (!placeFood()) {
        finish(true);
        return;
      }
    } else {
      snake.pop();
    }
  }

  function frame(now) {
    if (state !== 'running') return;
    if (!lastFrame) lastFrame = now;
    accumulator += Math.min(now - lastFrame, 250); // clamp so a stalled tab doesn't jump ahead
    lastFrame = now;

    while (accumulator >= stepDelay && state === 'running') {
      accumulator -= stepDelay;
      step();
    }
    if (state !== 'running') return;

    draw(now);
    stage.dataset.dir = directionName();
    stage.dataset.score = String(score);
    stage.dataset.head = `${snake[0].x},${snake[0].y}`;
    stage.dataset.food = `${food.x},${food.y}`;
    rafId = requestAnimationFrame(frame);
  }

  function run() {
    state = 'running';
    lastFrame = 0;
    accumulator = 0;
    updateUi();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function startNew() {
    resetGame();
    announce('Game started.');
    run();
    stage.focus({ preventScroll: true });
  }

  function pause() {
    if (state !== 'running') return;
    state = 'paused';
    cancelAnimationFrame(rafId);
    overlayText.textContent = 'Paused. Press Space, Resume, or an arrow key to continue.';
    announce('Paused.');
    updateUi();
    draw(performance.now());
  }

  function resume() {
    announce('Resumed.');
    run();
  }

  function toggle() {
    if (state === 'idle' || state === 'over') startNew();
    else if (state === 'running') pause();
    else if (state === 'paused') resume();
  }

  // Turn requests are queued (max 2) so quick double taps still register,
  // and a direct 180-degree reversal is ignored.
  function turn(name) {
    const next = DIRECTIONS[name];
    if (!next) return;

    if (state === 'idle') startNew();
    else if (state === 'paused') resume();
    else if (state === 'over') return;

    const last = directionQueue.length ? directionQueue[directionQueue.length - 1] : direction;
    if ((next.x === -last.x && next.y === -last.y) || (next.x === last.x && next.y === last.y)) return;
    if (directionQueue.length < 2) directionQueue.push(next);
  }

  /* ---------- drawing ---------- */
  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(now) {
    if (!cssSize) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const cell = cssSize / GRID;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    // Board: glossy gradient with a subtle checker pattern
    const bg = ctx.createLinearGradient(0, 0, 0, cssSize);
    bg.addColorStop(0, dark ? '#06233f' : '#d6f5ff');
    bg.addColorStop(1, dark ? '#05383f' : '#c6f3da');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cssSize, cssSize);

    ctx.fillStyle = dark ? 'rgba(120, 220, 255, 0.06)' : 'rgba(255, 255, 255, 0.35)';
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // Food: a glossy water bubble (the gentle pulse is skipped for reduced motion)
    const pulse = reduceMotion.matches ? 0 : Math.sin(now / 260) * 0.05;
    const fr = cell * (0.36 + pulse);
    const fx = (food.x + 0.5) * cell;
    const fy = (food.y + 0.5) * cell;
    const bubble = ctx.createRadialGradient(fx - fr * 0.35, fy - fr * 0.35, fr * 0.1, fx, fy, fr);
    bubble.addColorStop(0, '#ffffff');
    bubble.addColorStop(0.4, '#8fe3ff');
    bubble.addColorStop(1, '#0a8cff');
    ctx.fillStyle = bubble;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(1, cell * 0.05);
    ctx.stroke();

    // Snake: glossy green gel segments, drawn tail first so the head sits on top
    const pad = cell * 0.07;
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const x = seg.x * cell + pad;
      const y = seg.y * cell + pad;
      const size = cell - pad * 2;
      const body = ctx.createLinearGradient(0, y, 0, y + size);
      body.addColorStop(0, i === 0 ? '#9dffcb' : '#7dffb4');
      body.addColorStop(0.5, '#25c985');
      body.addColorStop(0.51, '#12a56c');
      body.addColorStop(1, '#2fd596');
      ctx.fillStyle = body;
      roundedRect(x, y, size, size, size * 0.34);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 110, 70, 0.55)';
      ctx.lineWidth = Math.max(1, cell * 0.04);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      roundedRect(x + size * 0.14, y + size * 0.1, size * 0.72, size * 0.3, size * 0.14);
      ctx.fill();
    }

    // Eyes on the head, looking in the direction of travel
    if (snake.length) {
      const head = snake[0];
      const cx = (head.x + 0.5) * cell;
      const cy = (head.y + 0.5) * cell;
      const sideX = -direction.y;
      const sideY = direction.x;
      [-1, 1].forEach((side) => {
        const ex = cx + direction.x * cell * 0.16 + sideX * side * cell * 0.19;
        const ey = cy + direction.y * cell * 0.16 + sideY * side * cell * 0.19;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey, cell * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#073b2a';
        ctx.beginPath();
        ctx.arc(ex + direction.x * cell * 0.05, ey + direction.y * cell * 0.05, cell * 0.065, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function resize() {
    const size = canvas.clientWidth;
    if (!size) return; // hidden for now; resize() runs again when it is shown
    pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
    cssSize = size;
    canvas.width = Math.round(size * pixelRatio);
    canvas.height = canvas.width;
    draw(performance.now());
  }

  /* ---------- input ---------- */
  // Keys are only handled while focus is inside the Snake pane, so the page keeps
  // scrolling and navigating normally everywhere else.
  pane.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const name = KEY_TO_DIRECTION[e.key];
    if (name) {
      e.preventDefault();
      turn(name);
      return;
    }
    if ((e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') && e.target === stage) {
      e.preventDefault();
      toggle();
    }
  });

  // Touch: swipe on the board to steer; tap it to start or resume
  let swipe = null;
  stage.addEventListener('pointerdown', (e) => {
    swipe = { x: e.clientX, y: e.clientY, moved: false };
    stage.focus({ preventScroll: true });
  });
  stage.addEventListener('pointermove', (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    swipe.moved = true;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    swipe.x = e.clientX;
    swipe.y = e.clientY;
  });
  const endSwipe = () => {
    if (swipe && !swipe.moved && state !== 'running') toggle();
    swipe = null;
  };
  stage.addEventListener('pointerup', endSwipe);
  stage.addEventListener('pointercancel', () => { swipe = null; });

  root.querySelectorAll('[data-snake-dir]').forEach((btn) => {
    btn.addEventListener('click', () => turn(btn.dataset.snakeDir));
  });
  startBtn.addEventListener('click', toggle);
  restartBtn.addEventListener('click', startNew);

  resetGame();
  updateUi();

  return {
    pause,
    resize,
    redraw() { draw(performance.now()); }
  };
}

  /* ==========================================================================
    9. UTILITIES
    ========================================================================== */
  function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }
