
import { useState } from 'react';
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

const Index = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('idle');

  const handleSubmit = async (e) => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to get video information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format) => {
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
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download video",
        variant: "destructive"
      });
    }
  };

  const resetDownload = () => {
    setVideoData(null);
    setUrl('');
    setDownloadStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <HeroSection />

        <div className="max-w-5xl mx-auto">
          <URLInputForm 
            url={url}
            setUrl={setUrl}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <StatusIndicator downloadStatus={downloadStatus} />

          {/* Video Preview and Download Options */}
          {videoData && (
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <VideoCard data={videoData} />
              <DownloadOptions 
                formats={videoData.formats} 
                onDownload={handleDownload}
                downloadStatus={downloadStatus}
              />
            </div>
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
        </div>

        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
