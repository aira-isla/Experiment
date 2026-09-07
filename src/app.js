// src/app.js

import { loadSuper } from './data-loader.js';
import { renderNpcs } from './render/render-npcs.js';
import { openDetail, closeModal } from './modal/modal-npc.js';
import { renderCalendar } from './render/render-calendar.js';
import { renderFishing } from './render/render-fishing.js';
import { renderAnimals } from './render/render-animals.js';
import { renderCrops } from './render/render-crops.js';
import { renderMining } from './render/render-mining.js';
import { renderCooking } from './render/render-cooking.js';
import { renderRoutes } from './render/render-routes.js';
import { renderLocations } from './render/render-locations.js';
import { renderRequest } from './render/render-request.js';

window.closeModal = closeModal;
window.openDetail = openDetail;

const renderers = {
  calendar: renderCalendar,
  npcs: renderNpcs,
  fishing: renderFishing,
  crops: renderCrops,
  animals: renderAnimals,
  mining: renderMining,
  cooking: renderCooking,
  routes: renderRoutes,
  locations: renderLocations,
  requests: renderRequest,
};

function showSkeleton(view) {
  const content = document.querySelector('#content');
  if (!content) return;

  content.setAttribute('aria-busy', 'true');
  content.className = `container skeleton-view skeleton-${view}`;
  const count = view === 'calendar' ? 35 : 6;
  content.innerHTML = view === 'calendar'
    ? `<div class="calendar-skeleton" aria-label="Loading calendar">${'<div class="skeleton-day"></div>'.repeat(count)}</div>`
    : `<div class="skeleton-grid" aria-label="Loading ${view}">${'<div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>'.repeat(count)}</div>`;
}

async function renderView(view) {
  const renderer = renderers[view];
  if (!renderer) return;

  showSkeleton(view);
  const mark = `render-${view}`;
  performance.mark(`${mark}-start`);
  await renderer();
  performance.mark(`${mark}-end`);
  performance.measure(mark, `${mark}-start`, `${mark}-end`);
  const measure = performance.getEntriesByName(mark).at(-1);
  if (import.meta.env?.DEV || location.hostname === 'localhost') {
    console.debug(`[performance] ${mark}: ${measure?.duration.toFixed(1)}ms`);
  }
  document.querySelector('#content')?.setAttribute('aria-busy', 'false');
}

export async function initApp() {
  const navButtons = document.querySelectorAll('.nav');
  const boxMain = document.querySelector('#content');
  const backToTop = document.querySelector('#back-to-top');
  const savedView = localStorage.getItem('harvest-moon-view');
  const initialView = renderers[savedView] ? savedView : 'calendar';

  await loadSuper();
  await renderView(initialView);
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === initialView));

  const prefetch = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = './data/main.json';
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };
  if ('requestIdleCallback' in window) requestIdleCallback(prefetch, { timeout: 2000 });
  else setTimeout(prefetch, 1000);

  navButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const view = btn.dataset.view;
      localStorage.setItem('harvest-moon-view', view);

      // Update active state for both desktop and mobile navs
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (renderers[view]) {
        await renderView(view);
      } else {
        boxMain.innerHTML = `<h2>${view.charAt(0).toUpperCase() + view.slice(1)} Coming Soon!</h2>`;
      }
    });
  });

  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.hidden = window.scrollY < 480;
    };
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    updateBackToTop();
  }
}
