
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/VideoCard';
import { DownloadOptions } from '@/components/DownloadOptions';
import { HeroSection } from '@/components/HeroSection';
import { URLInputForm } from '@/components/URLInputForm';
import { StatusIndicator } from '@/components/StatusIndicator';
import { FeaturesSection } from '@/components/FeaturesSection';
import { Footer } from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { api } from '@/utils/api';
import { logError, handleApiError } from '@/utils/errorHandler';
import { validateUrl } from '@/utils/validation';
import { performanceMonitor } from '@/utils/performance';
import { VideoInfo, VideoFormat, DownloadStatus } from '@/types';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoInfo | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      api.cancelRequests();
      performanceMonitor.logMemoryUsage();
    };
  }, []);

  // Reset retry count when URL changes
  useEffect(() => {
    setRetryCount(0);
  }, [url]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a valid social media URL",
        variant: "destructive"
      });
      return;
    }

    // Validate URL before making API call
    const validation = validateUrl(trimmedUrl);
    if (!validation.isValid) {
      toast({
        title: "Invalid URL",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setDownloadStatus('processing');
    
    try {
      performanceMonitor.startTimer('video-info-fetch');
      const videoInfo = await api.getVideoInfo(trimmedUrl);
      performanceMonitor.endTimer('video-info-fetch');
      
      setVideoData(videoInfo);
      setDownloadStatus('idle');
      setRetryCount(0);
      
      toast({
        title: "Success!",
        description: `Video information loaded for ${validation.platform}`,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      logError('handleSubmit', error, { url: trimmedUrl, retryCount });
      
      setDownloadStatus('error');
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, retryCount]);

  const handleDownload = useCallback(async (format: VideoFormat) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast({
        title: "Error",
        description: "No URL available for download",
        variant: "destructive"
      });
      return;
    }

    setDownloadStatus('downloading');
    
    try {
      performanceMonitor.startTimer('video-download');
      await api.downloadVideo(trimmedUrl, format.quality);
      performanceMonitor.endTimer('video-download');
      
      setDownloadStatus('completed');
      toast({
        title: "Download Complete!",
        description: `Video downloaded successfully in ${format.quality} quality`,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      logError('handleDownload', error, { 
        url: trimmedUrl, 
        quality: format.quality,
        format: format.format 
      });
      
      setDownloadStatus('error');
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [url]);

  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      toast({
        title: "Too Many Retries",
        description: "Please check the URL and try again later",
        variant: "destructive"
      });
    }
  }, [retryCount, handleSubmit]);

  const resetDownload = useCallback(() => {
    api.cancelRequests();
    setVideoData(null);
    setUrl('');
    setDownloadStatus('idle');
    setRetryCount(0);
    
    // Clear cache periodically
    if (Math.random() < 0.1) { // 10% chance
      api.clearCache();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <HeroSection />

        <main className="max-w-5xl mx-auto">
          <URLInputForm 
            url={url}
            setUrl={setUrl}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <StatusIndicator 
            downloadStatus={downloadStatus} 
            onRetry={downloadStatus === 'error' && retryCount < 3 ? handleRetry : undefined}
          />

          {/* Video Preview and Download Options */}
          {videoData && (
            <section className="grid lg:grid-cols-2 gap-8 mb-12" aria-label="Video preview and download options">
              <VideoCard data={videoData} />
              <DownloadOptions 
                formats={videoData.formats} 
                onDownload={handleDownload}
                downloadStatus={downloadStatus}
              />
            </section>
          )}

          {/* Reset Button */}
          {videoData && downloadStatus === 'completed' && (
            <div className="text-center mb-16">
              <Button 
                onClick={resetDownload}
                variant="outline"
                className="px-12 py-4 text-lg rounded-2xl border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300"
              >
                Download Another Video
              </Button>
            </div>
          )}
        </main>

        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
