// rewards.js - Advanced rewards and gamification system
let userData = {
  points: 0,
  level: 1,
  achievements: [],
  activities: [],
  streak: 0,
  totalRecycled: 0
};

const ACHIEVEMENTS = [
  { id: 'first_pickup', name: 'First Pickup', description: 'Complete your first e-waste pickup', points: 50, icon: 'fa-star', unlocked: false },
  { id: 'recycle_5', name: 'Eco Warrior', description: 'Recycle 5 items', points: 100, icon: 'fa-shield-alt', unlocked: false },
  { id: 'points_500', name: 'Point Collector', description: 'Earn 500 points', points: 200, icon: 'fa-trophy', unlocked: false },
  { id: 'streak_7', name: 'Consistent Recycler', description: 'Recycle for 7 days in a row', points: 150, icon: 'fa-fire', unlocked: false },
  { id: 'level_5', name: 'Eco Champion', description: 'Reach level 5', points: 300, icon: 'fa-crown', unlocked: false },
  { id: 'referral', name: 'Community Builder', description: 'Refer a friend who recycles', points: 250, icon: 'fa-users', unlocked: false }
];

const POINT_VALUES = {
  pickup: 25,
  referral: 50,
  review: 10,
  share: 5,
  daily_login: 5
};

export function initRewards() {
  loadUserData();
  initAchievements();
  initLeaderboard();
  initRewardRedemption();
  initSocialSharing();
  updateUI();
}

function loadUserData() {
  // Load from localStorage or simulate data
  const saved = localStorage.getItem('eZero_userData');
  if (saved) {
    userData = { ...userData, ...JSON.parse(saved) };
  } else {
    // Initialize with sample data
    userData = {
      points: 285,
      level: 3,
      achievements: ['first_pickup', 'recycle_5'],
      activities: [
        { type: 'pickup', description: 'Recycled laptop and monitor', points: 50, date: '2024-01-15', icon: 'fa-laptop' },
        { type: 'referral', description: 'Referred Sarah Johnson', points: 50, date: '2024-01-14', icon: 'fa-user-plus' },
        { type: 'review', description: 'Left a review for GreenTech Center', points: 10, date: '2024-01-13', icon: 'fa-star' },
        { type: 'share', description: 'Shared recycling tips on social media', points: 5, date: '2024-01-12', icon: 'fa-share' },
        { type: 'daily_login', description: 'Daily login bonus', points: 5, date: '2024-01-11', icon: 'fa-calendar-check' }
      ],
      streak: 3,
      totalRecycled: 8
    };
    saveUserData();
  }
}

function saveUserData() {
  localStorage.setItem('eZero_userData', JSON.stringify(userData));
}

function initAchievements() {
  checkAchievements();
  displayAchievements();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(achievement => {
    if (!userData.achievements.includes(achievement.id)) {
      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_pickup':
          shouldUnlock = userData.activities.some(a => a.type === 'pickup');
          break;
        case 'recycle_5':
          shouldUnlock = userData.totalRecycled >= 5;
          break;
        case 'points_500':
          shouldUnlock = userData.points >= 500;
          break;
        case 'streak_7':
          shouldUnlock = userData.streak >= 7;
          break;
        case 'level_5':
          shouldUnlock = userData.level >= 5;
          break;
        case 'referral':
          shouldUnlock = userData.activities.some(a => a.type === 'referral');
          break;
      }

      if (shouldUnlock) {
        unlockAchievement(achievement.id);
      }
    }
  });
}

function unlockAchievement(achievementId) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (achievement && !userData.achievements.includes(achievementId)) {
    userData.achievements.push(achievementId);
    userData.points += achievement.points;
    saveUserData();

    // Show achievement notification
    showAchievementNotification(achievement);

    // Update UI
    updateUI();
  }
}

function showAchievementNotification(achievement) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-500';
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
        <i class="fas ${achievement.icon} text-2xl"></i>
      </div>
      <div>
        <h4 class="font-bold">Achievement Unlocked!</h4>
        <p class="text-sm">${achievement.name}</p>
        <p class="text-xs opacity-90">+${achievement.points} points</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 5000);
}

