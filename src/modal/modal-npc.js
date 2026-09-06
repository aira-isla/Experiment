// src/modal-npc.js
const modal = document.getElementById('modal');

export function closeModal() {
  if (modal) modal.classList.add('hidden');
}

export function openDetail(npc, category) {
  if (!modal) return;
  modal.classList.remove('hidden');

  // Helper to format relationship text
  const getReadableText = (val) => {
    if (val == null || val === '') return '';
    if (Array.isArray(val)) {
      if (val.length === 0) return '';
      return val
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return (
              item.name ||
              item.displayName ||
              item.firstName ||
              item.label ||
              String(item)
            );
          }
          return String(item);
        })
        .join(', ');
    }
    if (typeof val === 'object') {
      return Object.entries(val)
        .map(([role, name]) => {
          return `${role.charAt(0).toUpperCase() + role.slice(1)}: ${name}`;
        })
        .join(', ');
    }
    return String(val);
  };

  // 1. Build Profile Section
  // --- 1. PROFILE SECTION (Fixed: Clean Structure + Original Labels + No Inline Styles) ---
  const profileHtml = `
    <div class="npc-section">
      <div class="npc-section-header">
        <span class="npc-section-icon">👤</span>
        <h3 class="npc-section-title">Profile</h3>
      </div>
      <div class="npc-info-grid">
        <div class="detail boxDetail"><dt>height</dt><dd>${npc.height || 'N/A'}</dd></div>
        <div class="detail boxDetail"><dt>birthday</dt><dd>${npc.birthday || 'N/A'}</dd></div>
        <div class="detail boxDetail"><dt>category</dt><dd>${category || 'N/A'}</dd></div>
        <div class="detail boxDetail"><dt>role</dt><dd>${npc.role || 'N/A'}</dd></div>
        <div class="detail boxDetail"><dt>personality</dt><dd>${npc.personality || 'N/A'}</dd></div>
        <div class="detail boxDetail bio-row">
          <dt>description</dt>
          <dd>${npc.bio || 'No description available.'}</dd>
        </div>
      </div>
    </div>
  `;

  // 2. Build Relationships Section (Optional: Can be merged or separate)
  const relationshipsConfig = [
    { key: 'crush_on', label: 'crush on' },
    { key: 'crushed_on_by', label: 'crushed on by' },
    { key: 'envy', label: 'envy by' },
    { key: 'family', label: 'family' },
    { key: 'friends_with', label: 'friend with' },
    { key: 'girlfriend', label: 'girlfriend' },
    { key: 'rivalry', label: 'rivalry' },
    { key: 'works_with', label: 'work with' },
    { key: 'colleague', label: 'colleague' },
    { key: 'believes_in', label: 'believes in' },
  ];

  const relationshipsHtml = relationshipsConfig
    .map(({ key, label }) => {
      const value = npc?.relationships?.[key];
      const content = getReadableText(value);

      if (!content) return '';

      return `<div class="detail boxDetail"><dt>${label}</dt><dd>${content}</dd></div>`;
    })
    .join('');

  const relationshipsSection = relationshipsHtml
    ? `
    <div class="npc-section">
      <div class="npc-section-header">
        <span class="npc-section-icon">💞</span>
        <h3 class="npc-section-title">Relationships</h3>
      </div>
      <div class="npc-info-grid">
        ${relationshipsHtml}
      </div>
    </div>
  `
    : '';

  // 3. Build Gifts Section
  const giftConfig = [
    { key: 'loved', label: 'loved' },
    { key: 'liked', label: 'liked' },
    { key: 'neutral', label: 'neutral' },
    { key: 'disliked', label: 'disliked' },
    { key: 'hated', label: 'hated' },
  ];

  let giftsHtml = '';
  console.log(npc);

  giftConfig.forEach(({ key, label }) => {
    const value = npc?.gifts?.[key];
    const content = getReadableText(value);

    if (!content) return '';

    // EXACT ORIGINAL STRUCTURE: Simple detail row, no chips
    giftsHtml += `<div class="detail boxDetail"><dt>${label}</dt><dd>${content}</dd></div>`;
  });

  if (npc.id === 'ponta' && npc.gifts?.note) {
    giftsHtml = `<div class="detail boxDetail"><dt>Note</dt><dd>${npc.gifts.note}</dd></div>`;
  }

  const giftsSection = giftsHtml
    ? `
    <div class="npc-section">
      <div class="npc-section-header">
        <span class="npc-section-icon">🎁</span>
        <h3 class="npc-section-title">Gift Preferences</h3>
      </div>
      <div class="npc-info-grid">
        ${giftsHtml}
      </div>
    </div>
  `
    : '';

  // 4. Build Schedule Section

    
  let scheduleHtml = '';
  if (npc.schedule) {
    const formatKey = (key) => {
      if (/^[0-9]+[ap]m/i.test(key)) {
        return key
          .replace(/_/g, ' - ')
          .replace(/(\d+)(am|pm)/gi, '$1 $2'.toUpperCase());
      }
      return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Recursive function matching original logic exactly
    const renderNode = (obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        const label = formatKey(key);

        // Handle "Note" specifically (matches original)
        if (key.toLowerCase() === 'note') {
          scheduleHtml += `<div class="detail boxDetail"><dt>Note</dt><dd>${value}</dd></div>`;
          scheduleHtml += `<div class="detail boxDetail separator"><dt>------</dt><dd>------</dd></div>`;
          return;
        }

        if (typeof value === 'string') {
          // Leaf node: Label + Value
          scheduleHtml += `<div class="detail boxDetail"><dt>${label}</dt><dd>${value}</dd></div>`;
        } else if (typeof value === 'object' && value !== null) {
          // Branch node: Label only (acts as header), then recurse
          // This ensures "Spring", "Mon", etc. appear as headers
          scheduleHtml += `<div class="detail boxDetail"><dt></dt><dd>${label}</dd></div>`;
          renderNode(value);
        }
      });
    };

    renderNode(npc.schedule);
  }


  const scheduleSection = scheduleHtml
    ? `
    <div class="npc-section">
      <div class="npc-section-header">
        <span class="npc-section-icon">⏰</span>
        <h3 class="npc-section-title">Daily Schedule</h3>
      </div>
      <div class="npc-info-grid">
        ${scheduleHtml}
      </div>
    </div>
  `
    : '';
  

  // Construct the main modal HTML
  modal.innerHTML = `
    <div class="modal-card">
      <button class="close" onclick="window.closeModal()">🌸</button>
      <div id="modalContent">
        <div class="modal-layout">
          <!-- Left Panel: Image -->
          <article class="modal-image-panel">
            <div class="mdi mdi-image">
              <img 
                src="./asset/npc/${npc.name}.webp" loading="lazy"
                alt="${npc.name}"
              >
            </div>
            <h2>${npc.name}</h2>
            <p style="text-align:center; color: var(--muted); font-size: 14px; margin-top: 8px;">${category || 'NPC'}</p>
          </article>

          <!-- Right Panel: Structured Info -->
          <article class="modal-info-panel">
            ${profileHtml}
            ${relationshipsSection}
            ${giftsSection}
            ${scheduleSection}
          </article>
        </div>
      </div>
    </div>
  `;

}

window.closeModal = closeModal;
window.openDetail = openDetail;
