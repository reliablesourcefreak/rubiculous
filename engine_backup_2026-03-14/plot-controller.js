
/*
 Plot Controller
 Extracts orchestration logic from legacy app.js functions.
*/

window.PlotController = {

  renderPlotRoom() {
    if (typeof renderPlotRoom === "function") renderPlotRoom();
  },

  renderCodex() {
    if (typeof renderCodex === "function") renderCodex();
  },

  renderArcs() {
    if (typeof renderArcs === "function") renderArcs();
  },

  renderRelationships() {
    if (typeof renderRelationships === "function") renderRelationships();
  }

};


/* Extracted from legacy app.js during de-monolith pass */

function renderPlotRoom() {
  const beats = loadPlotBeats();
  const el = document.getElementById('pr-main');
  if (!el) return;

  if (_prView === 'timeline') renderPrTimeline(beats, el);
  else if (_prView === 'outline') renderPrOutline(beats, el);
  else if (_prView === 'acts')   renderPrActs(beats, el);
}

function renderCodex() {
  const entries = loadCodexEntries();

  // ── Sidebar nav ──
  const nav = document.getElementById('codex-nav');
  if (nav) {
    nav.innerHTML = CODEX_MEDIA.map(m => {
      const count = m.id === 'all' ? entries.length : entries.filter(e => e.medium === m.id).length;
      const active = _cxFilter === m.id;
      return '<button class="codex-nav-item' + (active ? ' active' : '') + '" onclick="setCxFilter(\'' + m.id + '\')" data-color="' + m.color + '">'
        + '<span class="codex-nav-icon" style="color:' + (active ? m.color : '') + '">' + m.icon + '</span>'
        + '<span class="codex-nav-label">' + m.label + '</span>'
        + '<span class="codex-nav-count">' + count + '</span>'
        + '</button>';
    }).join('');
  }

  // ── World bar in sidebar ──
  const worldBar = document.getElementById('codex-world-bar');
  if (worldBar) {
    const worlds = ['all', ...CODEX_WORLDS];
    worldBar.innerHTML = '<div class="codex-world-label">World</div>'
      + worlds.map(w => {
          const active = _cxWorld === w;
          return '<button class="codex-world-btn' + (active ? ' active' : '') + '" onclick="setCxWorld(\'' + w + '\')">' + (w === 'all' ? 'All worlds' : w) + '</button>';
        }).join('');
  }

  // ── Main header ──
  const activeMed = CODEX_MEDIA.find(m => m.id === _cxFilter) || CODEX_MEDIA[0];
  const iconEl  = document.getElementById('codex-main-icon');
  const titleEl = document.getElementById('codex-main-title');
  const countEl = document.getElementById('codex-main-count');
  if (iconEl)  iconEl.textContent = activeMed.icon;
  if (iconEl)  iconEl.style.color = activeMed.color;
  if (titleEl) titleEl.textContent = activeMed.label === 'All' ? 'All Entries' : activeMed.label;
  
  // ── Apply filters ──
  let filtered = entries;
  if (_cxFilter !== 'all') filtered = filtered.filter(e => e.medium === _cxFilter);
  if (_cxWorld  !== 'all') filtered = filtered.filter(e => e.world  === _cxWorld);
  if (countEl)  countEl.textContent = filtered.length + ' ' + (filtered.length === 1 ? 'entry' : 'entries');

  // ── Entries panel ──
  const grid = document.getElementById('codex-grid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = '<div class="codex-empty">'
      + '<div class="codex-empty-icon">' + activeMed.icon + '</div>'
      + '<div class="codex-empty-text">Nothing filed here yet.<br>The story is still forming.</div>'
      + '<button class="codex-add-inline" onclick="openCodexModal()">+ File First Reference</button>'
      + '</div>';
    return;
  }

  grid.innerHTML = filtered.map(function(e) { return renderCodexEntry(e); }).join('');
}


function loadPlotBeats() {
  try { return JSON.parse(localStorage.getItem('rub_plotbeats') || '[]'); } catch(e) { return []; }
}

function savePlotBeats(beats) {
  localStorage.setItem('rub_plotbeats', JSON.stringify(beats));
}

