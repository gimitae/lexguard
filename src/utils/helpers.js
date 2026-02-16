import { FILE_CONFIG, ERROR_MESSAGES } from '../constants';

/**
 * Validate uploaded file
 * @param {File} file - File object to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: ERROR_MESSAGES.NO_FILE_SELECTED };
  }

  // Check file size
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const isValidType = FILE_CONFIG.ALLOWED_TYPES.includes(file.type) || 
                      FILE_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension);

  if (!isValidType) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }

  return { isValid: true, error: null };
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date to localized string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};