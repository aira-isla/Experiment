// src/render-npcs.js
import { getData } from '../data-loader.js';
import { openDetail } from '../modal/modal-npc.js';
import { getImageHtml } from '../utils/images.js';

export function renderNpcs() {
  const sb = getData();
  const boxMain = document.querySelector('#content');

  if (!sb || !sb.characters) {
    boxMain.innerHTML = '<p class="loading-message">Data not loaded yet.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  Object.entries(sb.characters).forEach(([key, npcs]) => {
    Object.entries(npcs).forEach(([npcKey, npc]) => {
      const article = document.createElement('article');
      article.className = 'box';
      article.innerHTML = `
        <div class="image-frame">${getImageHtml(`./asset/npc/${npc.name}.webp`, npc.name)}</div>
        <h2>${npc.name}</h2>
        <dl>
            <div class="detail"><dt>category</dt><dd>${key}</dd></div>
            <div class="detail"><dt>birthday</dt><dd>${npc.birthday || 'N/A'}</dd></div>
            <div class="detail"><dt>location</dt><dd>${npc.location}</dd></div>
        </dl>
      `;

      // This is where the error usually happens if openDetail isn't imported or defined
      article.addEventListener('click', () => {
        openDetail(npc, key);
      });

      fragment.appendChild(article);
    });
  });

  boxMain.replaceChildren(fragment);
}