function displayAchievements() {
  const achievementsGrid = document.getElementById('achievements-grid');
  if (!achievementsGrid) return;

  achievementsGrid.innerHTML = '';

  ACHIEVEMENTS.forEach(achievement => {
    const isUnlocked = userData.achievements.includes(achievement.id);
    const achievementCard = document.createElement('div');
    achievementCard.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'} p-4 rounded-lg border-2 transition-all duration-300`;

    achievementCard.innerHTML = `
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-3 rounded-full ${isUnlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center">
          <i class="fas ${achievement.icon} text-2xl"></i>
        </div>
        <h4 class="font-semibold text-sm mb-1">${achievement.name}</h4>
        <p class="text-xs text-gray-600 mb-2">${achievement.description}</p>
        <div class="text-xs font-medium ${isUnlocked ? 'text-green-600' : 'text-gray-400'}">
          ${achievement.points} points
        </div>
        ${isUnlocked ? '<div class="text-xs text-green-600 mt-1"><i class="fas fa-check-circle mr-1"></i>Unlocked</div>' : ''}
      </div>
    `;

    achievementsGrid.appendChild(achievementCard);
  });
}

function initLeaderboard() {
  // Simulate leaderboard data
  const leaderboardData = [
    { name: 'You', points: userData.points, level: userData.level, rank: 3 },
    { name: 'Priya Sharma', points: 450, level: 4, rank: 1 },
    { name: 'Rahul Verma', points: 380, level: 3, rank: 2 },
    { name: 'Anita Patel', points: 220, level: 2, rank: 4 },
    { name: 'Vikram Singh', points: 180, level: 2, rank: 5 }
  ];

  displayLeaderboard(leaderboardData);
}

function displayLeaderboard(data) {
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) return;

  leaderboardList.innerHTML = '';

  data.forEach((user, index) => {
    const isCurrentUser = user.name === 'You';
    const rankIcon = index === 0 ? 'fa-crown text-yellow-500' :
                    index === 1 ? 'fa-medal text-gray-400' :
                    index === 2 ? 'fa-award text-amber-600' : 'fa-trophy text-gray-300';

    const listItem = document.createElement('div');
    listItem.className = `flex items-center justify-between p-3 rounded-lg ${isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-white'} shadow-sm`;

    listItem.innerHTML = `
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-200'} flex items-center justify-center mr-3">
          <i class="fas ${rankIcon} text-white text-sm"></i>
        </div>
        <div>
          <div class="font-medium ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}">${user.name}</div>
          <div class="text-sm text-gray-500">Level ${user.level}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-bold text-gray-900">${user.points}</div>
        <div class="text-sm text-gray-500">points</div>
      </div>
    `;

    leaderboardList.appendChild(listItem);
  });
}

function initRewardRedemption() {
  const redeemButtons = document.querySelectorAll('.redeem-btn');
  redeemButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const rewardId = e.target.closest('.reward-item').dataset.reward;
      const cost = parseInt(e.target.dataset.cost);

      if (userData.points >= cost) {
        redeemReward(rewardId, cost);
      } else {
        showNotification('Not enough points to redeem this reward.', 'error');
      }
    });
  });
}

function redeemReward(rewardId, cost) {
  userData.points -= cost;

  // Add to activity log
  const activity = {
    type: 'redemption',
    description: `Redeemed ${rewardId.replace('_', ' ')}`,
    points: -cost,
    date: new Date().toISOString().split('T')[0],
    icon: 'fa-gift'
  };

  userData.activities.unshift(activity);
  saveUserData();
  updateUI();

  showNotification(`Successfully redeemed ${rewardId.replace('_', ' ')}!`, 'success');
}

