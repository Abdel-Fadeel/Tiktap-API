type SocialMediaType = 'facebook' | 'x' | 'telegram' | 'youtube' | 'whatsapp' | 'tiktok' | 'linkedin';

export const validateURL = (type: string, url: string): boolean => {
  const urlPatterns: Record<SocialMediaType, RegExp> = {
    facebook: /^(https?:\/\/)?(www\.)?facebook.com\/[A-Za-z0-9._-]+$/,
    x: /^https?:\/\/(www\.)?x\.com\/[A-Za-z0-9_.-]+\/?$/,
    telegram: /^(https?:\/\/)?(www\.)?t\.me\/[A-Za-z0-9._-]+$/,
    youtube:
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(c\/|channel\/|user\/|@|))([A-Za-z0-9._-]+)$/,
    whatsapp: /^(https?:\/\/)?(www\.)?wa\.me\/[0-9]+$/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9._-]+$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+$/,
  };

  const pattern = urlPatterns[type.toLowerCase() as SocialMediaType];
  return pattern ? pattern.test(url) : false;
}; 