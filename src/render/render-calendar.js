import { getData } from '../data-loader.js';
import { processCalendarData } from '../modal/modal-calendar.js';

// Robust date parser for complex formats
// Robust date parser for complex formats
function parseWhen(when) {
  const results = [];
  const segments = when.split(';').map(s => s.trim());

  for (const seg of segments) {
    if (!seg) continue;

    // Extract all "Year N" occurrences (could be multiple in cross‑year ranges)
    const yearRegex = /Year\s+(\d+)/g;
    let match;
    const years = [];
    while ((match = yearRegex.exec(seg)) !== null) {
      years.push(parseInt(match[1]));
    }
    if (years.length === 0) years.push(1); // fallback

    // Remove year markers to get the date part
    let datePart = seg.replace(/Year\s+\d+/g, '').trim();

    // Try to detect a dash that separates two full date specs (e.g., "Summer 26 - Fall 1")
    const parts = datePart.split(/\s*-\s*/);
    if (parts.length === 2) {
      const left = parts[0].trim();
      const right = parts[1].trim();

      const leftDate = parseDateSpec(left);
      const rightDate = parseDateSpec(right);

      if (leftDate && rightDate) {
        // Determine years: if the spec already contains a year, use it; otherwise use the ordered years list
        const startYear = leftDate.year !== undefined ? leftDate.year : years[0];
        const endYear = rightDate.year !== undefined ? rightDate.year : (years.length > 1 ? years[1] : years[0]);

        const range = generateDateRange(
          { season: leftDate.season, day: leftDate.day, year: startYear },
          { season: rightDate.season, day: rightDate.day, year: endYear }
        );
        results.push(...range);
        continue;
      }

      // If not a cross‑season range, try a same‑season range like "Spring 9-13"
      const sameSeasonMatch = datePart.match(/^([A-Za-z]+)\s+(\d+)\s*-\s*(\d+)/);
      if (sameSeasonMatch) {
        const season = sameSeasonMatch[1];
        const startDay = parseInt(sameSeasonMatch[2]);
        const endDay = parseInt(sameSeasonMatch[3]);
        const year = years[0];
        for (let d = startDay; d <= endDay; d++) {
          results.push({ season, year, day: d });
        }
        continue;
      }
    }

    // No dash: could be a single date or comma‑separated list
    const seasonMatch = datePart.match(/^([A-Za-z]+)\s+/);
    if (seasonMatch) {
      const season = seasonMatch[1];
      const rest = datePart.replace(/^[A-Za-z]+\s+/, '').trim();
      const dayParts = rest.split(/\s*,\s*/);
      const year = years[0];
      for (const dStr of dayParts) {
        const day = parseInt(dStr);
        if (!isNaN(day)) {
          results.push({ season, year, day });
        }
      }
    } else {
      // Fallback: try to parse as a standalone date (should not happen often)
      const single = parseDateSpec(datePart);
      if (single) {
        single.year = single.year !== undefined ? single.year : years[0];
        results.push(single);
      }
    }
  }

  return results;
}

// Helper: parse a string like "Spring 5" or "Spring 5, Year 2"
function parseDateSpec(str) {
  const match = str.match(/^([A-Za-z]+)\s+(\d+)(?:\s*,\s*Year\s+(\d+))?/);
  if (match) {
    const obj = {
      season: match[1],
      day: parseInt(match[2])
    };
    if (match[3]) obj.year = parseInt(match[3]);
    return obj;
  }
  return null;
}

// Generate all dates between two date objects (inclusive)
function generateDateRange(start, end) {
  const seasonOrder = ['Spring', 'Summer', 'Fall', 'Winter'];
  const daysPerSeason = 30;
  const totalDaysInYear = seasonOrder.length * daysPerSeason;

  const toAbsolute = (date) => {
    const yearIndex = date.year - 1;
    const seasonIndex = seasonOrder.indexOf(date.season);
    if (seasonIndex === -1) throw new Error(`Invalid season: ${date.season}`);
    return yearIndex * totalDaysInYear + seasonIndex * daysPerSeason + (date.day - 1);
  };

  let startAbs = toAbsolute(start);
  let endAbs = toAbsolute(end);

  if (startAbs > endAbs) {
    [startAbs, endAbs] = [endAbs, startAbs];
  }

  const dates = [];
  for (let abs = startAbs; abs <= endAbs; abs++) {
    const year = Math.floor(abs / totalDaysInYear) + 1;
    const dayInYear = abs % totalDaysInYear;
    const seasonIndex = Math.floor(dayInYear / daysPerSeason);
    const day = (dayInYear % daysPerSeason) + 1;
    dates.push({
      season: seasonOrder[seasonIndex],
      year: year,
      day: day
    });
  }
  return dates;
}