function switchPlotView(view, btn) {
  _prView = view;
  document.querySelectorAll('.pr-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPlotRoom();
}

function renderPrTimeline(beats, el) {
  if (!beats.length) {
    el.innerHTML = prEmptyState('No beats yet. Every story starts somewhere.', 'openAddBeat()');
    return;
  }

  let html = '<div class="pr-timeline"><div class="pr-timeline-spine"></div>';

  PR_ACTS.forEach(act => {
    const actBeats = beats.filter(b => b.act === act.id);
    if (!actBeats.length) return;

    html += '<div class="pr-act-block">';
    html += '<div class="pr-act-label" style="color:' + act.color + '">' + act.label + '</div>';

    actBeats.forEach(b => {
      const type  = PR_TYPES.find(t => t.id === b.type) || PR_TYPES[0];
      const stat  = PR_STATUSES.find(s => s.id === b.status) || PR_STATUSES[1];
      const chars = (b.chars || '').split(',').map(c => c.trim()).filter(Boolean);

      html += '<div class="pr-beat-row">';
      html +=   '<div class="pr-beat-node" style="border-color:' + type.color + ';background:' + type.color + '22;"></div>';
      html +=   '<div class="pr-beat-card" data-type="' + b.type + '" onclick="openEditBeat(\'' + b.id + '\')">';
      html +=     '<div style="display:flex;align-items:flex-start;gap:0.5rem;">';
      html +=       '<div style="flex:1;">';
      html +=         '<div class="pr-beat-title">' + (b.title || 'Untitled') + '</div>';
      if (b.synopsis) html += '<div class="pr-beat-synopsis">' + b.synopsis + '</div>';
      html +=         '<div class="pr-beat-meta">';
      html +=           '<span class="pr-type-chip" style="color:' + type.color + ';border-color:' + type.color + '33;background:' + type.color + '0a;">' + type.icon + ' ' + type.label + '</span>';
      html +=           '<span class="pr-type-chip pr-status-' + stat.id + '">' + stat.label + '</span>';
      chars.forEach(c => { html += '<span class="pr-char-chip">' + c + '</span>'; });
      if (b.notes) html += '<span style="font-family:\'DM Mono\',monospace;font-size:0.62rem;color:var(--dim);font-style:italic;">has notes</span>';
      html +=         '</div>';
      html +=       '</div>';
      html +=       '<div class="pr-beat-actions">';
      html +=         '<button onclick="event.stopPropagation();openEditBeat(\'' + b.id + '\')">EDIT</button>';
      html +=         '<button onclick="event.stopPropagation();deletePrBeat(\'' + b.id + '\')">✕</button>';
      html +=       '</div>';
      html +=     '</div>';
      html +=   '</div>';
      html += '</div>';
    });

    html += '</div>';
  });

  html += '</div>';
  el.innerHTML = html;
}

function renderPrOutline(beats, el) {
  if (!beats.length) {
    el.innerHTML = prEmptyState('No beats yet.', 'openAddBeat()');
    return;
  }

  let html = '<div>';
  html += '<div class="pr-outline-row pr-outline-header"><div>ACT</div><div>BEAT</div><div>TYPE</div><div>STATUS</div></div>';

  beats.forEach((b, i) => {
    const act  = PR_ACTS.find(a => a.id === b.act) || PR_ACTS[0];
    const type = PR_TYPES.find(t => t.id === b.type) || PR_TYPES[0];
    const stat = PR_STATUSES.find(s => s.id === b.status) || PR_STATUSES[1];
    html += '<div class="pr-outline-row" onclick="openEditBeat(\'' + b.id + '\')" style="cursor:pointer;">';
    html += '<div style="color:' + act.color + ';opacity:0.7;">' + act.id.toUpperCase() + '</div>';
    html += '<div><div style="font-family:\'Playfair Display\',serif;font-style:italic;color:var(--text);font-size:0.9rem;">' + (b.title||'Untitled') + '</div>' + (b.synopsis ? '<div style="color:var(--dim);font-size:0.72rem;margin-top:0.2rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:400px;">' + b.synopsis.slice(0,80) + '</div>' : '') + '</div>';
    html += '<div style="color:' + type.color + ';">' + type.icon + ' ' + type.label + '</div>';
    html += '<div><span class="pr-type-chip pr-status-' + stat.id + '">' + stat.label + '</span></div>';
    html += '</div>';
  });

  html += '</div>';
  el.innerHTML = html;
}

function renderPrActs(beats, el) {
  let html = '<div class="pr-acts-grid">';

  PR_ACTS.forEach(act => {
    const actBeats = beats.filter(b => b.act === act.id);
    html += '<div class="pr-act-col" style="border-top-color:' + act.color + ';">';
    html += '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.22em;color:' + act.color + ';text-transform:uppercase;margin-bottom:0.4rem;">' + act.label + '</div>';
    html += '<div style="font-family:\'DM Mono\',monospace;font-size:0.62rem;color:var(--dim);margin-bottom:1.2rem;">' + actBeats.length + ' beat' + (actBeats.length !== 1 ? 's' : '') + '</div>';

    if (!actBeats.length) {
      html += '<div style="font-family:\'Cormorant Garamond\',serif;font-size:0.88rem;font-style:italic;color:var(--dim);text-align:center;padding:2rem 0;">Empty</div>';
    } else {
      actBeats.forEach(b => {
        const type = PR_TYPES.find(t => t.id === b.type) || PR_TYPES[0];
        html += '<div style="border:1px solid ' + type.color + '18;border-left:2px solid ' + type.color + '66;padding:0.6rem 0.75rem;margin-bottom:0.5rem;cursor:pointer;background:' + type.color + '05;transition:all 0.15s;" onclick="openEditBeat(\'' + b.id + '\')" onmouseover="this.style.background=\'' + type.color + '0e\'" onmouseout="this.style.background=\'' + type.color + '05\'">';
        html += '<div style="font-family:\'Playfair Display\',serif;font-size:0.88rem;font-style:italic;color:var(--text);">' + (b.title||'Untitled') + '</div>';
        html += '<div style="font-family:\'DM Mono\',monospace;font-size:0.62rem;color:' + type.color + '77;margin-top:0.25rem;">' + type.icon + ' ' + type.label + '</div>';
        html += '</div>';
      });
    }
    html += '</div>';
  });

  html += '</div>';
  el.innerHTML = html;
}

function prEmptyState(msg, fn) {
  return '<div class="pr-empty"><div class="pr-empty-icon">◈</div><div class="pr-empty-text">' + msg + '</div><button onclick="' + fn + '" style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.15em;padding:0.55rem 1.4rem;border:1px solid var(--primary);background:none;color:var(--primary);cursor:pointer;margin-top:1.5rem;">+ File First Beat</button></div>';
}

function openAddBeat() {
  _prEditId = null;
  document.getElementById('pr-modal-title').textContent = 'Add Beat';
  document.getElementById('pr-title').value = '';
  document.getElementById('pr-synopsis').value = '';
  document.getElementById('pr-chars').value = '';
  document.getElementById('pr-notes').value = '';
  buildPrSelectors('setup', 'scene', 'draft');
  document.getElementById('pr-modal').style.display = 'block';
  setTimeout(() => document.getElementById('pr-title').focus(), 100);
}

function openEditBeat(id) {
  const beats = loadPlotBeats();
  const b = beats.find(x => x.id === id);
  if (!b) return;
  _prEditId = id;
  document.getElementById('pr-modal-title').textContent = 'Edit Beat';
  document.getElementById('pr-title').value    = b.title    || '';
  document.getElementById('pr-synopsis').value = b.synopsis || '';
  document.getElementById('pr-chars').value    = b.chars    || '';
  document.getElementById('pr-notes').value    = b.notes    || '';
  buildPrSelectors(b.act, b.type, b.status);
  document.getElementById('pr-modal').style.display = 'block';
}

function closePrModal() {
  document.getElementById('pr-modal').style.display = 'none';
  _prEditId = null;
}

function buildPrSelectors(selAct, selType, selStatus) {
  // Act
  document.getElementById('pr-act-select').innerHTML = PR_ACTS.map(a =>
    '<button class="pr-select-btn' + (a.id === selAct ? ' active' : '') + '" style="' + (a.id === selAct ? 'border-color:' + a.color + ';color:' + a.color + ';background:' + a.color + '0a;' : '') + '" onclick="prSelectAct(this,\'' + a.id + '\')" data-id="' + a.id + '">' + a.label + '</button>'
  ).join('');

  // Type
  document.getElementById('pr-type-select').innerHTML = PR_TYPES.map(t =>
    '<button class="pr-select-btn' + (t.id === selType ? ' active' : '') + '" style="' + (t.id === selType ? 'border-color:' + t.color + ';color:' + t.color + ';background:' + t.color + '0a;' : '') + '" onclick="prSelectType(this,\'' + t.id + '\')" data-id="' + t.id + '">' + t.icon + ' ' + t.label + '</button>'
  ).join('');

  // Status
  document.getElementById('pr-status-select').innerHTML = PR_STATUSES.map(s =>
    '<button class="pr-select-btn pr-status-' + s.id + (s.id === selStatus ? ' active' : '') + '" onclick="prSelectStatus(this,\'' + s.id + '\')" data-id="' + s.id + '">' + s.label + '</button>'
  ).join('');
}

function prSelectAct(btn, id) {
  document.querySelectorAll('#pr-act-select .pr-select-btn').forEach(b => {
    const act = PR_ACTS.find(a => a.id === b.dataset.id);
    b.classList.remove('active');
    b.style.cssText = '';
  });
  const act = PR_ACTS.find(a => a.id === id);
  btn.classList.add('active');
  if (act) btn.style.cssText = 'border-color:' + act.color + ';color:' + act.color + ';background:' + act.color + '0a;';
}

function prSelectType(btn, id) {
  document.querySelectorAll('#pr-type-select .pr-select-btn').forEach(b => { b.classList.remove('active'); b.style.cssText = ''; });
  const type = PR_TYPES.find(t => t.id === id);
  btn.classList.add('active');
  if (type) btn.style.cssText = 'border-color:' + type.color + ';color:' + type.color + ';background:' + type.color + '0a;';
}

function prSelectStatus(btn, id) {
  document.querySelectorAll('#pr-status-select .pr-select-btn').forEach(b => { b.classList.remove('active'); });
  btn.classList.add('active');
}

function savePrBeat() {
  const title    = document.getElementById('pr-title').value.trim();
  const synopsis = document.getElementById('pr-synopsis').value.trim();
  const chars    = document.getElementById('pr-chars').value.trim();
  const notes    = document.getElementById('pr-notes').value.trim();
  const act      = document.querySelector('#pr-act-select .pr-select-btn.active')?.dataset.id    || 'setup';
  const type     = document.querySelector('#pr-type-select .pr-select-btn.active')?.dataset.id   || 'scene';
  const status   = document.querySelector('#pr-status-select .pr-select-btn.active')?.dataset.id || 'draft';

  if (!title) { document.getElementById('pr-title').focus(); return; }

  const beats = loadPlotBeats();
  if (_prEditId) {
    const idx = beats.findIndex(b => b.id === _prEditId);
    if (idx >= 0) beats[idx] = { ...beats[idx], title, synopsis, chars, notes, act, type, status };
  } else {
    beats.push({
      id: 'pr_' + Date.now(),
      title, synopsis, chars, notes, act, type, status,
      created: new Date().toISOString().slice(0,10)
    });
  }
  savePlotBeats(beats);
  closePrModal();
  renderPlotRoom();
}

function deletePrBeat(id) {
  if (!confirm('Delete this beat?')) return;
  const beats = loadPlotBeats().filter(b => b.id !== id);
  savePlotBeats(beats);
  renderPlotRoom();
}

function loadCodexEntries() {
  try { return JSON.parse(localStorage.getItem('rub_codex') || '[]'); } catch(e) { return []; }
}

function saveCodexEntries(entries) {
  localStorage.setItem('rub_codex', JSON.stringify(entries));
}

function setCxFilter(f) { _cxFilter = f; renderCodex(); }

function setCxWorld(w)  { _cxWorld  = w; renderCodex(); }

function renderCodexEntry(e) {
  const med  = CODEX_MEDIA.find(m => m.id === e.medium) || CODEX_MEDIA[0];
  const stat = CODEX_STATUSES ? (CODEX_STATUSES.find(s => s.id === e.status) || CODEX_STATUSES[0]) : { label: e.status || '', color: 'var(--dim)' };

  let fields = '';
  if (e.fields) {
    const f = e.fields;
    if (f.mood)     fields += '<div class="cx-entry-field"><span class="cx-field-label">Mood</span><span class="cx-field-val">' + f.mood + '</span></div>';
    if (f.bpm)      fields += '<div class="cx-entry-field"><span class="cx-field-label">BPM</span><span class="cx-field-val">' + f.bpm + (f.key ? ' · ' + f.key : '') + '</span></div>';
    if (f.form)     fields += '<div class="cx-entry-field"><span class="cx-field-label">Form</span><span class="cx-field-val">' + f.form + '</span></div>';
    if (f.format)   fields += '<div class="cx-entry-field"><span class="cx-field-label">Format</span><span class="cx-field-val">' + f.format + (f.duration ? ' · ' + f.duration : '') + '</span></div>';
    if (f.sequence) fields += '<div class="cx-entry-field"><span class="cx-field-label">Sequence</span><span class="cx-field-val">' + f.sequence + '</span></div>';
    if (f.mechanic) fields += '<div class="cx-entry-field"><span class="cx-field-label">Mechanic</span><span class="cx-field-val">' + f.mechanic + '</span></div>';
    if (f.subject)  fields += '<div class="cx-entry-field"><span class="cx-field-label">Subject</span><span class="cx-field-val">' + f.subject + '</span></div>';
    const body = f.synopsis || f.angle || f.desc || f.verse || '';
    if (body) fields += '<div class="cx-entry-body">' + body.slice(0,200) + (body.length > 200 ? '…' : '') + '</div>';
  }

  const tags = e.tags ? e.tags.split(',').filter(Boolean).map(t =>
    '<span class="cx-entry-tag">' + t.trim() + '</span>'
  ).join('') : '';

  return '<div class="cx-entry" onclick="openCodexDetail(\'' + e.id + '\')">'
    + '<div class="cx-entry-stripe" style="background:' + med.color + ';"></div>'
    + '<div class="cx-entry-content">'
      + '<div class="cx-entry-head">'
        + '<div class="cx-entry-medium" style="color:' + med.color + '">' + med.icon + ' ' + med.label.toUpperCase() + '</div>'
        + (e.world ? '<div class="cx-entry-world">' + e.world + '</div>' : '')
        + '<div class="cx-entry-actions">'
          + '<button onclick="event.stopPropagation();openCodexEdit(\'' + e.id + '\')" title="Edit">✎</button>'
          + '<button onclick="event.stopPropagation();deleteCodexEntry(\'' + e.id + '\')" title="Delete">✕</button>'
        + '</div>'
      + '</div>'
      + '<div class="cx-entry-title">' + (e.title || 'Untitled') + '</div>'
      + (fields ? '<div class="cx-entry-fields">' + fields + '</div>' : '')
      + (tags ? '<div class="cx-entry-tags">' + tags + '</div>' : '')
      + '<div class="cx-entry-foot">'
        + '<span class="cx-entry-status" style="color:' + stat.color + '">' + stat.label + '</span>'
        + '<span class="cx-read-more">↗ Open</span>'
      + '</div>'
    + '</div>'
  + '</div>';
}

function openCodexDetail(id) {
  const entries = loadCodexEntries();
  const e = entries.find(x => x.id === id);
  if (!e) return;
  const med  = CODEX_MEDIA.find(m => m.id === e.medium) || CODEX_MEDIA[0];
  const stat = CODEX_STATUSES.find(s => s.id === e.status) || CODEX_STATUSES[0];
  const tags = (e.tags||'').split(',').map(t=>t.trim()).filter(Boolean);

  let fieldsHtml = '';
  const fields = CODEX_FIELDS[e.medium] || [];
  fields.forEach(f => {
    const val = e.fields && e.fields[f.id];
    if (!val) return;
    if (f.id === 'body' && e.medium === 'poetry') {
      fieldsHtml += '<div style="margin-bottom:1.5rem;"><div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.2em;color:var(--dim);margin-bottom:0.75rem;text-transform:uppercase;">' + f.label + '</div>'
        + '<div style="font-family:\'Cormorant Garamond\',serif;font-size:1.1rem;font-style:italic;color:var(--text-sub);line-height:2;white-space:pre-line;border-left:2px solid rgba(212,168,83,0.2);padding-left:1.2rem;">' + val + '</div></div>';
    } else if (f.id === 'embed') {
      const isSC = val.includes('soundcloud.com');
      const isYT = val.includes('youtube.com') || val.includes('youtu.be');
      if (isSC) {
        const scUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(val) + '&color=%23d4a853&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true';
        fieldsHtml += '<div style="margin-bottom:1.5rem;"><iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="' + scUrl + '" style="border:none;"></iframe></div>';
      } else {
        fieldsHtml += '<div style="margin-bottom:1rem;"><a href="' + val + '" target="_blank" style="font-family:\'DM Mono\',monospace;font-size:0.64rem;color:' + med.color + ';text-decoration:none;border:1px solid ' + med.color + '33;padding:0.35rem 0.9rem;">↗ Open Link</a></div>';
      }
    } else {
      fieldsHtml += '<div style="margin-bottom:1rem;"><div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.3rem;text-transform:uppercase;">' + f.label + '</div><div style="font-family:\'Cormorant Garamond\',serif;font-size:1rem;color:var(--text-sub);line-height:1.6;white-space:pre-line;">' + val + '</div></div>';
    }
  });

  const inner = document.getElementById('codex-detail-inner');
  inner.innerHTML = '<div class="codex-detail-header">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.6rem;letter-spacing:0.22em;color:' + med.color + ';">' + med.icon + ' ' + med.label.toUpperCase() + '</div>'
      + '<div style="display:flex;gap:0.5rem;align-items:center;">'
        + '<span class="codex-status-badge" style="color:' + stat.color + ';border-color:' + stat.color + '33;background:' + stat.color + '08;">' + stat.label + '</span>'
        + '<button onclick="openCodexEdit(\'' + e.id + '\')" style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:var(--dim);background:none;border:1px solid var(--border);padding:0.2rem 0.6rem;cursor:pointer;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--dim)\'">EDIT</button>'
        + '<button onclick="closeCodexDetail()" style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:var(--dim);background:none;border:none;cursor:pointer;padding:0 0.25rem;">✕</button>'
      + '</div>'
    + '</div>'
    + '<h2 style="font-family:\'Playfair Display\',serif;font-size:clamp(1.6rem,4vw,2.4rem);font-style:italic;color:var(--text);line-height:1;margin-bottom:0.5rem;">' + (e.title||'Untitled') + '</h2>'
    + '<div style="font-family:\'DM Mono\',monospace;font-size:0.54rem;color:var(--dim);">' + (e.world||'') + (e.date ? ' · ' + e.date : '') + '</div>'
  + '</div>'
  + '<div class="codex-detail-body">'
    + fieldsHtml
    + (tags.length ? '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">' + tags.map(t=>'<span style="font-family:\'DM Mono\',monospace;font-size:0.52rem;color:var(--dim);border:1px solid var(--border);padding:0.08rem 0.35rem;">'+t+'</span>').join('') + '</div>' : '')
  + '</div>';

  document.getElementById('codex-detail-modal').style.display = 'block';
}

function closeCodexDetail() {
  document.getElementById('codex-detail-modal').style.display = 'none';
}

function openCodexModal() {
  _cxEditId = null;
  document.getElementById('codex-modal-label').textContent = 'New Entry';
  document.getElementById('codex-title').value = '';
  document.getElementById('codex-tags').value  = '';
  _cxMedium = 'music';
  buildCxSelectors('music', 'all', 'idea');
  buildCxDynamicFields('music');
  document.getElementById('codex-modal').style.display = 'block';
  setTimeout(()=>document.getElementById('codex-title').focus(),100);
}

function openCodexEdit(id) {
  closeCodexDetail();
  const entries = loadCodexEntries();
  const e = entries.find(x => x.id === id);
  if (!e) return;
  _cxEditId = id;
  _cxMedium = e.medium || 'music';
  document.getElementById('codex-modal-label').textContent = 'Edit Entry';
  document.getElementById('codex-title').value = e.title || '';
  document.getElementById('codex-tags').value  = e.tags  || '';
  buildCxSelectors(e.medium, e.world||'all', e.status||'idea');
  buildCxDynamicFields(e.medium, e.fields || {});
  document.getElementById('codex-modal').style.display = 'block';
}

function closeCodexModal() {
  document.getElementById('codex-modal').style.display = 'none';
  _cxEditId = null;
}

function buildCxSelectors(selMed, selWorld, selStat) {
  // Medium
  document.getElementById('codex-medium-select').innerHTML = CODEX_MEDIA.filter(m=>m.id!=='all').map(m =>
    '<button class="cx-sel-btn' + (m.id === selMed ? ' active' : '') + '" style="' + (m.id===selMed?'border-color:'+m.color+';color:'+m.color+';background:'+m.color+'0a;':'') + '" onclick="cxSelectMedium(this,\'' + m.id + '\')" data-id="' + m.id + '">' + m.icon + ' ' + m.label + '</button>'
  ).join('');

  // World
  document.getElementById('codex-world-select').innerHTML = ['all',...CODEX_WORLDS].map(w =>
    '<button class="cx-sel-btn' + (w===selWorld?' active':'') + '" style="font-size:0.54rem;padding:0.22rem 0.6rem;" onclick="cxSelectWorld(this,\'' + w + '\')" data-id="' + w + '">' + (w==='all'?'Universal':w) + '</button>'
  ).join('');

  // Status
  document.getElementById('codex-status-select').innerHTML = CODEX_STATUSES.map(s =>
    '<button class="cx-sel-btn' + (s.id===selStat?' active':'') + '" style="' + (s.id===selStat?'border-color:'+s.color+';color:'+s.color+';background:'+s.color+'0a;':'') + '" onclick="cxSelectStatus(this,\'' + s.id + '\')" data-id="' + s.id + '">' + s.label + '</button>'
  ).join('');
}

function cxSelectMedium(btn, id) {
  document.querySelectorAll('#codex-medium-select .cx-sel-btn').forEach(b=>{ b.classList.remove('active'); b.style.cssText=''; });
  const m = CODEX_MEDIA.find(x=>x.id===id);
  btn.classList.add('active');
  if (m) btn.style.cssText='border-color:'+m.color+';color:'+m.color+';background:'+m.color+'0a;';
  _cxMedium = id;
  buildCxDynamicFields(id);
}

function cxSelectWorld(btn, id) {
  document.querySelectorAll('#codex-world-select .cx-sel-btn').forEach(b=>{ b.classList.remove('active'); b.style.cssText=''; });
  btn.classList.add('active');
}

function cxSelectStatus(btn, id) {
  document.querySelectorAll('#codex-status-select .cx-sel-btn').forEach(b=>{ b.classList.remove('active'); b.style.cssText=''; });
  const s = CODEX_STATUSES.find(x=>x.id===id);
  btn.classList.add('active');
  if (s) btn.style.cssText='border-color:'+s.color+';color:'+s.color+';background:'+s.color+'0a;';
}

function buildCxDynamicFields(medium, values) {
  values = values || {};
  const fields = CODEX_FIELDS[medium] || [];
  const container = document.getElementById('codex-dynamic-fields');
  if (!container) return;
  container.innerHTML = fields.map(f => {
    const val = values[f.id] || '';
    const input = f.type === 'textarea'
      ? '<textarea id="cx-f-'+f.id+'" rows="'+(f.id==='body'?8:3)+'" placeholder="'+f.placeholder+'" style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.08);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.6rem 0.75rem;outline:none;resize:vertical;line-height:1.6;">'+val+'</textarea>'
      : '<input id="cx-f-'+f.id+'" type="text" value="'+val+'" placeholder="'+f.placeholder+'" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,168,83,0.1);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.4rem 0;outline:none;">';
    return '<div class="cx-field"><label>'+f.label+'</label>'+input+'</div>';
  }).join('');
}

function saveCodexEntry() {
  const title  = document.getElementById('codex-title').value.trim();
  const tags   = document.getElementById('codex-tags').value.trim();
  const medium = document.querySelector('#codex-medium-select .cx-sel-btn.active')?.dataset.id || _cxMedium;
  const world  = document.querySelector('#codex-world-select .cx-sel-btn.active')?.dataset.id  || 'all';
  const status = document.querySelector('#codex-status-select .cx-sel-btn.active')?.dataset.id || 'idea';

  if (!title) { document.getElementById('codex-title').focus(); return; }

  // Collect dynamic fields
  const fields = {};
  (CODEX_FIELDS[medium]||[]).forEach(f => {
    const el = document.getElementById('cx-f-' + f.id);
    if (el && el.value.trim()) fields[f.id] = el.value.trim();
  });

  const entries = loadCodexEntries();
  if (_cxEditId) {
    const idx = entries.findIndex(e => e.id === _cxEditId);
    if (idx >= 0) entries[idx] = { ...entries[idx], title, tags, medium, world, status, fields };
  } else {
    entries.unshift({
      id: 'cx_' + Date.now(),
      title, tags, medium, world, status, fields,
      date: new Date().toISOString().slice(0,10)
    });
  }
  saveCodexEntries(entries);
  closeCodexModal();
  renderCodex();
}

function deleteCodexEntry(id) {
  if (!confirm('Delete this entry from the Codex?')) return;
  const entries = loadCodexEntries().filter(e => e.id !== id);
  saveCodexEntries(entries);
  renderCodex();
}

function loadArcs() {
  try { return JSON.parse(localStorage.getItem('rub_arcs') || '{}'); } catch(e) { return {}; }
}

function saveArcs(arcs) { localStorage.setItem('rub_arcs', JSON.stringify(arcs)); }

function loadRelationships() {
  try { return JSON.parse(localStorage.getItem('rub_relationships') || '[]'); } catch(e) { return []; }
}

function saveRelationships(rels) { localStorage.setItem('rub_relationships', JSON.stringify(rels)); }

function renderCharacterArcs() {
  const chars   = loadRegistry();
  const arcs    = loadArcs();
  const container = document.getElementById('registry-arcs-container');
  if (!container) return;

  const stageColors = ['#7f8c8d','#d4a853','#c0392b','#4a9eff','#27ae60'];

  let html = '<div style="margin-bottom:2rem;display:flex;justify-content:flex-end;">'
    + '<button onclick="openArcStageModal(null,null)" style="font-family:\'DM Mono\',monospace;font-size:0.64rem;letter-spacing:0.12em;padding:0.45rem 1rem;border:1px solid var(--border);background:none;color:var(--muted);cursor:pointer;" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.color=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--muted)\'">Track how a character changes. Stage by stage.</button>'
    + '</div>';

  chars.forEach(char => {
    const charArc = arcs[char.id] || {};
    const hasAny  = ARC_STAGES.some(s => charArc[s.id]);

    html += '<div class="arc-card">';

    // Connector bar
    html += '<div class="arc-connector">';
    stageColors.forEach((col, i) => {
      html += '<div class="arc-connector-seg" style="background:' + col + (hasAny ? 'cc' : '22') + ';"></div>';
    });
    html += '</div>';

    // Header
    html += '<div class="arc-card-header" onclick="toggleArcExpand(\'' + char.id + '\')">';
    html += '<div><div class="arc-char-name">' + char.name + '</div><div class="arc-char-role">' + (char.designation||'') + ' — ' + (char.world||'') + '</div></div>';
    html += '<div style="display:flex;align-items:center;gap:1rem;">';
    if (char.quote) html += '<div style="font-family:\'Cormorant Garamond\',serif;font-size:0.85rem;font-style:italic;color:var(--dim);max-width:320px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">"' + char.quote.slice(0,80) + (char.quote.length>80?'…':'') + '"</div>';
    html += '<div style="font-family:\'DM Mono\',monospace;font-size:0.55rem;color:var(--dim);" id="arc-toggle-' + char.id + '">▾</div>';
    html += '</div></div>';

    // Stage rail (expanded by default if has content)
    html += '<div id="arc-expand-' + char.id + '" style="display:' + (hasAny ? 'block' : 'none') + ';">';
    html += '<div class="arc-stages-rail">';
    ARC_STAGES.forEach((stage, i) => {
      const text = charArc[stage.id] || '';
      html += '<div class="arc-stage" data-stage="' + stage.id + '">';
      html += '<div class="arc-stage-label">' + stage.label + '</div>';
      if (text) {
        html += '<div class="arc-stage-text">' + text + '</div>';
      } else {
        html += '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;color:var(--dim);font-style:italic;line-height:1.5;">' + stage.desc + '</div>';
      }
      html += '<button class="arc-stage-edit" onclick="openArcStageModal(\'' + char.id + '\',\'' + stage.id + '\')">EDIT</button>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>'; // arc-expand

    html += '</div>'; // arc-card
  });

  container.innerHTML = html;
}

function toggleArcExpand(charId) {
  const el = document.getElementById('arc-expand-' + charId);
  const tog = document.getElementById('arc-toggle-' + charId);
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (tog) tog.textContent = open ? '▸' : '▾';
}

function openArcStageModal(charId, stageId) {
  const chars = loadRegistry();
  const arcs  = loadArcs();

  // Build modal HTML
  const charOpts = chars.map(c =>
    '<option value="' + c.id + '"' + (c.id === charId ? ' selected' : '') + '>' + c.name + '</option>'
  ).join('');
  const stageOpts = ARC_STAGES.map(s =>
    '<option value="' + s.id + '"' + (s.id === stageId ? ' selected' : '') + '>' + s.label + '</option>'
  ).join('');
  const existingText = charId && stageId && arcs[charId] ? (arcs[charId][stageId] || '') : '';

  const modal = document.getElementById('profile-modal');
  modal.style.display = 'block';
  modal.innerHTML = '<div style="position:fixed;inset:0;background:rgba(4,3,10,0.95);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:flex-start;justify-content:center;padding-top:4rem;" onclick="if(event.target===this)closeProfile()">'
    + '<div class="arc-modal-inner" style="width:100%;max-width:560px;margin:0 1.5rem;">'
      + '<div style="padding:1.2rem 1.8rem;border-bottom:1px solid rgba(212,168,83,0.08);display:flex;justify-content:space-between;align-items:center;">'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.22em;color:var(--primary);">EDIT ARC STAGE</div>'
        + '<button onclick="closeProfile()" style="font-family:\'DM Mono\',monospace;color:var(--dim);background:none;border:none;font-size:1rem;cursor:pointer;">✕</button>'
      + '</div>'
      + '<div style="padding:1.5rem 1.8rem;">'
        + '<div style="margin-bottom:1rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.2em;color:var(--dim);margin-bottom:0.4rem;text-transform:uppercase;">Character</div>'
          + '<select id="arc-modal-char" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.5rem;outline:none;">' + charOpts + '</select>'
        + '</div>'
        + '<div style="margin-bottom:1rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.2em;color:var(--dim);margin-bottom:0.4rem;text-transform:uppercase;">Stage</div>'
          + '<select id="arc-modal-stage" style="width:100%;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.5rem;outline:none;">' + stageOpts + '</select>'
        + '</div>'
        + '<div style="margin-bottom:1.5rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.2em;color:var(--dim);margin-bottom:0.4rem;text-transform:uppercase;">Content</div>'
          + '<textarea id="arc-modal-text" rows="6" placeholder="Write what happens at this stage of their arc..." style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.1);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.75rem;outline:none;resize:vertical;line-height:1.65;">' + existingText + '</textarea>'
        + '</div>'
        + '<div style="display:flex;gap:0.75rem;justify-content:flex-end;">'
          + '<button onclick="closeProfile()" style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.1em;padding:0.5rem 1rem;border:1px solid var(--border);background:none;color:var(--dim);cursor:pointer;">Cancel</button>'
          + '<button onclick="saveArcStage()" style="font-family:\'DM Mono\',monospace;font-size:0.42rem;letter-spacing:0.12em;padding:0.55rem 1.4rem;border:1px solid var(--primary);background:rgba(212,168,83,0.07);color:var(--primary);cursor:pointer;" onmouseover="this.style.background=\'rgba(212,168,83,0.15)\'" onmouseout="this.style.background=\'rgba(212,168,83,0.07)\'">Save Stage ◈</button>'
        + '</div>'
      + '</div>'
    + '</div>'
  + '</div>';
}

function saveArcStage() {
  const charId  = document.getElementById('arc-modal-char')?.value;
  const stageId = document.getElementById('arc-modal-stage')?.value;
  const text    = document.getElementById('arc-modal-text')?.value.trim();
  if (!charId || !stageId) return;
  const arcs = loadArcs();
  if (!arcs[charId]) arcs[charId] = {};
  arcs[charId][stageId] = text;
  saveArcs(arcs);
  closeProfile();
  renderCharacterArcs();
}

function renderRelationshipWeb() {
  const chars = loadRegistry();
  const rels  = loadRelationships();
  const stage = document.getElementById('mindmap-stage');
  const svgEl = document.getElementById('mindmap-svg');
  const nodesEl = document.getElementById('mindmap-nodes');
  const emptyEl = document.getElementById('mindmap-empty');
  const countEl = document.getElementById('mindmap-count');
  if (!stage || !svgEl || !nodesEl) return;

  if (countEl) countEl.textContent = rels.length + ' connection' + (rels.length !== 1 ? 's' : '') + ' · ' + chars.length + ' entities';

  // Gather all entities that appear in relationships OR in registry
  const nodeIds = new Set();
  chars.forEach(c => nodeIds.add(c.id));
  rels.forEach(r => { nodeIds.add(r.charA); nodeIds.add(r.charB); });
  const nodeList = Array.from(nodeIds);

  if (!nodeList.length) {
    emptyEl.style.display = 'flex';
    svgEl.innerHTML = '';
    nodesEl.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';

  // Load or generate positions
  let positions = {};
  try { positions = JSON.parse(localStorage.getItem('rub_mindmap_pos') || '{}'); } catch(e) {}

  const W = stage.clientWidth  || 900;
  const H = stage.clientHeight || 560;
  const cx = W / 2, cy = H / 2;
  const radius = Math.min(W, H) * 0.34;

  nodeList.forEach((id, i) => {
    if (!positions[id]) {
      const angle = (i / nodeList.length) * Math.PI * 2 - Math.PI / 2;
      positions[id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    }
  });

  // Draw SVG lines
  svgEl.setAttribute('width', W);
  svgEl.setAttribute('height', H);
  svgEl.innerHTML = '';

  // Defs: arrowhead markers per color
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  REL_TYPES.forEach(rt => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
    marker.setAttribute('id', 'arrow-' + rt.id);
    marker.setAttribute('markerWidth','6'); marker.setAttribute('markerHeight','6');
    marker.setAttribute('refX','5'); marker.setAttribute('refY','3');
    marker.setAttribute('orient','auto');
    const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points','0 0, 6 3, 0 6');
    poly.setAttribute('fill', rt.color);
    marker.appendChild(poly);
    defs.appendChild(marker);
  });
  svgEl.appendChild(defs);

  rels.forEach(rel => {
    const a = positions[rel.charA], b = positions[rel.charB];
    if (!a || !b) return;
    const rt = REL_TYPES.find(t => t.id === rel.type) || REL_TYPES[0];

    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;

    // Line
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', rt.color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', '0.55');
    svgEl.appendChild(line);

    // Label bg
    const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
    const lw = 80, lh = 18;
    fo.setAttribute('x', mx - lw/2); fo.setAttribute('y', my - lh/2);
    fo.setAttribute('width', lw); fo.setAttribute('height', lh);
    fo.innerHTML = '<div xmlns="http://www.w3.org/1999/xhtml" style="background:rgba(7,6,15,0.82);border:1px solid ' + rt.color + '33;color:' + rt.color + ';font-family:DM Mono,monospace;font-size:9px;letter-spacing:0.08em;text-align:center;padding:2px 4px;white-space:nowrap;border-radius:2px;cursor:pointer;" onclick="openRelModal(\'' + rel.id + '\')">' + rt.label + '</div>';
    svgEl.appendChild(fo);
  });

  // Render node divs
  nodesEl.innerHTML = '';
  nodeList.forEach(id => {
    const char = chars.find(c => c.id === id);
    const name = char ? char.name : id;
    const type = char ? (char.type || '') : '';
    const pos  = positions[id];
    const initials = name.replace(/[^A-Z0-9]/gi,'').slice(0,2).toUpperCase() || '?';

    const node = document.createElement('div');
    node.className = 'mindmap-node';
    node.dataset.id = id;
    node.style.left = (pos.x - 38) + 'px';
    node.style.top  = (pos.y - 38) + 'px';
    node.innerHTML =
      '<div class="mindmap-node-circle">' + initials + '</div>' +
      '<div class="mindmap-node-name">' + name + '</div>' +
      (type ? '<div class="mindmap-node-type">' + type + '</div>' : '');

    // Click → open dossier
    node.addEventListener('click', function(e) {
      if (node._dragged) return;
      if (char) openProfile(id);
    });

    // Drag
    let dragging = false, ox = 0, oy = 0, startX = 0, startY = 0;
    node.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true; node._dragged = false;
      startX = e.clientX; startY = e.clientY;
      ox = pos.x; oy = pos.y;
      node.classList.add('dragging');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    function onMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) node._dragged = true;
      pos.x = ox + dx; pos.y = oy + dy;
      node.style.left = (pos.x - 38) + 'px';
      node.style.top  = (pos.y - 38) + 'px';
      redrawLines(rels, positions, svgEl, W, H);
    }
    function onUp() {
      dragging = false;
      node.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      localStorage.setItem('rub_mindmap_pos', JSON.stringify(positions));
      setTimeout(() => { node._dragged = false; }, 50);
    }
    nodesEl.appendChild(node);
  });
}

function redrawLines(rels, positions, svgEl, W, H) {
  // Remove all lines and labels (keep defs)
  const defs = svgEl.querySelector('defs');
  svgEl.innerHTML = '';
  if (defs) svgEl.appendChild(defs);

  rels.forEach(rel => {
    const a = positions[rel.charA], b = positions[rel.charB];
    if (!a || !b) return;
    const rt = REL_TYPES.find(t => t.id === rel.type) || REL_TYPES[0];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;

    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', rt.color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', '0.55');
    svgEl.appendChild(line);

    const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
    const lw = 80, lh = 18;
    fo.setAttribute('x', mx - lw/2); fo.setAttribute('y', my - lh/2);
    fo.setAttribute('width', lw); fo.setAttribute('height', lh);
    fo.innerHTML = '<div xmlns="http://www.w3.org/1999/xhtml" style="background:rgba(7,6,15,0.82);border:1px solid ' + rt.color + '33;color:' + rt.color + ';font-family:DM Mono,monospace;font-size:9px;letter-spacing:0.08em;text-align:center;padding:2px 4px;white-space:nowrap;border-radius:2px;cursor:pointer;" onclick="openRelModal(\'' + rel.id + '\')">' + rt.label + '</div>';
    svgEl.appendChild(fo);
  });
}

