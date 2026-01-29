/**
 * E-Zero - Map Module
 * Handles the recycling centers map with Leaflet
 */

// ============================================
// STATE
// ============================================
let map = null;
let markers = [];
let centersData = [];
let userLocation = null;
let markerClusterGroup = null;

const DEFAULT_CENTER = [19.0760, 72.8777]; // Mumbai
const DEFAULT_ZOOM = 11;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('centers-map');
  if (mapContainer) {
    initMap();
  }
});

export function initMap() {
  try {
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded');
      showMapError('Map library not available. Please refresh the page.');
      return;
    }
    
    console.log('🗺️ Initializing map...');
    
    // Remove existing map if any
    if (map) {
      map.remove();
      map = null;
    }
    
    // Create map
    map = L.map('centers-map', {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Initialize marker cluster
    if (typeof L.markerClusterGroup !== 'undefined') {
      markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 80
      });
      map.addLayer(markerClusterGroup);
    }
    
    // Get user location
    getUserLocation();
    
    // Load centers
    loadCenters();
    
    // Setup search
    initSearch();
    initFilters();
    
    console.log('✅ Map initialized');
    
  } catch (error) {
    console.error('Map init error:', error);
    showMapError('Failed to initialize map.');
  }
}

// ============================================
// USER LOCATION
// ============================================
function getUserLocation() {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = [position.coords.latitude, position.coords.longitude];
      console.log('📍 Location found:', userLocation);
      
      // Add user marker
      const userIcon = L.divIcon({
        html: '<div class="user-marker"><i class="fas fa-user"></i></div>',
        iconSize: [30, 30],
        className: 'user-location-marker'
      });
      
      L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('Your Location');
      
      // Center map
      map.setView(userLocation, 13);
      
      // Update distances
      updateCenterCards(centersData);
    },
    (error) => {
      console.warn('Location error:', error.message);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ============================================
// LOAD CENTERS
// ============================================
async function loadCenters() {
  try {
    console.log('📊 Loading centers...');
    
    const response = await fetch('data/centers.json');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    centersData = data.centers || data;
    
    console.log(`✅ Loaded ${centersData.length} centers`);
    
    displayCenters(centersData);
    updateCenterCards(centersData);
    
  } catch (error) {
    console.error('Failed to load centers:', error);
    
    // Use fallback data
    centersData = getFallbackCenters();
    displayCenters(centersData);
    updateCenterCards(centersData);
  }
}

function getFallbackCenters() {
  return [
    {
      id: 1,
      name: "E-Zero Headquarters - Pune",
      city: "Pune",
      lat: 18.5204,
      lng: 73.8567,
      address: "123 Green Business Park, Shivaji Nagar, Pune, Maharashtra 411005",
      rating: 4.9,
      verified: true,
      hours: "9:00 AM - 7:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "servers", "batteries"],
      services: ["Free pickup", "Data destruction", "Certificates"],
      reviews: 2847
    },
    {
      id: 2,
      name: "E-Zero Mumbai - Andheri",
      city: "Mumbai",
      lat: 19.1136,
      lng: 72.8697,
      address: "456 Eco Tower, Andheri East, Mumbai, Maharashtra 400069",
      rating: 4.6,
      verified: true,
      hours: "9:00 AM - 6:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "batteries"],
      services: ["Free pickup", "Data destruction", "Bulk collection"],
      reviews: 1892
    },
    {
      id: 3,
      name: "E-Zero Mumbai - BKC",
      city: "Mumbai",
      lat: 19.0596,
      lng: 72.8656,
      address: "BKC Tower 3, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      rating: 4.8,
      verified: true,
      hours: "8:00 AM - 8:00 PM",
      accepts: ["servers", "networking", "laptops", "desktops", "monitors", "harddrives"],
      services: ["Corporate solutions", "Data center services"],
      reviews: 1456
    },
    {
      id: 4,
      name: "E-Zero Delhi - Connaught Place",
      city: "Delhi",
      lat: 28.6315,
      lng: 77.2167,
      address: "789 Green Plaza, Connaught Place, New Delhi 110001",
      rating: 4.5,
      verified: true,
      hours: "9:00 AM - 7:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "batteries"],
      services: ["Free pickup", "Data destruction", "Certificates"],
      reviews: 1654
    },
    {
      id: 5,
      name: "E-Zero Gurgaon - Cyber City",
      city: "Gurgaon",
      lat: 28.4940,
      lng: 77.0885,
      address: "DLF Cyber City, Phase 3, Gurgaon, Haryana 122002",
      rating: 4.8,
      verified: true,
      hours: "8:00 AM - 8:00 PM",
      accepts: ["servers", "networking", "laptops", "desktops", "monitors", "harddrives"],
      services: ["Enterprise pickup", "Data destruction", "Compliance certificates"],
      reviews: 2134
    },
    {
      id: 6,
      name: "E-Zero Bangalore - Koramangala",
      city: "Bangalore",
      lat: 12.9352,
      lng: 77.6245,
      address: "321 Circuit Avenue, Koramangala, Bangalore, Karnataka 560034",
      rating: 4.8,
      verified: true,
      hours: "9:00 AM - 7:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "servers"],
      services: ["Free pickup", "Data destruction", "Same-day payment"],
      reviews: 1876
    },
    {
      id: 7,
      name: "E-Zero Hyderabad - HITEC City",
      city: "Hyderabad",
      lat: 17.4435,
      lng: 78.3772,
      address: "Mindspace, HITEC City, Hyderabad, Telangana 500081",
      rating: 4.7,
      verified: true,
      hours: "9:00 AM - 7:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "servers"],
      services: ["Free pickup", "Data destruction", "Enterprise solutions"],
      reviews: 1543
    },
    {
      id: 8,
      name: "E-Zero Chennai - T. Nagar",
      city: "Chennai",
      lat: 13.0418,
      lng: 80.2341,
      address: "654 Clean Street, T. Nagar, Chennai, Tamil Nadu 600017",
      rating: 4.5,
      verified: true,
      hours: "9:00 AM - 6:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "batteries"],
      services: ["Free pickup", "Data destruction", "Certificates"],
      reviews: 1123
    },
    {
      id: 9,
      name: "E-Zero Kolkata - Salt Lake",
      city: "Kolkata",
      lat: 22.5726,
      lng: 88.4378,
      address: "Sector V, Salt Lake City, Kolkata, West Bengal 700091",
      rating: 4.4,
      verified: true,
      hours: "10:00 AM - 6:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "batteries"],
      services: ["Free pickup", "Certificates"],
      reviews: 765
    },
    {
      id: 10,
      name: "E-Zero Ahmedabad - SG Highway",
      city: "Ahmedabad",
      lat: 23.0225,
      lng: 72.5714,
      address: "Gift City Road, SG Highway, Ahmedabad, Gujarat 380015",
      rating: 4.5,
      verified: true,
      hours: "9:00 AM - 6:00 PM",
      accepts: ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "batteries"],
      services: ["Free pickup", "Data destruction", "Certificates"],
      reviews: 654
    }
  ];
}

