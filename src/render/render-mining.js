import { getData } from "../data-loader.js";

export function renderMining() {
    const sb = getData();
    const boxMain = document.querySelector('#content');

    const fragment = document.createDocumentFragment();

    Object.entries(sb.mining).forEach(([ids, keys]) => {
        const disMining = ['ores', 'gems', 'artifacts']
        if (disMining.includes(ids) )  {
            Object.entries(keys).forEach(([id, key]) => {

               const article = document.createElement('article');
               article.className = 'box';
               article.innerHTML = `
               <div class="image-frame no-image">
                    <span>${key.name.charAt(0)}</span>
                </div>
                <h2>${key.name}</h2>
                <dl>
                    <div class="detail"><dt>category</dt><dd>${ids}</dd></div>
                    <div class="detail"><dt>sell price</dt><dd>${key?.sell_price || 'N/A'}</dd></div>
                    <div class="detail"><dt>room</dt><dd>${key?.rooms || 'N/A'}</dd></div>
                </dl>
                `;

                    fragment.appendChild(article)
            })

        }
    })

        boxMain.replaceChildren(fragment);
}