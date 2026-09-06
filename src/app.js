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

export async function initApp() {
  const navButtons = document.querySelectorAll('.nav'); // This automatically selects both desktop and mobile nav buttons
  const boxMain = document.querySelector('#content');

  await loadSuper();
  renderNpcs();

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;

      // Update active state for both desktop and mobile navs
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (view === 'npcs') {
        renderNpcs();
      } else if (view === 'fishing') {
        renderFishing();
      } else if (view === 'calendar') {
        renderCalendar();
      } else if (view === 'crops') {
        renderCrops();
      } else if (view === 'animals') {
        renderAnimals();
      } else if (view === 'mining') {
        renderMining();
      } else if (view === 'cooking') {
        renderCooking();
      } else if (view === 'routes') {
        renderRoutes();
      } else if (view === 'locations') {
        renderLocations();
      } else if (view === 'requests') {
        renderRequest();
      } else {
        boxMain.innerHTML = `<h2>${view.charAt(0).toUpperCase() + view.slice(1)} Coming Soon!</h2>`;
      }
    });
  });
}
