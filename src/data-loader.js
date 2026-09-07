const DATA_URL = './data/main.json';
const DATA_INTEGRITY =
  'sha256-Z/RnOcMHHmhqFkODl5VaCEHgVfHhxlyMqHYyB3bMGE0=';

let sb = null;
let loadPromise = null;

export async function loadSuper() {
  if (sb) return sb;

  if (loadPromise) return loadPromise;

  loadPromise = fetch(DATA_URL, {
    cache: 'force-cache',
    credentials: 'same-origin',
    integrity: DATA_INTEGRITY,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
      return res.json();
    })
    .then((data) => {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid game data');
      }
      sb = data;
      return sb;
    })
    .catch((err) => {
      loadPromise = null;
      console.error('Error loading data:', err);
      const boxNpc = document.querySelector('#content');
      if (boxNpc) {
        boxNpc.innerHTML =
          '<p class="loading-message">Could not load game data.</p>';
      }
      return null;
    });

  return loadPromise;
}

export function getData() {
  return sb;
}
