// Rubiculous canonical repo — registry / informatics kernel
(function () {
function loadPosts() {
  try {
    const saved = localStorage.getItem('rub_posts');
    return saved ? JSON.parse(saved) : DEFAULT_POSTS;
  } catch(e) { return DEFAULT_POSTS; }
}

function savePosts(posts) {
  localStorage.setItem('rub_posts', JSON.stringify(posts));
}

function loadGallery() {
  try {
    const saved = localStorage.getItem('rub_gallery');
    return saved ? JSON.parse(saved) : DEFAULT_GALLERY;
  } catch(e) { return DEFAULT_GALLERY; }
}

function renderPostGrid(pub) {
  const filtered = currentFilter === 'ALL' ? pub : pub.filter(p => p.category === currentFilter);
  const grid = document.getElementById('home-grid');
  if (!filtered.length) { grid.innerHTML = '<div class="empty-state">Nothing here yet.</div>'; return; }
  grid.innerHTML = filtered.map((p, i) => `
    <div class="post-card" onclick="navigate('article','${p.slug}')">
      <div class="card-num">// ${String(p.id).padStart(3,'0')}</div>
      <div class="card-meta">
        <span class="card-cat">${p.category}</span>
        <span class="card-date">${p.publishDate}</span>
      </div>
      <h3 class="card-title font-display">${p.title}</h3>
      <p class="card-excerpt font-body">${p.excerpt}</p>
      <div class="card-footer">
        <span>${p.readTimeMinutes} min read</span>
        <span class="card-open">↗ Enter</span>
      </div>
    </div>`).join('');
}

function renderGalleryPreview() {
  const items = loadGallery().slice(0, 4);
  const el = document.getElementById('gallery-preview');
  el.innerHTML = items.map(item => `
    <div class="gallery-panel" onclick="${item.linkedArticleSlug && !item.isLocked ? `navigate('article','${item.linkedArticleSlug}')` : `navigate('gallery')`}" style="cursor:${item.isLocked ? 'default' : 'pointer'}">
      ${item.imageUrl
        ? `<img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">`
        : `<div class="gallery-panel-placeholder"><span style="font-size:2rem;color:var(--muted)">◈</span><span>${item.world}</span></div>`}
      ${item.isLocked ? '<div class="gallery-panel-locked">[ Locked ]</div>' : ''}
      <div class="gallery-panel-overlay">
        <div class="gallery-panel-world">${item.world}</div>
        <div class="gallery-panel-title font-display">${item.title}</div>
        ${!item.isLocked && item.linkedArticleSlug ? '<div class="enter-hint">[ ENTER ] ↗</div>' : ''}
      </div>
    </div>`).join('');
}

function saveRegistry(chars) {
  localStorage.setItem('rub_registry', JSON.stringify(chars));
}

function renderRegistryWorlds() {
  const el = document.getElementById('registry-worlds-grid');
  if (!el) return;
  const chars = loadRegistry();
  el.innerHTML = WORLDS_DATA.map(w => {
    const wChars = chars.filter(c => c.world === w.name || c.world === w.id.toUpperCase());
    const posts = loadPosts().filter(p => p.status === 'published' && (p.world === w.name || p.world === w.id.toUpperCase()));
    return `
    <div style="border:1px solid var(--border);background:var(--bg-card);margin-bottom:1px;padding:2rem;${w.locked ? 'opacity:0.4' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
        <div>
          <div style="font-family:var(--font-mono);font-size:0.4rem;color:var(--accent);letter-spacing:0.2em;margin-bottom:0.5rem">${w.sector || ''}</div>
          <div style="font-family:var(--font-display);font-size:2rem;font-style:italic;color:var(--primary)">${w.name}</div>
        </div>
        <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);letter-spacing:0.12em">${w.status}</div>
      </div>
      <div style="font-family:var(--font-body);font-style:italic;color:var(--muted);margin-bottom:1.5rem">${w.tagline}</div>
      <div style="display:flex;gap:3rem">
        <div><div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);letter-spacing:0.15em;margin-bottom:0.3rem">ENTITIES</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--text)">${wChars.length}</div></div>
        <div><div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);letter-spacing:0.15em;margin-bottom:0.3rem">TRANSMISSIONS</div>
          <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--text)">${posts.length}</div></div>
      </div>
    </div>`;
  }).join('');
}

function renderRegistryTimeline() {
  const el = document.getElementById('registry-timeline');
  if (!el) return;
  const posts = loadPosts().filter(p => p.status === 'published').sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  el.innerHTML = `
    <div style="position:relative;padding-left:2rem">
      <div style="position:absolute;left:0;top:0;bottom:0;width:1px;background:var(--border)"></div>
      ${posts.map((p, i) => `
        <div style="position:relative;padding:1.5rem 0 1.5rem 2rem;cursor:pointer" onclick="navigate('article','${p.slug}')">
          <div style="position:absolute;left:-4px;top:1.75rem;width:9px;height:9px;border-radius:50%;background:${p.world ? 'var(--accent)' : 'var(--muted)'};border:1px solid var(--bg)"></div>
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);letter-spacing:0.12em;margin-bottom:0.3rem">${p.publishDate}${p.world ? ' — ' + p.world : ''}</div>
          <div style="font-family:var(--font-display);font-size:1.1rem;font-style:italic;color:var(--text);transition:color 0.2s" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text)'">${p.title}</div>
          <div style="font-family:var(--font-body);font-size:0.85rem;color:var(--muted);font-style:italic;margin-top:0.25rem">${p.excerpt ? p.excerpt.slice(0,100) + '…' : ''}</div>
        </div>`).join('')}
    </div>`;
}

  window.loadPosts = loadPosts;
  window.savePosts = savePosts;
  window.loadGallery = loadGallery;
  window.renderPostGrid = renderPostGrid;
  window.renderGalleryPreview = renderGalleryPreview;
  window.saveRegistry = saveRegistry;
  window.renderRegistryWorlds = renderRegistryWorlds;
  window.renderRegistryTimeline = renderRegistryTimeline;
})();
