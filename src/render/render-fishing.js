import { getData } from '../data-loader.js';

export function renderFishing() {
  const sb = getData();
  const boxMain = document.querySelector('#content');

  if (!sb || !sb.fishing) {
    boxMain.innerHTML = '<p>Data not loaded yet.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  Object.entries(sb.fishing.fish).forEach(([key, fishs]) => {
    const article = document.createElement('article');
    article.className = 'box';
    article.innerHTML = `
      <div class="image-frame no-image">
        <span>${fishs.name.charAt(0)}</span>
      </div>
      <h2>${fishs.name}</h2>
      <dl>
        <div class="detail"><dt>size</dt><dd>${fishs.size}</dd></div>
        <div class="detail"><dt>season</dt><dd>${fishs.seasons.join(', ')}</dd></div>
        <div class="detail"><dt>location</dt><dd>${fishs.locations.join(', ')}</dd></div>
      </dl>
    `;
      fragment.appendChild(article);
  });

    boxMain.replaceChildren(fragment);
}
