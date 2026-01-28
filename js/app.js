/**
 * E-Zero - Main Application JavaScript
 * Core functionality for navigation, animations, and utilities
 */

// ============================================
// GLOBAL APP STATE
// ============================================
window.EZero = {
  state: {
    user: {
      id: 'user-001',
      name: 'John Doe',
      email: 'john@example.com',
      level: 7,
      points: 2450,
      recycledItems: 23,
      co2Saved: 156
    },
    notifications: [],
    currentSection: 'home'
  },
  
  utils: {
    showNotification: showNotification,
    formatNumber: formatNumber,
    debounce: debounce
  }
};

// ============================================
// DOM READY INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initNavHighlight();
  initCounters();
  initItemSelection();
  initFormSteps();
  
  console.log('🌱 E-Zero App Initialized');
});

// ============================================
// HEADER FUNCTIONALITY
// ============================================
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class for styling
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!menuBtn || !mobileMenu) return;
  
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const icon = menuBtn.querySelector('i');
    
    if (mobileMenu.classList.contains('open')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
      document.body.style.overflow = 'hidden';
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
      document.body.style.overflow = '';
    }
  });
  
  // Close menu when clicking a link
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const icon = menuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
      document.body.style.overflow = '';
    });
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      scrollToSection(targetId.substring(1));
    });
  });
}

// Global scroll function
window.scrollToSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  const headerOffset = 80;
  const elementPosition = section.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
  
  // Update URL without triggering scroll
  history.pushState(null, null, `#${sectionId}`);
};

// ============================================
// NAVIGATION HIGHLIGHT
// ============================================
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!sections.length || !navLinks.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
        
        window.EZero.state.currentSection = id;
      }
    });
  }, { 
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });
  
  sections.forEach(section => observer.observe(section));
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.scroll-animate');
  
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add stagger delay
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// COUNTER ANIMATIONS
// ============================================
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        animateCounter(entry.target);
        entry.target.classList.add('counted');
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const text = element.textContent;
  const match = text.match(/[\d,.]+/);
  if (!match) return;
  
  const target = parseFloat(match[0].replace(/,/g, ''));
  const suffix = text.replace(match[0], '');
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    
    element.textContent = formatNumber(Math.floor(current)) + suffix;
  }, 16);
}

// ============================================
// ITEM SELECTION (Pickup Form)
// ============================================
function initItemSelection() {
  const itemCards = document.querySelectorAll('.item-card');
  
  itemCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      updateSelectedItems();
    });
  });
}

function updateSelectedItems() {
  const selectedItems = document.querySelectorAll('.item-card.selected');
  const nextBtn = document.getElementById('next-btn');
  
  if (nextBtn) {
    nextBtn.disabled = selectedItems.length === 0;
  }
  
  return Array.from(selectedItems).map(card => card.dataset.item);
}

// ============================================
// MULTI-STEP FORM
// ============================================
let currentStep = 1;
const totalSteps = 4;

function initFormSteps() {
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const submitBtn = document.getElementById('submit-btn');
  const form = document.getElementById('pickup-form');
  
  if (!form) return;
  
  // Initialize time slots
  initTimeSlots();
  
  // Initialize date picker
  const dateInput = document.getElementById('pickup-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split('T')[0];
  }
  
  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        goToStep(currentStep + 1);
      }
    });
  }
  
  // Previous button
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  }
  
  // Form submission
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

function initTimeSlots() {
  const timeSlots = document.querySelectorAll('.time-slot:not(.unavailable)');
  
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      // Remove previous selection
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      // Add selection
      slot.classList.add('selected');
    });
  });
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;
  
  // Hide current step
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  
  // Show new step
  document.getElementById(`step-${step}`).classList.remove('hidden');
  
  // Update progress
  updateProgress(step);
  
  // Update buttons
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const submitBtn = document.getElementById('submit-btn');
  
  prevBtn.classList.toggle('hidden', step === 1);
  nextBtn.classList.toggle('hidden', step === totalSteps);
  submitBtn.classList.toggle('hidden', step !== totalSteps);
  
  // Generate summary on last step
  if (step === totalSteps) {
    generateBookingSummary();
  }
  
  currentStep = step;
}

function updateProgress(step) {
  const progressSteps = document.querySelectorAll('.progress-step');
  
  progressSteps.forEach((progressStep, index) => {
    if (index < step) {
      progressStep.classList.add('active');
      if (index < step - 1) {
        progressStep.classList.add('completed');
      }
    } else {
      progressStep.classList.remove('active', 'completed');
    }
  });
}

