// booking.js - Advanced pickup booking functionality with real-time scheduling

class PickupScheduler {
  constructor() {
    this.form = document.getElementById('pickup-form');
    this.timeSlots = this.generateTimeSlots();
    this.bookedSlots = new Set();
    this.selectedItems = new Map();
    this.bookingData = {};
    this.validation = {
      isValid: false,
      errors: {}
    };
    this.pricing = {
      baseRate: 50,
      itemRates: {
        'electronics': 25,
        'batteries': 30,
        'cables': 15,
        'computers': 40,
        'phones': 20,
        'appliances': 35,
        'metal': 10,
        'plastic': 8
      }
    };
    this.init();
  }

  init() {
    if (!this.form) return;

    this.setupFormElements();
    this.setupEventListeners();
    this.setupValidation();
    this.loadBookedSlots();
    this.initializeGeolocation();
    this.setupRealTimeUpdates();
    console.log('🚚 Pickup scheduler initialized');
  }

  setupFormElements() {
    this.setupItemSelection();
    this.setupDatePicker();
    this.setupTimeSlots();
    this.setupAddressValidation();
    this.setupPricingDisplay();
    this.setupProgressIndicator();
    this.setupConfirmationSystem();
  }

  setupItemSelection() {
    const itemsContainer = document.getElementById('items-selection');
    if (!itemsContainer) return;

    const itemTypes = [
      { id: 'electronics', name: 'Electronics', icon: 'fas fa-tv', rate: 25 },
      { id: 'batteries', name: 'Batteries', icon: 'fas fa-battery-half', rate: 30 },
      { id: 'cables', name: 'Cables & Wires', icon: 'fas fa-plug', rate: 15 },
      { id: 'computers', name: 'Computers', icon: 'fas fa-desktop', rate: 40 },
      { id: 'phones', name: 'Mobile Phones', icon: 'fas fa-mobile-alt', rate: 20 },
      { id: 'appliances', name: 'Appliances', icon: 'fas fa-blender', rate: 35 },
      { id: 'metal', name: 'Metal Components', icon: 'fas fa-cog', rate: 10 },
      { id: 'plastic', name: 'Plastic Items', icon: 'fas fa-recycle', rate: 8 }
    ];

    const itemsHTML = itemTypes.map(item => 
      '<div class="item-selection-card">' +
        '<div class="item-header">' +
          '<div class="item-icon">' +
            '<i class="' + item.icon + '"></i>' +
          '</div>' +
          '<h4>' + item.name + '</h4>' +
          '<span class="rate-badge">₹' + item.rate + '/kg</span>' +
        '</div>' +
        '<div class="quantity-controls">' +
          '<button type="button" class="qty-btn" onclick="adjustQuantity(\'' + item.id + '\', -1)">' +
            '<i class="fas fa-minus"></i>' +
          '</button>' +
          '<input type="number" id="qty-' + item.id + '" min="0" max="100" value="0" class="qty-input">' +
          '<button type="button" class="qty-btn" onclick="adjustQuantity(\'' + item.id + '\', 1)">' +
            '<i class="fas fa-plus"></i>' +
          '</button>' +
        '</div>' +
        '<div class="weight-input">' +
          '<input type="number" id="weight-' + item.id + '" placeholder="Estimated weight (kg)" min="0" step="0.1" class="weight-input">' +
        '</div>' +
      '</div>'
    ).join('');

    itemsContainer.innerHTML = itemsHTML;
    this.attachItemEventListeners();
  }

