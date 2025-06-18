
import { VideoInfo, APIError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIClient {
  private abortController: AbortController | null = null;

  private async makeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Cancel previous request if exists
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();
    const timeoutId = setTimeout(() => this.abortController?.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: this.abortController.signal,
        headers: {
          'Content-Type': 'application/json',
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
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled or timed out');
        }
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    console.log('Fetching video info for:', url);
    
    if (!url || !url.trim()) {
      throw new Error('URL is required');
    }

    try {
      const data = await this.makeRequest<VideoInfo>('/api/video-info', {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() }),
      });
      
      console.log('Video info received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching video info:', error);
      throw error;
    }
  }

  async downloadVideo(url: string, quality: string = 'best'): Promise<void> {
    console.log('Starting download:', { url, quality });
    
    if (!url || !url.trim()) {
      throw new Error('URL is required');
    }

    try {
      // Cancel previous request if exists
      if (this.abortController) {
        this.abortController.abort();
      }

      this.abortController = new AbortController();
      const timeoutId = setTimeout(() => this.abortController?.abort(), 300000); // 5 min timeout

      const response = await fetch(`${API_BASE_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim(), quality }),
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
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
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
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      console.log('Download completed:', filename);
    } catch (error) {
      console.error('Download error:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Download was cancelled or timed out');
        }
        throw error;
      }
      throw new Error('Download failed');
    }
  }

  cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const api = new APIClient();
