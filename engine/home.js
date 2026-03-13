// home kernel

function renderHome() {
  posts = loadPosts();
  const pub = posts.filter(p => p.status === 'published');

  // Inject cube image as full-bleed hero background
  const heroBg = document.getElementById('home-hero-bg');
  if (heroBg && !heroBg.querySelector('img') && typeof CUBE_IMG_SRC !== 'undefined') {
    const img = new Image();
    img.src = CUBE_IMG_SRC;
    img.alt = 'The Rubiculous';
    heroBg.appendChild(img);
  }

  // Live meta counts
  const chars = loadRegistry();
  const el_posts  = document.getElementById('home-post-count');
  const el_chars  = document.getElementById('home-char-count');
  const el_worlds = document.getElementById('home-world-count');
  if (el_posts)  el_posts.textContent  = pub.length;
  if (el_chars)  el_chars.textContent  = chars.length;
  if (el_worlds) el_worlds.textContent = WORLDS_DATA.filter(w => !w.locked).length;

  // Quote typewriter
  const quoteEl = document.getElementById('random-quote');
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  if (quoteEl) setTimeout(() => typewriter(quoteEl, '“' + quote + '”'), 600);

  // World status board removed — manifesto block is static HTML

  renderRadio();
}
