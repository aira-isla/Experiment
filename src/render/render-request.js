import { getData } from "../data-loader.js";

export function renderRequest() {
    const sb = getData();
    const boxMain = document.querySelector('#content');

    const fragment = document.createDocumentFragment();
    Object.entries(sb.itemRequests).forEach(([id ,key]) => {
       
         const article = document.createElement('article');
         article.className = 'box';
         article.innerHTML = `
                <h2 class="req-owner">${key.requester}</h2>
                <dl>
                    <div class="detail req-item"><dt>item</dt><dd>${key.item}</dd></div>
                    <div class="detail"><dt>quantity</dt><dd>${key.quantity || 'N/A'}</dd></div>
                    <div class="detail"><dt>payment</dt><dd>${key.payment || 'N/A'}</dd></div>
                    <div class="detail"><dt>dueDay</dt><dd>${key.dueDay || 'N/A'} days</dd></div>
                    <div class="detail"><dt>season</dt><dd>${key.season || 'N/A'} Y${key.year || 'N/A'}</dd></div>
                </dl>
                `;

             fragment.appendChild(article);
    })

        boxMain.replaceChildren(fragment);
}