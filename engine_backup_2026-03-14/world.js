const UNIVERSES = [
  {
    id: 'ex-nihilo',
    name: 'Ex Nihilo',
    subtitle: 'Out of Nothing',
    tagline: 'A philosophical mega-story. Humanity rebuilt on a distant planet — two civilizations, one origin, infinite divergence.',
    status: 'Active',
    locked: false,
    color: '#d4a853',
    glow: '#ffcc44',
    books: [
      {
        id: 'bang-bang-paradise',
        name: 'Bang Bang Paradise',
        number: '01',
        tagline: 'The drama between two cities that share a planet but nothing else. Old world versus new world. Root versus chrome. The first collision.',
        status: 'Incubating',
        color: '#d4a853',
      }
    ],
  },
];

// ── Ex Nihilo internals ──
const EX_NIHILO = UNIVERSES[0];

const GOA = {
  id: 'goa',
  name: 'G O A',
  subtitle: 'The Planet',
  tagline: 'A terraformed world in deep time. Humanity survived the unthinkable and arrived here — then split. Two answers to the same question: how do we live?',
  layer: 1,
  status: 'Active',
  firstSignal: '2025',
};

const WORLDS_DATA = [
  {
    id: 'gyanja',
    name: 'GYANJA',
    subtitle: 'The Living City',
    planet: 'goa',
    layer: 2,
    tagline: 'Rooted. Organic. A civilization that terraformed with the planet, not against it. Culture grown from soil, myth, ritual, and sound.',
    status: 'Active',
    locked: false,
    color: '#27ae60',
    glow: '#44ffaa',
    bumpers: ['SOIL','MYTH','RITUAL','SOUND','GROWTH'],
    characters: [],
  },
  {
    id: 'fotora',
    name: 'FOTORA',
    subtitle: 'The Chrome City',
    planet: 'goa',
    layer: 2,
    tagline: 'Accelerating. Synthetic. A civilization that terraformed against the planet — controlling, optimizing, reaching further into the void.',
    status: 'Active',
    locked: false,
    color: '#4a9eff',
    glow: '#88ccff',
    bumpers: ['CHROME','SIGNAL','CONTROL','POWER','VOID'],
    characters: [],
  },
  { id: 'null-sector', name: 'NULL SECTOR', subtitle: '—', planet: 'goa', layer: 2, tagline: 'Under construction.', status: 'Dormant', locked: true, color: '#c0392b', glow: '#ff4444', bumpers: [], characters: [] },
  { id: 'deep-archive', name: 'DEEP ARCHIVE', subtitle: '—', planet: 'goa', layer: 2, tagline: 'Under construction.', status: 'Unknown', locked: true, color: '#7f8c8d', glow: '#aabbcc', bumpers: [], characters: [] },
];

// ── Entry storage (workbench) ──
function loadEntries(worldId) {
  try { return JSON.parse(localStorage.getItem('rub_entries_' + worldId) || '[]'); } catch(e) { return []; }
}
function saveEntries(worldId, entries) {
  localStorage.setItem('rub_entries_' + worldId, JSON.stringify(entries));
}
function allEntries() {
  return WORLDS_DATA.filter(w=>!w.locked).flatMap(w => loadEntries(w.id).map(e => ({...e, worldId: w.id, worldName: w.name})));
}


window.UNIVERSES = UNIVERSES;
window.EX_NIHILO = EX_NIHILO;
window.GOA = GOA;
window.WORLDS_DATA = WORLDS_DATA;
window.loadEntries = loadEntries;
window.saveEntries = saveEntries;
window.allEntries = allEntries;
