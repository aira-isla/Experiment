export function getImageUrl(path) {
  return path.replace(/\.webp$/i, '.avif');
}

export function getImageHtml(path, alt, options = {}) {
  const { eager = false, className = '' } = options;
  const loading = eager ? 'eager' : 'lazy';
  const fetchPriority = eager ? 'high' : 'auto';
  return `<picture><source srcset="${getImageUrl(path)}" type="image/avif"><img class="${className}" src="${path}" loading="${loading}" fetchpriority="${fetchPriority}" decoding="async" alt="${alt}"></picture>`;
}