function resetMindmapLayout() {
  localStorage.removeItem('rub_mindmap_pos');
  renderRelationshipWeb();
}

function openRelModal(id) {
  const rels   = loadRelationships();
  const chars  = loadRegistry();
  const rel    = id ? rels.find(r => r.id === id) : null;
  _relEditId   = id || null;

  const charOpts = chars.map(c => '<option value="' + c.name + '">' + c.name + '</option>').join('');
  const typeOpts = REL_TYPES.map(t =>
    '<button class="cx-sel-btn' + (rel && rel.type === t.id ? ' active' : !rel && t.id === 'complex' ? ' active' : '') + '" data-id="' + t.id + '" onclick="relSelectType(this)" style="' + (rel && rel.type===t.id ? 'border-color:'+t.color+';color:'+t.color+';background:'+t.color+'0a;' : '') + 'font-size:0.54rem;padding:0.25rem 0.6rem;">' + t.label + '</button>'
  ).join('');

  const modal = document.getElementById('profile-modal');
  modal.style.display = 'block';
  modal.innerHTML = '<div style="position:fixed;inset:0;background:rgba(4,3,10,0.95);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:flex-start;justify-content:center;padding-top:4rem;" onclick="if(event.target===this)closeProfile()">'
    + '<div class="arc-modal-inner" style="width:100%;max-width:600px;margin:0 1.5rem;">'
      + '<div style="padding:1.2rem 1.8rem;border-bottom:1px solid rgba(212,168,83,0.08);display:flex;justify-content:space-between;">'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.22em;color:var(--primary);">' + (rel?'EDIT':'MAP') + ' RELATIONSHIP</div>'
        + '<button onclick="closeProfile()" style="color:var(--dim);background:none;border:none;font-size:1rem;cursor:pointer;">✕</button>'
      + '</div>'
      + '<div style="padding:1.5rem 1.8rem;">'
        + '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:0.75rem;align-items:center;margin-bottom:1.2rem;">'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.3rem;">CHARACTER A</div><input id="rel-charA" value="' + (rel?rel.charA:'') + '" list="rel-chars-list" placeholder="Name..." style="width:100%;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text);font-family:\'Playfair Display\',serif;font-style:italic;font-size:1rem;padding:0.4rem 0.6rem;outline:none;"></div>'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:var(--dim);text-align:center;">⟷</div>'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.3rem;">CHARACTER B</div><input id="rel-charB" value="' + (rel?rel.charB:'') + '" list="rel-chars-list" placeholder="Name..." style="width:100%;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text);font-family:\'Playfair Display\',serif;font-style:italic;font-size:1rem;padding:0.4rem 0.6rem;outline:none;"></div>'
        + '</div>'
        + '<datalist id="rel-chars-list">' + charOpts + '</datalist>'
        + '<div style="margin-bottom:1.1rem;"><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.4rem;">TYPE</div><div id="rel-type-btns" style="display:flex;flex-wrap:wrap;gap:0.3rem;">' + typeOpts + '</div></div>'
        + '<div style="margin-bottom:1rem;"><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.3rem;">DESCRIPTION</div><textarea id="rel-desc" rows="3" placeholder="How they relate to each other. The texture of it." style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.08);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.65rem;outline:none;resize:vertical;line-height:1.6;">' + (rel?rel.desc||'':'') + '</textarea></div>'
        + '<div style="margin-bottom:1.5rem;"><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.3rem;">ARC / HOW IT CHANGES</div><input id="rel-dynamic" value="' + (rel?rel.dynamic||'':'') + '" placeholder="Starts as allies, ends as..." style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,168,83,0.1);color:var(--muted);font-family:\'DM Mono\',monospace;font-size:0.68rem;padding:0.35rem 0;outline:none;"></div>'
        + '<div style="display:flex;gap:0.75rem;justify-content:flex-end;">'
          + '<button onclick="closeProfile()" style="font-family:\'DM Mono\',monospace;font-size:0.68rem;padding:0.5rem 1rem;border:1px solid var(--border);background:none;color:var(--dim);cursor:pointer;">Cancel</button>'
          + '<button onclick="saveRelationship()" style="font-family:\'DM Mono\',monospace;font-size:0.42rem;letter-spacing:0.12em;padding:0.55rem 1.4rem;border:1px solid var(--primary);background:rgba(212,168,83,0.07);color:var(--primary);cursor:pointer;" onmouseover="this.style.background=\'rgba(212,168,83,0.15)\'" onmouseout="this.style.background=\'rgba(212,168,83,0.07)\'">Save ◈</button>'
        + '</div>'
      + '</div>'
    + '</div>'
  + '</div>';
}

