/**
 * E-Zero - Charts Module
 * Handles impact visualization with Chart.js
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for Chart.js to load
  setTimeout(() => {
    initCharts();
  }, 500);
});

function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }
  
  console.log('📊 Initializing charts...');
  
  initRecyclingChart();
  initCategoryChart();
  
  console.log('✅ Charts initialized');
}

// ============================================
// RECYCLING ACTIVITY CHART (Bar)
// ============================================
function initRecyclingChart() {
  const ctx = document.getElementById('recycling-chart');
  if (!ctx) return;
  
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Items Recycled',
      data: [12, 19, 15, 25, 22, 30],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 0,
      borderRadius: 6,
      barThickness: 24
    }]
  };
  
  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: '600'
          },
          bodyFont: {
            size: 13
          },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} items recycled`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
            font: {
              size: 12
            },
            stepSize: 10
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  };
  
  new Chart(ctx, config);
}

// ============================================
// CATEGORY CHART (Doughnut)
// ============================================
function initCategoryChart() {
  const ctx = document.getElementById('category-chart');
  if (!ctx) return;
  
  const data = {
    labels: ['Phones', 'Laptops', 'Batteries', 'Chargers', 'Other'],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        '#10B981', // Green
        '#06B6D4', // Cyan
        '#8B5CF6', // Purple
        '#F59E0B', // Orange
        '#64748B'  // Gray
      ],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };
  
  const config = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: '600'
          },
          bodyFont: {
            size: 13
          },
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${percentage}%`;
            }
          }
        }
      },
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  };
  
  new Chart(ctx, config);
}

// ============================================
// ANIMATED COUNTERS FOR IMPACT
// ============================================
function animateImpactCounters() {
  const counters = [
    { id: 'impact-recycled', target: 156 },
    { id: 'impact-co2', target: 89 },
    { id: 'impact-trees', target: 12 }
  ];
  
  counters.forEach(counter => {
    const element = document.getElementById(counter.id);
    if (!element) return;
    
    animateValue(element, 0, counter.target, 2000);
  });
}

function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    const current = Math.floor(easeProgress * (end - start) + start);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  
  window.requestAnimationFrame(step);
}

// Trigger animation when section is visible
const impactSection = document.getElementById('impact');
if (impactSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateImpactCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(impactSection);
}

// ============================================
// EXPORTS
// ============================================
export { initCharts, animateImpactCounters };