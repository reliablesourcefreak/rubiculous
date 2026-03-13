// Rubiculous canonical repo — registry link kernel
(function () {
  let _linkSourceId    = null;
  let _linkSourceLabel = '';
  let _linkSourceType  = '';

function loadLinks() {
  try { return JSON.parse(localStorage.getItem('rub_links') || '{}'); } catch(e) { return {}; }
}

function saveLinks(links) { localStorage.setItem('rub_links', JSON.stringify(links)); }

function addLink(sourceId, targetType, targetId, targetLabel, rel) {
  const links = loadLinks();
  if (!links[sourceId]) links[sourceId] = [];
  // avoid dupes
  if (links[sourceId].some(l => l.targetId === targetId && l.targetType === targetType)) return;
  links[sourceId].push({ targetType, targetId, targetLabel, rel: rel || '' });
  // bidirectional — also store reverse
  if (!links[targetId]) links[targetId] = [];
  if (!links[targetId].some(l => l.targetId === sourceId)) {
    links[targetId].push({ targetType: 'auto', targetId: sourceId, targetLabel: String(sourceId), rel: rel || '' });
  }
  saveLinks(links);
}

function removeLink(sourceId, targetId) {
  const links = loadLinks();
  if (links[sourceId]) links[sourceId] = links[sourceId].filter(l => l.targetId !== targetId);
  if (links[targetId]) links[targetId] = links[targetId].filter(l => l.targetId !== sourceId);
  saveLinks(links);
}

function getLinks(id) {
  return (loadLinks()[id] || []);
}

function openLinkModal(sourceId, sourceLabel, sourceType) {
  _linkSourceId    = sourceId;
  _linkSourceLabel = sourceLabel;
  _linkSourceType  = sourceType;

  const modal = document.getElementById('link-modal');
  if (!modal) return;
  renderLinkModal();
  modal.style.display = 'block';
}

function closeLinkModal() {
  const modal = document.getElementById('link-modal');
  if (modal) modal.style.display = 'none';
}

function renderLinkModal() {
  const inner = document.getElementById('link-modal-inner');
  if (!inner) return;

  const existing = getLinks(_linkSourceId);

  // Build candidate lists from all data sources
  const candidates = [];

  // Characters
  loadRegistry().forEach(c => {
    if (String(c.id) !== String(_linkSourceId)) {
      candidates.push({ type: 'character', id: c.id, label: c.name, sub: c.designation || c.world, icon: '◉', color: '#4a9eff' });
    }
  });

  // Posts
  loadPosts().filter(p => p.status === 'published').forEach(p => {
    if (String(p.id) !== String(_linkSourceId)) {
      candidates.push({ type: 'post', id: p.id, label: p.title, sub: p.world || p.category, icon: '◈', color: '#d4a853' });
    }
  });

  // Gallery
  loadGallery().forEach(g => {
    if (String(g.id) !== String(_linkSourceId)) {
      candidates.push({ type: 'gallery', id: g.id, label: g.title, sub: g.world, icon: '▣', color: '#e85d3a' });
    }
  });

  // Codex
  loadCodexEntries().forEach(e => {
    if (String(e.id) !== String(_linkSourceId)) {
      const med = (typeof CODEX_MEDIA !== 'undefined' ? CODEX_MEDIA : []).find(m => m.id === e.medium);
      candidates.push({ type: 'codex', id: e.id, label: e.title, sub: e.medium, icon: med ? med.icon : '◎', color: '#9b59b6' });
    }
  });

  // Plot Beats
  loadPlotBeats().forEach(b => {
    if (String(b.id) !== String(_linkSourceId)) {
      candidates.push({ type: 'beat', id: b.id, label: b.title || 'Untitled Beat', sub: b.act, icon: '→', color: '#27ae60' });
    }
  });

  // Filter to unlinked + build search
  const linkedIds = new Set(existing.map(l => String(l.targetId)));

  inner.innerHTML = ''
    + '<div style="padding:1.2rem 1.8rem;border-bottom:1px solid rgba(212,168,83,0.08);display:flex;justify-content:space-between;align-items:center;">'
      + '<div>'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.22em;color:var(--primary);">Connect This</div>'
        + '<div style="font-family:\'Playfair Display\',serif;font-size:1rem;font-style:italic;color:var(--text-sub);margin-top:0.15rem;">' + _linkSourceLabel + '</div>'
      + '</div>'
      + '<button onclick="closeLinkModal()" style="color:var(--dim);background:none;border:none;font-size:1rem;cursor:pointer;">✕</button>'
    + '</div>'

    // Existing links
    + (existing.length ? '<div style="padding:1rem 1.8rem;border-bottom:1px solid rgba(212,168,83,0.06);">'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.6rem;">Linked (' + existing.length + ')</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">'
        + existing.map(l => {
            const c = candidates.find(x => String(x.id) === String(l.targetId)) || { icon:'◈', label: l.targetLabel, color:'#d4a853' };
            return '<div style="display:flex;align-items:center;gap:0.3rem;background:rgba(212,168,83,0.05);border:1px solid rgba(212,168,83,0.15);padding:0.2rem 0.5rem;font-family:\'DM Mono\',monospace;font-size:0.54rem;color:var(--muted);">'
              + '<span style="color:' + c.color + ';">' + c.icon + '</span>'
              + (l.targetLabel || c.label)
              + '<button onclick="removeLinkAndRefresh(\'' + _linkSourceId + '\',\'' + l.targetId + '\')" style="color:var(--dim);background:none;border:none;cursor:pointer;font-size:0.65rem;margin-left:0.25rem;padding:0;">✕</button>'
            + '</div>';
          }).join('')
        + '</div></div>'
      : '')

    // Search + candidate list
    + '<div style="padding:1rem 1.8rem 0;">'
      + '<input id="link-search" type="text" placeholder="Search to link…" oninput="filterLinkCandidates(this.value)" autocomplete="off"'
        + ' style="width:100%;background:rgba(255,255,255,0.02);border:1px solid var(--border);color:var(--text);font-family:\'DM Mono\',monospace;font-size:0.4rem;padding:0.55rem 0.75rem;outline:none;margin-bottom:0.75rem;">'
    + '</div>'
    + '<div id="link-candidates" style="max-height:320px;overflow-y:auto;padding:0 1.8rem 1.5rem;"></div>';

  // Store candidates on window for filter fn
  window._linkCandidates = candidates;
  window._linkLinkedIds  = linkedIds;
  filterLinkCandidates('');
}

function filterLinkCandidates(q) {
  const el = document.getElementById('link-candidates');
  if (!el) return;
  const candidates = window._linkCandidates || [];
  const linkedIds  = window._linkLinkedIds  || new Set();
  const filtered   = q
    ? candidates.filter(c => c.label.toLowerCase().includes(q.toLowerCase()) || (c.sub||'').toLowerCase().includes(q.toLowerCase()))
    : candidates;

  const TYPE_ORDER = ['character','post','gallery','codex','beat'];
  const grouped = {};
  TYPE_ORDER.forEach(t => { grouped[t] = []; });
  filtered.forEach(c => { if (grouped[c.type]) grouped[c.type].push(c); });

  const TYPE_LABELS = { character:'Characters', post:'Writing', gallery:'Gallery', codex:'Codex', beat:'Plot Beats' };
  let html = '';
  TYPE_ORDER.forEach(t => {
    const group = grouped[t];
    if (!group.length) return;
    html += '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.2em;color:var(--dim);text-transform:uppercase;margin:0.6rem 0 0.3rem;">' + TYPE_LABELS[t] + '</div>';
    group.slice(0, 12).forEach(c => {
      const linked = linkedIds.has(String(c.id));
      html += '<div style="display:flex;align-items:center;gap:0.65rem;padding:0.45rem 0.6rem;cursor:' + (linked ? 'default' : 'pointer') + ';border-radius:2px;transition:background 0.1s;' + (linked ? 'opacity:0.4;' : '') + '" '
        + (linked ? '' : 'onclick="linkAndRefresh(\'' + c.id + '\',\'' + c.label.replace(/'/g,"\\'") + '\',\'' + c.type + '\')" onmouseover="this.style.background=\'rgba(212,168,83,0.05)\'" onmouseout="this.style.background=\'transparent\'"')
        + '>'
        + '<span style="font-size:0.75rem;color:' + c.color + ';width:1rem;text-align:center;">' + c.icon + '</span>'
        + '<div style="flex:1;min-width:0;">'
          + '<div style="font-family:\'Playfair Display\',serif;font-size:0.85rem;font-style:italic;color:' + (linked ? 'var(--dim)' : 'var(--text)') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + c.label + '</div>'
          + (c.sub ? '<div style="font-family:\'DM Mono\',monospace;font-size:0.25rem;color:var(--dim);">' + c.sub + '</div>' : '')
        + '</div>'
        + (linked ? '<span style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:var(--primary);">linked</span>' : '<span style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:var(--dim);">+ link</span>')
      + '</div>';
    });
  });

  if (!html) html = '<div style="font-family:\'Cormorant Garamond\',serif;font-size:0.9rem;font-style:italic;color:var(--dim);text-align:center;padding:1.5rem 0;">Nothing found</div>';
  el.innerHTML = html;
}

function linkAndRefresh(targetId, targetLabel, targetType) {
  addLink(_linkSourceId, targetType, targetId, targetLabel, '');
  renderLinkModal();
  // Update link-count badge in whatever page is visible
  if (currentPage === 'gallery') renderGallery();
}

function removeLinkAndRefresh(sourceId, targetId) {
  removeLink(sourceId, targetId);
  renderLinkModal();
  if (currentPage === 'gallery') renderGallery();
}

function renderLinkedPanel(id, label) {
  const items  = getLinks(id);
  if (!items.length) return '';

  const chars   = loadRegistry();
  const posts   = loadPosts();
  const gallery = loadGallery();
  const codex   = loadCodexEntries();
  const beats   = loadPlotBeats();

  const ICONS = { character:'◉', post:'◈', gallery:'▣', codex:'◎', beat:'→', auto:'◈' };
  const COLORS = { character:'#4a9eff', post:'#d4a853', gallery:'#e85d3a', codex:'#9b59b6', beat:'#27ae60', auto:'#7f8c8d' };

  const chips = items.map(l => {
    let label = l.targetLabel;
    let action = '';
    const col   = COLORS[l.targetType] || '#d4a853';
    const icon  = ICONS[l.targetType]  || '◈';

    if (l.targetType === 'character') {
      const c = chars.find(x => String(x.id) === String(l.targetId));
      if (c) { label = c.name; action = 'openProfile(\'' + c.id + '\')'; }
    } else if (l.targetType === 'post') {
      const p = posts.find(x => String(x.id) === String(l.targetId));
      if (p) { label = p.title; action = 'navigate(\'article\',\'' + p.slug + '\')'; }
    } else if (l.targetType === 'gallery') {
      const g = gallery.find(x => String(x.id) === String(l.targetId));
      if (g) { label = g.title; action = 'navigate(\'gallery\')'; }
    } else if (l.targetType === 'codex') {
      const e = codex.find(x => String(x.id) === String(l.targetId));
      if (e) { label = e.title; action = 'navigate(\'codex\')'; }
    } else if (l.targetType === 'beat') {
      const b = beats.find(x => String(x.id) === String(l.targetId));
      if (b) { label = b.title || 'Beat'; action = 'navigate(\'plotroom\')'; }
    }

    return '<span onclick="' + (action ? action + ';closeLinkModal()' : '') + '" style="display:inline-flex;align-items:center;gap:0.3rem;font-family:\'DM Mono\',monospace;font-size:0.54rem;color:' + col + ';border:1px solid ' + col + '22;background:' + col + '08;padding:0.15rem 0.5rem;cursor:' + (action ? 'pointer' : 'default') + ';transition:background 0.15s;" onmouseover="this.style.background=\'' + col + '18\'" onmouseout="this.style.background=\'' + col + '08\'">'
      + '<span>' + icon + '</span>' + label
    + '</span>';
  }).join('');

  return '<div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border);">'
    + '<div style="font-family:\'DM Mono\',monospace;font-size:0.54rem;letter-spacing:0.2em;color:var(--dim);text-transform:uppercase;margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between;">'
      + 'Related'
      + '<button onclick="openLinkModal(\'' + id + '\',\'' + label.replace(/'/g,"\\'") + '\',\'auto\')" style="font-family:\'DM Mono\',monospace;font-size:0.52rem;color:var(--dim);background:none;border:1px solid var(--border);padding:0.1rem 0.45rem;cursor:pointer;letter-spacing:0.08em;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--dim)\'">+ Link</button>'
    + '</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">' + chips + '</div>'
  + '</div>';
}

  window.loadLinks = loadLinks;
  window.saveLinks = saveLinks;
  window.addLink = addLink;
  window.removeLink = removeLink;
  window.getLinks = getLinks;
  window.openLinkModal = openLinkModal;
  window.closeLinkModal = closeLinkModal;
  window.renderLinkModal = renderLinkModal;
  window.filterLinkCandidates = filterLinkCandidates;
  window.linkAndRefresh = linkAndRefresh;
  window.removeLinkAndRefresh = removeLinkAndRefresh;
  window.renderLinkedPanel = renderLinkedPanel;
})();
