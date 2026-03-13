
/*
 Sandbox Controller
 Transitional layer to move orchestration out of app.js.
 Currently delegates to legacy functions defined in app.js.
*/

window.SandboxController = {
  render() {
    if (typeof renderSandbox === "function") renderSandbox();
  },

  loadState() {
    if (typeof sbLoadState === "function") sbLoadState();
  },

  saveState() {
    if (typeof sbSaveState === "function") sbSaveState();
  },

  addEntity() {
    if (typeof sbAddEntity === "function") sbAddEntity();
  },

  addNote() {
    if (typeof sbAddNote === "function") sbAddNote();
  },

  connect() {
    if (typeof sbConnect === "function") sbConnect();
  },

  removeConnection(id) {
    if (typeof sbRemoveConnection === "function") sbRemoveConnection(id);
  }
};


/* Extracted from legacy app.js during de-monolith pass */

function renderSandbox() {
  sbLoadState();
  sbRenderBoard();
  sbRenderConnections();
}

function sbSaveState() {
  localStorage.setItem('rub_sandbox_pins', JSON.stringify(sbPins));
  localStorage.setItem('rub_sandbox_conns', JSON.stringify(sbConnections));
}

function sbLoadState() {
  try { sbPins = JSON.parse(localStorage.getItem('rub_sandbox_pins') || '[]'); } catch { sbPins = []; }
  try { sbConnections = JSON.parse(localStorage.getItem('rub_sandbox_conns') || '[]'); } catch { sbConnections = []; }
  sbNextId = sbPins.reduce((m, p) => Math.max(m, p.id + 1), 1);
}

function sbAddEntity() {
  const chars = loadRegistry();
  const name = prompt('Pin character:\n' + chars.map((c,i) => i+1+'. '+c.name).join('\n') + '\n\nType name or number:');
  if (!name) return;
  const idx = parseInt(name) - 1;
  const char = isNaN(idx) ? chars.find(c => c.name.toLowerCase() === name.toLowerCase()) : chars[idx];
  if (!char) { alert('Character not found'); return; }
  sbPins.push({ id: sbNextId++, type: 'entity', name: char.name, sub: char.designation, world: char.world, entityId: char.id, x: 80 + Math.random()*400, y: 80 + Math.random()*300 });
  sbSaveState(); sbRenderBoard();
}

function sbAddNote() {
  const text = prompt('Note text:');
  if (!text) return;
  sbPins.push({ id: sbNextId++, type: 'note', name: text, sub: '', x: 80 + Math.random()*400, y: 80 + Math.random()*300 });
  sbSaveState(); sbRenderBoard();
}


function sbAddWorld() {
  const worlds = WORLDS_DATA.filter(w => !w.locked);
  const name = prompt('Pin world:\n' + worlds.map((w,i) => i+1+'. '+w.name).join('\n') + '\n\nType name or number:');
  if (!name) return;
  const idx = parseInt(name) - 1;
  const world = isNaN(idx) ? worlds.find(w => w.name.toLowerCase().includes(name.toLowerCase())) : worlds[idx];
  if (!world) { alert('World not found'); return; }
  sbPins.push({ id: sbNextId++, type: 'world', name: world.name, sub: world.sector || 'SECTOR', x: 80 + Math.random()*400, y: 80 + Math.random()*300 });
  sbSaveState(); sbRenderBoard();
}

function sbRemovePin(id) {
  sbPins = sbPins.filter(p => p.id !== id);
  sbConnections = sbConnections.filter(c => c.from !== id && c.to !== id);
  sbSaveState(); sbRenderBoard(); sbRenderConnections();
}

function sbStartConnect(id) {
  sbConnectMode = true;
  sbConnectFrom = id;
  document.getElementById('sb-mode-bar').style.display = 'block';
  document.querySelectorAll('.sb-pin').forEach(el => {
    if (parseInt(el.dataset.id) !== id) el.classList.add('connecting');
  });
  const handler = (e) => {
    if (e.key === 'Escape') { sbCancelConnect(); document.removeEventListener('keydown', handler); }
  };
  document.addEventListener('keydown', handler);
}

