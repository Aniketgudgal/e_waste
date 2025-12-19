// map.js - Enhanced map functionality with Leaflet and clustering
let map;
let markers = [];
let centersData = [];
let userLocation = null;
let searchTimeout;
let markerClusterGroup;
let currentFilters = {
  itemType: 'all',
  searchQuery: '',
  radius: 50
};

// Default center coordinates (Mumbai, India)
const DEFAULT_CENTER = [19.0760, 72.8777];
const DEFAULT_ZOOM = 11;

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('centers-map')) {
    initMap();
  }
});

export function initMap() {
  try {
    if (typeof L === 'undefined') {
      console.warn('Leaflet library not found; map cannot be initialized.');
      showMapError('Map library not loaded. Please check your internet connection or CDN.');
      return;
    }
    console.log('🗺️ Initializing map...');
    
    // Check if map already exists
    if (map) {
      map.remove();
    }
    
    // Initialize map
    map = L.map('centers-map', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
      tap: true
    });

    // Add tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });
    
    osmLayer.addTo(map);

    // Initialize marker cluster
    markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 80
    });
    
    map.addLayer(markerClusterGroup);

    // Get user location
    getUserLocation();

    // Load centers data
    loadCenters();

    // Initialize search and filters
    initSearch();
    initFilters();

    console.log('✅ Map initialized successfully');

  } catch (error) {
    console.error('❌ Map initialization failed:', error);
    showMapError('Failed to initialize map. Please refresh the page.');
  }
}

function getUserLocation() {
  if (!('geolocation' in navigator)) {
    console.warn('⚠️ Geolocation not supported');
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = [position.coords.latitude, position.coords.longitude];
      console.log('📍 User location found:', userLocation);
      
      // Add user location marker
      const userIcon = L.divIcon({
        html: '<div class="user-marker"><i class="fas fa-user-circle"></i></div>',
        iconSize: [30, 30],
        className: 'user-location-marker'
      });
      
      L.marker(userLocation, { 
        icon: userIcon,
        zIndexOffset: 1000 
      })
      .addTo(map)
      .bindPopup('Your Location');

      // Center map on user location
      map.setView(userLocation, 13);
      
      // Update distances
      updateDistances();
      
    },
    (error) => {
      console.warn('⚠️ Geolocation error:', error.message);
      handleLocationError(error);
    },
    options
  );
}

function handleLocationError(error) {
  let message = 'Unable to get your location. ';
  
  switch(error.code) {
    case error.PERMISSION_DENIED:
      message += 'Location access denied.';
      break;
    case error.POSITION_UNAVAILABLE:
      message += 'Location information unavailable.';
      break;
    case error.TIMEOUT:
      message += 'Location request timed out.';
      break;
    default:
      message += 'Unknown location error.';
  }
  
  console.warn(message);
  
  if (window.EZero?.utils?.showNotification) {
    window.EZero.utils.showNotification(message, 'warning');
  }
}

