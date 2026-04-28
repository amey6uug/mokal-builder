/* ==============================================
   MOKAL BUILDER - FORM VALIDATION JAVASCRIPT
   Client-side and server-side ready validations
   ============================================== */

/**
 * Form Validator Class
 * Handles validation for all forms on the site
 */
class FormValidator {
  constructor(formSelector, options = {}) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.options = {
      showErrors: true,
      submitToServer: true,
      successCallback: null,
      errorCallback: null,
      ...options
    };

    this.errors = {};
    this.init();
  }

  init() {
    // Add real-time validation
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });

    // Handle form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Validate individual field
   */
  validateField(field) {
    const name = field.name;
    const value = field.value.trim();
    const type = field.getAttribute('type') || field.tagName.toLowerCase();
    let error = null;

    // Required field
    if (field.hasAttribute('required') && value === '') {
      error = `${this.getFieldLabel(field)} is required.`;
    }
    // Email validation
    else if (type === 'email' && value !== '') {
      if (!this.isValidEmail(value)) {
        error = 'Please enter a valid email address.';
      }
    }
    // Phone validation
    else if (type === 'tel' && value !== '') {
      if (!this.isValidPhone(value)) {
        error = 'Please enter a valid phone number.';
      }
    }
    // Number validation
    else if (type === 'number' && value !== '') {
      if (!this.isValidNumber(value)) {
        error = 'Please enter a valid number.';
      }
      // Min/Max validation
      const min = field.getAttribute('min');
      const max = field.getAttribute('max');
      const num = parseFloat(value);

      if (min && num < parseFloat(min)) {
        error = `Value must be at least ${min}.`;
      }
      if (max && num > parseFloat(max)) {
        error = `Value must not exceed ${max}.`;
      }
    }
    // Min length validation
    else if (field.hasAttribute('minlength')) {
      const minLength = field.getAttribute('minlength');
      if (value.length > 0 && value.length < minLength) {
        error = `${this.getFieldLabel(field)} must be at least ${minLength} characters.`;
      }
    }
    // Max length validation
    else if (field.hasAttribute('maxlength')) {
      const maxLength = field.getAttribute('maxlength');
      if (value.length > maxLength) {
        error = `${this.getFieldLabel(field)} must not exceed ${maxLength} characters.`;
      }
    }
    // Pattern validation
    else if (field.hasAttribute('pattern')) {
      const pattern = field.getAttribute('pattern');
      if (value !== '' && !new RegExp(pattern).test(value)) {
        error = field.getAttribute('title') || `${this.getFieldLabel(field)} format is invalid.`;
      }
    }

    // Display error
    if (error) {
      this.showFieldError(field, error);
      return false;
    } else {
      this.clearFieldError(field);
      return true;
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    this.errors = {};
    const inputs = this.form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Show field error
   */
  showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');

    const errorDiv = field.nextElementSibling;
    if (errorDiv?.classList.contains('form-error')) {
      errorDiv.textContent = message;
    } else {
      const error = document.createElement('div');
      error.className = 'form-error';
      error.textContent = message;
      field.parentElement.insertBefore(error, field.nextSibling);
    }
  }

  /**
   * Clear field error
   */
  clearFieldError(field) {
    field.classList.remove('error');

    const errorDiv = field.nextElementSibling;
    if (errorDiv?.classList.contains('form-error')) {
      errorDiv.remove();
    }
  }

  /**
   * Get field label for error messages
   */
  getFieldLabel(field) {
    const label = this.form.querySelector(`label[for="${field.id}"]`);
    if (label) {
      return label.textContent.replace('*', '').trim();
    }
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
  }

  /**
   * Email validation
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Phone validation (Indian format)
   */
  isValidPhone(phone) {
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return regex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Number validation
   */
  isValidNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Handle form submission
   */
  handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.validateForm()) {
      showNotification('error', 'Please fix the errors in the form.');
      if (this.options.errorCallback) {
        this.options.errorCallback(this.errors);
      }
      return;
    }

    // Collect form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Sanitize data
    Object.keys(data).forEach(key => {
      data[key] = this.sanitizeInput(data[key]);
    });

    // Submit to server
    if (this.options.submitToServer) {
      this.submitFormData(data);
    } else if (this.options.successCallback) {
      this.options.successCallback(data);
    }
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '')
      .trim();
  }

  /**
   * Submit form data to server
   */
  submitFormData(data) {
    const endpoint = this.form.getAttribute('action') || '/api/contact';

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(result => {
      if (result.success) {
        showNotification('success', result.message || 'Thank you! We\'ll contact you soon.');
        this.form.reset();
        if (this.options.successCallback) {
          this.options.successCallback(data);
        }
      } else {
        throw new Error(result.message || 'Server error');
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      showNotification('error', error.message || 'Failed to submit form. Please try again.');
      if (this.options.errorCallback) {
        this.options.errorCallback(error);
      }
    });
  }
}

/**
 * Contact Form Validator
 * Specific to contact form
 */
class ContactFormValidator extends FormValidator {
  constructor(formSelector = '#contact-form') {
    super(formSelector, {
      submitToServer: true,
      successCallback: (data) => {
        // Send WhatsApp notification (optional)
        notifyViaWhatsApp(data);
      }
    });
  }

