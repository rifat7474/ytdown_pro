
export const validateUrl = (url: string): { isValid: boolean; platform?: string; error?: string } => {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  try {
    const parsedUrl = new URL(trimmedUrl);
    
    const supportedPlatforms = [
      { domains: ['tiktok.com'], name: 'TikTok' },
      { domains: ['instagram.com', 'instagr.am'], name: 'Instagram' },
      { domains: ['youtube.com', 'youtu.be'], name: 'YouTube' },
      { domains: ['twitter.com', 'x.com'], name: 'Twitter' },
      { domains: ['facebook.com', 'fb.watch'], name: 'Facebook' },
      { domains: ['snapchat.com'], name: 'Snapchat' },
      { domains: ['linkedin.com'], name: 'LinkedIn' },
      { domains: ['reddit.com'], name: 'Reddit' },
      { domains: ['pinterest.com'], name: 'Pinterest' },
      { domains: ['dailymotion.com'], name: 'Dailymotion' },
      { domains: ['vimeo.com'], name: 'Vimeo' }
    ];

    const hostname = parsedUrl.hostname.toLowerCase();
    const platform = supportedPlatforms.find(p => 
      p.domains.some(domain => hostname.includes(domain))
    );

    if (!platform) {
      return { 
        isValid: false, 
        error: 'Unsupported platform. Please use a supported social media URL.' 
      };
    }

    return { isValid: true, platform: platform.name };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
