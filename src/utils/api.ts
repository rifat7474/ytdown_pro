
import { VideoInfo, APIError } from '@/types';
import { handleApiError, logError } from './errorHandler';
import { validateUrl, sanitizeInput } from './validation';
import { performanceMonitor } from './performance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIClient {
  private abortController: AbortController | null = null;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached result for:', key);
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() });
    
    // Clean old cache entries
    const now = Date.now();
    for (const [cacheKey, entry] of this.requestCache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.requestCache.delete(cacheKey);
      }
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Cancel previous request if exists
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();
    const timeoutId = setTimeout(() => this.abortController?.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: this.abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SocialMediaDownloader/1.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.detail || error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    const sanitizedUrl = sanitizeInput(url);
    
    // Validate URL first
    const validation = validateUrl(sanitizedUrl);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check cache first
    const cacheKey = this.getCacheKey('/api/video-info', { url: sanitizedUrl });
    const cached = this.getFromCache<VideoInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    console.log('Fetching video info for:', sanitizedUrl);
    
    try {
      const data = await performanceMonitor.measureApiCall('video-info', () =>
        this.makeRequest<VideoInfo>('/api/video-info', {
          method: 'POST',
          body: JSON.stringify({ url: sanitizedUrl }),
        })
      );
      
      // Cache successful response
      this.setCache(cacheKey, data);
      
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
      // Cancel previous request if exists
      if (this.abortController) {
        this.abortController.abort();
      }

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 300000); // 5 min timeout

      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SocialMediaDownloader/1.0',
        },
        body: JSON.stringify({ url: sanitizedUrl, quality }),
        signal: this.abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: APIError = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.detail || error.message || 'Download failed');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        // Fallback filename based on quality
        const extension = quality.includes('Audio') ? 'mp3' : 'mp4';
        filename = `${quality.includes('Audio') ? 'audio' : 'video'}.${extension}`;
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 1000);
      
      const duration = performance.now() - startTime;
      console.log(`Download completed: ${filename} (${blob.size} bytes in ${Math.round(duration)}ms)`);
      
      // Log successful download
      logError('downloadSuccess', null, { 
        filename, 
        size: blob.size, 
        duration: Math.round(duration),
        quality,
        url: sanitizedUrl 
      });
      
    } catch (error) {
      logError('downloadVideo', error, { url: sanitizedUrl, quality });
      throw new Error(handleApiError(error));
    }
  }

  cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  clearCache(): void {
    this.requestCache.clear();
    console.log('API cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.requestCache.size,
      keys: Array.from(this.requestCache.keys())
    };
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