  attachItemEventListeners() {
    const quantityInputs = document.querySelectorAll('.qty-input, .weight-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', () => this.updateItemSelection());
      input.addEventListener('input', () => this.calculatePricing());
    });
  }

  setupDatePicker() {
    const dateInput = document.getElementById('pickup-date');
    if (!dateInput) return;

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];

    // Set maximum date to 30 days from now
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split('T')[0];

    dateInput.addEventListener('change', (e) => {
      this.updateAvailableSlots(e.target.value);
      this.validateBookingDate(e.target.value);
    });
  }

  setupTimeSlots() {
    const slotsContainer = document.getElementById('time-slots');
    if (!slotsContainer) return;

    const slotsHTML = this.timeSlots.map(slot =>
      '<div class="time-slot" data-slot-id="' + slot.id + '" onclick="selectTimeSlot(\'' + slot.id + '\')">' +
        '<div class="slot-time">' + slot.label + '</div>' +
        '<div class="slot-status">Available</div>' +
      '</div>'
    ).join('');

    slotsContainer.innerHTML = slotsHTML;
  }

  setupAddressValidation() {
    const addressInput = document.getElementById('pickup-address');
    if (!addressInput) return;

    let addressTimeout;
    addressInput.addEventListener('input', (e) => {
      clearTimeout(addressTimeout);
      addressTimeout = setTimeout(() => {
        this.validateAddress(e.target.value);
      }, 500);
    });

    // Add current location button
    const locationBtn = document.createElement('button');
    locationBtn.type = 'button';
    locationBtn.className = 'current-location-btn';
    locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Current Location';
    locationBtn.onclick = () => this.getCurrentLocation();
    
    addressInput.parentNode.appendChild(locationBtn);
  }

  setupPricingDisplay() {
    const pricingContainer = document.getElementById('pricing-breakdown');
    if (!pricingContainer) return;

    pricingContainer.innerHTML = 
      '<div class="pricing-section">' +
        '<h4><i class="fas fa-calculator"></i> Pricing Breakdown</h4>' +
        '<div id="pricing-details" class="pricing-details">' +
          '<div class="pricing-row">' +
            '<span>Base pickup fee:</span>' +
            '<span id="base-fee">₹' + this.pricing.baseRate + '</span>' +
          '</div>' +
          '<div class="pricing-row">' +
            '<span>Items fee:</span>' +
            '<span id="items-fee">₹0</span>' +
          '</div>' +
          '<div class="pricing-row total-row">' +
            '<span><strong>Total Estimated Cost:</strong></span>' +
            '<span id="total-cost"><strong>₹' + this.pricing.baseRate + '</strong></span>' +
          '</div>' +
        '</div>' +
        '<div class="pricing-note">' +
          '<i class="fas fa-info-circle"></i>' +
          ' Final cost may vary based on actual weight and condition of items' +
        '</div>' +
      '</div>';
  }

  setupProgressIndicator() {
    const progressContainer = document.getElementById('booking-progress');
    if (!progressContainer) return;

    progressContainer.innerHTML =
      '<div class="progress-steps">' +
        '<div class="step active" data-step="1">' +
          '<div class="step-icon"><i class="fas fa-list"></i></div>' +
          '<span>Items</span>' +
        '</div>' +
        '<div class="step" data-step="2">' +
          '<div class="step-icon"><i class="fas fa-calendar"></i></div>' +
          '<span>Schedule</span>' +
        '</div>' +
        '<div class="step" data-step="3">' +
          '<div class="step-icon"><i class="fas fa-map-marker"></i></div>' +
          '<span>Address</span>' +
        '</div>' +
        '<div class="step" data-step="4">' +
          '<div class="step-icon"><i class="fas fa-check"></i></div>' +
          '<span>Confirm</span>' +
        '</div>' +
      '</div>';
  }

  setupConfirmationSystem() {
    const confirmContainer = document.getElementById('booking-confirmation');
    if (!confirmContainer) return;

    confirmContainer.innerHTML =
      '<div class="confirmation-content hidden" id="confirmation-details">' +
        '<div class="confirmation-icon">' +
          '<i class="fas fa-check-circle"></i>' +
        '</div>' +
        '<h3>Booking Confirmed!</h3>' +
        '<div class="booking-summary" id="booking-summary"></div>' +
        '<div class="confirmation-actions">' +
          '<button type="button" class="btn-primary" onclick="downloadBookingReceipt()">' +
            '<i class="fas fa-download"></i> Download Receipt' +
          '</button>' +
          '<button type="button" class="btn-secondary" onclick="trackPickup()">' +
            '<i class="fas fa-truck"></i> Track Pickup' +
          '</button>' +
        '</div>' +
      '</div>';
  }

  generateTimeSlots() {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    const interval = 2;

    for (let hour = startHour; hour < endHour; hour += interval) {
      const startTime = hour.toString().padStart(2, '0') + ':00';
      const endTime = (hour + interval).toString().padStart(2, '0') + ':00';
      slots.push({
        id: 'slot-' + hour,
        label: startTime + ' - ' + endTime,
        start: hour,
        end: hour + interval,
        available: true
      });
    }

    return slots;
  }

  setupEventListeners() {
    if (!this.form) return;

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleFormSubmission(e));

    // Real-time validation
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.updateProgress());
    });

    // Navigation buttons
    this.setupNavigationButtons();
  }

  setupNavigationButtons() {
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');

    nextButtons.forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });

    prevButtons.forEach(btn => {
      btn.addEventListener('click', () => this.prevStep());
    });
  }

  async validateAddress(address) {
    if (!address || address.length < 10) {
      this.showValidationError('pickup-address', 'Please enter a complete address');
      return false;
    }

    try {
      // Simulate address validation API call
      const isValid = await this.geocodeAddress(address);
      
      if (isValid) {
        this.showValidationSuccess('pickup-address', 'Address verified');
        return true;
      } else {
        this.showValidationError('pickup-address', 'Unable to verify address');
        return false;
      }
    } catch (error) {
      console.warn('Address validation failed:', error);
      return true; // Allow booking to continue
    }
  }

  async geocodeAddress(address) {
    // Simulate geocoding delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(address.length > 15);
      }, 800);
    });
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser');
      return;
    }

    const btn = document.querySelector('.current-location-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.reverseGeocode(position.coords.latitude, position.coords.longitude)
          .then(address => {
            const addressInput = document.getElementById('pickup-address');
            if (addressInput) {
              addressInput.value = address;
              this.validateAddress(address);
            }
          })
          .finally(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your current location');
        btn.innerHTML = originalText;
        btn.disabled = false;
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async reverseGeocode(lat, lng) {
    // Simulate reverse geocoding
    return 'Current Location: ' + lat.toFixed(4) + ', ' + lng.toFixed(4);
  }

  updateItemSelection() {
    this.selectedItems.clear();
    
    const itemTypes = ['electronics', 'batteries', 'cables', 'computers', 'phones', 'appliances', 'metal', 'plastic'];
    
    itemTypes.forEach(type => {
      const qtyInput = document.getElementById('qty-' + type);
      const weightInput = document.getElementById('weight-' + type);
      
      if (qtyInput && weightInput) {
        const quantity = parseInt(qtyInput.value) || 0;
        const weight = parseFloat(weightInput.value) || 0;
        
        if (quantity > 0 || weight > 0) {
          this.selectedItems.set(type, {
            quantity: quantity,
            weight: weight,
            rate: this.pricing.itemRates[type] || 0
          });
        }
      }
    });

    this.calculatePricing();
    this.updateProgress();
  }

  calculatePricing() {
    let itemsTotal = 0;
    
    this.selectedItems.forEach((item, type) => {
      const cost = (item.weight || 0) * (this.pricing.itemRates[type] || 0);
      itemsTotal += cost;
    });

    const total = this.pricing.baseRate + itemsTotal;

    // Update pricing display
    const itemsFeeEl = document.getElementById('items-fee');
    const totalCostEl = document.getElementById('total-cost');
    
    if (itemsFeeEl) itemsFeeEl.textContent = '₹' + itemsTotal.toFixed(2);
    if (totalCostEl) totalCostEl.innerHTML = '<strong>₹' + total.toFixed(2) + '</strong>';

    this.bookingData.pricing = {
      baseRate: this.pricing.baseRate,
      itemsTotal: itemsTotal,
      total: total
    };
  }

  updateAvailableSlots(date) {
    const selectedDate = new Date(date);
    const today = new Date();
    
    // Check if selected date is today or tomorrow for slot availability
    const isToday = selectedDate.toDateString() === today.toDateString();
    const currentHour = today.getHours();

    this.timeSlots.forEach(slot => {
      const slotElement = document.querySelector('[data-slot-id="' + slot.id + '"]');
      if (!slotElement) return;

      let isAvailable = true;
      let statusText = 'Available';

      // If today, disable past slots
      if (isToday && slot.start <= currentHour) {
        isAvailable = false;
        statusText = 'Not Available';
      }

      // Check if slot is already booked
      if (this.bookedSlots.has(date + '_' + slot.id)) {
        isAvailable = false;
        statusText = 'Booked';
      }

      slotElement.className = 'time-slot ' + (isAvailable ? 'available' : 'unavailable');
      slotElement.querySelector('.slot-status').textContent = statusText;
    });
  }

  loadBookedSlots() {
    // Simulate loading booked slots from API
    const mockBookedSlots = [
      '2024-01-20_slot-9',
      '2024-01-20_slot-13',
      '2024-01-21_slot-11'
    ];
    
    mockBookedSlots.forEach(slot => {
      this.bookedSlots.add(slot);
    });
  }

  setupRealTimeUpdates() {
    // Simulate real-time updates for slot availability
    setInterval(() => {
      this.refreshSlotAvailability();
    }, 30000); // Update every 30 seconds
  }

  refreshSlotAvailability() {
    const selectedDate = document.getElementById('pickup-date')?.value;
    if (selectedDate) {
      this.updateAvailableSlots(selectedDate);
    }
  }

  validateField(input) {
    const fieldName = input.name || input.id;
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'pickup-date':
        isValid = this.validateBookingDate(input.value);
        errorMessage = isValid ? '' : 'Please select a valid date';
        break;
      
      case 'pickup-address':
        isValid = input.value.length >= 10;
        errorMessage = isValid ? '' : 'Please enter a complete address';
        break;

      case 'contact-phone':
        isValid = /^[6-9]\d{9}$/.test(input.value);
        errorMessage = isValid ? '' : 'Please enter a valid 10-digit phone number';
        break;

      case 'contact-email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        errorMessage = isValid ? '' : 'Please enter a valid email address';
        break;
    }

    if (isValid) {
      this.showValidationSuccess(fieldName, '');
    } else {
      this.showValidationError(fieldName, errorMessage);
    }

    this.validation.errors[fieldName] = errorMessage;
    this.updateValidationState();
    
    return isValid;
  }

  validateBookingDate(date) {
    if (!date) return false;
    
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    
    return selectedDate >= tomorrow && selectedDate <= maxDate;
  }

  showValidationError(fieldName, message) {
    const field = document.getElementById(fieldName) || document.querySelector('[name="' + fieldName + '"]');
    if (!field) return;

    field.classList.add('error');
    
    let errorEl = field.parentNode.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      field.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  showValidationSuccess(fieldName, message) {
    const field = document.getElementById(fieldName) || document.querySelector('[name="' + fieldName + '"]');
    if (!field) return;

    field.classList.remove('error');
    field.classList.add('success');
    
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) {
      errorEl.remove();
    }
  }

  updateValidationState() {
    const hasErrors = Object.values(this.validation.errors).some(error => error !== '');
    this.validation.isValid = !hasErrors && this.selectedItems.size > 0;
    
    // Update submit button state
    const submitBtn = document.querySelector('.submit-booking-btn');
    if (submitBtn) {
      submitBtn.disabled = !this.validation.isValid;
    }
  }

  updateProgress() {
    let completedSteps = 0;
    
    // Step 1: Items selected
    if (this.selectedItems.size > 0) completedSteps++;
    
    // Step 2: Date and time selected
    const dateInput = document.getElementById('pickup-date');
    const selectedSlot = document.querySelector('.time-slot.selected');
    if (dateInput?.value && selectedSlot) completedSteps++;
    
    // Step 3: Address provided
    const addressInput = document.getElementById('pickup-address');
    if (addressInput?.value?.length >= 10) completedSteps++;
    
    // Step 4: Contact details
    const phoneInput = document.getElementById('contact-phone');
    const emailInput = document.getElementById('contact-email');
    if (phoneInput?.value && emailInput?.value) completedSteps++;

    // Update progress indicator
    this.updateProgressIndicator(completedSteps);
  }

  updateProgressIndicator(completedSteps) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
      step.classList.toggle('active', index < completedSteps);
      step.classList.toggle('completed', index < completedSteps - 1);
    });
  }

  async handleFormSubmission(e) {
    e.preventDefault();
    
    if (!this.validation.isValid) {
      alert('Please complete all required fields');
      return;
    }

    try {
      const submitBtn = e.target.querySelector('.submit-booking-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;

      // Collect form data
      this.collectBookingData();

      // Simulate API call
      const result = await this.submitBooking(this.bookingData);
      
      if (result.success) {
        this.showConfirmation(result.bookingId);
      } else {
        throw new Error(result.message || 'Booking failed');
      }

    } catch (error) {
      console.error('Booking submission failed:', error);
      alert('Booking failed: ' + error.message);
    }
  }

  collectBookingData() {
    const formData = new FormData(this.form);
    const selectedSlot = document.querySelector('.time-slot.selected');
    
    this.bookingData = {
      ...this.bookingData,
      items: Array.from(this.selectedItems.entries()).map(([type, data]) => ({
        type: type,
        quantity: data.quantity,
        weight: data.weight,
        rate: data.rate
      })),
      schedule: {
        date: formData.get('pickup-date'),
        timeSlot: selectedSlot ? selectedSlot.dataset.slotId : null
      },
      address: formData.get('pickup-address'),
      contact: {
        name: formData.get('contact-name'),
        phone: formData.get('contact-phone'),
        email: formData.get('contact-email')
      },
      specialInstructions: formData.get('special-instructions'),
      timestamp: new Date().toISOString()
    };
  }

  async submitBooking(bookingData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful booking
    return {
      success: true,
      bookingId: 'BK' + Date.now(),
      message: 'Pickup scheduled successfully!'
    };
  }

  showConfirmation(bookingId) {
    const confirmationEl = document.getElementById('confirmation-details');
    const summaryEl = document.getElementById('booking-summary');
    
    if (!confirmationEl || !summaryEl) return;

    // Generate booking summary
    const summary = this.generateBookingSummary(bookingId);
    summaryEl.innerHTML = summary;
    
    // Show confirmation
    confirmationEl.classList.remove('hidden');
    this.form.classList.add('hidden');
    
    // Scroll to confirmation
    confirmationEl.scrollIntoView({ behavior: 'smooth' });
    
    // Store booking data for tracking
    localStorage.setItem('currentBooking', JSON.stringify({
      ...this.bookingData,
      bookingId: bookingId
    }));
  }

  generateBookingSummary(bookingId) {
    const itemsList = Array.from(this.selectedItems.entries())
      .map(([type, data]) => 
        '<li>' + type.charAt(0).toUpperCase() + type.slice(1) + 
        ': ' + data.quantity + ' items (' + data.weight + ' kg)</li>'
      ).join('');

    const selectedSlot = document.querySelector('.time-slot.selected');
    const slotText = selectedSlot ? selectedSlot.querySelector('.slot-time').textContent : 'Not selected';

    return '<div class="booking-summary-content">' +
      '<div class="summary-section">' +
        '<h4><i class="fas fa-receipt"></i> Booking Details</h4>' +
        '<p><strong>Booking ID:</strong> ' + bookingId + '</p>' +
        '<p><strong>Date:</strong> ' + this.bookingData.schedule.date + '</p>' +
        '<p><strong>Time:</strong> ' + slotText + '</p>' +
      '</div>' +
      '<div class="summary-section">' +
        '<h4><i class="fas fa-list"></i> Items</h4>' +
        '<ul>' + itemsList + '</ul>' +
      '</div>' +
      '<div class="summary-section">' +
        '<h4><i class="fas fa-map-marker"></i> Pickup Address</h4>' +
        '<p>' + this.bookingData.address + '</p>' +
      '</div>' +
      '<div class="summary-section">' +
        '<h4><i class="fas fa-money-bill"></i> Pricing</h4>' +
        '<p><strong>Total Estimated Cost:</strong> ₹' + this.bookingData.pricing.total.toFixed(2) + '</p>' +
      '</div>' +
    '</div>';
  }
}

