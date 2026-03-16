// worlds zoom kernel
(function () {


  function universeCard(u) {
  const totalEntries = (u.books || []).reduce((n,b)=>n+(b||[]).length,0);  const c = u.color;
    const bookCount = (u.books||[]).length;
    const hoverOn  = u.locked ? '' : "this.style.transform='translateY(-3px)';this.style.boxShadow='0 12px 40px "+c+"25';this.style.borderColor='"+c+"55';";
    const hoverOff = u.locked ? '' : "this.style.transform='';this.style.boxShadow='0 0 30px "+c+"0f';this.style.borderColor='"+c+"33';";
    const click    = u.locked ? '' : "renderWorlds('"+u.id+"')";

    const bbp = (u.books||[])[0];
    const bbpHtml = bbp
      ? '<div style="border-left:2px solid '+c+'44;padding:0.8rem 1.2rem;background:'+c+'06;margin-bottom:1.8rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.18em;color:'+c+'55;margin-bottom:0.3rem;">BOOK 01 \u2014 IN DEVELOPMENT</div>'
          + '<div style="font-family:\'Playfair Display\',serif;font-size:1.3rem;font-style:italic;color:#f0ece4;">'+bbp.name+'</div>'
        + '</div>'
      : '';
    return '<div onclick="'+click+'" style="background:#09081a;border:1px solid '+c+'33;border-top:3px solid '+c+';cursor:'+(u.locked?'default':'pointer')+';padding:2.5rem 3rem;transition:all 0.2s;box-shadow:0 0 40px '+c+'12;position:relative;overflow:hidden;" onmouseover="'+hoverOn+'" onmouseout="'+hoverOff+'">'
      + '<div style="position:absolute;top:-40px;right:-40px;width:280px;height:280px;background:radial-gradient(circle,'+c+'08,transparent 70%);pointer-events:none;"></div>'
      + '<div style="position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,'+c+'22,transparent);"></div>'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.62rem;letter-spacing:0.26em;color:'+c+'55;margin-bottom:0.7rem;text-transform:uppercase;">Universe \u2014 '+u.subtitle+'</div>'
      + '<h2 style="font-family:\'Playfair Display\',serif;font-size:clamp(2.8rem,5vw,5rem);font-style:italic;font-weight:700;color:#f0ece4;line-height:0.85;margin-bottom:1.2rem;">'+u.name+'</h2>'
      + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;font-style:italic;color:'+c+'77;line-height:1.55;margin-bottom:2rem;max-width:580px;">'+u.tagline+'</p>'
      + bbpHtml
      + '<div style="height:1px;background:linear-gradient(90deg,'+c+'33,transparent);margin-bottom:1.5rem;"></div>'
      + '<div style="display:flex;gap:2.5rem;flex-wrap:wrap;align-items:center;justify-content:space-between;">'
        + '<div style="display:flex;gap:2.5rem;">'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.14em;color:'+c+'44;margin-bottom:0.2rem;">BOOKS</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">'+String(bookCount).padStart(2,'0')+'</div></div>'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.14em;color:'+c+'44;margin-bottom:0.2rem;">ENTRIES</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">'+String(totalEntries).padStart(3,'0')+'</div></div>'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.14em;color:'+c+'44;margin-bottom:0.2rem;">STATUS</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">'+(u.status||'ACTIVE').toUpperCase()+'</div></div>'
        + '</div>'
        + (u.locked ? '' : '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.16em;color:'+c+';border:1px solid '+c+'44;padding:0.5rem 1.2rem;background:'+c+'0a;">ENTER \u2192</div>')
      + '</div>'
    + '</div>';
  }

function showZoom(level) {
  ['zoom-universes','zoom-exnihilo','zoom-goa','zoom-world'].forEach((id,i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (i === level) ? 'block' : 'none';
  });
}

function renderZoomUniverses() {
  showZoom(0);
  const el = document.getElementById('zoom-universes');
  if (!el) return;

  const totalEntries = WORLDS_DATA.filter(w=>!w.locked).reduce((a,w)=>a+loadEntries(w.id).length,0);


  el.innerHTML = '<div style="min-height:100vh;padding:5rem 2rem 6rem;max-width:1100px;margin:0 auto;">'
    + '<div style="margin-bottom:4rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.26em;color:var(--primary);opacity:0.55;margin-bottom:0.8rem;text-transform:uppercase;">The Worlds</div>'
      + '<h1 style="font-family:\'Playfair Display\',serif;font-size:clamp(2.8rem,7vw,6rem);font-style:italic;font-weight:700;color:var(--text);line-height:0.88;margin-bottom:1.2rem;">Every Universe.<br><em>Mapped.</em></h1>'
      + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;color:var(--muted);font-style:italic;max-width:500px;">Each universe runs on its own logic. Pick a door.</p>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr;gap:1.5rem;max-width:780px;">'
      + UNIVERSES.map(universeCard).join('')
      + '<div style="border:1px dashed var(--border);padding:2rem;opacity:0.3;">'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.62rem;letter-spacing:0.18em;color:var(--dim);margin-bottom:0.4rem;">NEXT UNIVERSE</div>'
        + '<div style="font-family:\'Playfair Display\',serif;font-size:1.4rem;font-style:italic;color:var(--dim);">Unknown</div>'
      + '</div>'
    + '</div>'
  + '</div>';
}

function renderZoomExNihilo() {
  showZoom(1);
  const el = document.getElementById('zoom-exnihilo');
  if (!el) return;
  const c = '#d4a853';

  /* moved to kernel: bookCard */

const totalEntries = WORLDS_DATA.filter(w=>!w.locked).reduce((a,w)=>a+loadEntries(w.id).length,0);

  el.innerHTML = '<div style="min-height:100vh;padding:4rem 2rem 6rem;max-width:1100px;margin:0 auto;">'
    // breadcrumb
    + '<div style="font-family:\'DM Mono\',monospace;font-size:0.36rem;letter-spacing:0.16em;color:var(--dim);margin-bottom:4rem;display:flex;gap:0.7rem;align-items:center;">'
      + '<span onclick="renderWorlds()" style="cursor:pointer;color:var(--muted);" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--muted)\'">The Worlds</span>'
      + '<span>\u2192</span>'
      + '<span style="color:'+c+';">Ex Nihilo</span>'
    + '</div>'
    // massive title
    + '<div style="margin-bottom:1.2rem;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.68rem;letter-spacing:0.3em;color:'+c+';opacity:0.5;margin-bottom:0.8rem;text-transform:uppercase;">Universe \u2014 Out of Nothing</div>'
      + '<h1 style="font-family:\'Playfair Display\',serif;font-size:clamp(4rem,11vw,10rem);font-style:italic;font-weight:700;color:var(--text);line-height:0.82;margin-bottom:1.5rem;letter-spacing:-0.02em;">Ex<br>Nihilo</h1>'
    + '</div>'
    + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.25rem;font-style:italic;color:'+c+'77;line-height:1.65;max-width:620px;margin-bottom:1rem;">'+EX_NIHILO.tagline+'</p>'
    + '<div style="display:flex;gap:3rem;margin-bottom:4rem;flex-wrap:wrap;">'
      + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+c+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">TOTAL ENTRIES</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">'+String(totalEntries).padStart(3,'0')+'</div></div>'
      + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+c+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">CITIES</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">02</div></div>'
      + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+c+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">PLANET</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">G O A</div></div>'
      + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+c+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">STATUS</div><div style="font-family:\'DM Mono\',monospace;font-size:0.9rem;color:'+c+'cc;">ACTIVE</div></div>'
    + '</div>'
    // BBP as centrepiece
    + '<div style="height:1px;background:linear-gradient(90deg,'+c+'44,transparent);margin-bottom:2.5rem;"></div>'
    + '<div style="font-family:\'DM Mono\',monospace;font-size:0.36rem;letter-spacing:0.22em;color:'+c+'44;margin-bottom:1.5rem;text-transform:uppercase;">Active Story</div>'
    + '<div style="display:grid;gap:1rem;">'
      + (EX_NIHILO.books||[]).map(bookCard).join('')
    + '</div>'
  + '</div>';
}

  window.universeCard = universeCard;
  window.showZoom = showZoom;
  window.renderZoomUniverses = renderZoomUniverses;
  window.renderZoomExNihilo = renderZoomExNihilo;
})();
