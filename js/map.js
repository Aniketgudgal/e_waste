// map.js - Advanced map functionality with Leaflet
let map;
let markers = [];
let centersData = [];
let userLocation = null;
let searchTimeout;
let markerClusterGroup;

export function initMap() {
  // Initialize map with better default view
  map = L.map('map', {
    center: [18.5204, 73.8567],
    zoom: 11,
    zoomControl: true,
    scrollWheelZoom: true
  });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Initialize marker cluster group
  markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });
  map.addLayer(markerClusterGroup);

  // Get user location
  getUserLocation();

  // Load centers data
  loadCenters();

  // Initialize search functionality
  initSearch();

  // Initialize filters
  initFilters();
}

function getUserLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = [position.coords.latitude, position.coords.longitude];

        // Add user location marker
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
          iconSize: [16, 16]
        });

        L.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('Your Location');

        // Center map on user location
        map.setView(userLocation, 13);
      },
      error => {
        console.log('Geolocation error:', error);
        // Fallback to default location
        map.setView([18.5204, 73.8567], 11);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
}

async function loadCenters() {
  try {
    const response = await fetch('data/centers.json');
    const data = await response.json();
    centersData = data.centers;
    displayCenters(centersData);
  } catch (error) {
    console.error('Error loading centers:', error);
    showNotification('Failed to load recycling centers. Please try again.', 'error');
  }
}

