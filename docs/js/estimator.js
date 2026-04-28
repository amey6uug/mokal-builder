/* ==============================================
   MOKAL BUILDER - ESTIMATOR JAVASCRIPT
   Quote calculator and estimator logic
   ============================================== */

class EstimatorCalculator {
  constructor(formSelector = '.estimator-form') {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.areaInput = this.form.querySelector('[name="area"]');
    this.serviceSelect = this.form.querySelector('[name="service"]');
    this.qualitySelect = this.form.querySelector('[name="quality"]');
    this.resultDiv = this.form.querySelector('.estimator-result');

    // Price configuration (rupees per sqft)
    this.pricingMatrix = {
      residential: {
        basic: 300,
        standard: 500,
        premium: 800
      },
      commercial: {
        basic: 400,
        standard: 700,
        premium: 1000
      },
      renovation: {
        basic: 350,
        standard: 600,
        premium: 900
      }
    };

    this.init();
  }

  init() {
    if (this.areaInput) {
      this.areaInput.addEventListener('input', () => this.calculateEstimate());
    }
    if (this.serviceSelect) {
      this.serviceSelect.addEventListener('change', () => this.calculateEstimate());
    }
    if (this.qualitySelect) {
      this.qualitySelect.addEventListener('change', () => this.calculateEstimate());
    }

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Calculate estimate based on inputs
   */
  calculateEstimate() {
    const area = parseFloat(this.areaInput?.value) || 0;
    const service = this.serviceSelect?.value || 'residential';
    const quality = this.qualitySelect?.value || 'standard';

    if (area <= 0) {
      if (this.resultDiv) {
        this.resultDiv.style.display = 'none';
      }
      return;
    }

    // Get base price per sqft
    const basePricePerSqft = this.pricingMatrix[service]?.[quality] || 500;

    // Calculate total
    const baseEstimate = area * basePricePerSqft;

    // Apply discount for larger areas
    let discount = 0;
    if (area > 5000) {
      discount = 0.1; // 10% discount
    } else if (area > 3000) {
      discount = 0.05; // 5% discount
    }

    const discountAmount = baseEstimate * discount;
    const finalEstimate = baseEstimate - discountAmount;

    // Add 15% for contingency
    const contingency = finalEstimate * 0.15;
    const totalEstimate = finalEstimate + contingency;

    this.displayResult(totalEstimate, basePricePerSqft, area);
  }

  /**
   * Display estimate result
   */
  displayResult(total, pricePerSqft, area) {
    if (!this.resultDiv) return;

    const min = Math.round(total * 0.9);
    const max = Math.round(total * 1.1);

    this.resultDiv.style.display = 'block';
    this.resultDiv.innerHTML = `
      <h3>Estimated Budget</h3>
      <div class="result-range">
        ₹${this.formatNumber(min)} - ₹${this.formatNumber(max)}
      </div>
      <p>
        For ${area.toLocaleString()} sq ft @ ₹${pricePerSqft}/sq ft
        <br>
        <small style="opacity: 0.8;">* This is an approximate estimate. Final quote will depend on site conditions and specifications.</small>
      </p>
    `;
  }

  /**
   * Format number with commas
   */
  formatNumber(num) {
    return Math.round(num).toLocaleString('en-IN');
  }

  /**
   * Handle form submission
   */
  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const data = {
      area: parseFloat(formData.get('area')),
      service: formData.get('service'),
      quality: formData.get('quality'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email')
    };

    // Validate
    if (!this.validateData(data)) return;

    // Submit
    this.submitEstimate(data);
  }

  /**
   * Validate estimate data
   */
  validateData(data) {
    if (data.area <= 0) {
      showNotification('error', 'Please enter a valid area.');
      return false;
    }

    if (!data.name || data.name.trim() === '') {
      showNotification('error', 'Please enter your name.');
      return false;
    }

    if (!data.phone || !isValidPhone(data.phone)) {
      showNotification('error', 'Please enter a valid phone number.');
      return false;
    }

    if (!data.email || !isValidEmail(data.email)) {
      showNotification('error', 'Please enter a valid email.');
      return false;
    }

    return true;
  }

  /**
   * Submit estimate to backend
   */
  submitEstimate(data) {
    // Calculate final estimate for submission
    const basePrice = this.pricingMatrix[data.service][data.quality];
    const estimate = data.area * basePrice * 1.15;

    const submitData = {
      ...data,
      estimatedBudget: Math.round(estimate)
    };

    fetch('/api/estimate-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showNotification('success', 'Estimate request sent! We\'ll contact you shortly.');
        this.form.reset();
        this.calculateEstimate();
      } else {
        showNotification('error', result.message || 'Failed to send estimate request.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showNotification('error', 'An error occurred. Please try again.');
    });
  }
}

