import { getData } from '../data-loader.js';

export function renderCrops() {
  const sb = getData();
  const boxMain = document.querySelector('#content');

  if (!sb || !sb.crops) {
    boxMain.innerHTML = '<p>Data not loaded yet.</p>';
    return;
  }
  boxMain.innerHTML = '';
  Object.entries(sb.crops).forEach(([ids, keys]) => {
    Object.entries(keys).forEach(([id, crop]) => {

      let imgCrop = '';
      let bgCrop = '';
      let imgCropStyle = '';

      if (!crop?.base_crop) {
        imgCrop = crop.name;
      } else if (crop?.sp === 'crop-red') {
        imgCrop = 'Red Pumpkin'
      } else {
        imgCrop = crop.base_crop;
      }

      if (crop?.sp) {
        imgCropStyle =crop.sp
      }
      


      if (ids === 'mineral crops' && !crop?.sp) {
        imgCropStyle = 'crop-mineral'
      }

      if (sb?.crops) {
        bgCrop = 'bg-crop'
      }

      const article = document.createElement('article');
      article.className = 'box';
      article.innerHTML = `
     <div class="image-frame ${bgCrop}">
            <img class="${imgCropStyle}" src="./asset/crop/${imgCrop}.webp"  loading="lazy"  alt="${keys.name}">
        </div>
      <h2>${crop.name}</h2>
      <dl>
        <div class="detail"><dt>category</dt><dd>${ids}</dd></div>
        <div class="detail"><dt>seed price</dt><dd>${crop?.seed_price || 'N/A'}</dd></div>
        <div class="detail"><dt>sell price</dt><dd>${crop?.sell_price || 'N/A'}</dd></div>
      </dl>
    `;
      
       boxMain.appendChild(article);

    
    })
   
  })

}
