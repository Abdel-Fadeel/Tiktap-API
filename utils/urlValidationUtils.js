export const validateURL = (type, url) => {
  const urlPatterns = {
    facebook: /^(https?:\/\/)?(www\.)?facebook.com\/[A-Za-z0-9._-]+$/,
    x: /^https?:\/\/(www\.)?x\.com\/[A-Za-z0-9_.-]+\/?$/,
    telegram: /^(https?:\/\/)?(www\.)?t\.me\/[A-Za-z0-9._-]+$/,
    youtube:
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(c\/|channel\/|user\/|@|))([A-Za-z0-9._-]+)$/,
    whatsapp: /^(https?:\/\/)?(www\.)?wa\.me\/[0-9]+$/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9._-]+$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+$/,
  };

  const pattern = urlPatterns[type.toLowerCase()];
  return pattern ? pattern.test(url) : false;
};
