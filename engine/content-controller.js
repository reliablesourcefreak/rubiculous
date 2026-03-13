
/*
 Content Controller
 Transitional orchestration layer for archive/posts/gallery flows.
 Delegates to legacy functions in app.js while extraction continues.
*/

window.ContentController = {

  renderArchive() {
    if (typeof renderArchive === "function") renderArchive();
  },

  renderArticle(id) {
    if (typeof renderArticle === "function") renderArticle(id);
  },

  renderGallery() {
    if (typeof renderGallery === "function") renderGallery();
  },

  openPost(id) {
    if (typeof renderArticle === "function") renderArticle(id);
  },

  backToArchive() {
    if (typeof renderArchive === "function") renderArchive();
  }

};


/* Extracted from legacy app.js during de-monolith pass */

function renderArchive() {
  posts = loadPosts();
  var pub   = posts.filter(function(p){ return p.status === 'published'; });
  var chars = loadRegistry();
  var codex = loadCodexEntries();

  // ── Stats ──
  var sp = document.getElementById('baz-stat-posts');
  var sc = document.getElementById('baz-stat-chars');
  var sx = document.getElementById('baz-stat-codex');
  if (sp) sp.innerHTML = pub.length + '<span>transmissions</span>';
  if (sc) sc.innerHTML = chars.length + '<span>entities</span>';
  if (sx) sx.innerHTML = codex.length + '<span>in the codex</span>';

  // ── Filter bar ──
  var filterEl = document.getElementById('baz-filters');
  var categories = ['ALL', ...new Set(pub.map(function(p){ return p.category; }).filter(Boolean))];
  window._bazFilter = window._bazFilter || 'ALL';
  if (filterEl) {
    filterEl.innerHTML = categories.map(function(cat) {
      return '<button class="baz-filter-btn' + (window._bazFilter === cat ? ' active' : '') + '" onclick="window._bazFilter=\''+cat+'\';renderArchive();">' + cat + '</button>';
    }).join('');
  }

  // ── Editorial grid ──
  var gridEl = document.getElementById('baz-editorial');
  if (!gridEl) return;

  var filtered = window._bazFilter === 'ALL' ? pub : pub.filter(function(p){ return p.category === window._bazFilter; });

  if (!filtered.length) {
    gridEl.innerHTML = '<div class="baz-empty-editorial"><p>Nothing sent yet. The silence is temporary.</p></div>';
    renderArchiveDossier(pub);
    return;
  }

  // Build mixed editorial grid
  // First post = hero card (full width)
  // 2nd + 3rd = side by side large
  // Rest = 3-column smaller cards
  var html = '';

  filtered.forEach(function(p, i) {
    var world = p.world ? '<span class="baz-card-world">' + p.world + '</span>' : '';
    var cat   = p.category ? '<span class="baz-card-cat">' + p.category + '</span>' : '';
    var date  = p.publishDate ? '<span class="baz-card-date">' + p.publishDate + '</span>' : '';
    var img   = p.featuredImageUrl ? '<div class="baz-card-img"><img src="' + p.featuredImageUrl + '" alt=""></div>' : '';

    if (i === 0) {
      // HERO card — full width, image-led if has image
      html += '<div class="baz-card baz-card-hero' + (p.featuredImageUrl ? ' has-img' : '') + '" data-slug="' + p.slug + '">';
      if (p.featuredImageUrl) html += img;
      html += '<div class="baz-card-body">';
      html += '<div class="baz-card-meta">' + world + cat + date + '</div>';
      html += '<h2 class="baz-card-title">' + p.title + '</h2>';
      html += '<p class="baz-card-excerpt">' + (p.excerpt || '') + '</p>';
      html += '<span class="baz-card-read">↗ Read</span>';
      html += '</div></div>';
    } else if (i === 1 || i === 2) {
      // LARGE card — half width
      html += '<div class="baz-card baz-card-large' + (p.featuredImageUrl ? ' has-img' : '') + '" data-slug="' + p.slug + '">';
      if (p.featuredImageUrl) html += img;
      html += '<div class="baz-card-body">';
      html += '<div class="baz-card-meta">' + world + cat + date + '</div>';
      html += '<h3 class="baz-card-title">' + p.title + '</h3>';
      html += '<p class="baz-card-excerpt">' + (p.excerpt || '') + '</p>';
      html += '<span class="baz-card-read">↗ Read</span>';
      html += '</div></div>';
    } else {
      // STANDARD card — third width
      html += '<div class="baz-card baz-card-std" data-slug="' + p.slug + '">';
      html += '<div class="baz-card-body">';
      html += '<div class="baz-card-meta">' + world + cat + date + '</div>';
      html += '<h4 class="baz-card-title">' + p.title + '</h4>';
      html += '<p class="baz-card-excerpt baz-card-excerpt-short">' + (p.excerpt || '') + '</p>';
      html += '</div></div>';
    }
  });

  gridEl.innerHTML = html;
  gridEl.onclick = function(e) {
    var card = e.target.closest('[data-slug]');
    if (card) navigate('article', card.getAttribute('data-slug'));
  };

  // ── Full archive dossier ──
  renderArchiveDossier(pub);
}

