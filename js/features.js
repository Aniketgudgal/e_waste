/**
 * E-Zero - Business Features JavaScript
 * Pricing Calculator, FAQ, Impact Counter, Live Chat
 * @version 1.0.0
 */

(function() {
  'use strict';

  // ============================================
  // PRICING CALCULATOR
  // ============================================
  const calcPrices = {
    laptops: 150,
    desktops: 200,
    phones: 50,
    printers: 250,
    servers: 500,
    batteries: 100
  };

  const calcQuantities = {
    laptops: 0,
    desktops: 0,
    phones: 0,
    printers: 0,
    servers: 0,
    batteries: 0
  };

  window.calcUpdateQty = function(item, delta) {
    calcQuantities[item] = Math.max(0, (calcQuantities[item] || 0) + delta);
    document.getElementById(`calc-qty-${item}`).textContent = calcQuantities[item];
    updateCalcTotal();
  };

  window.updateCalcTotal = function() {
    // Calculate items total
    let itemsTotal = 0;
    let totalQty = 0;
    
    for (const [item, qty] of Object.entries(calcQuantities)) {
      itemsTotal += qty * (calcPrices[item] || 0);
      totalQty += qty;
    }

    // Calculate services
    let servicesTotal = 0;
    if (document.getElementById('calc-data-destruction')?.checked) servicesTotal += 500;
    if (document.getElementById('calc-certificate')?.checked) servicesTotal += 300;
    if (document.getElementById('calc-express')?.checked) servicesTotal += 1000;

    // Calculate pickup fee (free for 10+ items)
    const pickupFee = totalQty >= 10 ? 0 : (totalQty > 0 ? 200 : 0);

    // Update display
    document.getElementById('calc-items-total').textContent = `₹${itemsTotal.toLocaleString()}`;
    document.getElementById('calc-services-total').textContent = `₹${servicesTotal.toLocaleString()}`;
    document.getElementById('calc-pickup-fee').textContent = pickupFee === 0 ? 'FREE' : `₹${pickupFee}`;
    document.getElementById('calc-grand-total').textContent = `₹${(itemsTotal + servicesTotal + pickupFee).toLocaleString()}`;
  };

  // ============================================
  // FAQ ACCORDION
  // ============================================
  window.toggleFaq = function(button) {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('active');
    
    // Close all other items
    document.querySelectorAll('.faq-item.active').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('active');
      }
    });

    // Toggle current
    item.classList.toggle('active', !isOpen);
  };

  // ============================================
  // ENVIRONMENTAL IMPACT COUNTER
  // ============================================
  function initImpactCounters() {
    const counters = document.querySelectorAll('.impact-value');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOutQuart);
      
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================
  // LIVE CHAT WIDGET
  // ============================================
  let chatOpen = false;

  window.toggleChat = function() {
    chatOpen = !chatOpen;
    const chatWindow = document.getElementById('chat-window');
    const chatBadge = document.querySelector('.chat-badge');
    
    if (chatWindow) {
      chatWindow.classList.toggle('open', chatOpen);
    }
    
    if (chatBadge && chatOpen) {
      chatBadge.style.display = 'none';
    }
  };

  window.sendChatMessage = function() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
      const response = getBotResponse(message);
      addChatMessage(response, 'bot');
    }, 1000);
  };

  window.sendQuickReply = function(message) {
    addChatMessage(message, 'user');
    
    // Hide quick replies
    const quickReplies = document.querySelector('.chat-quick-replies');
    if (quickReplies) quickReplies.style.display = 'none';
    
    setTimeout(() => {
      const response = getBotResponse(message);
      addChatMessage(response, 'bot');
    }, 1000);
  };

  window.handleChatKeypress = function(event) {
    if (event.key === 'Enter') {
      sendChatMessage();
    }
  };

  function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${escapeHtml(text)}</p>
        <span class="message-time">${time}</span>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pickup') || lowerMessage.includes('schedule')) {
      return "I'd be happy to help you schedule a pickup! You can click the 'Schedule Pickup' button above, or I can connect you with our team. What's your preferred date?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('quote') || lowerMessage.includes('cost')) {
      return "For pricing, you can use our instant calculator in the Pricing section, or fill out the contact form for a detailed quote. Prices depend on item types and quantity.";
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('secure')) {
      return "Data security is our top priority! We offer NIST-compliant data destruction with certificates. All drives are securely wiped or physically shredded.";
    }
    
    if (lowerMessage.includes('certificate') || lowerMessage.includes('compliance')) {
      return "We provide comprehensive certificates including: Recycling Certificate, Data Destruction Certificate, and Environmental Compliance Certificate for your records.";
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('center') || lowerMessage.includes('where')) {
      return "We have multiple centers across India! Check our 'Locations' section for the nearest center, or we can arrange a pickup from your location.";
    }
    
    return "Thank you for your message! Our team will respond shortly. For immediate assistance, call us at +91 98765 43210 or use the contact form above.";
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    initImpactCounters();
    console.log('🚀 E-Zero Business Features Loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
