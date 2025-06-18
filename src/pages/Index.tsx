
import { useState, useEffect } from 'react';
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
import { VideoInfo, VideoFormat, DownloadStatus } from '@/types';

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoInfo | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      api.cancelRequests();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid social media URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setDownloadStatus('processing');
    
    try {
      const videoInfo = await api.getVideoInfo(url);
      setVideoData(videoInfo);
      setDownloadStatus('idle');
      toast({
        title: "Video Info Retrieved",
        description: "Video information loaded successfully",
      });
    } catch (error) {
      console.error('Error getting video info:', error);
      setDownloadStatus('error');
      const message = error instanceof Error ? error.message : "Failed to get video information";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: VideoFormat) => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "No URL available for download",
        variant: "destructive"
      });
      return;
    }

    setDownloadStatus('downloading');
    
    try {
      await api.downloadVideo(url, format.quality);
      setDownloadStatus('completed');
      toast({
        title: "Download Complete!",
        description: `Video downloaded in ${format.quality} quality`,
      });
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      const message = error instanceof Error ? error.message : "Failed to download video";
      toast({
        title: "Download Failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  const resetDownload = () => {
    api.cancelRequests();
    setVideoData(null);
    setUrl('');
    setDownloadStatus('idle');
  };

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

          <StatusIndicator downloadStatus={downloadStatus} />

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
