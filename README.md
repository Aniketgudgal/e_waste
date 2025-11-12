# E-Zero E-Waste Platform

A comprehensive web application for e-waste management, featuring doorstep pickup scheduling, recycling center discovery, rewards system, and admin dashboard.

## Features

- **Find Recycling Centers**: Interactive map with OpenStreetMap and Leaflet.js
- **Schedule Pickups**: User-friendly booking form with photo uploads
- **Rewards System**: Points-based incentives for recycling
- **Impact Dashboard**: Charts showing environmental impact
- **Multi-language Support**: English, Hindi, Marathi
- **PWA Ready**: Offline functionality and installable
- **Admin Dashboard**: Manage bookings, centers, and analytics
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Accessibility**: WCAG compliant with ARIA labels

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES Modules)
- **Maps**: Leaflet.js with OpenStreetMap
- **Charts**: Chart.js
- **Animations**: Lottie for micro-interactions
- **PWA**: Service Worker for offline caching
- **Internationalization**: Custom i18n system

## Project Structure

```
e-zero/
├── index.html          # Main user-facing application
├── admin.html          # Admin dashboard
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── i18n.json          # Translations
├── css/
│   ├── tailwind.css   # Tailwind CSS framework
│   └── styles.css     # Custom styles
├── js/
│   ├── app.js         # Main app logic
│   ├── i18n.js        # Internationalization
│   ├── theme.js       # Theme management
│   ├── map.js         # Map functionality
│   ├── booking.js     # Booking form handling
│   ├── rewards.js     # Rewards management
│   ├── charts.js      # Data visualizations
│   └── admin.js       # Admin dashboard logic
├── assets/
│   ├── logo.svg       # Application logo
│   ├── icons/         # UI icons
│   └── illustrations/ # Illustrations
└── data/
    ├── centers.json   # Recycling centers data
    ├── users.json     # User data
    └── bookings.json  # Booking records
```

## Getting Started

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. For admin access, open `admin.html`

## Key Components

### Map Integration
- Uses Leaflet.js for interactive maps
- Displays recycling centers with custom markers
- Geolocation for user location
- Search and filter functionality

### Booking System
- Comprehensive form with validation
- Photo upload capability
- Date/time selection
- Confirmation modal

### Rewards Dashboard
- Points balance display
- Activity history
- Achievement badges
- Redemption options

### Admin Panel
- Booking management
- Analytics charts
- Center oversight
- Performance metrics

## Advanced Features

- **Progressive Web App**: Installable, works offline
- **Multi-language**: Switch between EN/HI/MR
- **Dark Mode**: Theme toggle
- **Responsive**: Optimized for all devices
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Screen reader friendly

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Future Enhancements

- AI-powered waste classification
- WhatsApp integration
- Real-time notifications
- Advanced analytics
- Partner portal
- Mobile app version

## Contributing

This is a complete frontend implementation. For backend integration, API endpoints would need to be connected to a server-side application.

## License

Open source - feel free to use and modify for e-waste management initiatives.