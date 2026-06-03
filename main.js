document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     PRELOADER SPLASH SCREEN INTERACTION
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  
  if (preloader) {
    document.body.classList.add('loading');
    
    setTimeout(() => {
      preloader.classList.add('fade-out');
      document.body.classList.remove('loading');
      
      setTimeout(() => {
        preloader.style.display = 'none';
        const heroReveals = document.querySelectorAll('#hero .scroll-reveal');
        heroReveals.forEach(el => el.classList.add('active'));
      }, 800);
    }, 2600);
  }

  /* ==========================================================================
     HEADER SCROLL STATE & ACTIVE LINK TRACKING
     ========================================================================== */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], footer[id]');

  window.addEventListener('scroll', () => {
    // 1. Shrink header on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 2. Dynamic active section highlighting
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }

    // 3. Scroll Progress Indicator (Scroll Tracking)
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    // 4. Parallax Hero Background Scroll Effect
    const heroBgContainer = document.querySelector('.hero-bg-container');
    if (heroBgContainer && scrollTop < window.innerHeight) {
      heroBgContainer.style.transform = `translateY(${scrollTop * 0.3}px)`;
    }
  });

  /* ==========================================================================
     MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMobileMenu() {
    menuToggleBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    
    // Toggle body scroll lock to prevent scroll leak
    if (mobileMenu.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  menuToggleBtn.addEventListener('click', toggleMobileMenu);

  // Close mobile drawer when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggleBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ==========================================================================
     SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  // Filter out hero elements to handle their entry after the preloader completes
  const revealElements = Array.from(document.querySelectorAll('.scroll-reveal')).filter(el => !el.closest('#hero'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once visible, stop observing
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null, // Viewport
    threshold: 0.15, // Trigger when 15% visible
    rootMargin: '0px 0px -50px 0px' // Offset trigger point slightly
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     CUSTOM TOUCH/DRAG RESPONSIVE GALLERY SLIDER
     ========================================================================== */
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Set positions dynamically based on screen width
  function getSlideWidth() {
    const slide = slides[0];
    const style = window.getComputedStyle(slide);
    const width = slide.getBoundingClientRect().width;
    const marginRight = parseFloat(style.marginRight) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;
    return width + marginRight + marginLeft;
  }

  function getGap() {
    const trackStyle = window.getComputedStyle(track);
    return parseFloat(trackStyle.gap) || 24;
  }

  function updateSliderPosition() {
    const step = getSlideWidth();
    const gap = getGap();
    
    // Check boundaries to avoid white spaces on large monitors
    const maxIndex = slides.length - 1;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const translateAmt = -currentIndex * (step);
    track.style.transform = `translateX(${translateAmt}px)`;
    prevTranslate = translateAmt;

    // Highlight active slide & dot
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Next / Prev triggers
  function slideNext() {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop back
    }
    updateSliderPosition();
  }

  function slidePrev() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = slides.length - 1; // Loop to end
    }
    updateSliderPosition();
  }

  nextBtn.addEventListener('click', slideNext);
  prevBtn.addEventListener('click', slidePrev);

  // Dot triggers
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      currentIndex = parseInt(e.target.dataset.index);
      updateSliderPosition();
    });
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    updateSliderPosition();
  });

  // Touch & Mouse Drag Support
  slides.forEach((slide, index) => {
    const slideImage = slide.querySelector('img');
    // Prevent default ghost drag on images
    slideImage.addEventListener('dragstart', (e) => e.preventDefault());

    // Touch events
    slide.addEventListener('touchstart', touchStart(index));
    slide.addEventListener('touchend', touchEnd);
    slide.addEventListener('touchmove', touchMove);

    // Mouse events
    slide.addEventListener('mousedown', touchStart(index));
    slide.addEventListener('mouseup', touchEnd);
    slide.addEventListener('mouseleave', touchEnd);
    slide.addEventListener('mousemove', touchMove);
  });

  function touchStart(index) {
    return function(event) {
      isDragging = true;
      startX = getPositionX(event);
      animationID = requestAnimationFrame(animation);
      track.style.transition = 'none'; // Temporarily disable transition during drag
    };
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
  }

  function touchEnd() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

    // Trigger threshold (50px displacement to switch slide)
    if (movedBy < -50 && currentIndex < slides.length - 1) {
      currentIndex++;
    } else if (movedBy > 50 && currentIndex > 0) {
      currentIndex--;
    }

    updateSliderPosition();
  }

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function animation() {
    if (isDragging) {
      track.style.transform = `translateX(${currentTranslate}px)`;
      requestAnimationFrame(animation);
    }
  }

  // Initialize Slider Layout
  updateSliderPosition();


  /* ==========================================================================
     LIGHTBOX GALLERY MODAL
     ========================================================================== */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close-btn');
  const lightboxPrev = document.getElementById('lightbox-prev-btn');
  const lightboxNext = document.getElementById('lightbox-next-btn');
  const viewGalleryBtn = document.getElementById('view-gallery-btn');

  let lightboxIndex = 0;
  const galleryImages = [
    'assets/gallery-1.png',
    'assets/gallery-2.png',
    'assets/gallery-3.png',
    'assets/gallery-4.png',
    'assets/gallery-5.png'
  ];

  function openLightbox(index) {
    lightboxIndex = index;
    lightboxImg.src = galleryImages[lightboxIndex];
    lightboxModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeLightbox() {
    lightboxModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    lightboxIndex += dir;
    if (lightboxIndex < 0) lightboxIndex = galleryImages.length - 1;
    if (lightboxIndex >= galleryImages.length) lightboxIndex = 0;
    
    // Smooth transition between image loading
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.src = galleryImages[lightboxIndex];
      lightboxImg.onload = () => {
        lightboxImg.style.opacity = 1;
      };
    }, 150);
  }

  // Click on slides opens lightbox
  slides.forEach((slide, idx) => {
    slide.addEventListener('click', (e) => {
      // Only open lightbox if not actively dragging
      const clickDiff = Math.abs(currentTranslate - prevTranslate);
      if (clickDiff < 10) {
        openLightbox(idx);
      }
    });
  });

  // "VIEW GALLERY" button triggers first image
  viewGalleryBtn.addEventListener('click', () => openLightbox(0));

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));

  // Lightbox overlay close click
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
  });


  /* ==========================================================================
     BOOKING / INQUIRY MODAL SYSTEM
     ========================================================================== */
  const bookingModal = document.getElementById('booking-modal');
  const bookingForm = document.getElementById('booking-form');
  const formSuccess = document.getElementById('form-success');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCloseSuccess = document.querySelector('.modal-close-success');
  const serviceSelect = document.getElementById('form-service');
  
  const bookTriggers = document.querySelectorAll('.btn-book-trigger, .btn-inquiry-trigger, .mobile-book-btn');

  function openBookingModal(serviceName = '') {
    // Reset form display state
    bookingForm.classList.remove('hidden');
    formSuccess.classList.remove('active');
    
    // Auto-select dropdown service if passed from trigger button
    if (serviceName) {
      serviceSelect.value = serviceName;
    }
    
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeBookingModal() {
    bookingModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  bookTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      // Find service type from trigger properties
      const service = btn.getAttribute('data-service') || '';
      openBookingModal(service);
    });
  });

  modalCloseBtn.addEventListener('click', closeBookingModal);
  modalCloseSuccess.addEventListener('click', closeBookingModal);

  // Overlay click close
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeBookingModal();
    }
  });

  // Form submission (simulating request to server)
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = bookingForm.querySelector('.btn-submit-form');
    const originalBtnText = submitBtn.textContent;
    
    // Loading State
    submitBtn.textContent = 'SENDING...';
    submitBtn.style.pointerEvents = 'none';
    submitBtn.style.opacity = 0.7;

    setTimeout(() => {
      // Reset button
      submitBtn.textContent = originalBtnText;
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = 1;

      // Swap form with success message
      bookingForm.classList.add('hidden');
      formSuccess.classList.add('active');
      
      // Reset form fields
      bookingForm.reset();
    }, 1500); // 1.5s visual network lag
  });

});