/**
 * Advanced Estimator with Multiple Options
 */
class AdvancedEstimator {
  constructor(formSelector = '.advanced-estimator-form') {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.inputs = {
      area: this.form.querySelector('[name="area"]'),
      bhk: this.form.querySelector('[name="bhk"]'),
      finish: this.form.querySelector('[name="finish"]'),
      location: this.form.querySelector('[name="location"]'),
      timeline: this.form.querySelector('[name="timeline"]')
    };

    this.priceRanges = {
      1: { basic: 25, standard: 40, premium: 60 }, // lakhs
      2: { basic: 40, standard: 60, premium: 90 },
      3: { basic: 60, standard: 85, premium: 120 },
      4: { basic: 85, standard: 120, premium: 160 }
    };

    this.locationMultiplier = {
      tier1: 1.2,
      tier2: 1.0,
      tier3: 0.85
    };

    this.init();
  }

  init() {
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('change', () => this.calculateAdvanced());
        input.addEventListener('input', () => this.calculateAdvanced());
      }
    });

    this.form.addEventListener('submit', (e) => this.handleAdvancedSubmit(e));
  }

  calculateAdvanced() {
    const area = parseFloat(this.inputs.area?.value) || 0;
    const bhk = this.inputs.bhk?.value || '2';
    const finish = this.inputs.finish?.value || 'standard';
    const location = this.inputs.location?.value || 'tier2';

    if (area <= 0) return;

    // Base price range in lakhs
    const baseRange = this.priceRanges[bhk]?.[finish] || [40, 60];
    
    // Apply location multiplier
    const multiplier = this.locationMultiplier[location] || 1.0;
    
    const min = baseRange * multiplier;
    const max = (baseRange + 20) * multiplier;

    this.displayAdvancedResult(min, max, area, bhk);
  }

  displayAdvancedResult(min, max, area, bhk) {
    const resultDiv = this.form.querySelector('.estimator-result');
    if (!resultDiv) return;

    const pricePerSqft = (min * 10) / (area || 1000);

    resultDiv.innerHTML = `
      <h3>Budget Range</h3>
      <div class="result-range">
        ₹${min.toFixed(1)} - ₹${max.toFixed(1)} Lakhs
      </div>
      <p>
        For ${area.toLocaleString()} sq ft (${bhk} BHK)
        <br>
        ~₹${Math.round(pricePerSqft * 100000)}/sq ft
      </p>
    `;
  }

  handleAdvancedSubmit(e) {
    e.preventDefault();
    // Similar submission logic as basic estimator
  }
}

/**
 * Quick Calculator - Simplified version
 */
class QuickCalculator {
  constructor(elementSelector) {
    this.element = document.querySelector(elementSelector);
    if (!this.element) return;

    this.init();
  }

  init() {
    const inputs = this.element.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.calculate());
      input.addEventListener('change', () => this.calculate());
    });
  }

  calculate() {
    const area = parseFloat(this.element.querySelector('[name="area"]')?.value) || 0;
    const ratePerSqft = 500; // Default rate
    const total = area * ratePerSqft;

    const resultElement = this.element.querySelector('.quick-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <strong>₹${this.formatNumber(total)}</strong>
      `;
    }
  }

  formatNumber(num) {
    return Math.round(num).toLocaleString('en-IN');
  }
}

/* ========== INITIALIZATION ========== */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize basic estimator
  new EstimatorCalculator('.estimator-form');

  // Initialize advanced estimator if it exists
  new AdvancedEstimator('.advanced-estimator-form');

  // Initialize quick calculator
  new QuickCalculator('.quick-calculator');
});

/* ========== HELPER FUNCTIONS ========== */

/**
 * Format currency to Indian format
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Get estimate based on service type and area
 */
function getEstimate(service, area, quality) {
  const rates = {
    residential: { basic: 300, standard: 500, premium: 800 },
    commercial: { basic: 400, standard: 700, premium: 1000 }
  };

  const rate = rates[service]?.[quality] || 500;
  return area * rate * 1.15; // 15% contingency
}

/* ========== END OF ESTIMATOR.JS ========== */
