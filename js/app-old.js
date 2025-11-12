// app.js - Enhanced E-Zero Application Core
import { initI18n, changeLanguage, t } from './i18n.js';
import { initTheme, toggleTheme } from './theme.js';

// Global Application State
window.EZero = {
  // Application state
  state: {
    user: {
      id: 'user-001',
      name: 'John Doe',
      email: 'john@example.com',
      level: 7,
      points: 2450,
      recycledItems: 23,
      co2Saved: 156,
      avatar: 'JD',
      achievements: ['eco_beginner', 'recycling_pro', 'community_builder', 'champion']
    },
    notifications: [
      { 
        id: 1, 
        type: 'success', 
        title: 'Pickup Completed!', 
        message: 'Your electronics have been recycled successfully', 
        time: '2 hours ago', 
        unread: true,
        action: () => window.scrollToSection('rewards')
      },
      { 
        id: 2, 
        type: 'reward', 
        title: 'New Reward Available!', 
        message: '50% off on eco-friendly products at Green Store', 
        time: '1 day ago', 
        unread: true,
        action: () => window.openModal('rewards-modal')
      },
      { 
        id: 3, 
        type: 'achievement', 
        title: 'Level Up Achievement!', 
        message: 'You reached Level 7 - Eco Warrior! Keep going!', 
        time: '3 days ago', 
        unread: false,
        action: () => window.openModal('achievement-modal')
      }
    ],
    selectedLanguage: 'en',
    theme: 'light',
    activeSection: 'home',
    isLoading: false
  },

  // Utility functions
  utils: {
    formatNumber: (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return new Intl.NumberFormat().format(num);
    },
    
    debounce: (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    },

    throttle: (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    },
    
    showNotification: (message, type = 'info', duration = 5000) => {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 transform translate-x-full max-w-sm
        ${type === 'success' ? 'bg-green-500 text-white' : 
          type === 'error' ? 'bg-red-500 text-white' : 
          type === 'warning' ? 'bg-yellow-500 text-black' : 
          type === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`;
      
      notification.innerHTML = `
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 mt-0.5">
            <i class="fas ${
              type === 'success' ? 'fa-check-circle' : 
              type === 'error' ? 'fa-times-circle' : 
              type === 'warning' ? 'fa-exclamation-triangle' : 
              'fa-info-circle'
            }"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium">${message}</p>
          </div>
          <button class="flex-shrink-0 ml-4 text-white opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Animate in
      requestAnimationFrame(() => {
        notification.classList.remove('translate-x-full');
      });
      
      // Auto remove
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 500);
      }, duration);
    },
    
    loadingState: (isLoading) => {
      window.EZero.state.isLoading = isLoading;
      const loader = document.getElementById('global-loader');
      if (isLoading && !loader) {
        const spinner = document.createElement('div');
        spinner.id = 'global-loader';
        spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        spinner.innerHTML = `
          <div class="bg-white rounded-xl p-8 flex flex-col items-center space-y-4">
            <div class="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p class="text-gray-700 font-medium">Loading...</p>
          </div>
        `;
        document.body.appendChild(spinner);
      } else if (!isLoading && loader) {
        loader.remove();
      }
    },

    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validatePhone: (phone) => /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, '')),
    
    animateElement: (element, animation = 'fadeInUp') => {
      element.classList.add('animate__animated', `animate__${animation}`);
      element.addEventListener('animationend', () => {
        element.classList.remove('animate__animated', `animate__${animation}`);
      }, { once: true });
    }
  }
};

// Application initialization
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Initializing E-Zero Application...');
    
    // Initialize core systems
    await initI18n();
    initTheme();
    
    // Initialize UI components
    initNavigation();
    initCounters();
    initDropdowns();
    initNotifications();
    initUserProfile();
    initAnimations();
    initScrollIndicator();
    initPerformanceOptimizations();
    
    // Register service worker
    await registerSW();
    
    // Mark initialization complete
    window.EZero.state.isLoading = false;
    console.log('✅ E-Zero Application Initialized Successfully!');
    
    // Show welcome message
    setTimeout(() => {
      window.EZero.utils.showNotification('Welcome to E-Zero! 🌱 Start your eco journey today.', 'success');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    window.EZero.utils.showNotification('Failed to initialize application. Please refresh the page.', 'error');
  }
});

// Enhanced Navigation System
function initNavigation() {
  const navMenu = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('header');

  // Mobile menu toggle with animation
  navMenu?.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu?.classList.toggle('hidden');
    navMenu.setAttribute('aria-expanded', !isHidden);
    
    // Animate hamburger icon
    const icon = navMenu.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
      icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    // Add overlay for mobile menu
    if (!isHidden) {
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden';
      overlay.id = 'mobile-overlay';
      overlay.onclick = () => {
        mobileMenu?.classList.add('hidden');
        overlay.remove();
        icon?.classList.replace('fa-times', 'fa-bars');
        if (icon) icon.style.transform = 'rotate(0deg)';
      };
      document.body.appendChild(overlay);
    } else {
      document.getElementById('mobile-overlay')?.remove();
    }
  });

  // Enhanced smooth scrolling with easing
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Smooth scroll with custom easing
        smoothScrollTo(offsetPosition, 800);
        
        // Update active section
        window.EZero.state.activeSection = targetId;
        
        // Close mobile menu
        mobileMenu?.classList.add('hidden');
        document.getElementById('mobile-overlay')?.remove();
        const menuIcon = navMenu?.querySelector('i');
        menuIcon?.classList.replace('fa-times', 'fa-bars');
        if (menuIcon) menuIcon.style.transform = 'rotate(0deg)';
        
        // Update URL
        history.replaceState(null, null, `#${targetId}`);
        
        // Track analytics
        console.log(`📊 Section visited: ${targetId}`);
      }
    });
  });

  // Intersection Observer for active navigation
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '-80px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        window.EZero.state.activeSection = id;
        
        // Update navigation links
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
          link.classList.remove('active', 'text-green-600', 'bg-green-50');
          const linkSection = link.getAttribute('data-section') || 
                            link.getAttribute('href')?.substring(1);
          if (linkSection === id) {
            link.classList.add('active', 'text-green-600');
            if (link.classList.contains('nav-link')) {
              link.classList.add('bg-green-50');
            }
          }
        });
      }
    });
  }, observerOptions);

  // Observe all main sections
  document.querySelectorAll('section[id]').forEach(section => {
    observer.observe(section);
  });

  // Enhanced header scroll effects
  let lastScrollY = window.scrollY;
  const scrollThreshold = 100;

  const handleScroll = window.EZero.utils.throttle(() => {
    const currentScrollY = window.scrollY;
    
    // Header background and shadow
    if (currentScrollY > scrollThreshold) {
      header?.classList.add('bg-white/95', 'backdrop-blur-lg', 'shadow-xl');
    } else {
      header?.classList.remove('bg-white/95', 'backdrop-blur-lg', 'shadow-xl');
    }
    
    // Hide/show header on scroll (optional)
    if (currentScrollY > lastScrollY && currentScrollY > 300) {
      header?.classList.add('-translate-y-full');
    } else {
      header?.classList.remove('-translate-y-full');
    }
    
    lastScrollY = currentScrollY;
  }, 16);

  window.addEventListener('scroll', handleScroll);
}
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