function relSelectType(btn) {
  document.querySelectorAll('#rel-type-btns .cx-sel-btn').forEach(b => { b.classList.remove('active'); b.style.cssText='font-size:0.54rem;padding:0.25rem 0.6rem;'; });
  const type = REL_TYPES.find(t => t.id === btn.dataset.id);
  btn.classList.add('active');
  if (type) btn.style.cssText='border-color:'+type.color+';color:'+type.color+';background:'+type.color+'0a;font-size:0.54rem;padding:0.25rem 0.6rem;';
}

function saveRelationship() {
  const charA   = document.getElementById('rel-charA')?.value.trim();
  const charB   = document.getElementById('rel-charB')?.value.trim();
  const type    = document.querySelector('#rel-type-btns .cx-sel-btn.active')?.dataset.id || 'complex';
  const desc    = document.getElementById('rel-desc')?.value.trim();
  const dynamic = document.getElementById('rel-dynamic')?.value.trim();

  if (!charA || !charB) return;
  const rels = loadRelationships();
  if (_relEditId) {
    const idx = rels.findIndex(r => r.id === _relEditId);
    if (idx >= 0) rels[idx] = { ...rels[idx], charA, charB, type, desc, dynamic };
  } else {
    rels.unshift({ id: 'rel_' + Date.now(), charA, charB, type, desc, dynamic });
  }
  saveRelationships(rels);
  closeProfile();
  renderRelationshipWeb();
}

