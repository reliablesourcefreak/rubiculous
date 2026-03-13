/*
 Shared UI helper kernel
 Extracted from legacy app.js during de-monolith pass.
 Preserves global helper names for existing inline handlers and legacy calls.
*/

function getWorldColor(world) {
  const map = {
    'GOA': 'var(--world-goa)',
    'DOLA BORONCA': 'var(--world-dola)',
    'NULL SECTOR': 'var(--world-null)',
    'THE GRID': 'var(--world-grid)',
    'Philosophy': 'var(--world-philosophy)',
    'Worlds': 'var(--world-goa)',
    'Discards': 'var(--world-discards)',
    'Cybernetics': 'var(--world-dola)',
  };
  return map[world] || 'var(--border-strong)';
}

function setTheme(cls) {
  document.body.className = cls;
  document.getElementById('theme-dropdown').classList.remove('open');
  const mobileDD = document.getElementById('theme-dropdown-mobile');
  if (mobileDD) mobileDD.classList.remove('open');
  localStorage.setItem('rub_theme', cls);
}

function closeMobileNav() {
  const links = document.getElementById('nav-links');
  const btn = document.getElementById('nav-hamburger');
  if (links) links.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

function typewriter(el, text, speed=28) {
  el.textContent = '';
  el.style.borderRight = '2px solid var(--accent)';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      setTimeout(() => el.style.borderRight = 'none', 800);
    }
  }, speed);
}
