
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileVideo, Music, HardDrive, Sparkles } from 'lucide-react';
import { VideoFormat, DownloadStatus } from '@/types';

interface DownloadOptionsProps {
  formats: VideoFormat[];
  onDownload: (format: VideoFormat) => void;
  downloadStatus: DownloadStatus;
}

export const DownloadOptions = ({ formats, onDownload, downloadStatus }: DownloadOptionsProps) => {
  const getIcon = (format: VideoFormat) => {
    if (format.format === 'MP3') return <Music className="w-5 h-5" aria-hidden="true" />;
    return <FileVideo className="w-5 h-5" aria-hidden="true" />;
  };

  const getQualityColor = (quality: string) => {
    if (quality.includes('1080p') || quality.includes('4K')) return 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200';
    if (quality.includes('720p')) return 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200';
    if (quality.includes('480p')) return 'text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200';
    return 'text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200';
  };

  const isPremiumQuality = (quality: string) => {
    return quality.includes('1080p') || quality.includes('4K');
  };

  const isDownloading = downloadStatus === 'downloading';

  return (
    <Card className="p-8 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
        <h3 className="text-2xl font-bold text-gray-800">Download Options</h3>
      </div>
      
      <div className="space-y-4" role="list">
        {formats.map((format, index) => (
          <div 
            key={index}
            className="relative p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-200 transition-all duration-300 group hover:shadow-lg bg-white/50 backdrop-blur-sm"
            role="listitem"
          >
            {isPremiumQuality(format.quality) && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Premium
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                  {getIcon(format)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-800 text-lg">{format.quality}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getQualityColor(format.quality)}`}>
                      {format.format}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <HardDrive className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium" title={`File size: ${format.size}`}>{format.size}</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => onDownload(format)}
                disabled={isDownloading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50"
                aria-label={`Download ${format.quality} ${format.format}`}
              >
                {isDownloading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Downloading...
                  </div>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-3 h-3 text-white" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-bold text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 leading-relaxed">
              Higher quality videos provide the best viewing experience. 4K and 1080p options offer crystal clear resolution perfect for any screen size.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