function deleteRelationship(id) {
  if (!confirm('Remove this relationship?')) return;
  saveRelationships(loadRelationships().filter(r => r.id !== id));
  renderRelationshipWeb();
}

function openPromoteModal(pinId) {
  sbLoadState();
  const pin = sbPins.find(p => p.id === pinId);
  if (!pin) return;
  _promotePinId = pinId;
  _promoteDest  = pin.type === 'entity' ? 'plotbeat' : 'codex';

  renderPromoteModal(pin);
  document.getElementById('promote-modal').style.display = 'block';
}

function closePromoteModal() {
  document.getElementById('promote-modal').style.display = 'none';
  _promotePinId = null;
}

function renderPromoteModal(pin) {
  const inner = document.getElementById('promote-modal-inner');

  // Destination grid
  const destGrid = PROMOTE_DESTS.map(d => {
    // Hide 'character' dest for world/note pins that aren't entities
    if (d.id === 'character' && pin.type === 'entity' && pin.entityId) return ''; // already a character
    const active = d.id === _promoteDest;
    return '<div class="promote-dest-card' + (active ? ' active' : '') + '" onclick="selectPromoteDest(\'' + d.id + '\',\'' + (pin.id) + '\')">'
      + '<span class="promote-dest-icon">' + d.icon + '</span>'
      + '<div class="promote-dest-label">' + d.label + '</div>'
      + '<div class="promote-dest-desc">' + d.desc + '</div>'
      + '</div>';
  }).join('');

  // Pre-fill preview
  const prefill = buildPromotePrefill(pin, _promoteDest);

  // Dynamic fields for the chosen dest
  const fields = buildPromoteFields(pin, _promoteDest);

  inner.innerHTML = ''
    // Header
    + '<div style="padding:1.2rem 1.8rem;border-bottom:1px solid rgba(212,168,83,0.08);display:flex;justify-content:space-between;align-items:center;">'
      + '<div>'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.22em;color:var(--primary);text-transform:uppercase;">Send to World</div>'
        + '<div style="font-family:\'Playfair Display\',serif;font-size:1.1rem;font-style:italic;color:var(--text);margin-top:0.2rem;">' + pin.name + '</div>'
      + '</div>'
      + '<button onclick="closePromoteModal()" style="font-family:\'DM Mono\',monospace;color:var(--dim);background:none;border:none;font-size:1rem;cursor:pointer;">✕</button>'
    + '</div>'
    // Body
    + '<div style="padding:1.5rem 1.8rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.54rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.75rem;">Promote to</div>'
      + '<div class="promote-dest-grid">' + destGrid + '</div>'
      + prefill
      + fields
    + '</div>'
    // Actions
    + '<div style="padding:1rem 1.8rem;border-top:1px solid rgba(212,168,83,0.08);display:flex;gap:0.75rem;justify-content:flex-end;">'
      + '<button onclick="closePromoteModal()" style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.1em;padding:0.5rem 1rem;border:1px solid var(--border);background:none;color:var(--dim);cursor:pointer;">Cancel</button>'
      + '<button onclick="executePromotion()" style="font-family:\'DM Mono\',monospace;font-size:0.42rem;letter-spacing:0.12em;padding:0.55rem 1.5rem;border:1px solid var(--primary);background:rgba(212,168,83,0.07);color:var(--primary);cursor:pointer;" onmouseover="this.style.background=\'rgba(212,168,83,0.15)\'" onmouseout="this.style.background=\'rgba(212,168,83,0.07)\'">↑ Promote ◈</button>'
    + '</div>';
}

