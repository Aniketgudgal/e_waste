const fs = require('fs');

const cities = [
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 }
];

const partners = [
  'Attero Recycling',
  'Croma Collection Point',
  'Karo Sambhav Center',
  'E-Parisaraa Partner',
  'Namo E-Waste',
  'Hulladek Recycling',
  'Cerebra Integrated',
  'Eco Recycling (Ecoreco)',
  'Spas Recycling',
  'Vijay Sales e-Waste Bin',
  'Reliance Digital Collection'
];

const existingCenters = [
    {
      "id": 1,
      "name": "E-Zero Headquarters - Pune",
      "city": "Pune",
      "lat": 18.5204,
      "lng": 73.8567,
      "address": "123 Green Business Park, Shivaji Nagar, Pune, Maharashtra 411005",
      "certificates": ["ISO 14001", "EPR Certified", "CPCB Approved", "R2 Certified"],
      "accepts": ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "keyboards", "servers", "networking", "batteries", "harddrives", "cables"],
      "verified": true,
      "rating": 4.9,
      "contact": "+91-9876543210",
      "hours": "9:00 AM - 7:00 PM",
      "services": ["Free pickup", "Data destruction", "Certificates", "Same-day payment"],
      "capacity": "High",
      "reviews": 2847,
      "type": "E-Zero"
    },
    // ... (I will include the rest of the 28 E-Zero centers here manually or just generate generic E-Zero ones if easier, but keeping the "real" ones I made is better. For this script I'll just add the partner generation logic)
];


function generateCenters() {
  const centers = [];
  let idCounter = 100; // Start partner IDs from 100

  // 1. Add some varied E-Zero centers first (simulating the 28 I made + more)
  cities.forEach(city => {
    // Add 1-3 E-Zero centers per city
    const numEZero = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numEZero; i++) {
        centers.push(createCenter(city, 'E-Zero Center', 'E-Zero', idCounter++));
    }
  });

  // 2. Add Partner centers
  cities.forEach(city => {
    // Add 2-5 Partner centers per city
    const numPartners = Math.floor(Math.random() * 4) + 2; 
    for (let i = 0; i < numPartners; i++) {
        const partnerName = partners[Math.floor(Math.random() * partners.length)];
        centers.push(createCenter(city, partnerName, 'Partner', idCounter++));
    }
  });

  return { centers };
}

function createCenter(city, baseName, type, id) {
  // Random offset for lat/lng to spread them out in the city
  // Approx 0.01 deg is ~1km
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;

  const areas = ['Market Area', 'Industrial Estate', 'Tech Park', 'City Center', 'Suburbs', 'Main Road'];
  const area = areas[Math.floor(Math.random() * areas.length)];

  return {
    id: id,
    name: `${baseName} - ${city.name} (${area})`,
    city: city.name,
    lat: Number((city.lat + latOffset).toFixed(4)),
    lng: Number((city.lng + lngOffset).toFixed(4)),
    address: `${Math.floor(Math.random() * 100) + 1} ${area}, ${city.name}`,
    certificates: ["CPCB Approved", "ISO 14001"],
    accepts: type === 'E-Zero' 
      ? ["laptops", "desktops", "phones", "tablets", "monitors", "printers", "servers", "networking", "batteries"] 
      : ["laptops", "phones", "tablets", "batteries"], // Partners might accept less
    verified: true,
    rating: Number((4 + Math.random()).toFixed(1)),
    contact: "+91-" + Math.floor(6000000000 + Math.random() * 4000000000),
    hours: "10:00 AM - 6:00 PM",
    services: type === 'E-Zero' 
      ? ["Free pickup", "Data destruction", "Certificates"] 
      : ["Drop-off only", "Basic recycling"],
    capacity: type === 'E-Zero' ? "High" : "Medium",
    reviews: Math.floor(Math.random() * 500) + 50,
    type: type
  };
}

const data = generateCenters();
console.log(JSON.stringify(data, null, 2));
