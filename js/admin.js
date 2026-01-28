/**
 * E-Zero - Admin Dashboard JavaScript
 * Handles admin panel functionality
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeToggle();
  initSidebarToggle();
  initCharts();
  loadMockData();
  
  console.log('👨‍💼 Admin Dashboard initialized');
});

// ============================================
// MOCK DATA
// ============================================
const mockPickups = [
  { id: 'BK-001', customer: 'Rahul Sharma', phone: '9876543210', items: 'Laptops, Phones', date: '2024-01-28', time: '10:00 AM', address: 'Pune, MH', status: 'pending' },
  { id: 'BK-002', customer: 'Priya Patel', phone: '9876543211', items: 'Batteries, Chargers', date: '2024-01-28', time: '2:00 PM', address: 'Mumbai, MH', status: 'confirmed' },
  { id: 'BK-003', customer: 'Amit Kumar', phone: '9876543212', items: 'Monitors, Printers', date: '2024-01-27', time: '11:00 AM', address: 'Delhi', status: 'in-transit' },
  { id: 'BK-004', customer: 'Sneha Reddy', phone: '9876543213', items: 'Phones, Tablets', date: '2024-01-27', time: '3:00 PM', address: 'Bangalore, KA', status: 'completed' },
  { id: 'BK-005', customer: 'Vikram Singh', phone: '9876543214', items: 'Laptops', date: '2024-01-26', time: '10:00 AM', address: 'Chennai, TN', status: 'completed' },
];

const mockUsers = [
  { id: 'USR-001', name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', points: 2450, level: 7, joined: '2023-06-15' },
  { id: 'USR-002', name: 'Priya Patel', email: 'priya@email.com', phone: '9876543211', points: 1820, level: 5, joined: '2023-08-22' },
  { id: 'USR-003', name: 'Amit Kumar', email: 'amit@email.com', phone: '9876543212', points: 3200, level: 8, joined: '2023-04-10' },
  { id: 'USR-004', name: 'Sneha Reddy', email: 'sneha@email.com', phone: '9876543213', points: 950, level: 3, joined: '2023-11-05' },
  { id: 'USR-005', name: 'Vikram Singh', email: 'vikram@email.com', phone: '9876543214', points: 4100, level: 9, joined: '2023-02-18' },
];

const mockCenters = [
  { id: 1, name: 'E-Zero Center Pune', address: 'Shivaji Nagar, Pune', rating: 4.8, pickups: 342 },
  { id: 2, name: 'GreenRecycle Mumbai', address: 'Andheri West, Mumbai', rating: 4.6, pickups: 287 },
  { id: 3, name: 'TechWaste Delhi', address: 'Connaught Place, Delhi', rating: 4.3, pickups: 198 },
  { id: 4, name: 'EcoCircuit Bangalore', address: 'Koramangala, Bangalore', rating: 4.7, pickups: 256 },
  { id: 5, name: 'PureRecycle Chennai', address: 'T. Nagar, Chennai', rating: 4.5, pickups: 178 },
];

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const pageTitle = document.getElementById('page-title');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const sectionId = item.dataset.section;
      
      // Update active nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show section
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `section-${sectionId}`) {
          section.classList.add('active');
        }
      });
      
      // Update page title
      if (pageTitle) {
        pageTitle.textContent = item.querySelector('span').textContent;
      }
      
      // Close mobile sidebar
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });
  
  // Handle view-all links
  document.querySelectorAll('.view-all').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
      if (navItem) navItem.click();
    });
  });
}

// ============================================
// THEME TOGGLE
// ============================================
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
  
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      document.body.classList.toggle('dark', e.target.checked);
      document.body.classList.toggle('light', !e.target.checked);
      updateThemeIcon();
    });
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark');
  document.body.classList.toggle('dark', !isDark);
  document.body.classList.toggle('light', isDark);
  
  // Update settings toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) darkModeToggle.checked = !isDark;
  
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;
  
  const icon = themeBtn.querySelector('i');
  if (document.body.classList.contains('dark')) {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
}

// ============================================
// SIDEBAR TOGGLE (Mobile)
// ============================================
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// ============================================
// CHARTS
// ============================================
function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }
  
  // Set default styles
  Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#94A3B8';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  
  initPickupTrendChart();
  initCategoryDistributionChart();
}

function initPickupTrendChart() {
  const ctx = document.getElementById('pickup-trend-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Pickups',
        data: [65, 89, 112, 145],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

function initCategoryDistributionChart() {
  const ctx = document.getElementById('category-distribution-chart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Phones', 'Laptops', 'Batteries', 'Monitors', 'Other'],
      datasets: [{
        data: [35, 28, 18, 12, 7],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
          '#F59E0B',
          '#64748B'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}%`
          }
        }
      }
    }
  });
}

// ============================================
// LOAD DATA
// ============================================
function loadMockData() {
  renderRecentPickups();
  renderPickupsTable();
  renderUsersTable();
  renderCentersGrid();
}

function renderRecentPickups() {
  const tbody = document.getElementById('recent-pickups');
  if (!tbody) return;
  
  tbody.innerHTML = mockPickups.slice(0, 5).map(pickup => `
    <tr>
      <td><span class="font-mono text-sm">${pickup.id}</span></td>
      <td>${pickup.customer}</td>
      <td>${pickup.items}</td>
      <td>${formatDate(pickup.date)}</td>
      <td><span class="status-badge ${pickup.status}">${formatStatus(pickup.status)}</span></td>
      <td>
        <button class="action-btn" title="View" onclick="viewPickup('${pickup.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn" title="Edit" onclick="editPickup('${pickup.id}')">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderPickupsTable() {
  const tbody = document.getElementById('pickups-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = mockPickups.map(pickup => `
    <tr>
      <td><input type="checkbox" class="pickup-checkbox" data-id="${pickup.id}"></td>
      <td><span class="font-mono text-sm">${pickup.id}</span></td>
      <td>${pickup.customer}</td>
      <td>${pickup.phone}</td>
      <td>${pickup.items}</td>
      <td>${formatDate(pickup.date)} at ${pickup.time}</td>
      <td>${pickup.address}</td>
      <td><span class="status-badge ${pickup.status}">${formatStatus(pickup.status)}</span></td>
      <td>
        <button class="action-btn" title="View" onclick="viewPickup('${pickup.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn" title="Edit" onclick="editPickup('${pickup.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn" title="Delete" onclick="deletePickup('${pickup.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  // Select all checkbox
  const selectAll = document.getElementById('select-all-pickups');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      document.querySelectorAll('.pickup-checkbox').forEach(cb => {
        cb.checked = e.target.checked;
      });
    });
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = mockUsers.map(user => `
    <tr>
      <td><span class="font-mono text-sm">${user.id}</span></td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td><span style="color: var(--primary); font-weight: 600;">${user.points.toLocaleString()}</span></td>
      <td>Level ${user.level}</td>
      <td>${formatDate(user.joined)}</td>
      <td>
        <button class="action-btn" title="View" onclick="viewUser('${user.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn" title="Edit" onclick="editUser('${user.id}')">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderCentersGrid() {
  const grid = document.getElementById('centers-management-grid');
  if (!grid) return;
  
  grid.innerHTML = mockCenters.map(center => `
    <div class="center-card">
      <h4>${center.name}</h4>
      <p>${center.address}</p>
      <div class="center-meta">
        <span><i class="fas fa-star"></i> ${center.rating}</span>
        <span><i class="fas fa-truck"></i> ${center.pickups} pickups</span>
      </div>
      <div style="margin-top: 16px; display: flex; gap: 8px;">
        <button class="btn btn-sm btn-secondary" onclick="editCenter(${center.id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-sm btn-secondary" onclick="viewCenter(${center.id})">
          <i class="fas fa-eye"></i> View
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'in-transit': 'In Transit',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}

// ============================================
// ACTION HANDLERS
// ============================================
window.viewPickup = function(id) {
  console.log('View pickup:', id);
  alert(`Viewing pickup ${id}`);
};

window.editPickup = function(id) {
  console.log('Edit pickup:', id);
  alert(`Editing pickup ${id}`);
};

window.deletePickup = function(id) {
  if (confirm(`Are you sure you want to delete pickup ${id}?`)) {
    console.log('Delete pickup:', id);
    alert(`Deleted pickup ${id}`);
  }
};

window.viewUser = function(id) {
  console.log('View user:', id);
  alert(`Viewing user ${id}`);
};

window.editUser = function(id) {
  console.log('Edit user:', id);
  alert(`Editing user ${id}`);
};

window.viewCenter = function(id) {
  console.log('View center:', id);
  alert(`Viewing center ${id}`);
};

window.editCenter = function(id) {
  console.log('Edit center:', id);
  alert(`Editing center ${id}`);
};

window.generateReport = function(type) {
  console.log('Generate report:', type);
  alert(`Generating ${type} report...`);
};