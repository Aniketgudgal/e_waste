// admin.js - Admin dashboard functionality
import Chart from 'chart.js/auto';

export function initAdmin() {
  loadStats();
  loadCharts();
  loadBookings();
}

function loadStats() {
  // Simulate loading stats
  document.getElementById('total-bookings').textContent = '156';
  document.getElementById('active-centers').textContent = '12';
  document.getElementById('pending-pickups').textContent = '8';
  document.getElementById('revenue').textContent = '₹45,200';
}

function loadCharts() {
  // Material chart
  const materialCtx = document.getElementById('material-chart').getContext('2d');
  new Chart(materialCtx, {
    type: 'bar',
    data: {
      labels: ['Plastic', 'Metal', 'Circuit Boards', 'Batteries', 'Glass'],
      datasets: [{
        label: 'Weight (kg)',
        data: [1200, 800, 600, 400, 200],
        backgroundColor: '#2E7D32'
      }]
    }
  });

  // Trends chart
  const trendsCtx = document.getElementById('trends-chart').getContext('2d');
  new Chart(trendsCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Bookings',
        data: [45, 59, 80, 81, 96, 105],
        borderColor: '#1976D2',
        tension: 0.1
      }]
    }
  });
}

function loadBookings() {
  fetch('data/bookings.json')
    .then(res => res.json())
    .then(data => {
      const bookingsList = document.getElementById('bookings-list');
      data.bookings.forEach(booking => {
        const li = document.createElement('li');
        li.className = 'px-4 py-4 sm:px-6';
        li.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  📦
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">Booking #${booking.id}</div>
                <div class="text-sm text-gray-500">${booking.items[0].type} - ${booking.status}</div>
              </div>
            </div>
            <div class="flex items-center">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                booking.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }">
                ${booking.status}
              </span>
              <button class="ml-2 text-indigo-600 hover:text-indigo-900">View</button>
            </div>
          </div>
        `;
        bookingsList.appendChild(li);
      });
    });
}

document.addEventListener('DOMContentLoaded', initAdmin);