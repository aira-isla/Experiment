export function getImageUrl(path) {
  return encodeURI(path.replace(/\.webp$/i, '.avif'));
}

export function getImageHtml(path, alt, options = {}) {
  const { eager = false, className = '' } = options;
  const loading = eager ? 'eager' : 'lazy';
  const fetchPriority = eager ? 'high' : 'auto';
  const imageUrl = encodeURI(path);
  return `<picture><source srcset="${getImageUrl(path)}" type="image/avif"><img class="${className}" src="${imageUrl}" loading="${loading}" fetchpriority="${fetchPriority}" decoding="async" alt="${alt}"></picture>`;
}