function buildEventIndex(gameData) {
  const eventIndex = new Map();

  const addEventToIndex = (season, day, year, eventObj) => {
    const key = `${year}-${season}-${day}`;
    if (!eventIndex.has(key)) eventIndex.set(key, []);
    eventIndex.get(key).push(eventObj);
  };

  // 1. Story Path Events
  if (gameData?.story_paths_complete) {
    for (const path of gameData.story_paths_complete) {
      if (!path.events) continue;
      for (const event of path.events) {
        const parsed = parseWhen(event.when);
        if (!parsed || parsed.length === 0) continue;

        const total = parsed.length;
        parsed.forEach((dateObj, index) => {
          addEventToIndex(dateObj.season, dateObj.day, dateObj.year, {
            name: event.event_name || `Event ${event.guide_id}`,
            category: path.category,
            optional: event.optional ?? false,
            pathId: path.id,
            eventNumber: event.number,
            guideId: event.guide_id,
            eventDay: index + 1,
            eventTotalDays: total,
            isStartDay: index === 0,
            isEndDay: index === total - 1,
            isDayMiddle: index > 0 && index < total - 1,
            dayNumber: dateObj.day,
          });
        });
      }
    }
  }

  // 2. Festivals
  if (gameData?.festivals) {
    for (const fest of gameData.festivals) {
      const parts = fest.date.split(' ');
      const season = parts[0];
      const day = parseInt(parts[1]);
      for (let y = 1; y <= 3; y++) {
        addEventToIndex(season, day, y, {
          name: fest.name,
          category: 'festival',
          optional: false,
          pathId: 'FEST',
        });
      }
    }
  }

  // 3. Birthdays
  if (gameData?.birthdays) {
    for (const bday of gameData.birthdays) {
      const parts = bday.date.split(' ');
      const season = parts[0];
      const day = parseInt(parts[1]);
      for (let y = 1; y <= 3; y++) {
        addEventToIndex(season, day, y, {
          name: `${bday.name}'s Birthday`,
          category: 'birthday',
          optional: false,
          pathId: 'BDAY',
        });
      }
    }
  }

  return eventIndex;
}

// Navigator
let currentYear = 1;
const maxYear = 3;
const minYear = 1;
const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
let currentSeasonIndex = 0;
let currentStartDayIndex = 1; // 0=sunday 1=monday
let indexedGameData = null;
let cachedEventIndex = null;

