const modal = document.getElementById('modal');

export function closeModal() {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.__returnFocus?.focus?.();
  modal.__returnFocus = null;
}

//Event displayer
export function processCalendarData(data) {
  if (!modal) return;
  modal.__returnFocus = document.activeElement;

  if (!data || !data.date || !data.events || data.events.length === 0) {
    modal.innerHTML = `
      <div class="modal-card">
        <button class="close" type="button" aria-label="Close details" onclick="window.closeModal()">🌸</button>
        <div class="modal-layout">
          <article class="modal-info-panel empty-state">
            <h2>No Events</h2>
            <p>Nothing scheduled for this day.</p>
          </article>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
    modal.querySelector('.close')?.focus();
    return;
  }

  const { day, season, year } = data.date;
  const { events, gameData } = data;
  modal.classList.remove('hidden');

  const seasonEmojis = {
    Spring: '🌸',
    Summer: '☀️',
    Fall: '🍂',
    Autumn: '🍂',
    Winter: '❄️',
  };
  const seasonEmoji = seasonEmojis[season] || '🗓';

  const getBadgeClass = (cat) => {
    if (!cat) return '';
    const c = cat.toLowerCase();
    if (c === 'festival') return 'fest-badge';
    if (c === 'birthday') return 'bday-badge';
    // Any other category is considered a quest/story
    return 'quest-badge';
  };

  const eventsHtml = events
    .map((evt) => {
      const cat = evt.category || 'Event';
      const badgeClass = getBadgeClass(cat);
      // Identify if it's a story event (has pathId)
      const isStory =
        !!evt.pathId && evt.pathId !== 'FEST' && evt.pathId !== 'BDAY';

      let details = '';

      if (isStory && evt.pathId) {
        const path = gameData?.story_paths_complete?.find(
          (p) => p.id === evt.pathId,
        );
        if (path) {
          const numKey = path.events.find(
            (e) => String(e.guide_id) === String(evt.guideId),
          );
          const hasData = !!numKey;

          let statusClass = '';
          let statusText = '';

          if (evt.eventTotalDays === 1) {
            statusClass = 'status-single';
            statusText = 'Event';
          } else if (evt.isStartDay) {
            statusClass = 'status-start';
            statusText = 'Start of Event';
          } else if (evt.isEndDay) {
            statusClass = 'status-end';
            statusText = 'Last Day of Event';
          } else if (evt.isDayMiddle) {
            statusClass = 'status-middle';
            statusText = evt.eventDay
              ? `Event Day ${evt.eventDay} of ${evt.eventTotalDays}`
              : 'Middle of Event';
          }

          details += `
            <div class="detail boxDetail"><dt>Story Path</dt><dd>${path.name}</dd></div>
            ${statusClass ? `<div class="detail boxDetail"><dt>Status</dt><dd><span class="${statusClass}">${statusText}</span></dd></div>` : ''}
            ${hasData && numKey.when ? `<div class="detail boxDetail"><dt>When</dt><dd>${numKey.time}</dd></div>` : ''}
            ${hasData && numKey.where ? `<div class="detail boxDetail"><dt>Location</dt><dd>${numKey.where || 'Unknown'}</dd></div>` : ''}
            ${hasData && numKey.outcome ? `<div class="detail boxDetail"><dt>Outcome</dt><dd>${numKey.outcome}</dd></div>` : ''}
            ${path.characters ? `<div class="detail boxDetail"><dt>Characters</dt><dd>${(path.characters || []).join(', ') || 'N/A'}</dd></div>` : ''}
            ${hasData && numKey.requirements ? `<div class="detail boxDetail"><dt>Requirements</dt><dd>${numKey.requirements}</dd></div>` : ''}
          `;
        } else {
          // Path not found, show basic info
          details += `
            <div class="detail boxDetail"><dt>Event</dt><dd>${evt.name}</dd></div>
            <div class="detail boxDetail"><dt>Path ID</dt><dd>${evt.pathId}</dd></div>
          `;
        }
      } else if (cat === 'festival') {
        const fest = gameData?.festivals?.find((f) => f.name === evt.name);
        if (fest) {
          details += `
            <div class="detail boxDetail"><dt>Location</dt><dd>${fest.location}</dd></div>
            <div class="detail boxDetail"><dt>Description</dt><dd>${fest.description}</dd></div>
            ${fest.rewards ? `<div class="detail boxDetail"><dt>Rewards</dt><dd>${Array.isArray(fest.rewards) ? fest.rewards.join(', ') : fest.rewards}</dd></div>` : ''}
          `;
        } else {
          details += `<div class="detail boxDetail"><dt>Festival</dt><dd>${evt.name}</dd></div>`;
        }
      } else if (cat === 'birthday') {
        const name = evt.name.replace("'s Birthday", '');
        const charData =
          gameData?.characters?.villagers?.find((v) => v.name === name) ||
          gameData?.characters?.bachelorettes?.find((b) => b.name === name);

        if (charData) {
          details += `
            <div class="detail boxDetail"><dt>Character</dt><dd>${charData.name}</dd></div>
            <div class="detail boxDetail"><dt>Role</dt><dd>${charData.role}</dd></div>
            <div class="detail boxDetail"><dt>Location</dt><dd>${charData.location}</dd></div>
            ${charData.personality ? `<div class="detail boxDetail"><dt>Personality</dt><dd>${charData.personality}</dd></div>` : ''}
            ${charData.gifts?.loved ? `<div class="detail boxDetail"><dt>Loved Gifts</dt><dd>${Array.isArray(charData.gifts.loved) ? charData.gifts.loved.join(', ') : charData.gifts.loved}</dd></div>` : ''}
          `;
        } else {
          details += `<div class="detail boxDetail"><dt>Birthday</dt><dd>${name}</dd></div>`;
        }
      }

      // Always provide a fallback if details is empty
      if (!details) {
        details = `<div class="detail boxDetail"><dt>Event</dt><dd>${evt.name || 'Unnamed Event'}</dd></div>`;
      }

      return `
        <div class="event-block">
          <div class="event-title-row">
            <span class="event-label ${badgeClass}">${cat}</span>
            <strong>${evt.name}</strong>
          </div>
          <dl>${details}</dl>
        </div>
      `;
    })
    .join('');

  modal.innerHTML = `
  <div class="modal-card">
    <button class="close" type="button" aria-label="Close details" onclick="window.closeModal()">🌸</button>
    
    <div class="modal-layout">
      <article class="modal-image-panel" data-season="${season}">
        <div class="mdi">
          <span class="season-emoji">${seasonEmoji}</span>
        </div>
        <h2 class="season-title">${day} ${season}</h2>
        <p class="season-year">Year ${year}</p>
        <p class="event-count">${events.length} Events</p>
      </article>

      <article class="modal-info-panel">
        <div class="event-list-container">${eventsHtml}</div>
      </article>
    </div>
  </div>
`;
  modal.querySelector('.close')?.focus();

  const emojiSpan = modal.querySelector('.season-emoji');
  const modalPanel = modal.querySelector('.modal-image-panel');

  if (emojiSpan && modalPanel) {
    initializeSeasonEffects(emojiSpan, modalPanel, season);
  }
}

//Season partice
function initializeSeasonEffects(emojiSpan, container, season) {
  const POOL_SIZE = 40;
  const particlePool = [];

  const getEmoji = (type) => {
    if (type === 'spring') return '🌸';
    if (type === 'summer') return 'ִֶָ ࣪˖ ִִֶֶָ་༘';
    if (type === 'fall') return '🍂';
    if (type === 'winter') return '❄️';
    return '✨';
  };

  const particleContainer = document.createElement('div');
  particleContainer.className = 'season-particle-container';

  const mdiContainer = emojiSpan.closest('.mdi');
  if (mdiContainer) {
    mdiContainer.appendChild(particleContainer);
  } else {
    container.appendChild(particleContainer);
  }

  for (let i = 0; i < POOL_SIZE; i++) {
    const p = document.createElement('span');
    p.className = 'season-particle';
    p.style.display = 'none';
    particleContainer.appendChild(p);
    particlePool.push({ el: p, active: false, anim: null });
  }

  const createParticle = (type) => {
    const p = particlePool.find((item) => !item.active);
    if (!p) return;

    p.active = true;
    const el = p.el;
    const emojiChar = getEmoji(type);
    el.innerText = emojiChar;

    if (type === 'summer') {
      const startX = (Math.random() - 0.5) * 20;
      const startY = (Math.random() - 0.5) * 20;
      const duration = 1000 + Math.random() * 2000;
      const endX = (Math.random() - 0.5) * 400;
      const endY = (Math.random() - 0.5) * 400;

      el.style.display = 'block';
      el.style.opacity = '0.8';
      el.style.transform = `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`;

      p.anim = el.animate(
        [
          {
            transform: `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`,
            opacity: 0.8,
          },
          {
            transform: `translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px))`,
            opacity: 0,
          },
        ],
        { duration: duration, easing: 'ease-out', fill: 'forwards' },
      );

      p.anim.onfinish = () => {
        p.active = false;
        p.anim = null;
        el.style.display = 'none';
        el.style.opacity = '0';
      };
    } else {
      const startX = (Math.random() - 0.5) * 400;
      const startY = (Math.random() - 0.5) * 800;
      const duration = 4000 + Math.random() * 6000;
      const endX = (Math.random() - 0.5) * 200;
      const endY = 300 + Math.random() * 100;

      el.style.display = 'block';
      el.style.opacity = '0.8';
      el.style.transform = `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`;

      p.anim = el.animate(
        [
          {
            transform: `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`,
            opacity: 0.8,
          },
          {
            transform: `translate(calc(-50% + ${endX}px), ${endY}px)`,
            opacity: 0,
          },
        ],
        { duration: duration, easing: 'ease-out', fill: 'forwards' },
      );

      p.anim.onfinish = () => {
        p.active = false;
        p.anim = null;
        el.style.display = 'none';
        el.style.opacity = '0';
      };
    }
  };

  let particleInterval = null;

  container.addEventListener('mouseenter', () => {
    if (particleInterval) return;
    let type = 'spring';
    if (season === 'Fall') type = 'fall';
    if (season === 'Winter') type = 'winter';
    if (season === 'Summer') type = 'summer';
    particleInterval = setInterval(() => createParticle(type), 100);
  });

  container.addEventListener('mouseleave', () => {
    if (particleInterval) {
      clearInterval(particleInterval);
      particleInterval = null;
    }
  });
}

window.closeModal = closeModal;