// ============================================
// DISPLAY CENTERS
// ============================================
function displayCenters(centers) {
  // Clear existing markers
  if (markerClusterGroup) {
    markerClusterGroup.clearLayers();
  }
  markers = [];
  
  centers.forEach(center => {
    const marker = createMarker(center);
    if (marker) {
      markers.push(marker);
      if (markerClusterGroup) {
        markerClusterGroup.addLayer(marker);
      } else {
        marker.addTo(map);
      }
    }
  });
}

function createMarker(center) {
  const lat = center.lat || center.latitude;
  const lng = center.lng || center.longitude;
  
  if (!lat || !lng) return null;
  
  const iconColor = center.verified ? '#10B981' : '#8B5CF6';
  
  const icon = L.divIcon({
    html: `<div class="custom-marker" style="background: ${iconColor}"><i class="fas fa-recycle"></i></div>`,
    iconSize: [40, 40],
    className: 'custom-marker-container'
  });
  
  const marker = L.marker([lat, lng], { icon })
    .bindPopup(createPopupContent(center), {
      maxWidth: 280,
      className: 'custom-popup'
    });
  
  marker.on('click', () => {
    console.log('Center clicked:', center.name);
  });
  
  return marker;
}

function createPopupContent(center) {
  const lat = center.lat || center.latitude;
  const lng = center.lng || center.longitude;
  const distance = userLocation ? calculateDistance(userLocation, [lat, lng]) : null;
  
  return `
    <div class="popup-content">
      <h3 style="margin-bottom: 8px; font-weight: 600;">${center.name}</h3>
      <p class="address" style="font-size: 13px; color: #64748B; margin-bottom: 12px;">${center.address}</p>
      
      <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px;">
        <span style="color: #F59E0B;">
          <i class="fas fa-star"></i> ${center.rating}
        </span>
        ${distance ? `<span style="color: #64748B;"><i class="fas fa-route"></i> ${distance.toFixed(1)} km</span>` : ''}
      </div>
      
      <div class="popup-actions" style="display: flex; gap: 8px;">
        <button onclick="getDirections(${lat}, ${lng})" 
                style="flex: 1; padding: 8px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
          <i class="fas fa-directions"></i> Directions
        </button>
        <button onclick="window.scrollToSection('pickup')" 
                style="flex: 1; padding: 8px; background: white; color: #10B981; border: 1px solid #10B981; border-radius: 8px; cursor: pointer; font-size: 12px;">
          <i class="fas fa-calendar"></i> Schedule
        </button>
      </div>
    </div>
  `;
}

