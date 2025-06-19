
import { VideoInfo } from '@/types';
import { handleApiError, logError } from './errorHandler';
import { validateUrl, sanitizeInput } from './validation';
import { performanceMonitor } from './performance';
import { RequestCache } from './cache';
import { CoreAPIClient } from './apiClient';
import { DownloadManager } from './downloadManager';

class APIClient {
  private coreClient = new CoreAPIClient();
  private requestCache = new RequestCache();

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const sanitizedUrl = sanitizeInput(url);
    
    // Validate URL first
    const validation = validateUrl(sanitizedUrl);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check cache first
    const cacheKey = this.requestCache.getCacheKey('/api/video-info', { url: sanitizedUrl });
    const cached = this.requestCache.get<VideoInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    console.log('Fetching video info for:', sanitizedUrl);
    
    try {
      const data = await performanceMonitor.measureApiCall('video-info', () =>
        this.coreClient.makeRequest<VideoInfo>('/api/video-info', {
          method: 'POST',
          body: JSON.stringify({ url: sanitizedUrl }),
        })
      );
      
      // Cache successful response
      this.requestCache.set(cacheKey, data);
      
      console.log('Video info received:', data);
      return data;
    } catch (error) {
      logError('getVideoInfo', error, { url: sanitizedUrl });
      throw new Error(handleApiError(error));
    }
  }

  async downloadVideo(url: string, quality: string = 'best'): Promise<void> {
    const sanitizedUrl = sanitizeInput(url);
    
    // Validate URL first
    const validation = validateUrl(sanitizedUrl);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    console.log('Starting download:', { url: sanitizedUrl, quality });
    
    try {
      const startTime = performance.now();
      const response = await this.coreClient.makeDownloadRequest('/api/download', {
        method: 'POST',
        body: JSON.stringify({ url: sanitizedUrl, quality }),
      });

      // Get filename from response headers
      const filename = DownloadManager.extractFilename(response, quality);

      // Create blob and download
      const blob = await response.blob();
      DownloadManager.createDownloadLink(blob, filename);
      
      const duration = performance.now() - startTime;
      DownloadManager.logDownloadSuccess(filename, blob, duration, quality, sanitizedUrl);
      
    } catch (error) {
      logError('downloadVideo', error, { url: sanitizedUrl, quality });
      throw new Error(handleApiError(error));
    }
  }

  cancelRequests(): void {
    this.coreClient.cancelRequests();
  }

  clearCache(): void {
    this.requestCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return this.requestCache.getStats();
  }
}

export const api = new APIClient();

// Performance monitoring
if (typeof window !== 'undefined') {
  // Monitor memory usage periodically in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      performanceMonitor.logMemoryUsage();
    }, 30000); // Every 30 seconds
  }
}
