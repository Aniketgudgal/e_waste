/**
 * E-Zero - Business Features JavaScript
 * Pricing Calculator, FAQ, Impact Counter, Live Chat, Article Modal
 * @version 2.0.0
 */

(function() {
  'use strict';

  // ============================================
  // PRICING CALCULATOR (12 Categories)
  // ============================================
  const calcPrices = {
    laptops: 800,
    desktops: 600,
    phones: 300,
    tablets: 400,
    monitors: 350,
    printers: 450,
    keyboards: 50,
    servers: 2000,
    networking: 500,
    batteries: 200,
    harddrives: 150,
    cables: 20
  };

  const calcQuantities = {};
  Object.keys(calcPrices).forEach(item => calcQuantities[item] = 0);

  window.calcUpdateQty = function(item, delta) {
    calcQuantities[item] = Math.max(0, (calcQuantities[item] || 0) + delta);
    const el = document.getElementById(`calc-qty-${item}`);
    if (el) el.textContent = calcQuantities[item];
    updateCalcTotal();
  };

  window.updateCalcTotal = function() {
    // Calculate e-waste value (customer EARNS this)
    let ewasteValue = 0;
    let totalQty = 0;
    
    for (const [item, qty] of Object.entries(calcQuantities)) {
      ewasteValue += qty * (calcPrices[item] || 0);
      totalQty += qty;
    }

    // Calculate service charges (customer PAYS this)
    let servicesTotal = 0;
    if (document.getElementById('calc-data-destruction')?.checked) servicesTotal += 500;
    if (document.getElementById('calc-certificate')?.checked) servicesTotal += 300;
    if (document.getElementById('calc-express')?.checked) servicesTotal += 1000;
    if (document.getElementById('calc-asset-report')?.checked) servicesTotal += 400;

    // Calculate pickup fee (free for 5+ items)
    const pickupFee = totalQty >= 5 ? 0 : (totalQty > 0 ? 150 : 0);

    // Calculate net amount
    const netAmount = ewasteValue - servicesTotal - pickupFee;

    // Update display
    const itemsEl = document.getElementById('calc-items-total');
    const servicesEl = document.getElementById('calc-services-total');
    const pickupEl = document.getElementById('calc-pickup-fee');
    const totalEl = document.getElementById('calc-grand-total');
    const noteEl = document.getElementById('calc-total-note');

    if (itemsEl) itemsEl.textContent = `+ ₹${ewasteValue.toLocaleString()}`;
    if (servicesEl) servicesEl.textContent = servicesTotal > 0 ? `- ₹${servicesTotal.toLocaleString()}` : '₹0';
    if (pickupEl) pickupEl.textContent = pickupFee === 0 ? 'FREE' : `- ₹${pickupFee}`;
    
    if (totalEl) {
      if (netAmount >= 0) {
        totalEl.textContent = `₹${netAmount.toLocaleString()}`;
        totalEl.classList.remove('negative');
        totalEl.classList.add('positive');
      } else {
        totalEl.textContent = `₹${Math.abs(netAmount).toLocaleString()}`;
        totalEl.classList.remove('positive');
        totalEl.classList.add('negative');
      }
    }

    if (noteEl) {
      if (netAmount > 0) {
        noteEl.innerHTML = '<i class="fas fa-info-circle"></i> We will pay you this amount on pickup!';
        noteEl.className = 'calc-total-note positive';
      } else if (netAmount < 0) {
        noteEl.innerHTML = '<i class="fas fa-info-circle"></i> You pay the remaining service charges.';
        noteEl.className = 'calc-total-note negative';
      } else {
        noteEl.textContent = '';
      }
    }
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
  // ARTICLE MODAL (SEO Optimized Content)
  // ============================================
  const articles = {
    regulations: {
      title: 'E-Waste Management Rules 2022: Complete Compliance Guide for Indian Businesses',
      category: 'Regulations',
      date: 'January 15, 2026',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
      content: `
        <p><strong>The E-Waste (Management) Rules, 2022</strong> have revolutionized how Indian businesses handle electronic waste. With stricter Extended Producer Responsibility (EPR) targets and heavy penalties for non-compliance, understanding these regulations is crucial for every organization, from startups to MNCs.</p>
        
        <h2>Key Regulatory Changes Impacting Your Business</h2>
        
        <h3>1. Mandatory EPR Registration</h3>
        <p>All entities involved in the manufacture, sale, transfer, purchase, refurbishing, dismantling, recycling, and processing of e-waste must register on the Central Pollution Control Board (CPCB) portal. Unlike previous years, this is now a prerequisite for trading.</p>
        
        <h3>2. Specific Recycling Targets</h3>
        <p>The 2022 rules set clear, escalating targets for recycling:</p>
        <ul>
          <li><strong>2024-25:</strong> 70% of e-waste generated must be recycled.</li>
          <li><strong>2025-26:</strong> 80% of e-waste generated must be recycled.</li>
          <li><strong>2027 onwards:</strong> 80% minimum recycling rate maintained.</li>
        </ul>
        
        <h3>3. Environmental Compensation (EC) Charges</h3>
        <p>The "Polluter Pays" principle is now enforced. Non-compliant companies face Environmental Compensation charges, which can be levied for:</p>
        <ul>
          <li>Failure to collect e-waste.</li>
          <li>Failure to meet recycling targets.</li>
          <li>Operating without CPCB authorization.</li>
        </ul>
        
        <h2>How to Ensure 100% Compliance?</h2>
        <p>Partnering with a CPCB-authorized PRO (Producer Responsibility Organization) like E-Zero is the safest route. We ensure:</p>
        <ul>
          <li>End-to-end traceability of your e-waste.</li>
          <li>Issuance of digital EPR credits.</li>
          <li>Quarterly and annual return filing assistance.</li>
        </ul>
        
        <p><em>Don't risk penalties. Contact E-Zero today for a comprehensive compliance audit.</em></p>
      `
    },
    security: {
      title: 'Data Destruction vs. Deletion: Why Formatting Hard Drives is Not Enough',
      category: 'Security',
      date: 'January 10, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      content: `
        <p>Did you know that <strong>40% of second-hand hard drives still contain recoverable data</strong>? For businesses, this represents a massive cybersecurity risk. "Deleting" files or formatting a drive only removes the reference to the data, not the data itself.</p>
        
        <h2>The Dangers of Improper Data Disposal</h2>
        <p>Leaked data from old electronics can lead to:</p>
        <ul>
          <li><strong>Identity Theft:</strong> Employee and customer records (PII).</li>
          <li><strong>Corporate Espionage:</strong> Competitors accessing trade secrets/IP.</li>
          <li><strong>Financial Fraud:</strong> Banking credentials and financial reports.</li>
          <li><strong>Legal Liability:</strong> Heavy fines under the DPDP Act, 2023.</li>
        </ul>
        
        <h2>Certified Data Destruction Methods</h2>
        <p>At E-Zero, we use industry-standard methods to guarantee data unrecoverability:</p>
        
        <h3>1. Degaussing</h3>
        <p>Using a high-powered magnetic field to disrupt the magnetic domains on the drive platter, rendering the data completely unreadable. Ideal for HDDs.</p>
        
        <h3>2. Physical Shredding</h3>
        <p>The gold standard for SSDs and flash media. The drive is mechanically shredded into tiny particles (< 10mm), ensuring 100% destruction.</p>
        
        <h3>3. Software Wiping (NIST 800-88)</h3>
        <p>For drives intended for reuse, we use certified software that overwrites every sector multiple times, verified for no residual data.</p>
        
        <p><em>Secure your reputation. Choose E-Zero's certified data destruction services with video proof.</em></p>
      `
    },
    sustainability: {
      title: 'Boost Your ESG Score: The Role of E-Waste Recycling in Corporate Sustainability',
      category: 'Sustainability',
      date: 'January 5, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      content: `
        <p>Investors and consumers are increasingly looking at a company's <strong>Environmental, Social, and Governance (ESG)</strong> performance. E-waste management is a tangible, high-impact metric that significantly boosts your environmental score.</p>
        
        <h2>Environmental Impact (The 'E' in ESG)</h2>
        <p>Recycling one ton of laptops saves:</p>
        <ul>
          <li><strong>10 tons of CO2</strong> emissions compared to mining virgin materials.</li>
          <li>Equivalent energy to power <strong>3,500 homes</strong> for a year.</li>
        </ul>
        
        <h2>Circular Economy Contribution</h2>
        <p>By recycling, you return critical raw materials like Gold, Silver, Copper, and Palladium back into the supply chain, reducing the need for environmentally destructive mining.</p>
        
        <h2>Detailed Green Reporting</h2>
        <p>E-Zero provides detailed "Green Certificates" for your Annual Reports, showcasing:</p>
        <ul>
          <li>Total weight diverted from landfills.</li>
          <li>Carbon footprint reduction metrics.</li>
          <li>Hazardous materials safely neutralized.</li>
        </ul>
        
        <p><em>Make e-waste recycling a pillar of your sustainability strategy with E-Zero.</em></p>
      `
    },
    batteries: {
      title: 'The Ticking Time Bomb: Safe Disposal of Lithium-Ion Batteries',
      category: 'Safety',
      date: 'February 2, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1619641459422-5a3d7515e022?w=800&q=80',
      content: `
        <p>Lithium-ion batteries power our world, from phones to EVs. However, when damaged or improperly disposed of, they pose a severe <strong>fire hazard</strong>. Landfills fires caused by batteries are rising globally.</p>
        
        <h2>Why You Can't Bin Batteries</h2>
        <ul>
          <li><strong>Thermal Runaway:</strong> Physical damage can cause batteries to catch fire instantly.</li>
          <li><strong>Toxic Leakage:</strong> Cobalt and ionic fluids can leach into soil and groundwater.</li>
        </ul>
        
        <h2>Our Battery Recycling Process</h2>
        <p>E-Zero uses advanced hydrometallurgical processes to recover 95% of battery materials, including Lithium, Cobalt, Nickel, and Manganese, for reuse in new batteries.</p>
        
        <p><em>Never throw batteries in the trash. Drop them at an E-Zero partner bin or schedule a pickup.</em></p>
      `
    },
    laptops: {
      title: 'Ultimate Guide: How to Prepare Your Old Laptop for Recycling',
      category: 'Guides',
      date: 'January 28, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
      content: `
        <p>Ready to upgrade? Don't let your old laptop gather dust. Here is a step-by-step guide to preparing it for recycling to ensure your data is safe and the device is processed correctly.</p>
        
        <h2>Step-by-Step Preparation</h2>
        <ol>
          <li><strong>Backup Your Data:</strong> Use cloud storage or an external drive to save important files.</li>
          <li><strong>Deauthorize Software:</strong> Sign out of iTunes, Adobe Creative Cloud, and Office 365.</li>
          <li><strong>Remove Peripherals:</strong> Unplug USB mice, dongles, and remove SD cards.</li>
          <li><strong>Factory Reset:</strong> Perform a full system reset to wipe user data (or let us do it securely).</li>
        </ol>
        
        <p><em>We pay up to ₹25,000 for working laptops! Check our calculator above to see what yours is worth.</em></p>
      `
    },
    health: {
      title: 'Hidden Health Hazards: The Human Cost of Informal E-Waste Recycling',
      category: 'Health',
      date: 'January 20, 2026',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      content: `
        <p>95% of India's e-waste is still handled by the informal sector. While it provides livelihood, the primitive methods used—like acid bathing and open burning—have devastating health consequences.</p>
        
        <h2>Toxic Exposure Risks</h2>
        <ul>
          <li><strong>Lead:</strong> Damages the central nervous system and kidneys. Found in CRT monitors and solder.</li>
          <li><strong>Mercury:</strong> Impacts brain development. Found in CFL bulbs and switches.</li>
          <li><strong>Cadmium:</strong> Carcinogenic; affects lungs and prostate. Found in batteries.</li>
          <li><strong>BFRs:</strong> Disrupt endocrine / hormonal systems. Released when burning plastic casings.</li>
        </ul>
        
        <h2>Choose Formal Recycling</h2>
        <p>By choosing E-Zero, you support a system that uses closed-loop, automated recycling technologies that protect workers and the environment.</p>
      `
    }
  };

  window.openArticleModal = function(articleId) {
    const article = articles[articleId];
    if (!article) return;

    const modal = document.getElementById('article-modal');
    document.getElementById('article-modal-image').src = article.image;
    document.getElementById('article-modal-image').alt = article.title;
    document.getElementById('article-modal-category').textContent = article.category;
    document.getElementById('article-modal-date').textContent = article.date;
    document.getElementById('article-modal-read-time').textContent = article.readTime;
    document.getElementById('article-modal-title').textContent = article.title;
    document.getElementById('article-modal-body').innerHTML = article.content;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeArticleModal = function() {
    const modal = document.getElementById('article-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.shareArticle = function() {
    const title = document.getElementById('article-modal-title').textContent;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this article: ${title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeArticleModal();
    }
  });

  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('article-modal-overlay')) {
      closeArticleModal();
    }
  });

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
      return "I'd be happy to help you schedule a pickup! You can use our calculator to see how much you'll earn, then click 'Schedule Free Pickup'. Our team will contact you within 24 hours.";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('quote') || lowerMessage.includes('cost') || lowerMessage.includes('earn')) {
      return "Great question! We PAY YOU for your e-waste based on item condition. Use our Pricing Calculator above to see your estimated earnings. Laptops earn ₹800, Phones ₹300, Servers ₹2000, and more!";
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('secure')) {
      return "Data security is our top priority! We offer NIST-compliant data destruction with certificates. The service costs ₹500 and includes video documentation and a Certificate of Destruction.";
    }
    
    if (lowerMessage.includes('certificate') || lowerMessage.includes('compliance')) {
      return "We provide comprehensive certificates including: Recycling Certificate, Data Destruction Certificate, and Environmental Compliance Certificate. Certificate service costs ₹300.";
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('center') || lowerMessage.includes('where')) {
      return "We have multiple centers across India! Check our 'Locations' section for the nearest center, or we can arrange a free pickup (for 5+ items) from your location.";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "We offer same-day payment via UPI or NEFT after pickup. The amount depends on item types and conditions. Use our calculator to estimate your earnings!";
    }
    
    return "Thank you for your message! For immediate assistance, call us at +91 98765 43210. You can also use our Pricing Calculator to see earnings, or schedule a free pickup.";
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // TOAST NOTIFICATION (Global)
  // ============================================
  window.showToast = function(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.feature-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `feature-toast feature-toast-${type}`;

    const colors = {
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };

    const icons = {
      success: 'check-circle',
      error: 'times-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };

    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      background: ${colors[type]};
      color: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 14px;
      max-width: 400px;
      animation: toastSlideIn 0.3s ease;
    `;

    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    // Add animation styles if not present
    if (!document.getElementById('feature-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'feature-toast-styles';
      style.textContent = `
        @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes toastSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      `;
      document.head.appendChild(style);
    }

    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    initImpactCounters();
    console.log('🚀 E-Zero Business Features v2.0 Loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