function selectPromoteDest(destId, pinId) {
  _promoteDest = destId;
  sbLoadState();
  const pin = sbPins.find(p => p.id === parseInt(pinId));
  if (pin) renderPromoteModal(pin);
}

function buildPromotePrefill(pin, dest) {
  const rows = [];
  rows.push({ key: 'Title', val: pin.name });
  if (pin.sub)   rows.push({ key: 'Role / Sub', val: pin.sub });
  if (pin.world) rows.push({ key: 'World', val: pin.world });
  if (dest === 'codex')    rows.push({ key: 'Filed as', val: pin.type === 'note' ? 'concept' : pin.type === 'entity' ? 'commentary' : 'concept' });
  if (dest === 'plotbeat') rows.push({ key: 'Act', val: 'setup' });
  if (dest === 'post')     rows.push({ key: 'Status', val: 'draft' });
  if (dest === 'character') rows.push({ key: 'Type', val: 'Character' });

  return '<div class="promote-prefill">'
    + '<div class="promote-prefill-label">Carried over from the board</div>'
    + rows.map(r => '<div class="promote-prefill-row"><span>' + r.key + '</span>' + r.val + '</div>').join('')
    + '</div>';
}

function buildPromoteFields(pin, dest) {
  let html = '';

  if (dest === 'codex') {
    const medOptions = ['music','poetry','visual','storyboard','film','games','commentary','concept'];
    const defaultMed = pin.type === 'note' ? 'concept' : 'commentary';
    html += '<div style="margin-bottom:1.1rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.4rem;">Codex Medium</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;">'
      + medOptions.map(m => '<button class="cx-sel-btn' + (m===defaultMed?' active':'') + '" data-id="' + m + '" onclick="promoteSelectMed(this)" style="font-size:0.54rem;padding:0.22rem 0.6rem;' + (m===defaultMed?'border-color:var(--primary);color:var(--primary);background:rgba(212,168,83,0.07);':'') + '">' + m + '</button>').join('')
      + '</div>'
      + '</div>';
    html += '<div style="margin-bottom:1rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.3rem;">Notes / Body</div>'
      + '<textarea id="prm-notes" rows="3" placeholder="Any additional context to carry over..." style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.08);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.6rem;outline:none;resize:vertical;line-height:1.6;"></textarea>'
      + '</div>';

  } else if (dest === 'plotbeat') {
    const actOpts = ['setup','confrontation','resolution','epilogue','standalone'];
    const typeOpts = ['scene','turn','revelation','conflict','transition','note'];
    html += '<div style="margin-bottom:0.9rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.35rem;">Act</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;">'
      + actOpts.map(a => '<button class="cx-sel-btn' + (a==='setup'?' active':'') + '" data-id="' + a + '" onclick="promoteSelectAct(this)" style="font-size:0.54rem;padding:0.22rem 0.6rem;' + (a==='setup'?'border-color:var(--primary);color:var(--primary);background:rgba(212,168,83,0.07);':'') + '">' + a + '</button>').join('')
      + '</div></div>'
      + '<div style="margin-bottom:0.9rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.35rem;">Beat Type</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;">'
      + typeOpts.map(t => '<button class="cx-sel-btn' + (t==='scene'?' active':'') + '" data-id="' + t + '" onclick="promoteSelectBeatType(this)" style="font-size:0.54rem;padding:0.22rem 0.6rem;' + (t==='scene'?'border-color:var(--primary);color:var(--primary);background:rgba(212,168,83,0.07);':'') + '">' + t + '</button>').join('')
      + '</div></div>'
      + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.3rem;">Synopsis</div>'
      + '<textarea id="prm-synopsis" rows="3" placeholder="What happens in this beat..." style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.08);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.6rem;outline:none;resize:vertical;line-height:1.6;"></textarea>'
      + '</div>';

  } else if (dest === 'post') {
    html += '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.3rem;">Excerpt / Opening</div>'
      + '<textarea id="prm-excerpt" rows="3" placeholder="Opening lines, rough excerpt..." style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.08);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.6rem;outline:none;resize:vertical;line-height:1.6;"></textarea>'
      + '</div>';

  } else if (dest === 'character') {
    html += '<div style="margin-bottom:0.9rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.3rem;">Character Type</div>'
      + '<input id="prm-char-type" value="' + (pin.sub || '') + '" placeholder="Synthetic Entity, Human, Other..." style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,168,83,0.1);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.35rem 0;outline:none;">'
      + '</div>'
      + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.18em;color:var(--dim);text-transform:uppercase;margin-bottom:0.3rem;">Psyche / Core Note</div>'
      + '<textarea id="prm-psyche" rows="3" placeholder="Who are they, what drives them..." style="width:100%;background:rgba(255,255,255,0.02);border:1px solid rgba(212,168,83,0.08);color:var(--text-sub);font-family:\'Cormorant Garamond\',serif;font-size:1rem;padding:0.6rem;outline:none;resize:vertical;line-height:1.6;"></textarea>'
      + '</div>';
  }

  return html;
}