function renderArticle(slug) {
  posts = loadPosts();
  const post = posts.find(p => p.slug === slug);
  const el = document.getElementById('article-inner');
  if (!post) {
    el.innerHTML = `<div style="text-align:center;padding:5rem 0">
      <h1 class="font-display" style="font-size:3rem;color:var(--fire);font-style:italic">Signal Lost</h1>
      <p style="font-family:var(--font-mono);font-size:0.6rem;color:var(--muted);letter-spacing:0.2em;margin-top:1rem">Record_Not_Found</p>
      <button class="back-link" style="margin:2rem auto 0" onclick="navigate('archive')">← Back to the Bazaar</button>
    </div>`;
    return;
  }

  const tagsHtml = (post.tags||[]).map(t => `<span class="tag-chip">${t}</span>`).join('');
  const postLinked  = renderLinkedPanel(post.id, post.title);

  el.innerHTML = `
    <button class="back-link" onclick="navigate('archive')">← Back to the Bazaar</button>
    <header class="article-header">
      <div class="article-cat">${post.category}${post.world ? ' // ' + post.world : ''}</div>
      <h1 class="article-title font-display">${post.title}</h1>
      ${post.subtitle ? `<p class="article-subtitle font-body">"${post.subtitle}"</p>` : ''}
      <div class="article-meta">
        <span>${post.publishDate}</span>
        <span>${post.readTimeMinutes} min read</span>
      </div>
    </header>
    ${post.featuredImageUrl ? `
    <div class="article-featured-img">
      <img src="${post.featuredImageUrl}" alt="${post.title}" onerror="this.parentElement.style.display='none'">
    </div>` : ''}
    ${post.signalExtract ? `
    <div class="signal-extract">
      <div class="signal-extract-label" style="font-family:var(--font-body);font-style:italic;font-size:0.9rem;letter-spacing:0.08em;color:var(--accent)">Extract</div>
      <div class="signal-extract-text font-body">"${post.signalExtract}"</div>
    </div>` : ''}
    <div class="article-body font-body">${post.bodyHtml}</div>
    ${tagsHtml ? `<div class="article-tags">${tagsHtml}</div>` : ''}
  `;
}

function renderGallery() {
  const items = loadGallery();
  const worlds = [...new Set(items.map(i => i.world))];

  // World filter row
  const filtersEl = document.getElementById('gallery-filters');
  const filterBtns = ['ALL', ...worlds, 'ENCRYPTED'];
  filtersEl.innerHTML = filterBtns.map(function(f) {
    return '<button class="filter-btn ' + (f === galleryFilter ? 'active' : '') + '" onclick="setGalleryFilter(\''+f+'\', this)">' + f + '</button>';
  }).join('');

  // Type filter row
  let typeBar = document.getElementById('gallery-type-bar');
  if (!typeBar) {
    typeBar = document.createElement('div');
    typeBar.id = 'gallery-type-bar';
    typeBar.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:3rem;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);';
    filtersEl.insertAdjacentElement('afterend', typeBar);
  }
  typeBar.innerHTML = GALLERY_TYPES.map(function(t) {
    const count = t.id === 'all' ? items.length : items.filter(function(i){ return (i.type||'illustration') === t.id; }).length;
    const active = galleryTypeFilter === t.id;
    return '<button class="filter-btn ' + (active?'active':'') + '" onclick="setGalleryTypeFilter(\''+t.id+'\')">' + t.icon + ' ' + t.label + ' <span style="opacity:0.5;font-size:0.85em;">(' + count + ')</span></button>';
  }).join('');

  renderGalleryGrid(items);
}


function renderInformatics() {
  renderRegistryCharacters();
  renderRegistryTimeline();
}

function openArticleFromSlug(el) { var s = el.getAttribute('data-artslug'); if (s) navigate('article', s); }

function renderTransmissionLog() {
  const allPosts = loadPosts();
  const recent = [...allPosts].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  const el = document.getElementById('transmission-log-entries');
  if (!el) return;

  el.innerHTML = recent.map(p => `
    <div class="log-entry" onclick="${p.status === 'published' ? `navigate('article','${p.slug}')` : ''}">
      <div class="log-entry-dot ${p.status}"></div>
      <div class="log-entry-title">${p.title}</div>
      ${p.world ? `<div class="log-entry-meta" style="color:var(--accent);border:1px solid rgba(255,107,53,0.2);padding:0.1rem 0.4rem">${p.world}</div>` : ''}
      <div class="log-entry-meta">${p.publishDate}</div>
      <div class="log-entry-status ${p.status}">${p.status}</div>
    </div>`).join('');
}

function renderArchiveDossier(pub) {
  const list = document.getElementById('archive-list');
  if (!pub.length) { list.innerHTML = '<div class="empty-state">Nothing here yet.</div>'; return; }
  list.innerHTML = pub.map((p, i) => `
    <div class="archive-dossier-item" onclick="navigate('article','${p.slug}')">
      <div class="archive-dossier-num">${String(i+1).padStart(2,'0')}</div>
      <div class="archive-dossier-main">
        ${p.world ? `<div class="archive-dossier-world">${p.world}_SECTOR</div>` : ''}
        <div class="archive-dossier-title">${p.title}</div>
        <div class="archive-dossier-excerpt">${p.excerpt || ''}</div>
      </div>
      <div class="archive-dossier-right">
        <span class="archive-dossier-date">${p.publishDate}</span>
        <div class="archive-dossier-cat">${p.category}</div>
        <div class="archive-dossier-readtime">${p.readTimeMinutes} min read</div>
      </div>
    </div>`).join('');
}
