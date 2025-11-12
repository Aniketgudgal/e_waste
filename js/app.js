// app.js - Enhanced E-Zero Application Core
import { initI18n, changeLanguage } from './i18n.js';
import { initTheme } from './theme.js';

// Global Application State
window.EZero = {
  state: {
    user: {
      id: 'user-001',
      name: 'John Doe',
      email: 'john@example.com',
      level: 7,
      points: 2450,
      recycledItems: 23,
      co2Saved: 156,
      avatar: 'JD'
    },
    notifications: [
      { 
        id: 1, 
        type: 'success', 
        title: 'Pickup Completed!', 
        message: 'Your electronics have been recycled successfully', 
        time: '2 hours ago', 
        unread: true
      },
      { 
        id: 2, 
        type: 'reward', 
        title: 'New Reward Available!', 
        message: '50% off on eco-friendly products at Green Store', 
        time: '1 day ago', 
        unread: true
      },
      { 
        id: 3, 
        type: 'achievement', 
        title: 'Level Up Achievement!', 
        message: 'You reached Level 7 - Eco Warrior! Keep going!', 
        time: '3 days ago', 
        unread: false
      }
    ],
    selectedLanguage: 'en',
    activeSection: 'home'
  },
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
    showNotification: (message, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 transform translate-x-full max-w-sm
        ${type === 'success' ? 'bg-green-500 text-white' : 
          type === 'error' ? 'bg-red-500 text-white' : 
          type === 'warning' ? 'bg-yellow-500 text-black' : 
          type === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`;
      
      notification.innerHTML = `
        <div class="flex items-start space-x-3">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
          <div class="flex-1">
            <p class="text-sm font-medium">${message}</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-70 hover:opacity-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(notification);
      requestAnimationFrame(() => notification.classList.remove('translate-x-full'));
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 500);
      }, 5000);
    }
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Initializing E-Zero Application...');
    
    initI18n();
    initTheme();
    initNavigation();
    initCounters();
    initDropdowns();
    initNotifications();
    initUserProfile();
    initAnimations();
    initScrollIndicator();
    await registerSW();
    
    console.log('✅ E-Zero Application Initialized Successfully!');
    
    setTimeout(() => {
      window.EZero.utils.showNotification('Welcome to E-Zero! 🌱', 'success');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    window.EZero.utils.showNotification('Failed to initialize app', 'error');
  }
});

// Navigation System
function initNavigation() {
  const navMenu = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  navMenu?.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden');
    mobileMenu?.classList.toggle('hidden');
    
    const icon = navMenu.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });

  // Smooth scrolling
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
        
        mobileMenu?.classList.add('hidden');
        navMenu?.querySelector('i')?.classList.replace('fa-times', 'fa-bars');
        window.EZero.state.activeSection = targetId;
      }
    });
  });

  // Active navigation highlighting
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
          link.classList.remove('active', 'text-green-600');
          const linkSection = link.getAttribute('data-section') || 
                            link.getAttribute('href')?.substring(1);
          if (linkSection === id) {
            link.classList.add('active', 'text-green-600');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -80px 0px' });

  document.querySelectorAll('section[id]').forEach(section => {
    observer.observe(section);
  });
}

// Counter Animations
function initCounters() {
  const counterConfigs = {
    'waste-counter': { target: 125000, suffix: 'kg' },
    'users-counter': { target: 15000, suffix: '+' },
    'co2-counter': { target: 500000, suffix: 'kg' },
    'ai-insights-counter': { target: 50000, suffix: '+' },
    'user-points': { target: 2450, suffix: '' },
    'user-level': { target: 7, suffix: '' },
    'items-recycled': { target: 23, suffix: '' },
    'co2-saved': { target: 156, suffix: '' },
    'global-waste': { target: 1200000, suffix: '' },
    'global-co2': { target: 500000, suffix: '' },
    'global-trees': { target: 250000, suffix: '' },
    'global-communities': { target: 500, suffix: '+' }
  };

  const animateCounter = (element, target, suffix, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = window.EZero.utils.formatNumber(Math.floor(current)) + suffix;
    }, 16);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const config = counterConfigs[entry.target.id];
        if (config) {
          animateCounter(entry.target, config.target, config.suffix);
          entry.target.classList.add('animated');
        }
      }
    });
  }, { threshold: 0.5 });

  Object.keys(counterConfigs).forEach(id => {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
  });
}

