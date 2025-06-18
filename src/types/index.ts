
export interface VideoFormat {
  quality: string;
  format: string;
  size: string;
  ext: string;
  format_id?: string;
  is_premium?: boolean;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  platform: string;
  author: string;
  views: string;
  likes?: string;
  formats: VideoFormat[];
}

export type DownloadStatus = 'idle' | 'processing' | 'downloading' | 'completed' | 'error';

export interface APIError {
  message: string;
  detail?: string;
}