function sbCancelConnect() {
  sbConnectMode = false; sbConnectFrom = null;
  document.getElementById('sb-mode-bar').style.display = 'none';
  document.querySelectorAll('.sb-pin').forEach(el => el.classList.remove('connecting'));
}

function sbClickPin(id) {
  if (!sbConnectMode) return;
  if (id === sbConnectFrom) { sbCancelConnect(); return; }
  // Check not duplicate
  const exists = sbConnections.find(c => (c.from===sbConnectFrom&&c.to===id)||(c.from===id&&c.to===sbConnectFrom));
  if (!exists) {
    const fromPin = sbPins.find(p => p.id === sbConnectFrom);
    const toPin = sbPins.find(p => p.id === id);
    const relType = prompt(`Relationship between "${fromPin.name}" and "${toPin.name}":\nExamples: Allies, Adversaries, Displaced Into, Observed By, Collides With\n\nType relationship:`);
    if (relType) {
      sbConnections.push({ id: sbNextId++, from: sbConnectFrom, to: id, type: relType });
      sbSaveState(); sbRenderConnections();
    }
  }
  sbCancelConnect();
  sbDrawLines();
}

function sbRenderBoard() {
  const pinsEl = document.getElementById('sb-pins');
  const hint = document.getElementById('sb-empty-hint');
  if (!pinsEl) return;
  hint.style.display = sbPins.length ? 'none' : 'flex';

  pinsEl.innerHTML = '';
  sbPins.forEach(pin => {
    const el = document.createElement('div');
    el.className = 'sb-pin';
    el.dataset.id = pin.id;
    el.style.left = pin.x + 'px';
    el.style.top = pin.y + 'px';
    el.innerHTML = `
      <div class="sb-pin-header">
        <span class="sb-pin-type ${pin.type}">${pin.type.toUpperCase()}</span>
        <span class="sb-pin-close" onclick="sbRemovePin(${pin.id})">✕</span>
      </div>
      <div class="sb-pin-body">
        <div class="sb-pin-name">${pin.name}</div>
        ${pin.sub ? `<div class="sb-pin-sub">${pin.sub}</div>` : ''}
      </div>
      <div class="sb-pin-actions">
        <button class="sb-pin-btn connect-btn" onclick="sbStartConnect(${pin.id})">Connect</button>
        ${pin.entityId ? `<button class="sb-pin-btn" onclick="openProfile('${pin.entityId}')">Profile</button>` : ''}
        <button class="sb-pin-btn promote-btn" onclick="openPromoteModal(${pin.id})" title="Promote to a real entry">↑ Promote</button>
      </div>`;

    // Drag
    el.addEventListener('mousedown', e => {
      if (e.target.classList.contains('sb-pin-close') || e.target.tagName === 'BUTTON') return;
      if (sbConnectMode) { sbClickPin(pin.id); return; }
      sbDragging = pin.id;
      const board = document.getElementById('sb-board').getBoundingClientRect();
      sbDragOffset = { x: e.clientX - board.left - pin.x, y: e.clientY - board.top - pin.y };
      el.classList.add('dragging');
      e.preventDefault();
    });

    pinsEl.appendChild(el);
  });

  // Mouse move/up on board
  const board = document.getElementById('sb-board');
  board.onmousemove = (e) => {
    if (!sbDragging) return;
    const rect = board.getBoundingClientRect();
    const pin = sbPins.find(p => p.id === sbDragging);
    if (!pin) return;
    pin.x = Math.max(0, Math.min(rect.width - 200, e.clientX - rect.left - sbDragOffset.x));
    pin.y = Math.max(0, Math.min(rect.height - 120, e.clientY - rect.top - sbDragOffset.y));
    const el = document.querySelector(`.sb-pin[data-id="${sbDragging}"]`);
    if (el) { el.style.left = pin.x + 'px'; el.style.top = pin.y + 'px'; }
    sbDrawLines();
  };
  board.onmouseup = () => {
    if (sbDragging) {
      document.querySelectorAll('.sb-pin').forEach(el => el.classList.remove('dragging'));
      sbSaveState();
      sbDragging = null;
    }
  };

  sbDrawLines();
}

