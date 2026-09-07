import { getData } from "../data-loader.js";

export function renderCooking() {
    const boxMain = document.querySelector('#content');
    const sb = getData();
    const fragment = document.createDocumentFragment();

    Object.entries(sb.cooking).forEach(([ids, keys]) => {
        const disKitchen = ['utensils', 'kitchen']

        if (!disKitchen.includes(ids)) {
            Object.entries(keys).forEach(([id, key]) => {
                
                const article = document.createElement('article');
                article.className = 'box';
                article.innerHTML = `
               <div class="image-frame no-image">
                    <span>${key.name.charAt(0)}</span>
                </div>
                <h2>${key.name}</h2>
                <dl>
                <div class="detail"><dt>sell price</dt><dd>${key?.price || 'N/A'}</dd></div>
                    <div class="detail"><dt>utensils</dt><dd>${ids}</dd></div>
                    <div class="detail"><dt>recipe</dt><dd>${key?.ingredients.join(', ') || 'N/A'}</dd></div>
                </dl>
                `;

                    fragment.appendChild(article)

            })
        }
    })

        boxMain.replaceChildren(fragment);
}