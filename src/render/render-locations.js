// src/render/render-locations.js

// Coordinates as % of the map image (measured against 700x394)
const locations = [
  {
    id: 1,
    name: 'Mine Entrance',
    desc: 'The mine opens here. Dig for ore and minerals all day.',
    x: 49.3,
    y: 7.7,
  },
  {
    id: 2,
    name: 'Goddess Spring',
    desc: 'A tranquil pond where the Harvest Goddess resides.',
    x: 58.4,
    y: 12.6,
  },
  {
    id: 3,
    name: 'Mallard Lake / Church',
    desc: 'A large lake perfect for fishing.',
    x: 73.2,
    y: 14.7,
  },
  {
    id: 4,
    name: 'Pike Mountain',
    desc: 'The tall mountain that watches over the valley.',
    x: 45.2,
    y: 25.5,
  },
  {
    id: 5,
    name: "Carpenter's Area",
    desc: "Woody's shop. Upgrade your house and barn here.",
    x: 55.1,
    y: 29.4,
  },
  {
    id: 6,
    name: 'Crystal Bay',
    desc: 'Sandy shore, best place for Deep sea fishing.',
    x: 25.1,
    y: 45.7,
  },
  {
    id: 7,
    name: 'Clove Villa',
    desc: 'A beautiful villa surrounded by trees.',
    x: 35.9,
    y: 38.7,
  },
  {
    id: 8,
    name: 'Horse Track',
    desc: 'Race your horse and win prizes.',
    x: 44.8,
    y: 47.1,
  },
  {
    id: 9,
    name: 'Town Square',
    desc: 'Central hub for events and festivals.',
    x: 44.9,
    y: 54.5,
  },
  {
    id: 11,
    name: 'Sunny Garden Cafe',
    desc: 'A cozy place to eat and drink.',
    x: 72.9,
    y: 49.1,
  },
  {
    id: 12,
    name: 'Grocery Store',
    desc: 'Buy fresh ingredients and goods.',
    x: 69.4,
    y: 58.6,
  },
  {
    id: 13,
    name: "Bob's Ranch",
    desc: 'Selling  animals, feed,  and barn supplies.',
    x: 31.7,
    y: 70.5,
  },
  {
    id: 14,
    name: 'Tool Shop / Florist',
    desc: 'Buy flowers, seeds and farming tools.',
    x: 56.5,
    y: 72.1,
  },
  {
    id: 15,
    name: 'Farm / Ranch',
    desc: 'Your home, place for farming and raising animal.',
    x: 70.8,
    y: 71.5,
  },
];

export function renderLocations() {
  const main = document.getElementById('content');

  const mapHtml = `
  <div class="map-rotator">
    <div class="map-container">
      <img src="../asset/map/map.webp" loading="lazy" alt="Game Map" class="map-image">
      ${locations
        .map(
          (loc) => `
         <div class="map-star ${loc.y > 50 ? 'low' : ''}" style="left: ${loc.x}%; top: ${loc.y}%;" data-id="${loc.id}">
            <span class="star-icon">📍</span>
            <div class="map-tooltip">
              <h3>${loc.name}</h3>
              <p>${loc.desc}</p>
            </div>
          </div>`,
        )
        .join('')}
    </div>
    </div>
  `;

  main.innerHTML = mapHtml;

  const stars = document.querySelectorAll('.map-star');
  stars.forEach((star) => {
    star.addEventListener('mouseenter', () => star.classList.add('active'));
    star.addEventListener('mouseleave', () => star.classList.remove('active'));
  });

  // temp: click the map to get exact coords
  document.querySelector('.map-container').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    console.log({
      x: +(((e.clientX - r.left) / r.width) * 100).toFixed(1),
      y: +(((e.clientY - r.top) / r.height) * 100).toFixed(1),
    });
  });
}
