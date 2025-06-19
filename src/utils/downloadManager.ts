
import { logError } from './errorHandler';

export class DownloadManager {
  static createDownloadLink(blob: Blob, filename: string): void {
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
  }

  static extractFilename(response: Response, quality: string): string {
    const contentDisposition = response.headers.get('Content-Disposition');
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch) {
        return filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Fallback filename based on quality
    const extension = quality.includes('Audio') ? 'mp3' : 'mp4';
    return `${quality.includes('Audio') ? 'audio' : 'video'}.${extension}`;
  }

  static logDownloadSuccess(filename: string, blob: Blob, duration: number, quality: string, url: string): void {
    console.log(`Download completed: ${filename} (${blob.size} bytes in ${Math.round(duration)}ms)`);
    
    logError('downloadSuccess', null, { 
      filename, 
      size: blob.size, 
      duration: Math.round(duration),
      quality,
      url 
    });
  }
}
