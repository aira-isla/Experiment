// src/render-phone.js

export function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  const navButtons = document.querySelectorAll('.nav');

  function openMenu() {
    sidebar.classList.add('mobile-open');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeMenu() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // Close the menu whenever a navigation button is clicked
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 820) {
        closeMenu();
      }
    });
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}