  validateForm() {
    if (!super.validateForm()) return false;

    // Additional validation for contact form
    const message = this.form.querySelector('[name="message"]');
    if (message && message.value.length < 10) {
      this.showFieldError(message, 'Message must be at least 10 characters.');
      return false;
    }

    return true;
  }
}

/**
 * Lead Form Validator
 * For lead capture forms
 */
class LeadFormValidator extends FormValidator {
  constructor(formSelector = '.lead-form') {
    super(formSelector, {
      submitToServer: true,
      successCallback: (data) => {
        // Trigger GA4 event
        gtag('event', 'lead_submission', {
          lead_source: 'form',
          service_interest: data.service_interest
        });
      }
    });
  }
}

/**
 * Quote Request Validator
 * For quote/estimate forms
 */
class QuoteFormValidator extends FormValidator {
  constructor(formSelector = '.quote-form') {
    super(formSelector, {
      submitToServer: true,
      successCallback: (data) => {
        // Show quote result
        showQuoteResult(data);
      }
    });

    this.setupEstimateCalculation();
  }

  setupEstimateCalculation() {
    const areaInput = this.form.querySelector('[name="area"]');
    if (areaInput) {
      areaInput.addEventListener('input', () => {
        this.updateEstimate();
      });
    }
  }

  updateEstimate() {
    const area = parseFloat(this.form.querySelector('[name="area"]')?.value) || 0;
    const quality = this.form.querySelector('[name="quality"]')?.value || 'standard';

    if (area > 0) {
      const estimatedPrice = this.calculatePrice(area, quality);
      const resultDiv = this.form.querySelector('.estimator-result');

      if (resultDiv) {
        resultDiv.innerHTML = `
          <h3>Estimated Range</h3>
          <p>₹${formatCurrency(estimatedPrice * 0.9)} - ₹${formatCurrency(estimatedPrice * 1.1)}</p>
        `;
      }
    }
  }

  calculatePrice(area, quality) {
    const baseRate = {
      basic: 300,
      standard: 500,
      premium: 800
    };

    return area * (baseRate[quality] || 500) * 1.15;
  }
}

/**
 * Multi-step Form Validator
 * For forms with multiple steps/pages
 */
class MultiStepFormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.steps = this.form.querySelectorAll('[data-step]');
    this.currentStep = 1;
    this.totalSteps = this.steps.length;

    this.init();
  }

  init() {
    this.setupStepButtons();
    this.showStep(1);
  }

  setupStepButtons() {
    const nextBtns = this.form.querySelectorAll('[data-next-step]');
    const prevBtns = this.form.querySelectorAll('[data-prev-step]');

    nextBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.validateCurrentStep()) {
          this.nextStep();
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevStep();
      });
    });
  }

  validateCurrentStep() {
    const currentStepElement = this.form.querySelector(`[data-step="${this.currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') && input.value.trim() === '') {
        isValid = false;
        this.showError(input, `${input.name} is required.`);
      }
    });

    return isValid;
  }

  showStep(stepNumber) {
    this.steps.forEach(step => {
      if (step.getAttribute('data-step') === String(stepNumber)) {
        step.style.display = 'block';
      } else {
        step.style.display = 'none';
      }
    });

    this.currentStep = stepNumber;
    this.updateProgressBar();
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.showStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.showStep(this.currentStep - 1);
    }
  }

  updateProgressBar() {
    const progressBar = this.form.querySelector('.form-progress');
    if (progressBar) {
      const percentage = (this.currentStep / this.totalSteps) * 100;
      progressBar.style.width = percentage + '%';
    }
  }

  showError(field, message) {
    field.classList.add('error');
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    field.parentElement.appendChild(error);
  }
}

/**
 * Helper function: Send notification via WhatsApp
 */
function notifyViaWhatsApp(data) {
  const phoneNumber = '919876543210'; // Replace with actual number
  const message = `
New inquiry from ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Message: ${data.message}
  `.trim();

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  // Open in new window (optional)
  // window.open(whatsappUrl, '_blank');
}

/**
 * Helper function: Show quote result
 */
function showQuoteResult(data) {
  const resultModal = document.getElementById('quoteResultModal');
  if (resultModal) {
    resultModal.classList.add('active');
  }
}

/* ========== INITIALIZATION ========== */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize contact form
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    new ContactFormValidator('#contact-form');
  }

  // Initialize lead forms
  const leadForms = document.querySelectorAll('.lead-form');
  leadForms.forEach(form => {
    new LeadFormValidator(`.lead-form`);
  });

  // Initialize quote forms
  const quoteForms = document.querySelectorAll('.quote-form');
  quoteForms.forEach(form => {
    new QuoteFormValidator(`.quote-form`);
  });

  // Initialize multi-step forms
  const multiStepForms = document.querySelectorAll('[data-multi-step]');
  multiStepForms.forEach(form => {
    new MultiStepFormValidator(`[data-multi-step="${form.getAttribute('data-multi-step')}"]`);
  });
});

/* ========== ACCESSIBILITY HELPERS ========== */

/**
 * Add ARIA attributes to form fields for accessibility
 */
function setupFormAccessibility(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    if (!input.hasAttribute('aria-describedby')) {
      input.setAttribute('aria-describedby', `${input.name}-help`);
    }

    if (!input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
      const label = form.querySelector(`label[for="${input.id}"]`);
      if (label) {
        input.setAttribute('aria-label', label.textContent);
      }
    }
  });
}

/* ========== END OF FORM VALIDATION.JS ========== */
