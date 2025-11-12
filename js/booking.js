// booking.js - Advanced multi-step booking form handling
export function initBooking() {
  const bookingForm = document.getElementById('booking-form');
  const steps = document.querySelectorAll('.booking-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const nextBtns = document.querySelectorAll('.next-step');
  const prevBtns = document.querySelectorAll('.prev-step');
  const submitBtn = document.getElementById('submit-booking');

  let currentStep = 1;
  const totalSteps = steps.length;

  // Initialize form
  showStep(currentStep);
  updateProgress();

  // Next step buttons
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
        updateProgress();
      }
    });
  });

  // Previous step buttons
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep--;
      showStep(currentStep);
      updateProgress();
    });
  });

  // Form submission
  bookingForm.addEventListener('submit', handleBookingSubmit);

  // File upload handling
  initFileUpload();

  // Date/time picker
  initDateTimePicker();

  // Item type selection
  initItemTypeSelection();
}

function showStep(stepNumber) {
  const steps = document.querySelectorAll('.booking-step');
  const stepIndicators = document.querySelectorAll('.step-indicator');

  steps.forEach(step => step.classList.add('hidden'));
  stepIndicators.forEach(indicator => indicator.classList.remove('active'));

  document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
  document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');

  // Update navigation buttons
  updateNavigationButtons(stepNumber);
}

function updateProgress() {
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressBar = document.getElementById('progress-bar');
  const currentStep = parseInt(document.querySelector('.step-indicator.active').dataset.step);
  const progress = (currentStep / progressSteps.length) * 100;

  progressBar.style.width = `${progress}%`;

  progressSteps.forEach((step, index) => {
    if (index < currentStep - 1) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (index === currentStep - 1) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

function updateNavigationButtons(stepNumber) {
  const totalSteps = document.querySelectorAll('.booking-step').length;
  const prevBtn = document.querySelector('.prev-step');
  const nextBtn = document.querySelector('.next-step');
  const submitBtn = document.getElementById('submit-booking');

  if (prevBtn) {
    prevBtn.style.display = stepNumber === 1 ? 'none' : 'block';
  }

  if (nextBtn) {
    nextBtn.style.display = stepNumber === totalSteps ? 'none' : 'block';
  }

  if (submitBtn) {
    submitBtn.style.display = stepNumber === totalSteps ? 'block' : 'none';
  }
}

function validateStep(stepNumber) {
  const step = document.getElementById(`step-${stepNumber}`);
  const requiredFields = step.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      showFieldError(field, 'This field is required');
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });

  // Step-specific validation
  switch (stepNumber) {
    case 1:
      isValid = validateContactInfo() && isValid;
      break;
    case 2:
      isValid = validateItemDetails() && isValid;
      break;
    case 3:
      isValid = validateSchedule() && isValid;
      break;
  }

  return isValid;
}

function validateContactInfo() {
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  let isValid = true;

  // Name validation
  if (name.value.trim().length < 2) {
    showFieldError(name, 'Name must be at least 2 characters');
    isValid = false;
  }

  // Phone validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.value.replace(/[\s\-\(\)]/g, ''))) {
    showFieldError(phone, 'Please enter a valid phone number');
    isValid = false;
  }

  // Address validation
  if (address.value.trim().length < 10) {
    showFieldError(address, 'Please provide a complete address');
    isValid = false;
  }

  return isValid;
}

function validateItemDetails() {
  const itemType = document.getElementById('item-type');
  const photos = document.getElementById('photos');
  let isValid = true;

  if (!itemType.value) {
    showFieldError(itemType, 'Please select an item type');
    isValid = false;
  }

  if (photos.files.length === 0) {
    showFieldError(photos, 'Please upload at least one photo');
    isValid = false;
  } else if (photos.files.length > 5) {
    showFieldError(photos, 'Maximum 5 photos allowed');
    isValid = false;
  }

  return isValid;
}

function validateSchedule() {
  const datetime = document.getElementById('datetime');
  let isValid = true;

  const selectedDate = new Date(datetime.value);
  const now = new Date();
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  if (selectedDate < minDate) {
    showFieldError(datetime, 'Please select a date at least 24 hours from now');
    isValid = false;
  }

  return isValid;
}

function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('border-red-500');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'text-red-500 text-sm mt-1 error-message';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.classList.remove('border-red-500');
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

function initFileUpload() {
  const fileInput = document.getElementById('photos');
  const fileList = document.getElementById('file-list');
  const uploadArea = document.getElementById('upload-area');

  fileInput.addEventListener('change', handleFileSelect);
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('drop', handleFileDrop);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    displayFiles(files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('border-blue-500', 'bg-blue-50');
  }

  function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
    const files = Array.from(e.dataTransfer.files);
    displayFiles(files);
  }

  function displayFiles(files) {
    fileList.innerHTML = '';
    files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'flex items-center justify-between bg-gray-50 p-2 rounded';
      fileItem.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-file-image text-blue-500 mr-2"></i>
          <span class="text-sm">${file.name}</span>
          <span class="text-xs text-gray-500 ml-2">(${formatFileSize(file.size)})</span>
        </div>
        <button type="button" class="text-red-500 hover:text-red-700" onclick="removeFile(${index})">
          <i class="fas fa-times"></i>
        </button>
      `;
      fileList.appendChild(fileItem);
    });
  }

  window.removeFile = function(index) {
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    displayFiles(Array.from(fileInput.files));
  };
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initDateTimePicker() {
  const datetimeInput = document.getElementById('datetime');

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  datetimeInput.min = tomorrow.toISOString().slice(0, 16);

  // Set maximum date to 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  datetimeInput.max = maxDate.toISOString().slice(0, 16);
}

function initItemTypeSelection() {
  const itemTypeSelect = document.getElementById('item-type');
  const customItemType = document.getElementById('custom-item-type');

  itemTypeSelect.addEventListener('change', () => {
    if (itemTypeSelect.value === 'other') {
      customItemType.classList.remove('hidden');
      customItemType.required = true;
    } else {
      customItemType.classList.add('hidden');
      customItemType.required = false;
    }
  });
}

async function handleBookingSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-booking');
  const originalText = submitBtn.innerHTML;

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

  try {
    const formData = new FormData(e.target);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Show success message
    showBookingSuccess();

    // Reset form
    e.target.reset();
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('custom-item-type').classList.add('hidden');

    // Reset to first step
    showStep(1);
    updateProgress();

  } catch (error) {
    console.error('Booking submission failed:', error);
    showNotification('Booking submission failed. Please try again.', 'error');
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function showBookingSuccess() {
  // Create success modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-check-circle text-green-500 text-2xl"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p class="text-gray-600 mb-6">Your e-waste pickup has been scheduled successfully. We'll send you a confirmation SMS and email shortly.</p>
        <button onclick="this.closest('.fixed').remove()" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
          Continue
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', initBooking);