/**
 * GCP 모듈 진입점
 * Google Cloud Platform 관련 기능을 여기서 export
 */

// Cloud Storage
export {
  uploadToGCS,
  uploadMultipleToGCS,
  getGCSUrl,
  deleteFromGCS,
  getResizedImageUrl,
  getMimeType,
  validateFileSize,
  isImageFile,
  validateFileExtension,
} from './storage';

// Monitoring & Logging
export {
  logToGCP,
  trackPerformance,
  trackEvent,
  trackError,
  trackApiCall,
  trackPageView,
  trackUserAction,
  trackSessionStart,
  trackSessionEnd,
} from './monitoring';