export async function renderCalendar() {
  const gameData = getData();
  const contentContainer = document.querySelector('#content');
  if (!contentContainer) {
    console.error('Target container #content not found');
    return;
  }

  const currentSeason = seasons[currentSeasonIndex];
  const daysInSeason = gameData?.timeframe?.days_per_season || 30;
  if (gameData !== indexedGameData) {
    cachedEventIndex = buildEventIndex(gameData);
    indexedGameData = gameData;
  }
  const eventIndex = cachedEventIndex;

  let gridHtml = '';

  // 1. Generate empty slots...
  for (let i = 0; i < currentStartDayIndex; i++) {
    gridHtml += `<div class="day blank"></div>`;
  }

  // 2. Generate the 30 days
  for (let d = 1; d <= daysInSeason; d++) {
    const dayOfWeek = (currentStartDayIndex + (d - 1)) % 7;
    const dateKey = `${currentYear}-${currentSeason}-${d}`;
    const dayEvents = eventIndex.get(dateKey) || [];
    let eventsHtml = '';

   if (dayEvents.length > 0) {
     const displayEvents = dayEvents.slice(0, 3);
     eventsHtml = displayEvents
       .map((e) => {
         let label = '';
         let chipClass = 'eventchip';

         if (e.category === 'birthday') {
           label = 'Bday';
           chipClass += ' bday-chip';
         } else if (e.category === 'festival') {
           label = 'Fest';
           chipClass += ' fest-chip';
         } else {
           // All other events (story paths, tourist, nature, etc.) get the quest chip
           label = e.isStartDay ? 'Quest' : e.dayNumber || '';
           chipClass += ' quest-chip';
         }

         return `<div class="${chipClass}" title="${e.name}">${label}</div>`;
       })
       .join('');

     if (dayEvents.length > 3) {
       eventsHtml += `<div class="more-badge">+${dayEvents.length - 3}</div>`;
     }
   }

    gridHtml += `
      <div class="day" data-day="${d}" data-year="${currentYear}" data-season="${currentSeason}">
        <div class="dayhead">
          <span class="daynum">${d}</span>
          <span class="tiny muted">${dayEvents.length} events</span>
        </div>
        ${eventsHtml}
      </div>
    `;
  }

  let heroDesc = 'Chronological event map with dependency-aware detail.';
  contentContainer.innerHTML = `
      <div class="content remove-grid" id="view">
        <div class="hero">
          <div>
            <h1>Year ${currentYear} · ${currentSeason}</h1>
            <p>${heroDesc}</p>
          </div>
          <div class="hero-actions">
            <button class="btn" data-action="prev" ${currentYear === minYear && currentSeasonIndex === 0 ? 'disabled' : ''}>←</button>
            <button class="btn" data-action="next" ${currentYear === maxYear && currentSeasonIndex === seasons.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>
        
        <div class="kpis">
          <div class="kpi"><b class="kpiEvent">0</b><span>Events today</span></div>
          <div class="kpi"><b>${daysInSeason}</b><span>Days in Season</span></div>
          <div class="kpi"><b>0</b><span>Completed</span></div>
          <div class="kpi"><b>${gameData?.story_paths_complete?.length || 0}</b><span>Routes Tracked</span></div>
        </div>

        <div class="panel calendar">
          <div class="weekday">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
            <div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div class="calendar-grid">${gridHtml}</div>
        </div>
      </div>
    `;

  setTimeout(() => {
    const prevBtn = document.querySelector('[data-action="prev"]');
    const nextBtn = document.querySelector('[data-action="next"]');
    const grid = document.querySelector('.calendar-grid');
    const kpiEvent = document.querySelector('.kpiEvent');

    let rafId = null;
    let pendingCount = null;

    if (grid) {
      grid.addEventListener('mouseover', (e) => {
        const dayCell = e.target.closest('.day');
        if (!dayCell || dayCell.classList.contains('blank')) return;

        const day = parseInt(dayCell.dataset.day);
        const season = dayCell.dataset.season;
        const year = parseInt(dayCell.dataset.year);
        const dateKey = `${year}-${season}-${day}`;
        const dayEvents = eventIndex.get(dateKey);
        const count = dayEvents ? dayEvents.length : 0;

        if (pendingCount === count) return;
        pendingCount = count;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (kpiEvent && kpiEvent.textContent != count) {
            kpiEvent.textContent = count;
          }
          rafId = null;
        });
      });

      grid.addEventListener('click', (e) => {
        const dayCell = e.target.closest('.day');
        if (!dayCell || dayCell.classList.contains('blank')) return;
        e.stopPropagation();

        const day = parseInt(dayCell.dataset.day);
        const season = dayCell.dataset.season;
        const year = parseInt(dayCell.dataset.year);
        const dateKey = `${year}-${season}-${day}`;
        const dayEvents = eventIndex.get(dateKey) || [];

        processCalendarData({
          date: { day, season, year },
          events: dayEvents,
          gameData: gameData,
        });

        if (kpiEvent) kpiEvent.textContent = dayEvents.length;
      });
    }

    const updateStartDay = (direction) => {
      const days = gameData?.timeframe?.days_per_season || 30;
      if (direction === 'next') {
        currentStartDayIndex = (currentStartDayIndex + days) % 7;
      } else {
        currentStartDayIndex = (currentStartDayIndex - days) % 7;
        if (currentStartDayIndex < 0) currentStartDayIndex += 7;
      }
    };

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentYear > minYear || currentSeasonIndex > 0) {
          updateStartDay('prev');
          if (currentSeasonIndex > 0) {
            currentSeasonIndex--;
          } else {
            if (currentYear > minYear) {
              currentYear--;
              currentSeasonIndex = seasons.length - 1;
            }
          }
          renderCalendar();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentYear < maxYear || currentSeasonIndex < seasons.length - 1) {
          updateStartDay('next');
          if (currentSeasonIndex < seasons.length - 1) {
            currentSeasonIndex++;
          } else {
            if (currentYear < maxYear) {
              currentYear++;
              currentSeasonIndex = 0;
            } else {
              currentYear = minYear;
              currentSeasonIndex = 0;
              currentStartDayIndex = 1;
            }
          }
          renderCalendar();
        }
      };
    }
  }, 0);
}
