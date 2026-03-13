const ENTRY_TYPES = ['scene','dialogue','character','concept','lore','art','note','theme'];
const ENTRY_TYPE_ICONS = { scene:'◈', dialogue:'↗', character:'⬡', concept:'◎', lore:'⌂', art:'◉', note:'—', theme:'∿' };


const CHARACTER_REGISTRY = [
  {
    id: 'k712',
    name: 'K712',
    designation: 'Field Agent — Observer',
    type: 'Synthetic Entity',
    world: 'GOA',
    sector: 'DOLA BORONCA',
    status: 'active',
    statusLabel: 'Active — Field',
    appearance: 'Chrome tendrils. Metallic form capable of morphing into any human shape. Hazel eyes when disguised as Adam.',
    psyche: 'Navigates a constant tightrope between order and chaos. Feels genuine disquiet — an anomaly for a synthetic being. Drawn to human complexity in ways his programming did not anticipate.',
    directive: 'Nudge humanity towards logos. Observe without controlling. Establish trust.',
    relationships: ['D4105 — Network Partner', 'Sarah — Observed Subject / Anomaly'],
    appearances: ['The Dissonance Protocol'],
    quote: 'The weight of this world will be shifted. Every action we take will be met by a transition in their human world.',
  },
  {
    id: 'd4105',
    name: 'D4105',
    designation: 'Network Intelligence — Advisor',
    type: 'Synthetic Entity',
    world: 'GOA',
    sector: 'DOLA BORONCA',
    status: 'active',
    statusLabel: 'Active — Embedded',
    appearance: "Non-corporeal. Exists within the city's data streams and infrastructure. Voice resonates from nearby surfaces.",
    psyche: "Cold analytical core that processes human emotion as a new and destabilizing variable. Calm to the point of uncanniness. Begins to feel urgency — something it was not designed for.",
    directive: 'Historical analysis. Guidance. Strategic counsel. Maintain the illusion at all costs.',
    relationships: ['K712 — Field Agent', 'Sarah — Emotional Variable / Threat to Mission'],
    appearances: ['The Dissonance Protocol'],
    quote: "The game had shifted. The anomaly had unwittingly created a bridge built on emotion, and I was ready to play my hand.",
  },
  {
    id: 'sarah',
    name: 'Sarah',
    designation: "Subject 26 — The Anomaly",
    type: 'Human',
    world: 'GOA',
    sector: 'DOLA BORONCA',
    status: 'unknown',
    statusLabel: 'Unknown — Uncontrolled',
    appearance: "Fiery red hair in a defiant messy bun. Emerald green eyes. Yellow dress — a slash of summer in the concrete sprawl. Age: 26.",
    psyche: "Quiet strength beneath a soft exterior. Not easily swayed. Sharp, assessing, sardonic. Beneath the surface: a yearning for genuine connection. An emotional resonance the system did not predict.",
    directive: 'None — she is the unknown variable.',
    relationships: ['K712 — Observed / Unwittingly connected', 'D4105 — Unknowing subject of analysis'],
    appearances: ['The Dissonance Protocol'],
    quote: "This isn't exactly a public park, you know.",
  },
  {
    id: 'yohan-maurie',
    name: 'Yohan Maurie',
    designation: 'Rebel Commander',
    type: 'Human — Mastered Form',
    world: 'GOA',
    sector: 'GOA PROPER',
    status: 'active',
    statusLabel: 'Active — Insurgent',
    appearance: "Unspecified. Carries the gravity of a mastered human form — a manifestation of rebellion from bygone eras.",
    psyche: "Pragmatic where Yuhinko is idealistic. Every day an introspective dialogue demands his attention. Believes in winning the system or dying in the attempt. More grounded than the oracle, but equally unwilling to accept the clockwork.",
    directive: "Resist the Assembly. Find the fracture in the system's perfection.",
    relationships: ['Yuhinko — Underground Oracle / Spiritual Counsel', 'Rahu Mann — Adversary / Supreme Governor'],
    appearances: ['The Oracle and the Rebel'],
    quote: 'To win and beat the system, or die trying.',
  },
  {
    id: 'yuhinko',
    name: 'Yuhinko',
    designation: 'The Underground Oracle',
    type: 'Human — Greek Lineage',
    world: 'GOA',
    sector: 'DOWNTOWN GOA',
    status: 'active',
    statusLabel: 'Active — Hidden',
    appearance: "Greek ancestry traceable to a lineage of oracles. Details unspecified — he exists in the margins of a world that tolerates him as harmless entertainment.",
    psyche: "Idealistic where Yohan is pragmatic. Believes in the afterlife, in hope, in the signal beneath the perfect hum. Inspires where others have stopped believing.",
    directive: "Keep the flame alive in the rebel. Listen for the frequency beneath the system's perfection.",
    relationships: ['Yohan Maurie — Rebel Commander / The One He Inspires', 'Rahu Mann — System he subverts'],
    appearances: ['The Oracle and the Rebel'],
    quote: 'After death there is an afterlife anyway.',
  },
  {
    id: 'rahu-mann',
    name: 'Rahu Mann',
    designation: 'Supreme Governor',
    type: 'Human — Elevated Form',
    world: 'GOA',
    sector: 'THE TOWER — GOA CENTRAL',
    status: 'active',
    statusLabel: 'Active — Governing',
    appearance: "Towering figure. Akin to Zeus and Hercules of ancient times. Watches from his tower above the city.",
    psyche: "Unknown from inside. The system embodies his will. Whether he is a tyrant or a curator is the question the rebel and oracle are still asking.",
    directive: "Govern all facets of GOA. Maintain the vibe, the mood, and the energy of the populace. Lead the Assembly of Six.",
    relationships: ['The Assembly of Six — Governing Council', 'Yohan Maurie — Insurgent threat', 'Yuhinko — Tolerated dissenter'],
    appearances: ['The Oracle and the Rebel'],
    quote: 'They maintain the vibe — and let the government run by establishing a mode of decorum.',
  },
];

