// charts.js - Advanced analytics and data visualizations
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

let charts = {};
let updateInterval;

export function initCharts() {
  // Initialize all charts
  createImpactChart();
  createMonthlyTrendsChart();
  createUserEngagementChart();
  createEnvironmentalImpactChart();
  createPerformanceMetricsChart();
  createGeographicDistributionChart();

  // Start real-time updates
  startRealTimeUpdates();

  // Initialize export functionality
  initExportFeatures();
}

function createImpactChart() {
  const ctx = document.getElementById('impact-chart');
  if (!ctx) return;

  const data = {
    labels: ['Electronics', 'Batteries', 'Plastic', 'Metal', 'Glass', 'Other'],
    datasets: [{
      data: [35, 15, 20, 15, 10, 5],
      backgroundColor: [
        '#10B981', // green
        '#F59E0B', // amber
        '#3B82F6', // blue
        '#8B5CF6', // violet
        '#06B6D4', // cyan
        '#6B7280'  // gray
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3
    }]
  };

  charts.impact = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: 'Waste Composition by Category',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value}% (${Math.round(value * 1250 / 100)} kg)`;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
}

function createMonthlyTrendsChart() {
  const ctx = document.getElementById('monthly-trends-chart');
  if (!ctx) return;

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'E-waste Collected (kg)',
        data: [1200, 1800, 2400, 2200, 2800, 3200, 3800, 3500, 4200, 4800, 4500, 5200],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'CO₂ Saved (tons)',
        data: [8.5, 12.7, 17.0, 15.5, 19.8, 22.6, 26.8, 24.7, 29.6, 33.8, 31.7, 36.7],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1'
      }
    ]
  };

  charts.monthlyTrends = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: 'Monthly Trends & Environmental Impact',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#10B981',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'E-waste Collected (kg)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'CO₂ Saved (tons)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function createUserEngagementChart() {
  const ctx = document.getElementById('user-engagement-chart');
  if (!ctx) return;

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [120, 150, 180, 200, 250, 300, 280],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      },
      {
        label: 'New Registrations',
        data: [25, 30, 35, 40, 45, 50, 48],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  charts.userEngagement = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Weekly User Engagement',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
        delay: function(context) {
          return context.dataIndex * 200;
        }
      }
    }
  });
}

function createEnvironmentalImpactChart() {
  const ctx = document.getElementById('environmental-impact-chart');
  if (!ctx) return;

  const data = {
    labels: ['Energy Saved (MWh)', 'Water Conserved (L)', 'Landfill Diversion (tons)', 'Raw Materials Recovered (kg)'],
    datasets: [{
      label: 'Environmental Impact',
      data: [1250, 50000, 850, 2500],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        '#10B981',
        '#3B82F6',
        '#F59E0B',
        '#8B5CF6'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  charts.environmentalImpact = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Environmental Impact Metrics',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.x.toLocaleString()} ${context.label.split(' ')[1]}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function createPerformanceMetricsChart() {
  const ctx = document.getElementById('performance-metrics-chart');
  if (!ctx) return;

  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Pickup Success Rate (%)',
        data: [85, 88, 92, 95],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Customer Satisfaction (%)',
        data: [82, 85, 89, 93],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  charts.performanceMetrics = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Performance Metrics',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          min: 75,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function createGeographicDistributionChart() {
  const ctx = document.getElementById('geographic-distribution-chart');
  if (!ctx) return;

  const data = {
    labels: ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
    datasets: [{
      label: 'Recycling Centers',
      data: [25, 32, 28, 35, 22, 18, 20],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: '#10B981',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  charts.geographicDistribution = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Geographic Distribution of Centers',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          title: {
            display: true,
            text: 'Number of Centers'
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
        delay: function(context) {
          return context.dataIndex * 100;
        }
      }
    }
  });
}

function startRealTimeUpdates() {
  // Update charts with simulated real-time data every 30 seconds
  updateInterval = setInterval(() => {
    updateChartData();
  }, 30000);
}

function updateChartData() {
  // Simulate real-time data updates
  if (charts.monthlyTrends) {
    const lastValue = charts.monthlyTrends.data.datasets[0].data.slice(-1)[0];
    const newValue = lastValue + Math.floor(Math.random() * 200) - 100;
    charts.monthlyTrends.data.datasets[0].data.push(Math.max(0, newValue));
    charts.monthlyTrends.data.datasets[0].data.shift();
    charts.monthlyTrends.update('none');
  }

  if (charts.userEngagement) {
    const lastValue = charts.userEngagement.data.datasets[0].data.slice(-1)[0];
    const newValue = lastValue + Math.floor(Math.random() * 50) - 25;
    charts.userEngagement.data.datasets[0].data.push(Math.max(0, newValue));
    charts.userEngagement.data.datasets[0].data.shift();
    charts.userEngagement.update('none');
  }
}

function initExportFeatures() {
  // Export chart as image
  document.querySelectorAll('.export-chart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chartId = e.target.dataset.chart;
      const chart = charts[chartId];
      if (chart) {
        const link = document.createElement('a');
        link.download = `${chartId}-chart.png`;
        link.href = chart.toBase64Image();
        link.click();
      }
    });
  });

  // Export data as CSV
  document.querySelectorAll('.export-data-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chartId = e.target.dataset.chart;
      const chart = charts[chartId];
      if (chart) {
        exportChartDataAsCSV(chart, chartId);
      }
    });
  });
}

function exportChartDataAsCSV(chart, chartId) {
  const data = chart.data;
  let csv = 'Label,' + data.datasets.map(ds => ds.label).join(',') + '\n';

  data.labels.forEach((label, index) => {
    csv += label + ',';
    data.datasets.forEach(dataset => {
      csv += dataset.data[index] + ',';
    });
    csv = csv.slice(0, -1) + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.download = `${chartId}-data.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

// Utility functions
export function updateChartTheme(isDark) {
  const textColor = isDark ? '#ffffff' : '#374151';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.options.plugins.legend.labels.color = textColor;
      chart.options.plugins.title.color = textColor;
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.update();
    }
  });
}

export function destroyCharts() {
  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.destroy();
    }
  });
  charts = {};

  if (updateInterval) {
    clearInterval(updateInterval);
  }
}

// Make functions globally available
window.updateChartTheme = updateChartTheme;
window.destroyCharts = destroyCharts;

document.addEventListener('DOMContentLoaded', initCharts);