function displayCenters(centers) {
  // Clear existing markers
  markerClusterGroup.clearLayers();
  markers = [];

  const centersList = document.getElementById('centers-list');
  centersList.innerHTML = '';

  if (centers.length === 0) {
    centersList.innerHTML = '<p class="text-gray-500 text-center py-8">No centers found matching your criteria.</p>';
    return;
  }

  centers.forEach(center => {
    // Create custom marker icon
    const markerIcon = createMarkerIcon(center);

    const marker = L.marker([center.lat, center.lng], { icon: markerIcon });

    // Enhanced popup content
    const popupContent = createPopupContent(center);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });

    // Add marker to cluster group
    markerClusterGroup.addLayer(marker);
    markers.push(marker);

    // Add to list with enhanced card
    const centerCard = createCenterCard(center);
    centersList.appendChild(centerCard);
  });

  // Fit map bounds to show all markers
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function createMarkerIcon(center) {
  let markerClass = 'recycling-marker';
  let color = '#10B981'; // green for verified

  if (!center.verified) {
    color = '#F59E0B'; // amber for unverified
  }

  if (center.rating >= 4.5) {
    color = '#059669'; // emerald for highly rated
  }

  return L.divIcon({
    className: markerClass,
    html: `
      <div class="marker-pin" style="background-color: ${color}">
        <div class="marker-icon">
          <i class="fas fa-recycle text-white text-xs"></i>
        </div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
}

function createPopupContent(center) {
  const ratingStars = createRatingStars(center.rating);
  const distance = userLocation ? calculateDistance(userLocation, [center.lat, center.lng]) : null;

  return `
    <div class="popup-content">
      <div class="popup-header">
        <h3 class="font-bold text-lg text-gray-900">${center.name}</h3>
        ${center.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
      </div>
      <div class="popup-body">
        <p class="text-sm text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-1"></i>${center.address}</p>
        <div class="rating mb-2">
          ${ratingStars}
          <span class="text-sm text-gray-600 ml-1">(${center.rating})</span>
        </div>
        ${distance ? `<p class="text-sm text-gray-600 mb-2"><i class="fas fa-route mr-1"></i>${distance.toFixed(1)} km away</p>` : ''}
        <div class="accepts mb-3">
          <p class="text-sm font-medium text-gray-700 mb-1">Accepts:</p>
          <div class="flex flex-wrap gap-1">
            ${center.accepts.map(item => `<span class="accept-tag">${item}</span>`).join('')}
          </div>
        </div>
        <div class="popup-actions">
          <button onclick="viewCenterDetails(${center.id})" class="btn-secondary text-xs">
            <i class="fas fa-info-circle mr-1"></i>Details
          </button>
          <button onclick="getDirections(${center.lat}, ${center.lng})" class="btn-primary text-xs ml-2">
            <i class="fas fa-directions mr-1"></i>Directions
          </button>
        </div>
      </div>
    </div>
  `;
}

function createRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return `
    ${'<i class="fas fa-star text-yellow-400"></i>'.repeat(fullStars)}
    ${hasHalfStar ? '<i class="fas fa-star-half-alt text-yellow-400"></i>' : ''}
    ${'<i class="far fa-star text-gray-300"></i>'.repeat(emptyStars)}
  `;
}

function createCenterCard(center) {
  const card = document.createElement('div');
  card.className = 'center-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300';

  const ratingStars = createRatingStars(center.rating);
  const distance = userLocation ? calculateDistance(userLocation, [center.lat, center.lng]) : null;

  card.innerHTML = `
    <div class="p-4">
      <div class="flex items-start justify-between mb-2">
        <h4 class="font-semibold text-gray-900">${center.name}</h4>
        ${center.verified ? '<i class="fas fa-check-circle text-green-500 text-sm"></i>' : ''}
      </div>
      <p class="text-sm text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-1"></i>${center.address}</p>
      <div class="flex items-center mb-2">
        ${ratingStars}
        <span class="text-sm text-gray-600 ml-1">(${center.rating})</span>
      </div>
      ${distance ? `<p class="text-xs text-gray-500 mb-2"><i class="fas fa-route mr-1"></i>${distance.toFixed(1)} km away</p>` : ''}
      <div class="flex flex-wrap gap-1 mb-3">
        ${center.accepts.slice(0, 3).map(item => `<span class="accept-tag-small">${item}</span>`).join('')}
        ${center.accepts.length > 3 ? `<span class="text-xs text-gray-500">+${center.accepts.length - 3} more</span>` : ''}
      </div>
      <div class="flex gap-2">
        <button onclick="viewCenterDetails(${center.id})" class="btn-secondary flex-1 text-sm">
          <i class="fas fa-info-circle mr-1"></i>Details
        </button>
        <button onclick="schedulePickup(${center.id})" class="btn-primary flex-1 text-sm">
          <i class="fas fa-calendar-plus mr-1"></i>Book
        </button>
      </div>
    </div>
  `;

  return card;
}

function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = (point2[0] - point1[0]) * Math.PI / 180;
  const dLon = (point2[1] - point1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function initSearch() {
  const searchInput = document.getElementById('search-input');

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchCenters();
    }, 300);
  });

  // Search on Enter key
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchCenters();
    }
  });
}

function initFilters() {
  const filterSelect = document.getElementById('filter-select');
  const verifiedFilter = document.getElementById('verified-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const sortSelect = document.getElementById('sort-select');

  [filterSelect, verifiedFilter, ratingFilter, sortSelect].forEach(filter => {
    filter.addEventListener('change', searchCenters);
  });
}

export function searchCenters() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const itemFilter = document.getElementById('filter-select').value;
  const verifiedOnly = document.getElementById('verified-filter').checked;
  const minRating = parseFloat(document.getElementById('rating-filter').value) || 0;
  const sortBy = document.getElementById('sort-select').value;

  let filtered = centersData.filter(center => {
    // Text search
    const matchesQuery = !query ||
      center.name.toLowerCase().includes(query) ||
      center.address.toLowerCase().includes(query) ||
      center.accepts.some(item => item.toLowerCase().includes(query));

    // Item type filter
    const matchesItem = !itemFilter || center.accepts.includes(itemFilter);

    // Verified filter
    const matchesVerified = !verifiedOnly || center.verified;

    // Rating filter
    const matchesRating = center.rating >= minRating;

    return matchesQuery && matchesItem && matchesVerified && matchesRating;
  });

  // Sort results
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        if (userLocation) {
          const distA = calculateDistance(userLocation, [a.lat, a.lng]);
          const distB = calculateDistance(userLocation, [b.lat, b.lng]);
          return distA - distB;
        }
        return 0;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  displayCenters(filtered);
}

// Global functions for popup buttons
window.viewCenterDetails = function(centerId) {
  const center = centersData.find(c => c.id === centerId);
  if (center) {
    showCenterDetailsModal(center);
  }
};

window.getDirections = function(lat, lng) {
  if (userLocation) {
    const url = `https://www.openstreetmap.org/directions?from=${userLocation[0]},${userLocation[1]}&to=${lat},${lng}&route=car`;
    window.open(url, '_blank');
  } else {
    showNotification('Unable to get directions without your location.', 'error');
  }
};

window.schedulePickup = function(centerId) {
  const center = centersData.find(c => c.id === centerId);
  if (center) {
    // Scroll to booking section
    document.getElementById('pickup').scrollIntoView({ behavior: 'smooth' });

    // Pre-fill center selection if possible
    const itemTypeSelect = document.getElementById('item-type');
    if (itemTypeSelect && center.accepts.length > 0) {
      itemTypeSelect.value = center.accepts[0];
    }

    showNotification(`Selected ${center.name} for pickup scheduling.`, 'success');
  }
};

function showCenterDetailsModal(center) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">${center.name}</h2>
            ${center.verified ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1"><i class="fas fa-check-circle mr-1"></i>Verified Center</span>' : ''}
          </div>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <div class="mb-4">
              <h3 class="font-semibold text-gray-900 mb-2">Location & Contact</h3>
              <p class="text-gray-600 mb-2"><i class="fas fa-map-marker-alt mr-2"></i>${center.address}</p>
              <p class="text-gray-600 mb-2"><i class="fas fa-phone mr-2"></i>${center.phone || 'Not available'}</p>
              <p class="text-gray-600"><i class="fas fa-clock mr-2"></i>${center.hours || '9 AM - 6 PM'}</p>
            </div>

            <div class="mb-4">
              <h3 class="font-semibold text-gray-900 mb-2">Rating</h3>
              <div class="flex items-center">
                ${createRatingStars(center.rating)}
                <span class="ml-2 text-gray-600">(${center.rating})</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">${center.reviews || 0} reviews</p>
            </div>
          </div>

          <div>
            <div class="mb-4">
              <h3 class="font-semibold text-gray-900 mb-2">Accepted Items</h3>
              <div class="grid grid-cols-2 gap-2">
                ${center.accepts.map(item => `
                  <div class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-check text-green-500 mr-2"></i>
                    ${item}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mb-4">
              <h3 class="font-semibold text-gray-900 mb-2">Services</h3>
              <div class="space-y-1">
                ${center.services ? center.services.map(service => `
                  <div class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-check text-green-500 mr-2"></i>
                    ${service}
                  </div>
                `).join('') : '<p class="text-gray-500">No additional services listed</p>'}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button onclick="getDirections(${center.lat}, ${center.lng})" class="btn-primary flex-1">
            <i class="fas fa-directions mr-2"></i>Get Directions
          </button>
          <button onclick="schedulePickup(${center.id}); this.closest('.fixed').remove()" class="btn-secondary flex-1">
            <i class="fas fa-calendar-plus mr-2"></i>Schedule Pickup
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', initMap);