function initSocialSharing() {
  const shareButtons = document.querySelectorAll('.share-btn');
  shareButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const platform = e.target.dataset.platform;
      const text = `I just recycled e-waste and earned ${userData.points} points with E-Zero! Join me in making a difference for our planet. 🌱♻️ #EWaste #Sustainability`;
      const url = window.location.href;

      shareOnSocialMedia(platform, text, url);
      earnPoints('share');
    });
  });
}

function shareOnSocialMedia(platform, text, url) {
  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}

// Utility functions
export function earnPoints(activityType, description = '', extraData = {}) {
  const points = POINT_VALUES[activityType] || 0;
  if (points > 0) {
    userData.points += points;

    const activity = {
      type: activityType,
      description: description || getActivityDescription(activityType),
      points: points,
      date: new Date().toISOString().split('T')[0],
      icon: getActivityIcon(activityType),
      ...extraData
    };

    userData.activities.unshift(activity);

    // Update stats
    if (activityType === 'pickup') {
      userData.totalRecycled += 1;
    }

    // Check level up
    checkLevelUp();

    saveUserData();
    updateUI();

    showNotification(`Earned ${points} points!`, 'success');
  }
}

function getActivityDescription(type) {
  const descriptions = {
    pickup: 'Completed e-waste pickup',
    referral: 'Referred a friend',
    review: 'Left a review',
    share: 'Shared on social media',
    daily_login: 'Daily login bonus'
  };
  return descriptions[type] || 'Activity completed';
}

function getActivityIcon(type) {
  const icons = {
    pickup: 'fa-recycle',
    referral: 'fa-user-plus',
    review: 'fa-star',
    share: 'fa-share',
    daily_login: 'fa-calendar-check',
    redemption: 'fa-gift'
  };
  return icons[type] || 'fa-check';
}

function checkLevelUp() {
  const newLevel = Math.floor(userData.points / 100) + 1;
  if (newLevel > userData.level) {
    userData.level = newLevel;
    showLevelUpNotification(newLevel);
  }
}

function showLevelUpNotification(level) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-500';
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
        <i class="fas fa-level-up-alt text-2xl"></i>
      </div>
      <div>
        <h4 class="font-bold">Level Up!</h4>
        <p class="text-sm">Congratulations! You reached level ${level}</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 5000);
}

function updateUI() {
  // Update points balance
  const pointsElement = document.getElementById('points-balance');
  if (pointsElement) {
    animateCounter(pointsElement, userData.points);
  }

  // Update level
  const levelElement = document.getElementById('user-level');
  if (levelElement) {
    levelElement.textContent = userData.level;
  }

  // Update progress bar
  const progressBar = document.getElementById('level-progress');
  if (progressBar) {
    const progress = (userData.points % 100);
    progressBar.style.width = `${progress}%`;
  }

  // Update streak
  const streakElement = document.getElementById('streak-count');
  if (streakElement) {
    streakElement.textContent = userData.streak;
  }

  // Update activity log
  displayActivityLog();

  // Update achievements
  displayAchievements();
}

function animateCounter(element, target) {
  const current = parseInt(element.textContent) || 0;
  const increment = target > current ? 1 : -1;
  const timer = setInterval(() => {
    const newValue = parseInt(element.textContent) + increment;
    element.textContent = newValue;

    if ((increment > 0 && newValue >= target) || (increment < 0 && newValue <= target)) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, 20);
}

function displayActivityLog() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;

  activityList.innerHTML = '';

  userData.activities.slice(0, 10).forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0';

    activityItem.innerHTML = `
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <i class="fas ${activity.icon} text-blue-600"></i>
        </div>
        <div>
          <div class="font-medium text-gray-900">${activity.description}</div>
          <div class="text-sm text-gray-500">${formatDate(activity.date)}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-bold ${activity.points > 0 ? 'text-green-600' : 'text-red-600'}">
          ${activity.points > 0 ? '+' : ''}${activity.points}
        </div>
        <div class="text-sm text-gray-500">points</div>
      </div>
    `;

    activityList.appendChild(activityItem);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
}

// Make functions globally available
window.earnPoints = earnPoints;

document.addEventListener('DOMContentLoaded', initRewards);