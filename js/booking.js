/**
 * E-Zero - Booking Module
 * Handles pickup booking functionality
 * Note: Main form logic is in app.js, this provides additional utilities
 */

// ============================================
// BOOKING STATE
// ============================================
const bookingState = {
  selectedItems: [],
  selectedDate: null,
  selectedTimeSlot: null,
  address: null,
  contact: null,
  pricing: {
    baseRate: 0, // Free pickup
    itemsTotal: 0,
    total: 0
  }
};

// Item rates (for potential future pricing)
const itemRates = {
  phones: { rate: 20, unit: 'per item', points: 50 },
  laptops: { rate: 40, unit: 'per item', points: 100 },
  tablets: { rate: 30, unit: 'per item', points: 75 },
  batteries: { rate: 15, unit: 'per kg', points: 30 },
  chargers: { rate: 10, unit: 'per item', points: 20 },
  monitors: { rate: 35, unit: 'per item', points: 80 },
  printers: { rate: 30, unit: 'per item', points: 70 },
  other: { rate: 10, unit: 'per item', points: 25 }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('📦 Booking module loaded');
});

// ============================================
// ESTIMATE POINTS
// ============================================
function estimatePoints(items) {
  let totalPoints = 0;
  
  items.forEach(item => {
    if (itemRates[item]) {
      totalPoints += itemRates[item].points;
    }
  });
  
  return totalPoints;
}

// ============================================
// GENERATE BOOKING ID
// ============================================
function generateBookingId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `BK-${timestamp}-${random}`.toUpperCase();
}

// ============================================
// SAVE BOOKING TO LOCAL STORAGE
// ============================================
function saveBooking(bookingData) {
  const bookings = getBookings();
  bookings.push({
    ...bookingData,
    id: generateBookingId(),
    createdAt: new Date().toISOString(),
    status: 'scheduled'
  });
  
  localStorage.setItem('ezero_bookings', JSON.stringify(bookings));
  return bookings[bookings.length - 1];
}

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem('ezero_bookings')) || [];
  } catch {
    return [];
  }
}

// ============================================
// PREFILL FORM (from map selection)
// ============================================
window.prefillPickupForm = function(center) {
  console.log('Prefilling form with center:', center.name);
  
  // Scroll to pickup section
  if (window.scrollToSection) {
    window.scrollToSection('pickup');
  }
  
  // Show notification
  if (window.EZero?.utils?.showNotification) {
    window.EZero.utils.showNotification(
      `Selected: ${center.name}. Please fill in the pickup details.`,
      'info'
    );
  }
};

// ============================================
// VALIDATE BOOKING DATA
// ============================================
function validateBookingData(data) {
  const errors = [];
  
  if (!data.items || data.items.length === 0) {
    errors.push('Please select at least one item');
  }
  
  if (!data.date) {
    errors.push('Please select a pickup date');
  }
  
  if (!data.timeSlot) {
    errors.push('Please select a time slot');
  }
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Please enter your full name');
  }
  
  if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
    errors.push('Please enter a valid 10-digit phone number');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.address || data.address.trim().length < 10) {
    errors.push('Please enter a complete address');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// ============================================
// FORMAT BOOKING FOR DISPLAY
// ============================================
function formatBookingForDisplay(booking) {
  return {
    id: booking.id,
    items: booking.items.join(', '),
    schedule: `${formatDate(booking.date)} at ${booking.timeSlot}`,
    contact: `${booking.name} (${booking.phone})`,
    address: booking.address,
    status: formatStatus(booking.status),
    estimatedPoints: estimatePoints(booking.items)
  };
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

function formatStatus(status) {
  const statusMap = {
    scheduled: { text: 'Scheduled', color: '#3B82F6' },
    confirmed: { text: 'Confirmed', color: '#10B981' },
    'in-transit': { text: 'In Transit', color: '#F59E0B' },
    completed: { text: 'Completed', color: '#22C55E' },
    cancelled: { text: 'Cancelled', color: '#EF4444' }
  };
  
  return statusMap[status] || { text: status, color: '#64748B' };
}

// ============================================
// BOOKING HISTORY
// ============================================
function renderBookingHistory(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const bookings = getBookings();
  
  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-box-open text-4xl mb-4 opacity-50"></i>
        <p>No bookings yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = bookings.reverse().map(booking => {
    const formatted = formatBookingForDisplay(booking);
    return `
      <div class="booking-history-item card card-bordered mb-4 p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="text-sm font-mono text-gray-500">${formatted.id}</span>
            <h4 class="font-semibold">${formatted.items}</h4>
          </div>
          <span class="px-2 py-1 rounded text-xs font-medium" 
                style="background: ${formatted.status.color}20; color: ${formatted.status.color}">
            ${formatted.status.text}
          </span>
        </div>
        <div class="text-sm text-gray-600">
          <p><i class="fas fa-calendar mr-2"></i>${formatted.schedule}</p>
          <p><i class="fas fa-map-marker-alt mr-2"></i>${formatted.address}</p>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span class="text-sm text-primary font-medium">
            <i class="fas fa-star mr-1"></i>+${formatted.estimatedPoints} points
          </span>
          ${booking.status === 'scheduled' ? `
            <button class="btn btn-sm btn-secondary" onclick="cancelBooking('${booking.id}')">
              Cancel
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// CANCEL BOOKING
// ============================================
window.cancelBooking = function(bookingId) {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) return;
  
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  bookings[index].status = 'cancelled';
  localStorage.setItem('ezero_bookings', JSON.stringify(bookings));
  
  // Re-render if there's a history container
  renderBookingHistory('booking-history');
  
  if (window.EZero?.utils?.showNotification) {
    window.EZero.utils.showNotification('Booking cancelled successfully', 'info');
  }
};

// ============================================
// EXPORTS
// ============================================
export {
  bookingState,
  itemRates,
  estimatePoints,
  saveBooking,
  getBookings,
  validateBookingData,
  formatBookingForDisplay,
  renderBookingHistory
};