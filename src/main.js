import { initApp } from './app.js';

function showOfflineReady() {
  const notice = document.createElement('div');
  notice.className = 'offline-notice';
  notice.textContent = 'Offline mode ready';
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 2800);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        if (registration.active) showOfflineReady();
      })
      .catch((error) => console.warn('Offline support unavailable:', error));
  }, { once: true });
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'offline-ready') showOfflineReady();
  });
}

// Initialize only when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}