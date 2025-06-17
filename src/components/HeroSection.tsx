
import { Download } from 'lucide-react';

export const HeroSection = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
          <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <Download className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
        StreamSaver
      </h1>
      <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4 font-light">
        Download videos from any social platform with lightning speed
      </p>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Free, fast, and secure. No registration required. Works with TikTok, Instagram, YouTube, Twitter and more.
      </p>
    </div>
  );
};