async function loadCenters() {
  try {
    console.log('📊 Loading centers data...');
    
    const response = await fetch('/data/centers.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    centersData = await response.json();
    console.log(`✅ Loaded ${centersData.length} centers`);
    
    // Display centers
    displayCenters(centersData);
    updateCenterCards(centersData);
    
  } catch (error) {
    console.error('❌ Failed to load centers:', error);
    showMapError('Failed to load recycling centers. Please try again.');
  }
}

function displayCenters(centers) {
  // Clear existing markers
  markerClusterGroup.clearLayers();
  markers = [];

  centers.forEach(center => {
    const marker = createCenterMarker(center);
    if (marker) {
      markers.push(marker);
      markerClusterGroup.addLayer(marker);
    }
  });
}

function createCenterMarker(center) {
  if (!center.latitude || !center.longitude) {
    console.warn('⚠️ Center missing coordinates:', center.name);
    return null;
  }

  const iconColor = getIconColor(center);
  const icon = L.divIcon({
    html: `<div class="custom-marker" style="background-color: ${iconColor};"><i class="fas fa-recycle"></i></div>`,
    iconSize: [40, 40],
    className: 'custom-marker-container'
  });

  const marker = L.marker([center.latitude, center.longitude], { icon })
    .bindPopup(createPopupContent(center), {
      maxWidth: 300,
      className: 'custom-popup'
    });

  marker.on('click', () => {
    showCenterDetails(center);
    trackEvent('center_clicked', { center_id: center.id });
  });

  return marker;
}

function getIconColor(center) {
  if (center.verified) {
    return '#10B981'; // Green
  } else if (center.rating >= 4) {
    return '#3B82F6'; // Blue
  } else {
    return '#8B5CF6'; // Purple
  }
}

function createPopupContent(center) {
  const distance = userLocation ? 
    calculateDistance(userLocation, [center.latitude, center.longitude]) : 
    null;
    
  const distanceText = distance ? `${distance.toFixed(1)} km away` : '';
  const verifiedBadge = center.verified ? 
    '<span class="verified-badge">Verified</span>' : '';
  
  return `
    <div class="popup-content">
      <div class="popup-header">
        <h3>${center.name}</h3>
        ${verifiedBadge}
      </div>
      <p class="address">${center.address}</p>
      <div class="rating">
        ${generateStarRating(center.rating)}
        <span>(${center.rating})</span>
      </div>
      <div class="distance">${distanceText}</div>
      <div class="accepted-items">
        ${center.acceptedItems.slice(0, 3).join(', ')}
        ${center.acceptedItems.length > 3 ? '...' : ''}
      </div>
      <div class="popup-actions">
        <button onclick="getDirections(${center.latitude}, ${center.longitude})">Directions</button>
        <button onclick="schedulePickup('${center.id}')">Schedule</button>
      </div>
    </div>
  `;
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

function showCenterDetails(center) {
  const detailsContainer = document.getElementById('center-details');
  if (!detailsContainer) return;

  const distance = userLocation ? 
    calculateDistance(userLocation, [center.latitude, center.longitude]) : 
    null;

  const detailsHTML = `
    <div class="center-details-content">
      <div class="center-icon">
        <i class="fas fa-recycle"></i>
      </div>
      <div class="center-info">
        <div class="center-header">
          <h3>${center.name}</h3>
          ${center.verified ? '<span class="verified">Verified</span>' : ''}
        </div>
        <p class="address">${center.address}</p>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Rating:</span>
            <div class="rating">
              ${generateStarRating(center.rating)}
              <span>(${center.rating}/5)</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="label">Distance:</span>
            <span>${distance ? `${distance.toFixed(1)} km` : 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="label">Hours:</span>
            <span>${center.timings}</span>
          </div>
          <div class="detail-item">
            <span class="label">Contact:</span>
            <span>${center.contact}</span>
          </div>
        </div>
        <div class="accepted-items">
          <span class="label">Accepted Items:</span>
          <div class="items-list">
            ${center.acceptedItems.map(item => `<span class="item-tag">${item}</span>`).join('')}
          </div>
        </div>
        <div class="actions">
          <button onclick="getDirections(${center.latitude}, ${center.longitude})" class="btn-primary">
            <i class="fas fa-directions"></i> Get Directions
          </button>
          <button onclick="schedulePickup('${center.id}')" class="btn-secondary">
            <i class="fas fa-calendar-plus"></i> Schedule Pickup
          </button>
        </div>
      </div>
    </div>
  `;
  
  detailsContainer.innerHTML = detailsHTML;
  detailsContainer.classList.remove('hidden');
}

function initSearch() {
  const searchInput = document.getElementById('location-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    currentFilters.searchQuery = query;
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterCenters();
    }, 300);
  });
}

function initFilters() {
  const itemFilter = document.getElementById('item-filter');
  if (!itemFilter) return;

  itemFilter.addEventListener('change', (e) => {
    currentFilters.itemType = e.target.value;
    filterCenters();
  });
}

function filterCenters() {
  let filteredCenters = [...centersData];

  // Filter by search query
  if (currentFilters.searchQuery) {
    const query = currentFilters.searchQuery.toLowerCase();
    filteredCenters = filteredCenters.filter(center =>
      center.name.toLowerCase().includes(query) ||
      center.address.toLowerCase().includes(query) ||
      center.acceptedItems.some(item => item.toLowerCase().includes(query))
    );
  }

  // Filter by item type
  if (currentFilters.itemType && currentFilters.itemType !== 'all') {
    filteredCenters = filteredCenters.filter(center =>
      center.acceptedItems.some(item => 
        item.toLowerCase().includes(currentFilters.itemType.toLowerCase())
      )
    );
  }

  // Display filtered results
  displayCenters(filteredCenters);
  updateCenterCards(filteredCenters);
  
  console.log(`🔍 Filtered to ${filteredCenters.length} centers`);
}

