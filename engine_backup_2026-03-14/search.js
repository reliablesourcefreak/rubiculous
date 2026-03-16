let _searchFocusIdx = -1;
let _searchResults  = [];

// ── Open / Close ──────────────────────────
function openSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  const input = document.getElementById('search-input');
  if (input) { input.value = ''; input.focus(); }
  _searchFocusIdx = -1;
  _searchResults  = [];
  renderSearchHint();
}

function closeSearch() {
  const overlay = document.getElementById('search-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ── Keyboard shortcut ─────────────────────
document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const overlay = document.getElementById('search-overlay');
    if (overlay && overlay.style.display === 'block') closeSearch();
    else openSearch();
  }
  if (e.key === 'Escape') {
    const overlay = document.getElementById('search-overlay');
    if (overlay && overlay.style.display === 'block') closeSearch();
  }
  // Hidden dev tools: Ctrl+Shift+D reveals Sandbox and Admin nav
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    const sb = document.getElementById('nav-sandbox');
    const ad = document.getElementById('nav-admin');
    const reveal = sb && sb.style.display === 'none';
    if (sb) sb.style.display = reveal ? '' : 'none';
    if (ad) ad.style.display = reveal ? '' : 'none';
  }
});

// ── Result navigation ─────────────────────
function searchKeyNav(e) {
  const items = document.querySelectorAll('.search-result-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _searchFocusIdx = Math.min(_searchFocusIdx + 1, items.length - 1);
    updateSearchFocus(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _searchFocusIdx = Math.max(_searchFocusIdx - 1, 0);
    updateSearchFocus(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (_searchFocusIdx >= 0 && items[_searchFocusIdx]) {
      items[_searchFocusIdx].click();
    }
  }
}

function updateSearchFocus(items) {
  items.forEach((el, i) => {
    el.classList.toggle('focused', i === _searchFocusIdx);
    if (i === _searchFocusIdx) el.scrollIntoView({ block: 'nearest' });
  });
}

// ── Hint state (no query) ─────────────────
function renderSearchHint() {
  const el = document.getElementById('search-results');
  if (!el) return;
  el.innerHTML = '<div class="search-hint">'
    + '<div class="search-hint-icon">⌕</div>'
    + '<div class="search-hint-text">Search across everything in the Rubiculous</div>'
    + '<div class="search-quick-actions">'
      + '<button class="search-quick-btn" onclick="runSearch(\'Characters\')">Characters</button>'
      + '<button class="search-quick-btn" onclick="runSearch(\'Worlds\')">Worlds</button>'
      + '<button class="search-quick-btn" onclick="runSearch(\'Music\')">Music</button>'
    + '</div>'
  + '</div>';
  // Quick links
  el.innerHTML = '<div class="search-hint">'
    + '<div class="search-hint-icon">⌕</div>'
    + '<div class="search-hint-text">Search characters, worlds, entries, beats, codex...</div>'
    + '<div class="search-quick-actions">'
      + ['Characters','Worlds','Music','Codex','Story'].map(t =>
          '<button class="search-quick-btn" onclick="var i=document.getElementById(\'search-input\');i.value=\'' + t + '\';i.focus();runSearch(\'' + t + '\')">' + t + '</button>'
        ).join('')
    + '</div>'
  + '</div>';
}

// ── Search engine ─────────────────────────
function runSearch(query) {
  const el = document.getElementById('search-results');
  if (!el) return;
  _searchFocusIdx = -1;

  const input = document.getElementById('search-input');
  if (input && input.value !== query) input.value = query;

  query = (query || '').trim();
  if (!query) { renderSearchHint(); return; }

  const q = query.toLowerCase();
  const results = [];

  // ── Characters ──
  const chars = loadRegistry();
  chars.forEach(c => {
    const score = scoreMatch(q, [c.name, c.designation, c.type, c.world, c.psyche, c.quote, ...(c.relationships||[])]);
    if (score > 0) results.push({
      type: 'character', score, icon: '◉', badge: c.type||'Character', badgeColor: '#4a9eff',
      title: c.name,
      sub: (c.designation||'') + (c.world ? ' — ' + c.world : ''),
      snippet: c.psyche || c.quote || '',
      action: () => { closeSearch(); navigate('informatics'); openProfile(c.id); }
    });
  });

  // ── Posts / Bazaar ──
  const posts = loadPosts().filter(p => p.status === 'published');
  posts.forEach(p => {
    const score = scoreMatch(q, [p.title, p.subtitle, p.excerpt, p.world, p.category, ...(p.tags||[])]);
    if (score > 0) results.push({
      type: 'post', score, icon: '◈', badge: p.category||'Entry', badgeColor: '#d4a853',
      title: p.title,
      sub: (p.world||'') + (p.category ? ' · ' + p.category : ''),
      snippet: p.excerpt || '',
      action: () => { closeSearch(); navigate('article', p.id); }
    });
  });

  // ── Gallery ──
  const gallery = loadGallery();
  gallery.forEach(g => {
    const score = scoreMatch(q, [g.title, g.world, g.type, g.caption]);
    if (score > 0) results.push({
      type: 'gallery', score, icon: '▣', badge: 'Gallery', badgeColor: '#e85d3a',
      title: g.title,
      sub: g.world || '',
      snippet: g.caption || '',
      action: () => { closeSearch(); navigate('gallery'); }
    });
  });

  // ── Worlds ──
  if (typeof WORLDS_DATA !== 'undefined') {
    WORLDS_DATA.forEach(w => {
      const score = scoreMatch(q, [w.name, w.subtitle, w.tagline, w.planet, ...(w.bumpers||[])]);
      if (score > 0) results.push({
        type: 'world', score, icon: '⬡', badge: w.locked ? 'Restricted' : 'World', badgeColor: w.color||'#d4a853',
        title: w.name,
        sub: w.subtitle || '',
        snippet: w.tagline || '',
        action: () => { closeSearch(); navigate('worlds', w.id); }
      });
    });
  }

  // ── Plot Beats ──
  const beats = loadPlotBeats();
  beats.forEach(b => {
    const score = scoreMatch(q, [b.title, b.synopsis, b.chars, b.act, b.type, b.notes]);
    if (score > 0) results.push({
      type: 'beat', score, icon: '→', badge: 'Plot Beat', badgeColor: '#27ae60',
      title: b.title || 'Untitled Beat',
      sub: (b.act ? b.act.toUpperCase() : '') + (b.type ? ' · ' + b.type : ''),
      snippet: b.synopsis || b.notes || '',
      action: () => { closeSearch(); navigate('plotroom'); }
    });
  });

  // ── Codex ──
  const codex = loadCodexEntries();
  codex.forEach(e => {
    const fieldVals = Object.values(e.fields || {});
    const score = scoreMatch(q, [e.title, e.tags, e.world, e.medium, ...fieldVals]);
    if (score > 0) {
      const med = (typeof CODEX_MEDIA !== 'undefined' ? CODEX_MEDIA : []).find(m => m.id === e.medium);
      results.push({
        type: 'codex', score, icon: med ? med.icon : '◎', badge: (med ? med.label : 'Codex'), badgeColor: med ? med.color : '#d4a853',
        title: e.title || 'Untitled',
        sub: (e.world||'') + (e.medium ? ' · ' + e.medium : ''),
        snippet: fieldVals.filter(Boolean).join(' ').slice(0, 120),
        action: () => { closeSearch(); navigate('codex'); }
      });
    }
  });

  // ── Sort by score desc ──
  results.sort((a, b) => b.score - a.score);
  _searchResults = results;

  renderSearchResults(results, query);
}

function scoreMatch(q, fields) {
  let score = 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  fields.forEach(f => {
    if (!f) return;
    const s = String(f).toLowerCase();
    tokens.forEach(tok => {
      if (s === tok)             score += 10;
      else if (s.startsWith(tok)) score += 6;
      else if (s.includes(tok))   score += 3;
    });
  });
  // Bonus: title match
  const title = (fields[0] || '').toLowerCase();
  tokens.forEach(tok => { if (title.includes(tok)) score += 4; });
  return score;
}

function highlight(text, query) {
  if (!text || !query) return text || '';
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  let result = String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  tokens.forEach(tok => {
    const re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    result = result.replace(re, '<mark class="search-hl">$1</mark>');
  });
  return result;
}

// ── Render results ────────────────────────
function renderSearchResults(results, query) {
  const el = document.getElementById('search-results');
  if (!el) return;

  if (!results.length) {
    el.innerHTML = '<div class="search-hint"><div class="search-hint-icon" style="font-size:1.2rem;">—</div><div class="search-hint-text">Nothing found for "<em>' + query + '</em>"</div></div>';
    return;
  }

  // Group by type
  const GROUPS = [
    { key: 'character', label: 'Characters' },
    { key: 'world',     label: 'Worlds' },
    { key: 'post',      label: 'Bazaar — Writing' },
    { key: 'codex',     label: 'Codex' },
    { key: 'beat',      label: 'Plot Room' },
    { key: 'gallery',   label: 'Gallery' },
  ];

  let html = '';
  GROUPS.forEach(g => {
    const group = results.filter(r => r.type === g.key);
    if (!group.length) return;
    html += '<div class="search-group-label">' + g.label + ' <span style="opacity:0.5;font-size:0.85em;">(' + group.length + ')</span></div>';
    group.slice(0, 8).forEach((r, idx) => {
      html += '<div class="search-result-item" tabindex="-1" onclick="r_action_' + r.type + '_' + idx + '()" onmouseenter="highlightSearchItem(this)">';
      html += '<div class="search-res-icon" style="color:' + r.badgeColor + ';">' + r.icon + '</div>';
      html += '<div class="search-res-body">';
      html += '<div class="search-res-title">' + highlight(r.title, query) + '</div>';
      if (r.sub) html += '<div class="search-res-sub">' + highlight(r.sub, query) + '</div>';
      if (r.snippet) html += '<div class="search-res-snippet">' + highlight(r.snippet.slice(0,140), query) + '</div>';
      html += '</div>';
      html += '<span class="search-res-badge" style="color:' + r.badgeColor + ';border-color:' + r.badgeColor + '33;background:' + r.badgeColor + '08;">' + r.badge + '</span>';
      html += '</div>';
    });
  });

  el.innerHTML = html;

  // Wire click actions after DOM is set
  const items = el.querySelectorAll('.search-result-item');
  let flat = [];
  GROUPS.forEach(g => { flat = flat.concat(results.filter(r => r.type === g.key).slice(0,8)); });
  items.forEach((item, i) => {
    if (flat[i]) item.addEventListener('click', flat[i].action);
  });
}

function highlightSearchItem(el) {
  const items = document.querySelectorAll('.search-result-item');
  items.forEach(i => i.classList.remove('focused'));
  el.classList.add('focused');
  _searchFocusIdx = Array.from(items).indexOf(el);
}


window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.runSearch = runSearch;
window.renderSearchHint = renderSearchHint;
window.highlightSearchItem = highlightSearchItem;
