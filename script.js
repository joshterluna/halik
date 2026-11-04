
  document.addEventListener('DOMContentLoaded', () => {
    initAeroBubbles();
    initThemeToggle();
    initNavigation();
    initProjectCarousel();
    initSkillsFilter();
    initPersonalGalleryFolder();
    initLightbox();
    initCustomNotification();
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
      email: "seanhalik.dev@gmail.com"
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
        tech: ["Java SE", "OOP", "File I/O", "Console Architecture"]
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

    function createBubble() {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      // Randomize dimensions between 20px and 65px
      const size = Math.floor(Math.random() * 45) + 20;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Randomize horizontal origin
      const leftPercent = Math.random() * 100;
      bubble.style.left = `${leftPercent}%`;

      // Randomize animation speed and delay
      const duration = Math.random() * 14 + 10; // 10s to 24s
      const delay = Math.random() * 8;
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;

      // Click to pop interaction!
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        bubble.style.transform = 'scale(1.6)';
        bubble.style.opacity = '0';
        bubble.style.filter = 'blur(4px)';
        
        setTimeout(() => {
          bubble.remove();
          createBubble();
        }, 220);
      });

      container.appendChild(bubble);
    }

    for (let i = 0; i < bubbleCount; i++) {
      createBubble();
    }
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
        const duration = reduceMotion ? 180 : 650;

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
    9. UTILITIES
    ========================================================================== */
  function setCurrentYear() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }
