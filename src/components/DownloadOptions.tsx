
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileVideo, Music, HardDrive } from 'lucide-react';

interface Format {
  quality: string;
  format: string;
  size: string;
}

interface DownloadOptionsProps {
  formats: Format[];
  onDownload: (format: Format) => void;
  downloadStatus: string;
}

export const DownloadOptions = ({ formats, onDownload, downloadStatus }: DownloadOptionsProps) => {
  const getIcon = (format: Format) => {
    if (format.format === 'MP3') return <Music className="w-4 h-4" />;
    return <FileVideo className="w-4 h-4" />;
  };

  const getQualityColor = (quality: string) => {
    if (quality.includes('1080p')) return 'text-green-600 bg-green-50';
    if (quality.includes('720p')) return 'text-blue-600 bg-blue-50';
    if (quality.includes('480p')) return 'text-orange-600 bg-orange-50';
    return 'text-purple-600 bg-purple-50';
  };

  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Download Options</h3>
      
      <div className="space-y-3">
        {formats.map((format, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                {getIcon(format)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{format.quality}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(format.quality)}`}>
                    {format.format}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <HardDrive className="w-3 h-3" />
                  <span>{format.size}</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onDownload(format)}
              disabled={downloadStatus === 'downloading'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Pro Tip:</strong> Higher quality videos will take longer to download but provide better viewing experience.
        </p>
      </div>
    </Card>
  );
};
