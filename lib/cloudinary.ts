
export function optimizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  // If already optimized, return as is
  if (url.includes('f_auto,q_auto')) return url;

  // Insert f_auto,q_auto after /upload/
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}
