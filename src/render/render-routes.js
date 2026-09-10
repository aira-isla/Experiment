import { getData } from "../data-loader.js";

export function renderRoutes() {
    const sb = getData();
    const boxMain = document.querySelector('#content');
    const fragment = document.createDocumentFragment();

    let groupIndex = 0; 
    Object.entries(sb.story_paths_complete).forEach(([ids, keys]) => {
      const groupId = `group-${groupIndex++}`; 
      const article = document.createElement('article');
      article.dataset.group = groupId;
      article.className = 'box triger';
      article.innerHTML = `            
                <h2 class="status-start" >${keys.name}</h2>
                <dl>
                <div class="detail"><dt>Number</dt><dd>${keys.quest_number}</dd></div>
                <div class="detail"><dt>Id</dt><dd>${keys.id}</dd></div>
                    <div class="detail"><dt>Category</dt><dd>${keys.category.replace(/_/g, ' ')}</dd></div>
                    <div class="detail"><dt>Npc</dt><dd>${keys.characters.join(', ')}</dd></div>
                </dl>
                `;

        fragment.appendChild(article); 

        Object.entries(keys.events).forEach(([id, key]) => {
            const article1 = document.createElement('article');
            article1.dataset.group = groupId;
            article1.className = 'box target hiddens';

            article1.innerHTML = `
                <dl>
                <div class="detail req-owner"><dt>quest</dt><dd>${key.event_name}</dd></div>        
                <div class="detail"><dt>time</dt><dd>${key.time}</dd></div>
                <div class="detail"><dt>weather</dt><dd>${key.weather}</dd></div>
                <div class="detail"><dt>when</dt><dd>${key.when}</dd></div>
                <div class="detail"><dt>location</dt><dd>${key.where}</dd></div>
                <div class="detail"><dt>guide id</dt><dd>${key.guide_id || 'Main'}</dd></div>
                <div class="detail"><dt>req</dt><dd>${key.requirements || 'N/A'}</dd></div>
                </dl>
            `;

            fragment.appendChild(article1)

        })
    });

    boxMain.replaceChildren(fragment);

    const triggers = document.querySelectorAll('.triger');
     triggers.forEach((trigger) => {
       trigger.addEventListener('click', function () {
         const group = this.dataset.group;
         // Toggle only targets with the same group
         document
           .querySelectorAll(`.target[data-group="${group}"]`)
           .forEach((el) => el.classList.toggle('hiddens'));
       });
     });

}