// ============================================
// CENTER CARDS
// ============================================
function updateCenterCards(centers) {
  const container = document.getElementById('centers-grid');
  if (!container) return;
  
  if (!centers || centers.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">No centers found</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = centers.map(center => createCenterCard(center)).join('');
  
  // Add click handlers
  container.querySelectorAll('.center-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      const center = centers[index];
      const lat = center.lat || center.latitude;
      const lng = center.lng || center.longitude;
      if (lat && lng && map) {
        map.setView([lat, lng], 15);
      }
    });
  });
}

function createCenterCard(center) {
  const lat = center.lat || center.latitude;
  const lng = center.lng || center.longitude;
  const distance = userLocation && lat && lng ? calculateDistance(userLocation, [lat, lng]) : null;
  
  return `
    <div class="center-card">
      <div class="center-card-header">
        <div>
          <h4 class="center-name">${center.name}</h4>
          <p class="center-address">${center.address}</p>
        </div>
        ${center.verified ? '<span class="center-badge">Verified</span>' : ''}
      </div>
      <div class="center-meta">
        <div class="center-rating">
          <i class="fas fa-star"></i>
          <span>${center.rating}</span>
        </div>
        ${distance ? `<span><i class="fas fa-route"></i> ${distance.toFixed(1)} km</span>` : ''}
        <span><i class="fas fa-clock"></i> ${center.hours || '9AM-6PM'}</span>
      </div>
    </div>
  `;
}

// ============================================
// SEARCH & FILTERS
// ============================================
let searchTimeout;

function initSearch() {
  const searchInput = document.getElementById('location-search');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterCenters(query);
    }, 300);
  });
}

function initFilters() {
  const itemFilter = document.getElementById('item-filter');
  if (!itemFilter) return;
  
  itemFilter.addEventListener('change', () => {
    const searchInput = document.getElementById('location-search');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    filterCenters(query);
  });
}

function filterCenters(query = '') {
  const itemFilter = document.getElementById('item-filter');
  const itemType = itemFilter ? itemFilter.value : 'all';
  
  let filtered = [...centersData];
  
  // Filter by search query
  if (query) {
    filtered = filtered.filter(center =>
      center.name.toLowerCase().includes(query) ||
      center.address.toLowerCase().includes(query)
    );
  }
  
  // Filter by item type
  if (itemType !== 'all') {
    filtered = filtered.filter(center => {
      const accepts = center.accepts || center.acceptedItems || [];
      return accepts.some(item => item.toLowerCase().includes(itemType.toLowerCase()));
    });
  }
  
  displayCenters(filtered);
  updateCenterCards(filtered);
  
  console.log(`🔍 Filtered: ${filtered.length} centers`);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function showMapError(message) {
  const container = document.getElementById('centers-map');
  if (!container) return;
  
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #F8FAFC; color: #64748B;">
      <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
      <p style="margin-bottom: 16px;">${message}</p>
      <button onclick="location.reload()" style="padding: 8px 16px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer;">
        <i class="fas fa-refresh"></i> Reload
      </button>
    </div>
  `;
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================
window.getDirections = function(lat, lng) {
  const url = userLocation 
    ? `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${lat},${lng}`
    : `https://www.google.com/maps/search/${lat},${lng}`;
  window.open(url, '_blank');
};

window.focusOnCenter = function(lat, lng) {
  if (map) {
    map.setView([lat, lng], 15);
  }
};