function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      const selectedItems = document.querySelectorAll('.item-card.selected');
      if (selectedItems.length === 0) {
        showNotification('Please select at least one item', 'warning');
        return false;
      }
      return true;
      
    case 2:
      const date = document.getElementById('pickup-date').value;
      const selectedSlot = document.querySelector('.time-slot.selected');
      
      if (!date) {
        showNotification('Please select a pickup date', 'warning');
        return false;
      }
      if (!selectedSlot) {
        showNotification('Please select a time slot', 'warning');
        return false;
      }
      return true;
      
    case 3:
      const name = document.getElementById('contact-name').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const address = document.getElementById('pickup-address').value.trim();
      
      if (!name || !phone || !email || !address) {
        showNotification('Please fill in all required fields', 'warning');
        return false;
      }
      
      if (!/^[6-9]\d{9}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'warning');
        return false;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return false;
      }
      
      return true;
      
    default:
      return true;
  }
}

function generateBookingSummary() {
  const summaryContainer = document.getElementById('booking-summary');
  if (!summaryContainer) return;
  
  const selectedItems = Array.from(document.querySelectorAll('.item-card.selected'))
    .map(card => card.querySelector('span').textContent);
  const date = document.getElementById('pickup-date').value;
  const timeSlot = document.querySelector('.time-slot.selected .time-slot-time')?.textContent || '';
  const name = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const address = document.getElementById('pickup-address').value;
  
  summaryContainer.innerHTML = `
    <div class="p-4">
      <h5 class="font-semibold mb-4">Booking Summary</h5>
      
      <div class="mb-4">
        <p class="text-sm text-gray-500">Items to Recycle</p>
        <p class="font-medium">${selectedItems.join(', ')}</p>
      </div>
      
      <div class="mb-4">
        <p class="text-sm text-gray-500">Pickup Schedule</p>
        <p class="font-medium">${formatDate(date)} at ${timeSlot}</p>
      </div>
      
      <div class="mb-4">
        <p class="text-sm text-gray-500">Contact</p>
        <p class="font-medium">${name}</p>
        <p class="text-sm">${phone}</p>
      </div>
      
      <div>
        <p class="text-sm text-gray-500">Pickup Address</p>
        <p class="font-medium">${address}</p>
      </div>
    </div>
  `;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.innerHTML;
  
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  submitBtn.disabled = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bookingId = 'BK' + Date.now();
    
    // Show confirmation
    showConfirmation(bookingId);
    
    showNotification('Booking confirmed successfully!', 'success');
    
  } catch (error) {
    console.error('Booking failed:', error);
    showNotification('Booking failed. Please try again.', 'error');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function showConfirmation(bookingId) {
  const form = document.getElementById('pickup-form');
  const confirmation = document.getElementById('booking-confirmation');
  const details = document.getElementById('confirmation-details');
  
  if (!form || !confirmation || !details) return;
  
  const selectedItems = Array.from(document.querySelectorAll('.item-card.selected'))
    .map(card => card.querySelector('span').textContent);
  const date = document.getElementById('pickup-date').value;
  const timeSlot = document.querySelector('.time-slot.selected .time-slot-time')?.textContent || '';
  const name = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const address = document.getElementById('pickup-address').value;
  
  details.innerHTML = `
    <div class="mb-3">
      <span class="text-sm text-gray-500">Booking ID:</span>
      <span class="font-semibold text-primary">${bookingId}</span>
    </div>
    <div class="mb-3">
      <span class="text-sm text-gray-500">Items:</span>
      <span class="font-medium">${selectedItems.join(', ')}</span>
    </div>
    <div class="mb-3">
      <span class="text-sm text-gray-500">Schedule:</span>
      <span class="font-medium">${formatDate(date)} at ${timeSlot}</span>
    </div>
    <div class="mb-3">
      <span class="text-sm text-gray-500">Contact:</span>
      <span class="font-medium">${name} (${phone})</span>
    </div>
    <div>
      <span class="text-sm text-gray-500">Address:</span>
      <span class="font-medium">${address}</span>
    </div>
  `;
  
  form.classList.add('hidden');
  document.querySelector('.form-progress').classList.add('hidden');
  confirmation.classList.remove('hidden');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  `;
  
  const icon = type === 'success' ? 'check-circle' : 
               type === 'error' ? 'times-circle' : 
               type === 'warning' ? 'exclamation-triangle' : 'info-circle';
  
  notification.innerHTML = `<i class="fas fa-${icon}"></i>${message}`;
  document.body.appendChild(notification);
  
  // Add animation keyframes
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

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

// ============================================
// EXPORTS
// ============================================
export { showNotification, formatNumber, formatDate, debounce };