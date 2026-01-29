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
  // ARTICLE MODAL
  // ============================================
  const articles = {
    regulations: {
      title: 'E-Waste Management Rules 2022: Complete Compliance Guide',
      category: 'Regulations',
      date: 'January 15, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
      content: `
        <p><strong>The E-Waste (Management) Rules, 2022</strong> represent a significant shift in India's approach to electronic waste management. These updated regulations place greater responsibility on producers, refurbishers, and recyclers while introducing new compliance requirements for businesses of all sizes.</p>
        
        <h2>Key Changes in the 2022 Rules</h2>
        
        <h3>1. Extended Producer Responsibility (EPR)</h3>
        <p>Producers are now required to collect and recycle a minimum percentage of e-waste generated from their products. The targets are:</p>
        <ul>
          <li><strong>2023-24:</strong> 60% of e-waste generated</li>
          <li><strong>2024-25:</strong> 70% of e-waste generated</li>
          <li><strong>2025-26 onwards:</strong> 80% of e-waste generated</li>
        </ul>
        
        <h3>2. New Categories Added</h3>
        <p>The rules now cover additional categories including:</p>
        <ul>
          <li>Solar panels and photovoltaic modules</li>
          <li>Micro-enterprises generating e-waste</li>
          <li>Large household appliances</li>
        </ul>
        
        <h3>3. EPR Certificate Trading</h3>
        <p>A new framework for EPR certificate trading has been introduced, allowing producers to purchase certificates from authorized recyclers to meet their targets.</p>
        
        <h2>Compliance Requirements for Businesses</h2>
        
        <h3>Registration Requirements</h3>
        <p>All producers, manufacturers, and refurbishers must register on the centralized portal. The registration process includes:</p>
        <ul>
          <li>Submission of business PAN and GST details</li>
          <li>Declaration of product categories</li>
          <li>Annual compliance plan submission</li>
        </ul>
        
        <h3>Documentation and Reporting</h3>
        <p>Businesses must maintain detailed records of:</p>
        <ul>
          <li>E-waste collected and channelized</li>
          <li>Recycling certificates obtained</li>
          <li>Quarterly and annual returns filed</li>
        </ul>
        
        <h2>Penalties for Non-Compliance</h2>
        <p>Non-compliance can result in:</p>
        <ul>
          <li>Environmental Compensation up to ₹50 lakhs</li>
          <li>Cancellation of EPR authorization</li>
          <li>Legal proceedings under the Environment Protection Act</li>
        </ul>
        
        <h2>How E-Zero Can Help</h2>
        <p>As a CPCB-authorized e-waste recycler, E-Zero provides:</p>
        <ul>
          <li>EPR fulfillment services for producers</li>
          <li>Compliant recycling with full documentation</li>
          <li>Certificates for your audit requirements</li>
          <li>Pan-India pickup services</li>
        </ul>
        
        <p><em>Contact us today to ensure your business stays compliant with the latest e-waste regulations.</em></p>
      `
    },
    security: {
      title: 'Why Secure Data Destruction is Critical for Your Business',
      category: 'Security',
      date: 'January 10, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      content: `
        <p>In today's digital age, <strong>data breaches from improperly disposed electronics</strong> pose one of the greatest risks to businesses. A single hard drive containing sensitive information can lead to catastrophic consequences if it falls into the wrong hands.</p>
        
        <h2>The Real Risks of Improper Data Disposal</h2>
        
        <h3>Data Recovery is Easier Than You Think</h3>
        <p>Simply deleting files or formatting a drive doesn't actually remove the data. With readily available software, anyone can:</p>
        <ul>
          <li>Recover "deleted" files from hard drives</li>
          <li>Extract data from SSDs even after formatting</li>
          <li>Access information from damaged storage devices</li>
        </ul>
        
        <h3>The Cost of a Data Breach</h3>
        <p>According to IBM's 2023 Cost of a Data Breach Report:</p>
        <ul>
          <li><strong>Average cost:</strong> ₹17.9 crore per incident in India</li>
          <li><strong>Detection time:</strong> 277 days average to identify a breach</li>
          <li><strong>Reputation damage:</strong> 60% of customers lose trust after a breach</li>
        </ul>
        
        <h2>Types of Sensitive Data at Risk</h2>
        <ul>
          <li>Customer personal information (PII)</li>
          <li>Financial records and banking details</li>
          <li>Employee HR records and salaries</li>
          <li>Trade secrets and intellectual property</li>
          <li>Email communications and contracts</li>
          <li>Healthcare records (HIPAA compliance)</li>
        </ul>
        
        <h2>Secure Data Destruction Methods</h2>
        
        <h3>1. Software-Based Wiping (NIST 800-88)</h3>
        <p>Multiple-pass overwriting that meets government standards:</p>
        <ul>
          <li>DoD 5220.22-M standard (3 passes)</li>
          <li>NIST 800-88 Clear/Purge guidelines</li>
          <li>Suitable for drives being reused</li>
        </ul>
        
        <h3>2. Degaussing</h3>
        <p>Powerful magnetic field that destroys data on magnetic media:</p>
        <ul>
          <li>Renders drives completely unusable</li>
          <li>Instant and irreversible</li>
          <li>Ideal for HDDs and magnetic tapes</li>
        </ul>
        
        <h3>3. Physical Shredding</h3>
        <p>Industrial shredding for complete destruction:</p>
        <ul>
          <li>Particles reduced to less than 2mm</li>
          <li>100% guarantee of data destruction</li>
          <li>Recommended for SSDs and flash storage</li>
        </ul>
        
        <h2>E-Zero's Data Destruction Services</h2>
        <p>Our certified data destruction process includes:</p>
        <ul>
          <li>Chain of custody documentation</li>
          <li>Video recording of destruction process</li>
          <li>Certificate of Data Destruction</li>
          <li>Serial number tracking for each device</li>
          <li>On-site destruction options available</li>
        </ul>
        
        <p><em>Protect your business reputation. Choose certified data destruction from E-Zero.</em></p>
      `
    },
    sustainability: {
      title: 'Corporate ESG Goals: Integrating E-Waste Recycling',
      category: 'Sustainability',
      date: 'January 5, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      content: `
        <p><strong>Environmental, Social, and Governance (ESG)</strong> criteria have become essential metrics for businesses worldwide. Proper e-waste management is a critical component of environmental sustainability that directly impacts your ESG scores.</p>
        
        <h2>Why E-Waste Matters for ESG</h2>
        
        <h3>Environmental Impact</h3>
        <p>E-waste contains both valuable and hazardous materials:</p>
        <ul>
          <li><strong>Precious metals:</strong> Gold, silver, platinum, copper</li>
          <li><strong>Hazardous substances:</strong> Lead, mercury, cadmium, brominated flame retardants</li>
          <li><strong>Recyclable materials:</strong> Plastics, glass, aluminum</li>
        </ul>
        
        <p>When improperly disposed, these materials can:</p>
        <ul>
          <li>Contaminate soil and groundwater</li>
          <li>Release toxic fumes when burned</li>
          <li>Contribute to greenhouse gas emissions</li>
        </ul>
        
        <h2>E-Waste Recycling Contributions to ESG</h2>
        
        <h3>Environmental (E) Score Impact</h3>
        <ul>
          <li>Reduces carbon footprint through material recovery</li>
          <li>Decreases mining for virgin raw materials</li>
          <li>Prevents toxic waste from reaching landfills</li>
          <li>Supports circular economy principles</li>
        </ul>
        
        <h3>Social (S) Score Impact</h3>
        <ul>
          <li>Protects workers from hazardous exposure</li>
          <li>Supports formal recycling sector employment</li>
          <li>Demonstrates corporate responsibility</li>
          <li>Community engagement opportunities</li>
        </ul>
        
        <h3>Governance (G) Score Impact</h3>
        <ul>
          <li>Compliance with environmental regulations</li>
          <li>Transparent supply chain management</li>
          <li>Risk management documentation</li>
          <li>Audit-ready certifications</li>
        </ul>
        
        <h2>Key Metrics to Track</h2>
        <p>For ESG reporting, track and document:</p>
        <ul>
          <li>Total e-waste generated (kg/year)</li>
          <li>Percentage recycled vs. disposed</li>
          <li>CO2 emissions avoided through recycling</li>
          <li>Materials recovered and reused</li>
          <li>Compliance certifications obtained</li>
        </ul>
        
        <h2>E-Zero's ESG Partnership</h2>
        <p>We provide comprehensive documentation for your ESG reports:</p>
        <ul>
          <li>Annual e-waste summary reports</li>
          <li>Carbon offset certificates</li>
          <li>Material recovery tracking</li>
          <li>Third-party audit support</li>
          <li>ESG-aligned disposal certificates</li>
        </ul>
        
        <h3>Our Environmental Certifications</h3>
        <ul>
          <li>ISO 14001:2015 - Environmental Management</li>
          <li>R2 Certification - Responsible Recycling</li>
          <li>CPCB Authorization - Central Pollution Control Board</li>
        </ul>
        
        <p><em>Partner with E-Zero to strengthen your ESG performance and demonstrate your commitment to sustainability.</em></p>
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