function updateCenterCards(centers) {
  const cardsContainer = document.getElementById('centers-grid');
  if (!cardsContainer) return;

  if (centers.length === 0) {
    cardsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No Centers Found</h3>
        <p>Try adjusting your search criteria.</p>
        <button onclick="resetFilters()" class="btn-primary">Reset Filters</button>
      </div>
    `;
    return;
  }

  cardsContainer.innerHTML = centers.map(center => createCenterCard(center)).join('');
}

function createCenterCard(center) {
  const distance = userLocation ? 
    calculateDistance(userLocation, [center.latitude, center.longitude]) : 
    null;

  const verifiedClass = center.verified ? 'verified' : 'unverified';
  const verifiedText = center.verified ? 'Verified' : 'Unverified';

  return `
    <div class="center-card ${verifiedClass}" onclick="focusOnCenter(${center.latitude}, ${center.longitude})">
      <div class="card-header">
        <div class="card-icon">
          <i class="fas fa-recycle"></i>
        </div>
        <div class="verification-badge">
          <span class="${verifiedClass}">${verifiedText}</span>
        </div>
      </div>
      <div class="card-body">
        <h3>${center.name}</h3>
        <p class="address">${center.address}</p>
        <div class="card-meta">
          <div class="timing">
            <i class="fas fa-clock"></i>
            <span>${center.timings}</span>
          </div>
          <div class="distance">
            <i class="fas fa-route"></i>
            <span>${distance ? `${distance.toFixed(1)} km` : 'N/A'}</span>
          </div>
        </div>
        <div class="rating">
          ${generateStarRating(center.rating)}
          <span>(${center.rating}/5)</span>
        </div>
        <div class="accepted-items">
          ${center.acceptedItems.slice(0, 3).map(item => 
            `<span class="item-tag">${item}</span>`
          ).join('')}
          ${center.acceptedItems.length > 3 ? 
            `<span class="more-items">+${center.acceptedItems.length - 3}</span>` : 
            ''
          }
        </div>
        <div class="card-actions">
          <button onclick="event.stopPropagation(); getDirections(${center.latitude}, ${center.longitude})" class="btn-directions">
            <i class="fas fa-directions"></i> Directions
          </button>
          <button onclick="event.stopPropagation(); schedulePickup('${center.id}')" class="btn-schedule">
            <i class="fas fa-calendar-plus"></i> Schedule
          </button>
        </div>
      </div>
    </div>
  `;
}

function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function updateDistances() {
  if (!userLocation) return;
  filterCenters();
}

function focusOnCenter(lat, lng) {
  if (map) {
    map.setView([lat, lng], 15);
    trackEvent('center_focused', { lat, lng });
  }
}

function showMapError(message) {
  const mapContainer = document.getElementById('centers-map');
  if (!mapContainer) return;

  mapContainer.innerHTML = `
    <div class="map-error">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>Map Error</h3>
      <p>${message}</p>
      <button onclick="window.location.reload()" class="btn-primary">
        <i class="fas fa-refresh"></i> Reload Page
      </button>
    </div>
  `;
}

// Global functions for HTML onclick handlers
window.getDirections = function(lat, lng) {
  if (userLocation) {
    const url = `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${lat},${lng}`;
    window.open(url, '_blank');
  } else {
    const url = `https://www.google.com/maps/search/${lat},${lng}`;
    window.open(url, '_blank');
  }
  trackEvent('directions_requested', { lat, lng });
};

window.schedulePickup = function(centerId) {
  console.log('📅 Scheduling pickup for center:', centerId);
  window.scrollToSection('pickup');
  
  const center = centersData.find(c => c.id === centerId);
  if (center && window.prefillPickupForm) {
    window.prefillPickupForm(center);
  }
  
  trackEvent('pickup_scheduled', { center_id: centerId });
  
  if (window.EZero?.utils?.showNotification) {
    window.EZero.utils.showNotification('Redirecting to pickup form...', 'info');
  }
};

window.resetFilters = function() {
  currentFilters = {
    itemType: 'all',
    searchQuery: '',
    radius: 50
  };
  
  const searchInput = document.getElementById('location-search');
  const itemFilter = document.getElementById('item-filter');
  
  if (searchInput) searchInput.value = '';
  if (itemFilter) itemFilter.value = 'all';
  
  filterCenters();
  console.log('🔄 Filters reset');
};

function trackEvent(eventName, data = {}) {
  console.log(`📊 Event: ${eventName}`, data);
}

// Auto-initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('centers-map')) {
      initMap();
    }
  });
} else if (document.getElementById('centers-map')) {
  initMap();
}