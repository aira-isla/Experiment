// src/render-npcs.js
import { getData } from '../data-loader.js';
import { openDetail } from '../modal/modal-npc.js';

export function renderNpcs() {
  const sb = getData();
  const boxMain = document.querySelector('#content');

  if (!sb || !sb.characters) {
    boxMain.innerHTML = '<p class="loading-message">Data not loaded yet.</p>';
    return;
  }

  boxMain.innerHTML = '';

  Object.entries(sb.characters).forEach(([key, npcs]) => {
    Object.entries(npcs).forEach(([npcKey, npc]) => {
      const article = document.createElement('article');
      article.className = 'box';
      article.innerHTML = `
        <div class="image-frame">
            <img 
                src="./asset/npc/${npc.name}.webp" loading="lazy"
                alt="${npc.name}"
              >
        </div>
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

      boxMain.appendChild(article);
    });
  });
}
