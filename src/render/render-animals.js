import { getData } from "../data-loader.js";
import { getImageHtml } from '../utils/images.js';

export function renderAnimals() {
  const sb = getData();
  const boxMain = document.querySelector('#content');

  if (!sb || !sb.animal_products) {
    boxMain.innerHTML = '<p>Data not loaded yet.</p>';
    return;
  }
    
    const fragment = document.createDocumentFragment();
    
    Object.entries(sb.animal_products).forEach(([ids, keys]) => {
        const article = document.createElement('article');
        article.className = 'box';
        article.innerHTML = `
            <div class="image-frame">${getImageHtml(`./asset/animal/${keys.name}.webp`, keys.name)}</div>
           <h2>${keys.name}</h2>
           <dl>
           <div class="detail"><dt>Buy price</dt><dd>${keys?.buy_price || 'Free'}</dd></div>
               <div class="detail"><dt>Buy from</dt><dd>${keys?.buy_from}</dd></div>
           </dl>
           `;

      fragment.appendChild(article);

   })     

    boxMain.replaceChildren(fragment);
}
