
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessages = {
  INVALID_URL: 'Please enter a valid social media URL',
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection',
  TIMEOUT: 'Request timed out. Please try again',
  DOWNLOAD_FAILED: 'Download failed. Please try again',
  VIDEO_INFO_FAILED: 'Failed to retrieve video information',
  UNSUPPORTED_PLATFORM: 'This platform is not supported',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again',
  SERVER_ERROR: 'Server error occurred. Please try again later'
};

export const handleApiError = (error: unknown): string => {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return errorMessages.TIMEOUT;
    }
    
    if (error.message.includes('rate limit')) {
      return errorMessages.RATE_LIMITED;
    }
    
    if (error.message.includes('Invalid or unsupported URL')) {
      return errorMessages.UNSUPPORTED_PLATFORM;
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return errorMessages.NETWORK_ERROR;
    }
    
    return error.message;
  }
  
  return errorMessages.SERVER_ERROR;
};

export const logError = (context: string, error: unknown, additionalData?: Record<string, any>) => {
  const errorInfo = {
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...additionalData
  };
  
  console.error(`[${context}]`, errorInfo);
  
  // In production, you could send this to an error tracking service
  // Example: sendToErrorTracker(errorInfo);
};
