
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  async getVideoInfo(url) {
    console.log('Fetching video info for:', url);
    const response = await fetch(`${API_BASE_URL}/api/video-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get video info');
    }

    const data = await response.json();
    console.log('Video info received:', data);
    return data;
  },

  async downloadVideo(url, quality = 'best') {
    console.log('Starting download:', { url, quality });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, quality }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to download video');
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
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      console.log('Download completed:', filename);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};