// Dropdown Management
function initDropdowns() {
  const dropdowns = [
    'lang-dropdown',
    'notification-dropdown', 
    'user-dropdown'
  ];

  // Language selector
  document.getElementById('lang-selector')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('lang-dropdown');
  });

  // Notification button
  document.getElementById('notification-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('notification-dropdown');
  });

  // User menu button
  document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown('user-dropdown');
  });

  // Language options
  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      if (lang) {
        document.getElementById('current-lang').textContent = lang.toUpperCase();
        changeLanguage(lang);
        window.EZero.state.selectedLanguage = lang;
        closeAllDropdowns();
        window.EZero.utils.showNotification(`Language changed to ${lang.toUpperCase()}`, 'success');
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', closeAllDropdowns);

  function toggleDropdown(targetId) {
    closeAllDropdowns(targetId);
    const dropdown = document.getElementById(targetId);
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  function closeAllDropdowns(except) {
    dropdowns.forEach(id => {
      if (id !== except) {
        document.getElementById(id)?.classList.add('hidden');
      }
    });
  }
}

// Notifications
function initNotifications() {
  updateNotificationBadge();
  renderNotifications();
}

function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  const unreadCount = window.EZero.state.notifications.filter(n => n.unread).length;
  
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function renderNotifications() {
  const container = document.querySelector('#notification-dropdown .max-h-80');
  if (!container) return;
  
  container.innerHTML = window.EZero.state.notifications.map(n => `
    <div class="notification-item p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${n.unread ? 'bg-green-50' : ''}" 
         data-id="${n.id}">
      <div class="flex items-start space-x-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center ${
          n.type === 'success' ? 'bg-green-100 text-green-600' :
          n.type === 'reward' ? 'bg-yellow-100 text-yellow-600' :
          'bg-blue-100 text-blue-600'
        }">
          <i class="fas ${n.type === 'success' ? 'fa-check' : n.type === 'reward' ? 'fa-gift' : 'fa-info'}"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 text-sm">${n.title}</h4>
          <p class="text-gray-600 text-sm mt-1">${n.message}</p>
          <p class="text-gray-400 text-xs mt-2">${n.time}</p>
        </div>
        ${n.unread ? '<div class="w-2 h-2 bg-green-500 rounded-full"></div>' : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      markAsRead(id);
    });
  });
}

function markAsRead(id) {
  const notification = window.EZero.state.notifications.find(n => n.id === id);
  if (notification && notification.unread) {
    notification.unread = false;
    updateNotificationBadge();
    renderNotifications();
  }
}

// User Profile
function initUserProfile() {
  const user = window.EZero.state.user;
  
  // Update user avatar and name in header
  const userButton = document.getElementById('user-menu-btn');
  if (userButton) {
    const avatar = userButton.querySelector('div.rounded-full');
    const nameElement = userButton.querySelector('.text-sm.font-semibold');
    const levelElement = userButton.querySelector('.text-xs.text-gray-500');
    
    if (avatar) avatar.textContent = user.avatar;
    if (nameElement) nameElement.textContent = user.name;
    if (levelElement) levelElement.textContent = `Level ${user.level} Eco Warrior`;
  }
}

// Scroll Progress Indicator
function initScrollIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'fixed top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100 z-50';
  indicator.style.width = '0%';
  document.body.appendChild(indicator);
  
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    indicator.style.width = scrollPercent + '%';
  });
}

// Animations
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.animate-fade-in-up').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
}

// Service Worker
async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ SW registered:', registration.scope);
      
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.error('❌ SW registration failed:', error);
    }
  }
}

// Global utility functions
window.scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerOffset = 100;
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

window.openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
};