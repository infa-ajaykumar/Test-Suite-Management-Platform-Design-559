export const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const formatDuration = (startTime, endTime) => {
  if (!startTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = end - start;
  
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    running: 'blue',
    success: 'green',
    failure: 'red',
    error: 'red',
    cancelled: 'gray'
  };
  return colors[status] || 'gray';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const parseCronExpression = (expression) => {
  // Basic cron expression parser for display purposes
  const parts = expression.split(' ');
  if (parts.length !== 5) return 'Invalid cron expression';
  
  const [minute, hour, day, month, dayOfWeek] = parts;
  
  // Simple interpretations
  if (expression === '0 9 * * 1') return 'Every Monday at 9:00 AM';
  if (expression === '0 9 * * *') return 'Every day at 9:00 AM';
  if (expression === '0 9 * * 1-5') return 'Every weekday at 9:00 AM';
  if (expression === '0 0 1 * *') return 'First day of every month at midnight';
  if (expression === '0 */6 * * *') return 'Every 6 hours';
  if (expression === '0 0 * * 0') return 'Every Sunday at midnight';
  
  return expression;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};