function promoteSelectMed(btn) {
  btn.closest('div').querySelectorAll('.cx-sel-btn').forEach(b => { b.classList.remove('active'); b.style.cssText='font-size:0.54rem;padding:0.22rem 0.6rem;'; });
  btn.classList.add('active'); btn.style.cssText='font-size:0.54rem;padding:0.22rem 0.6rem;border-color:var(--primary);color:var(--primary);background:rgba(212,168,83,0.07);';
}

function promoteSelectAct(btn) {
  btn.closest('div').querySelectorAll('.cx-sel-btn').forEach(b => { b.classList.remove('active'); b.style.cssText='font-size:0.54rem;padding:0.22rem 0.6rem;'; });
  btn.classList.add('active'); btn.style.cssText='font-size:0.54rem;padding:0.22rem 0.6rem;border-color:var(--primary);color:var(--primary);background:rgba(212,168,83,0.07);';
}

function promoteSelectBeatType(btn) {
  btn.closest('div').querySelectorAll('.cx-sel-btn').forEach(b => { b.classList.remove('active'); b.style.cssText='font-size:0.54rem;padding:0.22rem 0.6rem;'; });
  btn.classList.add('active'); btn.style.cssText='font-size:0.54rem;padding:0.22rem 0.6rem;border-color:var(--primary);color:var(--primary);background:rgba(212,168,83,0.07);';
}

