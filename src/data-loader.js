let sb = null;

export async function loadSuper() {
  if (sb) return sb;

  try {
    const res = await fetch('./data/main.json');
    if (!res.ok) throw new Error('Failed to load super.json');
    sb = await res.json();
    console.log('main data loaded');
    console.log(sb)
    return sb;
  } catch (err) {
    console.error('Error loading data:', err);
    const boxNpc = document.querySelector('#content');
    if (boxNpc)
      boxNpc.innerHTML = '<p>Error: Could not load data. Check console.</p>';
    return null;
  }
}

export function getData() {
  return sb;
}
