// gallery runtime kernel
(function () {
function setGalleryFilter(f) {
  galleryFilter = f;
  renderGallery();
}

function setGalleryTypeFilter(t) {
  galleryTypeFilter = t;
  renderGallery();
}

function renderGalleryGrid(items) {
  let filtered = galleryFilter === 'ALL' ? items
    : galleryFilter === 'ENCRYPTED' ? items.filter(i => i.isLocked)
    : items.filter(i => i.world === galleryFilter);

  if (galleryTypeFilter !== 'all') {
    filtered = filtered.filter(i => (i.type || 'illustration') === galleryTypeFilter);
  }

  const grid = document.getElementById('gallery-full-grid');
  if (!filtered.length) { grid.innerHTML = '<div class="empty-state">Nothing here yet. Keep building.</div>'; return; }

  // ── Hero piece (first visible, non-locked) ──
  const heroItem = filtered.find(function(i){ return !i.isLocked && i.imageUrl; }) || filtered[0];
  const restItems = filtered.filter(function(i){ return i !== heroItem; });

  function buildCard(item, isHero) {
    var typeInfo = GALLERY_TYPES.find(function(t){ return t.id === (item.type||'illustration'); }) || GALLERY_TYPES[GALLERY_TYPES.length-1];
    var links = loadLinks();
    var hasLinks = (links[item.id] || []).length > 0;
    var cursor = item.isLocked ? 'default' : 'pointer';
    var imgHtml = item.imageUrl
      ? '<img src="' + item.imageUrl + '" alt="' + item.title + '">'
      : '<div class="gallery-panel-placeholder"><span style="font-size:2.5rem;color:var(--muted)">◈</span><span>' + item.world + '</span></div>';

    var panelClass = isHero ? 'gallery-panel gallery-hero-panel' : 'gallery-panel';

    var clickHandler = '';
    if (!item.isLocked) {
      if (item.linkedArticleSlug) {
        clickHandler = 'data-artslug="' + item.linkedArticleSlug + '"';
      } else if (item.imageUrl) {
        clickHandler = 'data-lightbox="1"';
      }
    }
    return '<div class="gal-exhibit-item' + (isHero ? ' gal-hero-item' : '') + '" ' + clickHandler + ' style="cursor:' + cursor + ';">'
      + '<div class="' + panelClass + '">'
        + imgHtml
        + (item.isLocked ? '<div class="gallery-panel-locked">[ Encrypted ]</div>' : '')
      + '</div>'
      + '<div class="gal-caption">'
        + '<div class="gal-caption-top">'
          + '<div class="gal-caption-world">' + (item.world || '') + '</div>'
          + '<div style="display:flex;align-items:center;gap:0.6rem;">'
            + (hasLinks ? '<span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--dim);">⛓ ' + (links[item.id]||[]).length + '</span>' : '')
            + '<div class="gal-caption-type">' + typeInfo.icon + ' ' + typeInfo.label + '</div>'
          + '</div>'
        + '</div>'
        + '<div class="gal-caption-title">' + item.title + '</div>'
        + (item.subtitle ? '<div class="gal-caption-sub">' + item.subtitle + '</div>' : '')
        + (item.linkedArticleSlug && !item.isLocked ? '<div class="gal-caption-link">↗ Full transmission</div>' : '')
      + '</div>'
    + '</div>';
  }

  var heroHtml = heroItem ? '<div class="gal-hero-wrap">' + buildCard(heroItem, true) + '</div>' : '';
  var gridHtml = restItems.length
    ? '<div class="gallery-full-grid">' + restItems.map(function(i){ return buildCard(i, false); }).join('') + '</div>'
    : '';

  grid.innerHTML = heroHtml + gridHtml;

  grid.onclick = function(e) {
    var item = e.target.closest('.gal-exhibit-item');
    if (!item) return;
    if (item.hasAttribute('data-artslug')) {
      navigate('article', item.getAttribute('data-artslug'));
    } else if (item.hasAttribute('data-lightbox')) {
      var img = item.querySelector('img');
      var title = item.querySelector('.gal-caption-title');
      if (img) openGalleryLightbox(img.src, title ? title.textContent : '');
    }
  };
}

function openGalleryLightbox(src, title) {
  var lb = document.getElementById('gal-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'gal-lightbox';
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(7,6,15,0.96);z-index:800;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;';
    lb.onclick = function() { lb.style.display = 'none'; };
    document.body.appendChild(lb);
  }
  lb.innerHTML = '<img src="' + src + '" style="max-width:90vw;max-height:82vh;object-fit:contain;">'
    + '<div style="font-family:\'Playfair Display\',serif;font-style:italic;color:var(--text-sub);margin-top:1.2rem;font-size:1.1rem;">' + title + '</div>'
    + '<div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:var(--dim);margin-top:0.5rem;letter-spacing:0.14em;">— click anywhere to close —</div>';
  lb.style.display = 'flex';
}

  window.setGalleryFilter = setGalleryFilter;
  window.setGalleryTypeFilter = setGalleryTypeFilter;
  window.renderGalleryGrid = renderGalleryGrid;
  window.openGalleryLightbox = openGalleryLightbox;
})();