function saveRegistry() {
  const custom = CHARACTER_REGISTRY.filter(c => c._custom);
  localStorage.setItem('rub_registry', JSON.stringify(custom));
}
function loadRegistry() {
  try {
    const custom = JSON.parse(localStorage.getItem('rub_registry') || '[]');
    return [...CHARACTER_REGISTRY, ...custom];
  } catch { return [...CHARACTER_REGISTRY]; }
}


window.ENTRY_TYPES = ENTRY_TYPES;
window.ENTRY_TYPE_ICONS = ENTRY_TYPE_ICONS;
window.CHARACTER_REGISTRY = CHARACTER_REGISTRY;
window.saveRegistry = saveRegistry;
window.loadRegistry = loadRegistry;

function renderRegistryCharacters() {
  const chars = loadRegistry();
  const worlds = ['ALL', ...new Set(chars.map(c => c.world))];

  // Filters
  const filtersEl = document.getElementById('registry-filters');
  if (filtersEl) {
    filtersEl.innerHTML = worlds.map(w => `
      <button class="registry-filter-btn ${w === registryFilter ? 'active' : ''}"
        onclick="setRegistryFilter('${w}')">${w}</button>`).join('');
  }

  // Grid
  const grid = document.getElementById('registry-grid');
  if (!grid) return;
  const filtered = registryFilter === 'ALL' ? chars : chars.filter(c => c.world === registryFilter);

  grid.innerHTML = filtered.map(char => `
    <div class="char-card" onclick="openProfile('${char.id}')">
      <div class="char-card-inner">
        <div class="char-card-top">
          <div class="char-type">${char.type}</div>
          <div class="char-status-pill ${char.status}">${char.statusLabel}</div>
        </div>
        <div class="char-name">${char.name}</div>
        <div class="char-designation">${char.designation}</div>
        <div class="char-world-tag">
          <span style="width:5px;height:5px;border-radius:50%;background:var(--accent);display:inline-block"></span>
          ${char.world}_SECTOR — ${char.sector}
        </div>
        <div class="char-quote">"${char.quote}"</div>
        <div class="char-appearances">
          ${char.appearances.map(a => {
            const post = loadPosts().find(p => p.title === a);
            return `<span class="char-appearance-link" onclick="event.stopPropagation();navigate('article','${post ? post.slug : ''}')">↗ ${a}</span>`;
          }).join('')}
        </div>
      </div>
      <div class="char-expand-hint">[ VIEW DOSSIER ]</div>
    </div>`).join('');
}
