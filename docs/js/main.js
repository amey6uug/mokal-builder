/* ==============================================
   MOKAL BUILDER - MAIN JAVASCRIPT
   Global scripts for navbar, sliders, modals
   ============================================== */

/* ========== 1. NAVBAR TOGGLE ========== */
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }

  // Close menu when a link is clicked
  const navLinks = document.querySelectorAll('.nav-item a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    const isClickInsideNav = navMenu?.contains(event.target);
    const isClickOnToggle = menuToggle?.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle && navMenu?.classList.contains('active')) {
      navMenu.classList.remove('active');
    }
  });
});

/* ========== 2. SMOOTH SCROLL ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

/* ========== 3. IMAGE SLIDER ========== */
class ImageSlider {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.slides = this.container.querySelectorAll('.slide');
    this.dots = this.container.querySelectorAll('.dot');
    this.prevBtn = this.container.querySelector('.prev');
    this.nextBtn = this.container.querySelector('.next');
    this.currentSlide = 0;
    this.autoPlayInterval = null;

    this.init();
  }

  init() {
    if (this.slides.length === 0) return;

    // Show first slide
    this.showSlide(0);

    // Event listeners
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.currentSlide(index));
    });

    // Auto-play
    this.autoPlay();

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.autoPlay());
  }

  showSlide(index) {
    if (this.slides.length === 0) return;

    // Wrap around
    this.currentSlide = (index + this.slides.length) % this.slides.length;

    // Hide all slides
    this.slides.forEach(slide => slide.classList.remove('active'));

    // Remove active class from all dots
    this.dots.forEach(dot => dot.classList.remove('active'));

    // Show current slide and highlight dot
    this.slides[this.currentSlide].classList.add('active');
    if (this.dots[this.currentSlide]) {
      this.dots[this.currentSlide].classList.add('active');
    }
  }

  nextSlide() {
    this.showSlide(this.currentSlide + 1);
  }

  prevSlide() {
    this.showSlide(this.currentSlide - 1);
  }

  autoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    clearInterval(this.autoPlayInterval);
  }
}

// Initialize hero slider
document.addEventListener('DOMContentLoaded', function() {
  new ImageSlider('.hero-slider');
});

/* ========== 4. BEFORE/AFTER SLIDER ========== */
class BeforeAfterSlider {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.imgWrapper = this.container.querySelector('.ba-img-wrapper');
    this.beforeImg = this.container.querySelector('.ba-img-before');
    this.handle = this.container.querySelector('.ba-handle');
    this.isActive = false;

    this.init();
  }

  init() {
    if (!this.handle) return;

    this.handle.addEventListener('mousedown', () => this.startDrag());
    this.handle.addEventListener('touchstart', () => this.startDrag());

    document.addEventListener('mouseup', () => this.stopDrag());
    document.addEventListener('touchend', () => this.stopDrag());

    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('touchmove', (e) => this.drag(e));

    // Set initial position
    this.updateSliderPosition(50);
  }

  startDrag() {
    this.isActive = true;
  }

  stopDrag() {
    this.isActive = false;
  }

  drag(event) {
    if (!this.isActive) return;

    const rect = this.container.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    this.updateSliderPosition(Math.max(0, Math.min(100, percentage)));
  }

  updateSliderPosition(percentage) {
    this.beforeImg.style.width = percentage + '%';
    this.handle.style.left = percentage + '%';
  }
}

// Initialize before/after sliders
document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('.before-after-slider');
  sliders.forEach(slider => new BeforeAfterSlider('.before-after-slider'));
});

/* ========== 5. MODAL FUNCTIONALITY ========== */
class Modal {
  constructor(modalId, openBtnSelector = null, closeBtnSelector = null) {
    this.modal = document.getElementById(modalId);
    this.openBtn = document.querySelector(openBtnSelector);
    this.closeBtn = this.modal?.querySelector('.modal-close') || document.querySelector(closeBtnSelector);

    if (!this.modal) return;

    this.init();
  }

  init() {
    // Open modal
    if (this.openBtn) {
      this.openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    }

    // Close modal
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close on overlay click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Initialize modals (add specific ones as needed)
document.addEventListener('DOMContentLoaded', function() {
  // Example: new Modal('scheduleModal', '[data-open-schedule]', '[data-close-schedule]');
});

/* ========== 6. SCROLL ANIMATIONS ========== */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
  const animateElements = document.querySelectorAll(
    '.card, .service-card, .project-card, .testimonial-card, .trust-item'
  );
  animateElements.forEach(el => observer.observe(el));
});

/* ========== 7. COUNTER ANIMATION ========== */
class Counter {
  constructor(element, target, duration = 2000) {
    this.element = element;
    this.target = parseInt(target);
    this.duration = duration;
    this.current = 0;
    this.increment = this.target / (this.duration / 16); // 60fps
  }

  animate() {
    this.current += this.increment;

    if (this.current >= this.target) {
      this.element.textContent = this.target.toLocaleString();
    } else {
      this.element.textContent = Math.floor(this.current).toLocaleString();
      requestAnimationFrame(() => this.animate());
    }
  }

  start() {
    this.animate();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const counters = document.querySelectorAll('[data-counter]');
  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.getAttribute('data-counter');
        new Counter(entry.target, target).start();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
});

/* ========== 8. FORM SUBMISSION ========== */
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form[data-submit="ajax"]');

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      // Basic validation
      const isValid = validateFormData(data);
      if (!isValid) return;

      // Send to backend (replace with your API endpoint)
      fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          showNotification('success', 'Thank you! We\'ll contact you soon.');
          form.reset();
        } else {
          showNotification('error', result.message || 'An error occurred. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'An error occurred. Please try again.');
      });
    });
  });
});

/* ========== 9. NOTIFICATION SYSTEM ========== */
function showNotification(type, message, duration = 4000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} animate-slide-down`;
  notification.innerHTML = `
    <div class="notification-content">
      ${type === 'success' ? '✓' : '✕'} ${message}
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after duration
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/* ========== 10. LAZY LOADING ========== */
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/* ========== 11. ACTIVE NAV LINK ========== */
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-item a');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage || 
        link.getAttribute('href') === currentPage + '/' ||
        currentPage.includes(link.getAttribute('href'))) {
      link.parentElement.classList.add('active');
    }
  });
});

/* ========== 12. WHATSAPP INTEGRATION ========== */
function openWhatsApp(phoneNumber, message = '') {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

// Attach to WhatsApp buttons
document.addEventListener('DOMContentLoaded', function() {
  const whatsappBtns = document.querySelectorAll('[data-whatsapp]');
  whatsappBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const phone = this.getAttribute('data-whatsapp');
      const message = this.getAttribute('data-message') || 'Hello, I\'m interested in your services.';
      openWhatsApp(phone, message);
    });
  });
});

/* ========== 13. UTILITY FUNCTIONS ========== */

/**
 * Validate form data
 */
function validateFormData(data) {
  if (!data.name || data.name.trim() === '') {
    showNotification('error', 'Please enter your name.');
    return false;
  }

  if (!data.email || !isValidEmail(data.email)) {
    showNotification('error', 'Please enter a valid email.');
    return false;
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    showNotification('error', 'Please enter a valid phone number.');
    return false;
  }

  return true;
}

/**
 * Email validation
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone validation
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ========== END OF MAIN.JS ========== */
