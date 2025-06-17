
import { Card } from '@/components/ui/card';
import { Sparkles, Shield, Zap } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Download videos in seconds with our optimized servers and cutting-edge technology.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "Download videos in original quality up to 4K resolution with crystal clear audio.",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your privacy is our priority. No data collection, no registration, completely anonymous.",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto mt-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Why Choose StreamSaver?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the fastest, most reliable video downloading service with premium features
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="p-8 text-center bg-white/70 backdrop-blur-xl border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2"
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
            <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
