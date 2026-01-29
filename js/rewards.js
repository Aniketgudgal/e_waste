/**
 * E-Zero - Rewards Module
 * Handles rewards display and redemption
 */

// ============================================
// STATE
// ============================================
const rewardsState = {
  userPoints: 2450,
  userLevel: 7,
  levelName: 'Eco Warrior',
  pointsToNextLevel: 550,
  history: []
};

// ============================================
// REWARDS DATA
// ============================================
const rewards = [
  {
    id: 1,
    title: '₹100 Amazon Voucher',
    description: 'Redeem your points for Amazon gift card balance.',
    points: 500,
    icon: '🎁',
    category: 'voucher',
    available: true
  },
  {
    id: 2,
    title: 'Starbucks Gift Card',
    description: 'Enjoy a free coffee on us as a thank you.',
    points: 300,
    icon: '☕',
    category: 'food',
    available: true
  },
  {
    id: 3,
    title: 'Plant a Tree',
    description: "We'll plant a tree in your name to offset carbon.",
    points: 200,
    icon: '🌳',
    category: 'eco',
    available: true
  },
  {
    id: 4,
    title: 'Mobile Recharge',
    description: 'Get ₹50 mobile recharge for any network.',
    points: 250,
    icon: '📱',
    category: 'voucher',
    available: true
  },
  {
    id: 5,
    title: 'Movie Ticket',
    description: 'Free movie ticket at select theaters.',
    points: 400,
    icon: '🎬',
    category: 'entertainment',
    available: true
  },
  {
    id: 6,
    title: 'Eco Badge',
    description: 'Exclusive digital badge for your profile.',
    points: 100,
    icon: '🏅',
    category: 'badge',
    available: true
  }
];

// Level progression data
const levels = [
  { level: 1, name: 'Beginner', minPoints: 0 },
  { level: 2, name: 'Starter', minPoints: 200 },
  { level: 3, name: 'Recycler', minPoints: 500 },
  { level: 4, name: 'Eco Friend', minPoints: 1000 },
  { level: 5, name: 'Green Champion', minPoints: 1500 },
  { level: 6, name: 'Planet Protector', minPoints: 2000 },
  { level: 7, name: 'Eco Warrior', minPoints: 2500 },
  { level: 8, name: 'Earth Guardian', minPoints: 3000 },
  { level: 9, name: 'Climate Hero', minPoints: 4000 },
  { level: 10, name: 'Eco Legend', minPoints: 5000 }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initRewards();
});

function initRewards() {
  updatePointsDisplay();
  setupRewardButtons();
  
  console.log('🎁 Rewards module initialized');
}

// ============================================
// POINTS DISPLAY
// ============================================
function updatePointsDisplay() {
  const pointsElement = document.getElementById('user-points');
  if (pointsElement) {
    pointsElement.textContent = rewardsState.userPoints.toLocaleString();
  }
  
  // Update level progress
  updateLevelProgress();
}

function updateLevelProgress() {
  const currentLevel = levels.find(l => l.level === rewardsState.userLevel);
  const nextLevel = levels.find(l => l.level === rewardsState.userLevel + 1);
  
  if (!currentLevel || !nextLevel) return;
  
  const pointsInLevel = rewardsState.userPoints - currentLevel.minPoints;
  const pointsForLevel = nextLevel.minPoints - currentLevel.minPoints;
  const progress = (pointsInLevel / pointsForLevel) * 100;
  
  const levelFill = document.querySelector('.level-fill');
  if (levelFill) {
    levelFill.style.width = `${Math.min(progress, 100)}%`;
  }
  
  const levelText = document.querySelector('.level-text');
  if (levelText) {
    levelText.innerHTML = `
      <span>Level ${currentLevel.level}: ${currentLevel.name}</span>
      <span>${nextLevel.minPoints - rewardsState.userPoints} pts to Level ${nextLevel.level}</span>
    `;
  }
}

// ============================================
// REWARD REDEMPTION
// ============================================
function setupRewardButtons() {
  const rewardCards = document.querySelectorAll('.reward-card');
  
  rewardCards.forEach((card, index) => {
    const redeemBtn = card.querySelector('.btn');
    if (!redeemBtn) return;
    
    const reward = rewards[index];
    if (!reward) return;
    
    // Update button state based on points
    updateRedeemButton(redeemBtn, reward);
    
    redeemBtn.addEventListener('click', (e) => {
      e.preventDefault();
      redeemReward(reward, redeemBtn);
    });
  });
}

function updateRedeemButton(btn, reward) {
  if (rewardsState.userPoints < reward.points) {
    btn.disabled = true;
    btn.textContent = 'Not Enough Points';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    btn.style.opacity = '0.5';
  }
}

async function redeemReward(reward, btn) {
  // Check if enough points
  if (rewardsState.userPoints < reward.points) {
    showRewardsNotification(`You need ${reward.points - rewardsState.userPoints} more points`, 'warning');
    return;
  }
  
  // Confirm redemption
  const confirmed = await showConfirmDialog(
    `Redeem ${reward.title}?`,
    `This will use ${reward.points} points from your balance.`
  );
  
  if (!confirmed) return;
  
  // Show loading
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btn.disabled = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Deduct points
    rewardsState.userPoints -= reward.points;
    updatePointsDisplay();
    
    // Add to history
    rewardsState.history.push({
      reward: reward,
      redeemedAt: new Date().toISOString()
    });
    
    // Show success
    showRewardsNotification(`${reward.title} redeemed successfully!`, 'success');
    
    // Update button
    btn.innerHTML = '<i class="fas fa-check"></i> Redeemed';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    
  } catch (error) {
    console.error('Redemption failed:', error);
    showRewardsNotification('Redemption failed. Please try again.', 'error');
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ============================================
// POINTS EARNING
// ============================================
function addPoints(amount, reason) {
  rewardsState.userPoints += amount;
  
  // Check for level up
  const newLevel = levels.filter(l => rewardsState.userPoints >= l.minPoints).pop();
  if (newLevel && newLevel.level > rewardsState.userLevel) {
    rewardsState.userLevel = newLevel.level;
    rewardsState.levelName = newLevel.name;
    
    showRewardsNotification(`🎉 Level Up! You're now a ${newLevel.name}!`, 'success');
  }
  
  updatePointsDisplay();
  
  // Show points earned notification
  showRewardsNotification(`+${amount} points earned for ${reason}!`, 'success');
}

// ============================================
// UI HELPERS
// ============================================
function showRewardsNotification(message, type = 'info') {
  // Use global notification if available
  if (window.EZero?.utils?.showNotification) {
    window.EZero.utils.showNotification(message, type);
    return;
  }
  
  // Fallback
  console.log(`[${type}] ${message}`);
}

function showConfirmDialog(title, message) {
  return new Promise((resolve) => {
    // Simple confirm for now
    const confirmed = window.confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
}

// ============================================
// ANIMATIONS
// ============================================
function animatePointsChange(element, from, to) {
  const duration = 1000;
  const start = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const current = Math.floor(from + (to - from) * easeProgress);
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}

// ============================================
// GLOBAL ACCESS
// ============================================
window.EZeroRewards = {
  getPoints: () => rewardsState.userPoints,
  getLevel: () => rewardsState.userLevel,
  addPoints: addPoints,
  redeemReward: redeemReward
};

// ============================================
// EXPORTS
// ============================================
export { 
  rewardsState, 
  rewards, 
  levels, 
  addPoints, 
  updatePointsDisplay 
};