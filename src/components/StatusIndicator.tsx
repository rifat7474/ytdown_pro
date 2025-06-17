
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Loader } from '@/components/Loader';

interface StatusIndicatorProps {
  downloadStatus: string;
}

export const StatusIndicator = ({ downloadStatus }: StatusIndicatorProps) => {
  if (downloadStatus === 'idle') return null;

  return (
    <Card className="p-8 mb-12 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
      <div className="flex items-center justify-center">
        {downloadStatus === 'processing' && <Loader message="Analyzing video..." />}
        {downloadStatus === 'downloading' && <Loader message="Downloading your video..." />}
        {downloadStatus === 'completed' && (
          <div className="flex items-center gap-4 text-green-600">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold">Download completed successfully!</span>
          </div>
        )}
        {downloadStatus === 'error' && (
          <div className="flex items-center gap-4 text-red-600">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold">Something went wrong. Please try again.</span>
          </div>
        )}
      </div>
    </Card>
  );
};