function sbDrawLines() {
  const canvas = document.getElementById('sb-canvas');
  const board = document.getElementById('sb-board');
  if (!canvas || !board) return;
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  sbConnections.forEach(conn => {
    const fromPin = sbPins.find(p => p.id === conn.from);
    const toPin = sbPins.find(p => p.id === conn.to);
    if (!fromPin || !toPin) return;
    const fx = fromPin.x + 100, fy = fromPin.y + 60;
    const tx = toPin.x + 100, ty = toPin.y + 60;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = 'rgba(212,168,83,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    // Midpoint label
    const mx = (fx + tx) / 2, my = (fy + ty) / 2;
    ctx.fillStyle = 'rgba(212,168,83,0.6)';
    ctx.font = '9px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(conn.type, mx, my - 5);
  });
}

function sbRenderConnections() {
  const el = document.getElementById('sb-connections');
  if (!el) return;
  if (!sbConnections.length) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.42rem;letter-spacing:0.2em;color:var(--muted);margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">ACTIVE CONNECTIONS</div>
    ${sbConnections.map(conn => {
      const fromPin = sbPins.find(p => p.id === conn.from);
      const toPin = sbPins.find(p => p.id === conn.to);
      if (!fromPin || !toPin) return '';
      return `<div class="sb-conn-item">
        <div>
          <div class="sb-conn-label">${fromPin.name} ↔ ${toPin.name}</div>
          <div class="sb-conn-type">${conn.type}</div>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="sb-conn-write" onclick="sbOpenWrite('${fromPin.name}','${toPin.name}','${conn.type}')">↗ Write This</button>
          <button class="sb-conn-write" onclick="sbRemoveConn(${conn.id})" style="color:var(--muted)">Remove</button>
        </div>
      </div>`;
    }).join('')}`;
}

function sbRemoveConn(id) {
  sbConnections = sbConnections.filter(c => c.id !== id);
  sbSaveState(); sbRenderConnections(); sbDrawLines();
}

function sbOpenWrite(nameA, nameB, rel) {
  const panel = document.getElementById('sb-write-panel');
  document.getElementById('sb-write-title').textContent = `NEW ENTRY — ${nameA} × ${nameB}`;
  document.getElementById('sb-write-tx-title').value = `${nameA} and ${nameB}: ${rel}`;
  document.getElementById('sb-write-body').value = '';
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

function sbPublishTransmission() {
  const title = document.getElementById('sb-write-tx-title').value.trim();
  const body = document.getElementById('sb-write-body').value.trim();
  if (!title || !body) { alert('Add a title and body first.'); return; }
  const posts = loadPosts();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now();
  const newPost = {
    id: Date.now(), title, subtitle: 'Sandbox Entry', category: 'Worlds', world: '',
    tags: ['sandbox'], excerpt: body.slice(0, 120) + '…',
    signalExtract: body.slice(0, 80) + '…',
    bodyHtml: body.split('\n\n').map(p => `<p>${p}</p>`).join(''),
    status: 'published', slug, featuredImageUrl: '',
    readTimeMinutes: Math.max(1, Math.ceil(body.split(' ').length / 200)),
    publishDate: new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'}).replace(/\//g,'.'),
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  savePosts(posts);
  document.getElementById('sb-write-panel').style.display = 'none';
  alert(`"${title}" published to the Bazaar.`);
}

function sbSaveDraft() {
  const title = document.getElementById('sb-write-tx-title').value.trim();
  const body = document.getElementById('sb-write-body').value.trim();
  if (!title) { alert('Add a title first.'); return; }
  const posts = loadPosts();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-draft';
  posts.push({
    id: Date.now(), title, subtitle: 'Draft', category: 'Worlds', world: '',
    tags: ['sandbox','draft'], excerpt: body.slice(0,120) + '…', signalExtract: '',
    bodyHtml: body.split('\n\n').map(p => `<p>${p}</p>`).join(''),
    status: 'draft', slug, featuredImageUrl: '',
    readTimeMinutes: 1, publishDate: '--',
    createdAt: new Date().toISOString()
  });
  savePosts(posts);
  document.getElementById('sb-write-panel').style.display = 'none';
  alert('Draft saved.');
}

function sbClear() {
  if (!confirm('Clear the entire board?')) return;
  sbPins = []; sbConnections = [];
  sbSaveState(); sbRenderBoard(); sbRenderConnections();
}