// Global functions for HTML onclick handlers
window.adjustQuantity = function(itemId, change) {
  const input = document.getElementById('qty-' + itemId);
  if (!input) return;
  
  const currentValue = parseInt(input.value) || 0;
  const newValue = Math.max(0, Math.min(100, currentValue + change));
  input.value = newValue;
  
  // Trigger change event
  input.dispatchEvent(new Event('change'));
};

window.selectTimeSlot = function(slotId) {
  // Remove previous selection
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  // Add selection to clicked slot
  const selectedSlot = document.querySelector('[data-slot-id="' + slotId + '"]');
  if (selectedSlot && !selectedSlot.classList.contains('unavailable')) {
    selectedSlot.classList.add('selected');
  }
};

window.downloadBookingReceipt = function() {
  const bookingData = localStorage.getItem('currentBooking');
  if (!bookingData) return;
  
  // Simulate receipt download
  console.log('📄 Downloading receipt for booking:', JSON.parse(bookingData).bookingId);
  alert('Receipt downloaded successfully!');
};

window.trackPickup = function() {
  const bookingData = localStorage.getItem('currentBooking');
  if (!bookingData) return;
  
  const booking = JSON.parse(bookingData);
  console.log('🚚 Tracking pickup for booking:', booking.bookingId);
  
  // Simulate tracking redirection
  alert('Redirecting to pickup tracking...');
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pickup-form')) {
    window.pickupScheduler = new PickupScheduler();
  }
});

// Export for module systems
export { PickupScheduler };