function executePromotion() {
  sbLoadState();
  const pin  = sbPins.find(p => p.id === _promotePinId);
  if (!pin) return;
  const dest = _promoteDest;

  let destLabel = '';
  let navFn = null;

  if (dest === 'codex') {
    const med     = document.querySelector('#promote-modal-inner .cx-sel-btn.active[data-id]')?.dataset.id || 'concept';
    const notes   = document.getElementById('prm-notes')?.value.trim() || '';
    const entries = loadCodexEntries();
    entries.unshift({
      id: 'cx_' + Date.now(),
      title:  pin.name,
      tags:   (pin.world || '') + (pin.sub ? ',' + pin.sub : ''),
      medium: med,
      world:  pin.world || 'all',
      status: 'idea',
      fields: notes ? { notes } : {},
      date:   new Date().toISOString().slice(0,10),
      fromPin: true,
    });
    saveCodexEntries(entries);
    destLabel = 'Codex';
    navFn = () => navigate('codex');

  } else if (dest === 'plotbeat') {
    const actBtns  = document.querySelectorAll('#promote-modal-inner .cx-sel-btn.active');
    const act      = actBtns[0]?.dataset.id || 'setup';
    const type     = actBtns[1]?.dataset.id || 'scene';
    const synopsis = document.getElementById('prm-synopsis')?.value.trim() || '';
    const beats    = loadPlotBeats();
    beats.push({
      id:       'pr_' + Date.now(),
      title:    pin.name,
      synopsis: synopsis,
      chars:    pin.type === 'entity' ? pin.name : '',
      notes:    pin.sub || '',
      act:      act,
      type:     type,
      status:   'exploring',
      created:  new Date().toISOString().slice(0,10),
      fromPin:  true,
    });
    savePlotBeats(beats);
    destLabel = 'Plot Room';
    navFn = () => navigate('plotroom');

  } else if (dest === 'post') {
    const excerpt = document.getElementById('prm-excerpt')?.value.trim() || '';
    const existing = loadPosts();
    const newPost = {
      id:       'post_' + Date.now(),
      title:    pin.name,
      subtitle: pin.sub || '',
      category: 'Worlds',
      world:    pin.world || 'GOA',
      tags:     [pin.type],
      excerpt:  excerpt,
      content:  excerpt,
      status:   'draft',
      date:     new Date().toISOString().slice(0,10),
      fromPin:  true,
    };
    existing.unshift(newPost);
    savePosts(existing);
    destLabel = 'Bazaar (as draft)';
    navFn = () => navigate('archive');

  } else if (dest === 'character') {
    const charType = document.getElementById('prm-char-type')?.value.trim() || 'Unknown';
    const psyche   = document.getElementById('prm-psyche')?.value.trim() || '';
    const chars    = loadRegistry();
    const newChar  = {
      id:          'char_' + Date.now(),
      name:        pin.name,
      designation: pin.sub || '',
      type:        charType,
      world:       pin.world || 'GOA',
      sector:      '',
      status:      'active',
      statusLabel: 'Active',
      appearance:  '',
      psyche:      psyche,
      directive:   '',
      relationships: [],
      appearances:   [],
      quote:         '',
      fromPin:       true,
    };
    chars.push(newChar);
    saveRegistry(chars);
    destLabel = 'The Registry';
    navFn = () => { navigate('informatics'); };
  }

  // Show success state
  showPromoteSuccess(pin.name, destLabel, navFn);
}

function showPromoteSuccess(name, dest, navFn) {
  const inner = document.getElementById('promote-modal-inner');
  inner.innerHTML = '<div class="promote-success">'
    + '<div class="promote-success-icon">◈</div>'
    + '<div class="promote-success-msg">"' + name + '" has been promoted</div>'
    + '<div class="promote-success-sub" style="margin-bottom:1.5rem;">Filed into ' + dest + '</div>'
    + '<div style="display:flex;gap:0.75rem;justify-content:center;">'
      + '<button onclick="closePromoteModal()" style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.1em;padding:0.5rem 1.2rem;border:1px solid var(--border);background:none;color:var(--dim);cursor:pointer;">Stay in Sandbox</button>'
      + '<button onclick="closePromoteModal();' + (navFn ? '(' + navFn.toString() + ')()' : '') + '" style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.1em;padding:0.5rem 1.2rem;border:1px solid var(--primary);background:rgba(212,168,83,0.07);color:var(--primary);cursor:pointer;">Go to ' + dest + ' →</button>'
    + '</div>'
  + '</div>';
}
