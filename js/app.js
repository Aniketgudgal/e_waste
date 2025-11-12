// app.js - Main application logic with advanced features
import { initI18n, changeLanguage } from './i18n.js';
import { initTheme } from './theme.js';

// Global state management
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
    notifications: [
      { id: 1, type: 'success', title: 'Pickup Completed!', message: 'Your electronics have been recycled', time: '2 hours ago', unread: true },
      { id: 2, type: 'reward', title: 'New Reward Available!', message: '50% off on eco-friendly products', time: '1 day ago', unread: true },
      { id: 3, type: 'achievement', title: 'Level Up!', message: 'You reached Level 7 - Eco Warrior', time: '3 days ago', unread: false }
    ],
    selectedLanguage: 'en'
  },
  utils: {
    formatNumber: (num) => new Intl.NumberFormat().format(num),
    debounce: (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    },
    showNotification: (message, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full
        ${type === 'success' ? 'bg-green-500 text-white' : 
          type === 'error' ? 'bg-red-500 text-white' : 
          type === 'warning' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`;
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : type === 'warning' ? 'fa-exclamation' : 'fa-info'}"></i>
          <span>${message}</span>
          <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.classList.remove('translate-x-full'), 100);
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initTheme();
  initNavigation();
  initCounters();
  initDropdowns();
  initAnimations();
  initNotifications();
  initUserProfile();
  initScrollIndicator();
  registerSW();
  console.log('🚀 E-Zero App Initialized Successfully!');
});

// Enhanced Navigation System
function initNavigation() {
  const navMenu = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Mobile menu toggle
  navMenu?.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu?.classList.toggle('hidden');
    navMenu.setAttribute('aria-expanded', !isHidden);
    
    // Animate hamburger to X
    const icon = navMenu.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });

  // Enhanced smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        mobileMenu?.classList.add('hidden');
        navMenu?.querySelector('i')?.classList.replace('fa-times', 'fa-bars');
        
        // Update URL without triggering navigation
        history.pushState(null, null, `#${targetId}`);
      }
    });
  });

  // Active navigation highlighting with intersection observer
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '-80px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
          link.classList.remove('active');
        });
        document.querySelector(`a[href="#${id}"]`)?.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('section[id]').forEach(section => {
    observer.observe(section);
  });
}

// Enhanced Counters with Animation
function initCounters() {
  const counters = [
    { id: 'waste-counter', target: 12500, suffix: ' kg', duration: 2000 },
    { id: 'users-counter', target: 5200, suffix: '', duration: 2500 },
    { id: 'co2-counter', target: 8750, suffix: ' tons', duration: 3000 }
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = counters.find(c => c.id === entry.target.id);
        if (counter) {
          animateCounter(entry.target, counter.target, counter.suffix, counter.duration);
        }
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    const element = document.getElementById(counter.id);
    if (element) {
      observer.observe(element);
    }
  });
}

function animateCounter(element, target, suffix, duration) {
  let current = 0;
  const increment = target / (duration / 16); // 60fps
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 16);
}

// Dropdown Management
function initDropdowns() {
  // Language dropdown
  const langSelector = document.getElementById('lang-selector');
  const langDropdown = document.getElementById('lang-dropdown');

  langSelector?.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown?.classList.toggle('hidden');
    closeOtherDropdowns('lang-dropdown');
  });

  // Language options
  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      changeLanguage(lang);
      document.getElementById('current-lang').textContent = lang.toUpperCase();
      langDropdown?.classList.add('hidden');
    });
  });

  // User menu dropdown
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');

  userMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown?.classList.toggle('hidden');
    closeOtherDropdowns('user-dropdown');
  });

  // Notification dropdown
  const notificationBtn = document.getElementById('notification-btn');
  const notificationDropdown = document.getElementById('notification-dropdown');

  notificationBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown?.classList.toggle('hidden');
    closeOtherDropdowns('notification-dropdown');
    // Mark notifications as read
    document.querySelector('.notification-badge')?.classList.add('hidden');
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });
}

function closeOtherDropdowns(except) {
  const dropdowns = ['lang-dropdown', 'user-dropdown', 'notification-dropdown'];
  dropdowns.forEach(id => {
    if (id !== except) {
      document.getElementById(id)?.classList.add('hidden');
    }
  });
}

function closeAllDropdowns() {
  ['lang-dropdown', 'user-dropdown', 'notification-dropdown'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
}

// Advanced Animations
function initAnimations() {
  // Intersection Observer for fade-in animations
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    animationObserver.observe(el);
  });

  // Parallax effect for hero background
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.getElementById('home');
    if (hero) {
      hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });
}

// Utility Functions
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`;

  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

// PWA Registration
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('SW registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  }
}

// Export functions for global use
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;