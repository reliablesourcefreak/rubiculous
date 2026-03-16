
/*
 Worlds Controller
 Transitional orchestration layer for world browsing and entry flows.
 Delegates to legacy app.js functions until deeper extraction is complete.
*/

window.WorldsController = {

  render(param) {
    if (typeof renderWorlds === "function") renderWorlds(param);
  },

  openWorld(id) {
    if (typeof renderWorlds === "function") renderWorlds(id);
  },

  openEntry(id) {
    if (typeof openEntryModal === "function") openEntryModal(id);
  },

  closeEntry() {
    if (typeof closeEntryModal === "function") closeEntryModal();
  },

  saveEntry() {
    if (typeof saveEntry === "function") saveEntry();
  },

  deleteEntry(id) {
    if (typeof deleteEntry === "function") deleteEntry(id);
  }

};


/* Extracted from legacy app.js during de-monolith pass */

function renderWorlds(param) {
  if (!param)                     { renderZoomUniverses(); }
  else if (param === 'ex-nihilo') { renderZoomExNihilo(); }
  else if (param === 'goa')       { renderZoomGoa(); }
  else                            { window._worldFilter = window._worldFilter || 'all'; renderZoomWorld(param); }
}

function openEntryModal(worldId,editId){
  entryEditState={worldId,type:null,id:editId||null};
  const modal=document.getElementById('entry-modal');
  if(!modal)return;
  document.getElementById('entry-modal-title').textContent=editId?'EDIT ENTRY':'NEW ENTRY — '+(WORLDS_DATA.find(w=>w.id===worldId)||{}).name;

  // Populate type buttons dynamically
  const typeEl=document.getElementById('entry-type-select');
  typeEl.innerHTML=ENTRY_TYPES.map(t=>`<button onclick="selectEntryType('${t}',this)" data-type="${t}" style="font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.12em;padding:0.3rem 0.8rem;border:1px solid var(--border);background:none;color:var(--muted);cursor:pointer;transition:all 0.15s;">${ENTRY_TYPE_ICONS[t]} ${t.toUpperCase()}</button>`).join('');

  // Populate world buttons dynamically
  const worldEl=document.getElementById('entry-world-select');
  worldEl.innerHTML=WORLDS_DATA.filter(w=>!w.locked).map(w=>`<button onclick="selectEntryWorld('${w.id}',this)" data-world="${w.id}" style="font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.1em;padding:0.3rem 0.8rem;border:1px solid ${w.color}33;color:${w.color}77;background:none;cursor:pointer;transition:all 0.15s;">${w.name}</button>`).join('');

  // Pre-select world
  document.querySelectorAll('#entry-world-select button').forEach(btn=>{
    const w=WORLDS_DATA.find(x=>x.id===btn.dataset.world);
    const isThis=btn.dataset.world===worldId;
    btn.style.borderColor=isThis?(w?w.color+'88':'var(--primary)'):(w?w.color+'33':'var(--border)');
    btn.style.color=isThis?(w?w.color:'var(--primary)'):(w?w.color+'77':'var(--muted)');
    btn.style.background=isThis?(w?w.color+'15':'var(--primary-dim)'):'none';
    if(isThis) entryEditState.worldId=worldId;
  });

  if(editId){
    const entry=loadEntries(worldId).find(e=>e.id===editId);
    if(entry){
      document.getElementById('entry-title').value=entry.title||'';
      document.getElementById('entry-tags').value=(entry.tags||[]).join(', ');
      document.getElementById('entry-body').value=entry.body||'';
      const btn=document.querySelector(`#entry-type-select button[data-type="${entry.type}"]`);
      selectEntryType(entry.type,btn);
    }
  } else {
    document.getElementById('entry-title').value='';
    document.getElementById('entry-tags').value='';
    document.getElementById('entry-body').value='';
    entryEditState.type=null;
  }
  modal.style.display='block';
  document.getElementById('entry-title').focus();
}

function closeEntryModal(){const m=document.getElementById('entry-modal');if(m)m.style.display='none';}

function saveEntry(){
  const title=document.getElementById('entry-title').value.trim();
  const body=document.getElementById('entry-body').value.trim();
  const tags=document.getElementById('entry-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const{worldId,type,id}=entryEditState;
  if(!title){alert('Add a title.');return;}
  if(!type){alert('Select a type.');return;}
  if(!worldId){alert('Select a world.');return;}
  const entries=loadEntries(worldId);
  const now=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'}).replace(/\//g,'.');
  if(id){const idx=entries.findIndex(e=>e.id===id);if(idx>-1)entries[idx]={...entries[idx],title,body,tags,type,updatedAt:now};}
  else{entries.unshift({id:'e_'+Date.now(),title,body,tags,type,date:now,worldId});}
  saveEntries(worldId,entries);
  closeEntryModal();
  renderZoomWorld(worldId);
}

function deleteEntry(worldId,entryId){
  if(!confirm('Delete this entry?'))return;
  saveEntries(worldId,loadEntries(worldId).filter(e=>e.id!==entryId));
  renderZoomWorld(worldId);
}


function bookCard(b) {
    const coverArt = (typeof CABINET_ART !== 'undefined' && CABINET_ART[b.id]) || null;
    const coverHtml = coverArt
      ? '<div style="position:absolute;top:0;right:0;width:320px;height:100%;overflow:hidden;pointer-events:none;">'
          + '<img src="'+coverArt+'" style="width:100%;height:100%;object-fit:cover;object-position:right top;" />'
          + '<div style="position:absolute;inset:0;background:none;"></div>'
        + '</div>'
      : '<div style="position:absolute;top:0;right:0;width:220px;height:220px;background:radial-gradient(circle at top right,'+b.color+'0a,transparent 70%);pointer-events:none;"></div>';
    return '<div onclick="renderWorlds(\'goa\')" style="background:#09081a;border:1px solid '+b.color+'22;border-top:2px solid '+b.color+';padding:2.5rem 3rem;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;min-height:260px;" onmouseover="this.style.background=\''+b.color+'08\';this.style.boxShadow=\'0 8px 40px '+b.color+'18\';" onmouseout="this.style.background=\'#09081a\';this.style.boxShadow=\'none\';">'
      + coverHtml
      + '<div style="position:relative;z-index:1;max-width:620px;">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.62rem;letter-spacing:0.22em;color:'+b.color+'55;">BOOK '+b.number+' \u2014 EX NIHILO</div>'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.12em;color:'+b.color+'55;border:1px solid '+b.color+'22;padding:0.15rem 0.6rem;">'+b.status.toUpperCase()+'</div>'
        + '</div>'
        + '<h2 style="font-family:\'Playfair Display\',serif;font-size:clamp(2.2rem,5vw,4rem);font-style:italic;font-weight:700;color:#f0ece4;margin-bottom:1.2rem;line-height:0.9;">'+b.name+'</h2>'
        + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;font-style:italic;color:'+b.color+'77;line-height:1.6;max-width:480px;margin-bottom:2rem;">'+b.tagline+'</p>'
        + '<div style="height:1px;background:linear-gradient(90deg,'+b.color+'33,transparent);margin-bottom:1.5rem;"></div>'
        + '<div style="display:flex;gap:3rem;align-items:center;justify-content:space-between;flex-wrap:wrap;">'
          + '<div style="display:flex;gap:2.5rem;">'
            + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+b.color+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">PLANET</div><div style="font-family:\'DM Mono\',monospace;font-size:0.75rem;color:'+b.color+'cc;">G O A</div></div>'
            + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+b.color+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">CITIES</div><div style="font-family:\'DM Mono\',monospace;font-size:0.75rem;color:'+b.color+'cc;">02</div></div>'
            + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+b.color+'44;letter-spacing:0.14em;margin-bottom:0.25rem;">CONFLICT</div><div style="font-family:\'DM Mono\',monospace;font-size:0.75rem;color:'+b.color+'cc;">GYANJA \u2715 FOTORA</div></div>'
          + '</div>'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.36rem;letter-spacing:0.14em;color:'+b.color+';border:1px solid '+b.color+'44;padding:0.5rem 1.2rem;background:'+b.color+'0a;">ENTER PLANET \u2192</div>'
        + '</div>'
      + '</div>'
    + '</div>';
  }

function renderZoomGoa() {
  showZoom(2);
  const el = document.getElementById('zoom-goa');
  if (!el) return;
  const goaArt = (typeof CABINET_ART !== 'undefined' && CABINET_ART['goa']) || null;

  function worldCard(w) {
    const count = loadEntries(w.id).length;
    const c = w.color;
    const art = (typeof CABINET_ART !== 'undefined' && CABINET_ART[w.id]) || null;
    const ledRow = Array.from({length:16},(_,i)=>'<div style="flex:1;background:'+c+(w.locked?'18':(i%3===0?'cc':'33'))+'"></div>').join('');
    const bumpers = w.bumpers.map(b=>'<span style="font-family:\'DM Mono\',monospace;font-size:0.56rem;letter-spacing:0.1em;padding:0.15rem 0.55rem;border:1px solid '+c+(w.locked?'18':'3a')+';color:'+c+(w.locked?'22':'77')+';">'+b+'</span>').join('');
    // Big atmospheric header block — even without art
    const colorStop1 = w.id==='gyanja' ? '#0a1a0e' : w.id==='fotora' ? '#080d1a' : '#0e0808';
    const artHtml = art
      ? '<div style="height:180px;position:relative;overflow:hidden;"><img src="'+art+'" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.85) brightness('+(w.locked?'0.2':'0.65')+')" /><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,rgba(9,8,26,0.95) 100%);"></div><div style="position:absolute;top:0;left:0;right:0;height:2px;display:flex;">'+ledRow+'</div></div>'
      : '<div style="height:140px;position:relative;overflow:hidden;background:'+colorStop1+';border-bottom:1px solid '+c+(w.locked?'10':'22')+';">'
          + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,'+c+(w.locked?'08':'14')+' 0%,transparent 65%);"></div>'
          + '<div style="position:absolute;inset:0;background-image:linear-gradient('+c+'08 1px,transparent 1px),linear-gradient(90deg,'+c+'08 1px,transparent 1px);background-size:28px 28px;"></div>'
          + '<div style="position:absolute;top:0;left:0;right:0;height:2px;display:flex;">'+ledRow+'</div>'
          + '<div style="position:absolute;bottom:1.2rem;left:1.2rem;font-family:\'Playfair Display\',serif;font-size:3rem;font-style:italic;font-weight:700;color:'+c+(w.locked?'08':'18')+';line-height:1;letter-spacing:-0.02em;">'+w.name+'</div>'
        + '</div>';
    const badge = w.locked
      ? '<span style="font-family:\'DM Mono\',monospace;font-size:0.56rem;color:#1e1e1e;border:1px solid #1a1a1a;padding:0.12rem 0.5rem;letter-spacing:0.1em;">LOCKED</span>'
      : '<span style="font-family:\'DM Mono\',monospace;font-size:0.58rem;color:'+c+';border:1px solid '+c+'33;padding:0.12rem 0.5rem;background:'+c+'0a;letter-spacing:0.06em;">'+String(count).padStart(3,'0')+' entries</span>';
    const hoverOn  = w.locked ? '' : "this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 36px "+c+"1e';this.style.borderTopColor='"+c+"';";
    const hoverOff = w.locked ? '' : "this.style.transform='';this.style.boxShadow='0 0 24px "+c+"0e';this.style.borderTopColor='"+c+"aa';";
    const click    = w.locked ? '' : "renderWorlds('"+w.id+"')";
    return '<div onclick="'+click+'" style="background:#09081a;border:1px solid '+c+(w.locked?'14':'2a')+';border-top:2px solid '+c+(w.locked?'20':'aa')+';cursor:'+(w.locked?'default':'pointer')+';overflow:hidden;transition:transform 0.2s,box-shadow 0.2s,border-top-color 0.2s;'+(w.locked?'':'box-shadow:0 0 24px '+c+'0e;')+'" onmouseover="'+hoverOn+'" onmouseout="'+hoverOff+'">'
      + artHtml
      + '<div style="padding:1.3rem 1.4rem 1rem;">'
        + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.6rem;">'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.56rem;letter-spacing:0.16em;color:'+c+(w.locked?'28':'55')+';margin-bottom:0.3rem;text-transform:uppercase;">'+w.subtitle+'</div>'
          + '<h2 style="font-family:\'Playfair Display\',serif;font-size:1.5rem;font-style:italic;font-weight:700;color:'+(w.locked?'#222':'#f0ece4')+';line-height:1;">'+w.name+'</h2></div>'
          + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.35rem;">'+badge
            + (w.locked ? '' : '<span style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.1em;color:'+c+'44;text-transform:uppercase;">'+w.status+'</span>')
          + '</div>'
        + '</div>'
        + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:0.92rem;font-style:italic;color:'+c+(w.locked?'22':'66')+';line-height:1.5;margin-bottom:0.9rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">'+w.tagline+'</p>'
        + '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.4rem;">'+bumpers+'</div>'
      + '</div>'
      + '<div style="padding:0.6rem 1.4rem;border-top:1px solid '+c+(w.locked?'0a':'1a')+';background:'+c+(w.locked?'03':'07')+';display:flex;justify-content:space-between;align-items:center;">'
        + (w.locked
          ? '<span style="font-family:\'DM Mono\',monospace;font-size:0.56rem;letter-spacing:0.18em;color:'+c+'18;text-transform:uppercase;">INSERT COIN</span>'
          : '<div style="display:flex;align-items:center;gap:0.75rem;">'
              + '<div style="width:22px;height:4px;background:'+c+'99;border-radius:2px 1px 1px 2px;transform:rotate(18deg);box-shadow:0 0 5px '+c+'55;"></div>'
              + '<span style="font-family:\'DM Mono\',monospace;font-size:0.56rem;letter-spacing:0.16em;color:'+c+'88;text-transform:uppercase;">Enter City \u2192</span>'
              + '<div style="width:22px;height:4px;background:'+c+'99;border-radius:1px 2px 2px 1px;transform:rotate(-18deg);box-shadow:0 0 5px '+c+'55;"></div>'
            + '</div>'
        )
        + (w.locked ? '' : '<span style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:'+c+'33;">Layer 02</span>')
      + '</div>'
    + '</div>';
  }

  // Cinematic planet hero — works beautifully with or without CABINET_ART
  const heroHtml = goaArt
    ? '<div style="position:relative;height:75vh;min-height:460px;overflow:hidden;margin-bottom:0;">'
        + '<img src="'+goaArt+'" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;filter:saturate(0.9) brightness(0.6);" />'
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(9,8,26,0.25) 0%,rgba(9,8,26,0.0) 30%,rgba(9,8,26,0.65) 65%,#09081a 100%);"></div>'
        + '<div style="position:absolute;bottom:3rem;left:50%;transform:translateX(-50%);width:100%;max-width:1200px;padding:0 2rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.3em;color:#d4a853;opacity:0.7;margin-bottom:0.7rem;text-transform:uppercase;">Layer 02 — The Planet</div>'
          + '<h1 style="font-family:\'Playfair Display\',serif;font-size:clamp(3.5rem,10vw,8rem);font-style:italic;font-weight:700;color:#f0ece4;line-height:0.82;text-shadow:0 4px 40px rgba(0,0,0,0.8);margin-bottom:0.75rem;letter-spacing:-0.01em;">G O A</h1>'
          + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;font-style:italic;color:rgba(240,236,228,0.6);max-width:520px;">Two civilizations. One planet. Zero compromise.</p>'
        + '</div>'
      + '</div>'
    // Full-strength CSS fallback — atmospheric, not apologetic
    : '<div style="position:relative;height:75vh;min-height:460px;overflow:hidden;margin-bottom:0;background:#07060f;">'
        + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,rgba(212,168,83,0.08) 0%,rgba(39,174,96,0.04) 35%,rgba(74,158,255,0.04) 60%,transparent 75%);"></div>'
        + '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(212,168,83,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,83,0.04) 1px,transparent 1px);background-size:48px 48px;"></div>'
        // Planet orb
        + '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);width:min(55vw,400px);height:min(55vw,400px);border-radius:50%;background:radial-gradient(ellipse at 35% 35%,rgba(39,174,96,0.22) 0%,rgba(74,158,255,0.14) 35%,rgba(212,168,83,0.08) 60%,rgba(7,6,15,0.6) 80%);border:1px solid rgba(212,168,83,0.1);box-shadow:0 0 120px rgba(212,168,83,0.06),inset 0 0 80px rgba(9,8,26,0.7);"></div>'
        // City glow left (GYANJA — green)
        + '<div style="position:absolute;bottom:25%;left:30%;width:6px;height:6px;border-radius:50%;background:#27ae60;box-shadow:0 0 30px 12px rgba(39,174,96,0.3),0 0 60px 20px rgba(39,174,96,0.1);"></div>'
        // City glow right (FOTORA — blue)
        + '<div style="position:absolute;bottom:28%;right:30%;width:6px;height:6px;border-radius:50%;background:#4a9eff;box-shadow:0 0 30px 12px rgba(74,158,255,0.3),0 0 60px 20px rgba(74,158,255,0.1);"></div>'
        // City labels
        + '<div style="position:absolute;bottom:calc(25% + 22px);left:calc(30% - 30px);font-family:\'DM Mono\',monospace;font-size:0.44rem;letter-spacing:0.16em;color:rgba(39,174,96,0.5);text-transform:uppercase;white-space:nowrap;">GYANJA</div>'
        + '<div style="position:absolute;bottom:calc(28% + 22px);right:calc(30% - 24px);font-family:\'DM Mono\',monospace;font-size:0.44rem;letter-spacing:0.16em;color:rgba(74,158,255,0.5);text-transform:uppercase;white-space:nowrap;">FOTORA</div>'
        // Horizon gradient
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(7,6,15,0.5) 70%,#09081a 100%);pointer-events:none;"></div>'
        + '<div style="position:absolute;bottom:3rem;left:50%;transform:translateX(-50%);width:100%;max-width:1200px;padding:0 2rem;text-align:center;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.3em;color:#d4a853;opacity:0.6;margin-bottom:0.7rem;text-transform:uppercase;">Layer 02 — The Planet</div>'
          + '<h1 style="font-family:\'Playfair Display\',serif;font-size:clamp(3.5rem,10vw,8rem);font-style:italic;font-weight:700;color:#f0ece4;line-height:0.82;text-shadow:0 4px 40px rgba(212,168,83,0.15);margin-bottom:0.75rem;letter-spacing:0.05em;">G O A</h1>'
          + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;font-style:italic;color:rgba(240,236,228,0.55);max-width:520px;margin:0 auto;">Two civilizations. One planet. Zero compromise.</p>'
        + '</div>'
      + '</div>';

  el.innerHTML = heroHtml
    + '<div style="padding:2.5rem 2rem 6rem;max-width:1200px;margin:0 auto;">'
      // breadcrumb
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.48rem;letter-spacing:0.16em;color:var(--dim);margin-bottom:2.5rem;display:flex;gap:0.7rem;align-items:center;flex-wrap:wrap;">'
        + '<span onclick="renderWorlds()" style="cursor:pointer;color:var(--muted);transition:color 0.15s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--muted)\'">The Worlds</span>'
        + '<span style="color:var(--dim);">\u2192</span>'
        + '<span onclick="renderWorlds(\'ex-nihilo\')" style="cursor:pointer;color:var(--muted);transition:color 0.15s;" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--muted)\'">Ex Nihilo</span>'
        + '<span style="color:var(--dim);">\u2192</span>'
        + '<span style="color:var(--primary);">G O A</span>'
      + '</div>'
      // Context strip
      + '<div style="display:grid;grid-template-columns:1fr auto;gap:2rem;align-items:start;margin-bottom:3rem;padding-bottom:2.5rem;border-bottom:1px solid rgba(212,168,83,0.1);">'
        + '<div>'
          + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;font-style:italic;color:var(--muted);max-width:580px;line-height:1.65;">'+GOA.tagline+'</p>'
        + '</div>'
        + '<div style="display:flex;gap:2.5rem;flex-shrink:0;">'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:rgba(212,168,83,0.4);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:0.25rem;">Cities</div><div style="font-family:\'Playfair Display\',serif;font-size:1.6rem;font-style:italic;color:rgba(212,168,83,0.8);">02</div></div>'
          + '<div><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:rgba(212,168,83,0.4);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:0.25rem;">Conflict</div><div style="font-family:\'DM Mono\',monospace;font-size:0.65rem;color:rgba(212,168,83,0.6);letter-spacing:0.06em;margin-top:0.4rem;">GYANJA × FOTORA</div></div>'
        + '</div>'
      + '</div>'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.56rem;letter-spacing:0.22em;color:var(--dim);margin-bottom:1.4rem;text-transform:uppercase;">Bang Bang Paradise — Select a city</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">'
        + WORLDS_DATA.map(worldCard).join('')
      + '</div>'
    + '</div>';
}

function renderZoomWorld(worldId) {
  const world = WORLDS_DATA.find(w=>w.id===worldId);
  if (!world||world.locked){renderZoomGoa();return;}
  showZoom(3);
  const c=world.color;
  const entries=loadEntries(worldId);
  const art=(typeof CABINET_ART!=='undefined'&&CABINET_ART[worldId])||null;
  const filterType=window._worldFilter||'all';
  const filtered=filterType==='all'?entries:entries.filter(e=>e.type===filterType);
  const el=document.getElementById('zoom-world');
  if(!el) return;

  const bumpers = world.bumpers.map(b=>'<span style="font-family:\'DM Mono\',monospace;font-size:0.6rem;letter-spacing:0.12em;padding:0.2rem 0.65rem;border:1px solid '+c+'44;color:'+c+'88;background:'+c+'08;">'+b+'</span>').join('');
  const statCounts = ENTRY_TYPES.map(t=>{
    const n=entries.filter(e=>e.type===t).length;
    return n ? '<div style="text-align:center;"><div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:'+c+'44;letter-spacing:0.12em;margin-bottom:0.2rem;text-transform:uppercase;">'+t+'</div><div style="font-family:\'Playfair Display\',serif;font-size:1.2rem;font-style:italic;color:'+c+'aa;">'+n+'</div></div>' : '';
  }).join('');

  // World-specific gradient
  const bgGrad = world.id==='gyanja'
    ? 'radial-gradient(ellipse at 0% 0%,rgba(39,174,96,0.06) 0%,transparent 55%),radial-gradient(ellipse at 100% 100%,rgba(39,174,96,0.04) 0%,transparent 50%)'
    : world.id==='fotora'
    ? 'radial-gradient(ellipse at 100% 0%,rgba(74,158,255,0.06) 0%,transparent 55%),radial-gradient(ellipse at 0% 100%,rgba(74,158,255,0.03) 0%,transparent 50%)'
    : 'radial-gradient(ellipse at 50% 0%,'+c+'08 0%,transparent 60%)';

  const heroSection = art
    ? '<div style="position:relative;height:50vh;min-height:320px;overflow:hidden;">'
        + '<img src="'+art+'" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.85) brightness(0.55);" />'
        + '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(9,8,26,0.2) 0%,transparent 30%,rgba(9,8,26,0.75) 70%,#09081a 100%);"></div>'
        + '<div style="position:absolute;bottom:2.5rem;left:2.5rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.26em;color:'+c+';opacity:0.65;margin-bottom:0.5rem;text-transform:uppercase;">Layer 03 — '+world.subtitle+'</div>'
          + '<h1 style="font-family:\'Playfair Display\',serif;font-size:clamp(3rem,8vw,6rem);font-style:italic;font-weight:700;color:#f0ece4;line-height:0.85;text-shadow:0 4px 30px rgba(0,0,0,0.8);">'+world.name+'</h1>'
        + '</div>'
      + '</div>'
    // No art — immersive atmospheric header using CSS
    : '<div style="position:relative;min-height:320px;overflow:hidden;background:#09081a;">'
        + '<div style="position:absolute;inset:0;background:'+bgGrad+';"></div>'
        + '<div style="position:absolute;inset:0;background-image:linear-gradient('+c+'06 1px,transparent 1px),linear-gradient(90deg,'+c+'06 1px,transparent 1px);background-size:44px 44px;"></div>'
        // Large ghost name as background texture
        + '<div style="position:absolute;bottom:-0.15em;right:2rem;font-family:\'Playfair Display\',serif;font-size:clamp(8rem,20vw,18rem);font-style:italic;font-weight:700;color:'+c+'06;line-height:1;white-space:nowrap;pointer-events:none;user-select:none;letter-spacing:-0.02em;">'+world.name+'</div>'
        // Animated accent line
        + '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,'+c+'cc,'+c+'33,transparent);"></div>'
        // Content
        + '<div style="position:relative;z-index:1;padding:3rem 2.5rem 2.5rem;">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:0.52rem;letter-spacing:0.26em;color:'+c+';opacity:0.6;margin-bottom:0.75rem;text-transform:uppercase;">Layer 03 — '+world.subtitle+'</div>'
          + '<h1 style="font-family:\'Playfair Display\',serif;font-size:clamp(3rem,8vw,6rem);font-style:italic;font-weight:700;color:#f0ece4;line-height:0.85;margin-bottom:1.2rem;">'+world.name+'</h1>'
          + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.15rem;font-style:italic;color:'+c+'88;max-width:520px;line-height:1.6;margin-bottom:1.5rem;">'+world.tagline+'</p>'
          + '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">'+bumpers+'</div>'
        + '</div>'
      + '</div>';

  // If there IS art, we need tagline + bumpers below
  const infoStrip = art
    ? '<div style="padding:1.8rem 2.5rem;background:linear-gradient(180deg,rgba(9,8,26,0.98),#09081a);border-bottom:1px solid '+c+'18;">'
        + '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.1rem;font-style:italic;color:'+c+'77;max-width:580px;line-height:1.6;margin-bottom:1rem;">'+world.tagline+'</p>'
        + '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">'+bumpers+'</div>'
      + '</div>'
    : '';

  // Stats strip
  const statsStrip = '<div style="display:flex;gap:0;border-top:1px solid '+c+'14;border-bottom:1px solid '+c+'14;background:'+c+'04;">'
    + '<div style="padding:1rem 2rem;border-right:1px solid '+c+'14;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:'+c+'44;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:0.25rem;">Total Entries</div>'
      + '<div style="font-family:\'Playfair Display\',serif;font-size:1.6rem;font-style:italic;color:'+c+'cc;">'+String(entries.length).padStart(3,'0')+'</div>'
    + '</div>'
    + '<div style="padding:1rem 2rem;border-right:1px solid '+c+'14;">'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:'+c+'44;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:0.25rem;">Status</div>'
      + '<div style="font-family:\'DM Mono\',monospace;font-size:0.62rem;color:'+c+'cc;letter-spacing:0.08em;margin-top:0.35rem;">'+world.status.toUpperCase()+'</div>'
    + '</div>'
    + (statCounts ? '<div style="padding:1rem 2rem;display:flex;gap:1.8rem;align-items:center;flex:1;flex-wrap:wrap;">'+statCounts+'</div>' : '')
    + '<div style="padding:1rem 2rem;display:flex;align-items:center;margin-left:auto;">'
      + '<button onclick="openEntryModal(\''+worldId+'\')" style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.14em;padding:0.65rem 1.6rem;border:1px solid '+c+';color:'+c+';background:'+c+'0a;cursor:pointer;transition:all 0.15s;white-space:nowrap;" onmouseover="this.style.background=\''+c+'1a\'" onmouseout="this.style.background=\''+c+'0a\'">+ New Entry</button>'
    + '</div>'
  + '</div>';

  // filter bar
  const filterBtns = ['all'].concat(ENTRY_TYPES.filter(t=>entries.some(e=>e.type===t))).map(t=>{
    const active=filterType===t;
    const label=t==='all'?'ALL':(ENTRY_TYPE_ICONS[t]+' '+t.toUpperCase());
    const count = t==='all'?entries.length:entries.filter(e=>e.type===t).length;
    return '<button onclick="setWorldFilter(\''+t+'\',\''+worldId+'\')" style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.08em;padding:0.28rem 0.7rem;border:1px solid '+(active?c+'77':'var(--border)')+';color:'+(active?c:'var(--muted)')+';background:'+(active?c+'0c':'none')+';cursor:pointer;transition:all 0.15s;">'+label+(count&&!active?' <span style=\"opacity:0.45;\">'+count+'</span>':'')+'</button>';
  }).join('');

  let html = '<div style="min-height:100vh;">'
    + heroSection
    + infoStrip;

  html += '<div style="max-width:1280px;margin:0 auto;">'
    + statsStrip
    + '<div style="padding:1.8rem 2rem 6rem;">'
    // breadcrumb
    + '<div style="font-family:\'DM Mono\',monospace;font-size:0.46rem;letter-spacing:0.16em;color:var(--dim);margin-bottom:2rem;display:flex;gap:0.7rem;align-items:center;flex-wrap:wrap;">'
      + '<span onclick="renderWorlds()" style="cursor:pointer;color:var(--muted);" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--muted)\'">The Worlds</span><span>\u2192</span>'
      + '<span onclick="renderWorlds(\'ex-nihilo\')" style="cursor:pointer;color:var(--muted);" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--muted)\'">Ex Nihilo</span><span>\u2192</span>'
      + '<span onclick="renderWorlds(\'goa\')" style="cursor:pointer;color:var(--muted);" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--muted)\'">G O A</span><span>\u2192</span>'
      + '<span style="color:'+c+';">'+world.name+'</span>'
    + '</div>'
    // filter toolbar
    + '<div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:2rem;flex-wrap:wrap;">'
      + '<span style="font-family:\'DM Mono\',monospace;font-size:0.52rem;color:var(--dim);letter-spacing:0.14em;margin-right:0.3rem;text-transform:uppercase;">View</span>'
      + filterBtns
    + '</div>';

  const cards = filtered.length===0
    ? '<div style="grid-column:1/-1;padding:5rem 2rem;text-align:center;border:1px dashed '+c+'18;background:'+c+'03;">'
        + '<div style="font-family:\'Playfair Display\',serif;font-size:2rem;font-style:italic;color:'+c+'18;margin-bottom:1rem;">Empty</div>'
        + '<div style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.16em;color:var(--dim);margin-bottom:1rem;text-transform:uppercase;">No entries yet</div>'
        + '<div style="font-family:\'Cormorant Garamond\',serif;font-size:1.05rem;font-style:italic;color:var(--muted);margin-bottom:1.8rem;">Start building. Drop anything — a line, a scene, a character thought.</div>'
        + '<button onclick="openEntryModal(\''+worldId+'\')" style="font-family:\'DM Mono\',monospace;font-size:0.58rem;letter-spacing:0.14em;padding:0.65rem 1.6rem;border:1px solid '+c+';color:'+c+';background:'+c+'0a;cursor:pointer;">+ First Entry</button>'
      + '</div>'
    : filtered.map(e=>renderEntryCard(e,world)).join('');

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.2rem;">'+cards+'</div></div></div></div>';
  el.innerHTML = html;
}

function renderEntryCard(e,world) {
  const c=world.color;
  const icon=ENTRY_TYPE_ICONS[e.type]||'\u2014';
  const preview=(e.body||'').slice(0,180);
  const tags=(e.tags||[]).slice(0,4);
  const tagHtml=tags.map(t=>'<span style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:'+c+'55;border:1px solid '+c+'22;padding:0.1rem 0.4rem;letter-spacing:0.06em;">'+t+'</span>').join('');
  const typeColor = {scene:'#d4a853',dialogue:'#4a9eff',character:'#e85d3a',concept:'#9b59b6',lore:'#27ae60',art:'#e85d3a',note:'#7f8c8d',theme:'#f0a030'}[e.type]||c;

  return '<div style="background:#09081a;border:1px solid '+c+'1a;border-top:2px solid '+c+'66;position:relative;overflow:hidden;transition:all 0.18s;display:flex;flex-direction:column;" onmouseover="this.style.borderColor=\''+c+'33\';this.style.borderTopColor=\''+c+'\';this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 24px '+c+'14\';" onmouseout="this.style.borderColor=\''+c+'1a\';this.style.borderTopColor=\''+c+'66\';this.style.transform=\'none\';this.style.boxShadow=\'none\';">'
    // Faint background texture
    + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 0% 0%,'+c+'05,transparent 60%);pointer-events:none;"></div>'
    // Header
    + '<div style="padding:0.85rem 1rem 0.6rem;border-bottom:1px solid '+c+'12;position:relative;">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;">'
        + '<div style="display:flex;align-items:center;gap:0.5rem;">'
          + '<span style="font-family:\'DM Mono\',monospace;font-size:0.8rem;color:'+typeColor+';opacity:0.9;line-height:1;">'+icon+'</span>'
          + '<span style="font-family:\'DM Mono\',monospace;font-size:0.5rem;letter-spacing:0.14em;color:'+c+'55;text-transform:uppercase;">'+e.type+'</span>'
        + '</div>'
        + '<div style="display:flex;gap:0.2rem;">'
          + '<button onclick="event.stopPropagation();openEntryModal(\''+world.id+'\',\''+e.id+'\')" style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:var(--dim);background:none;border:none;cursor:pointer;padding:0.2rem 0.4rem;transition:color 0.15s;" onmouseover="this.style.color=\''+c+'\'" onmouseout="this.style.color=\'var(--dim)\'">Edit</button>'
          + '<button onclick="event.stopPropagation();deleteEntry(\''+world.id+'\',\''+e.id+'\')" style="font-family:\'DM Mono\',monospace;font-size:0.5rem;color:var(--dim);background:none;border:none;cursor:pointer;padding:0.2rem 0.4rem;transition:color 0.15s;" onmouseover="this.style.color=\'#c04040\'" onmouseout="this.style.color=\'var(--dim)\'">✕</button>'
        + '</div>'
      + '</div>'
    + '</div>'
    // Body
    + '<div style="padding:0.9rem 1rem;flex:1;position:relative;">'
      + '<div style="font-family:\'Playfair Display\',serif;font-size:1.05rem;font-style:italic;font-weight:600;color:#f0ece4;margin-bottom:0.5rem;line-height:1.25;">'+(e.title||'Untitled')+'</div>'
      + (preview ? '<p style="font-family:\'Cormorant Garamond\',serif;font-size:0.9rem;color:var(--muted);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;">'+preview+(e.body&&e.body.length>180?'\u2026':'')+'</p>' : '<p style="font-family:\'Cormorant Garamond\',serif;font-size:0.9rem;font-style:italic;color:var(--dim);line-height:1.5;">No body yet.</p>')
    + '</div>'
    // Footer
    + '<div style="padding:0.55rem 1rem;border-top:1px solid '+c+'10;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.3rem;background:'+c+'04;">'
      + '<div style="display:flex;gap:0.3rem;flex-wrap:wrap;">'+tagHtml+'</div>'
      + '<span style="font-family:\'DM Mono\',monospace;font-size:0.46rem;color:var(--dim);letter-spacing:0.06em;">'+(e.date||'')+'</span>'
    + '</div>'
  + '</div>';
}

function setWorldFilter(type,worldId){window._worldFilter=type;renderZoomWorld(worldId);}

function selectEntryType(type,btn){
  entryEditState.type=type;
  document.querySelectorAll('#entry-type-select button').forEach(b=>{b.style.borderColor='var(--border)';b.style.color='var(--muted)';b.style.background='none';});
  if(btn){const w=WORLDS_DATA.find(x=>x.id===entryEditState.worldId);const c=w?w.color:'var(--primary)';btn.style.borderColor=c;btn.style.color=c;btn.style.background=c+'15';}
}

function selectEntryWorld(worldId,btn){
  entryEditState.worldId=worldId;
  document.querySelectorAll('#entry-world-select button').forEach(b=>{const w=WORLDS_DATA.find(x=>x.id===b.dataset.world);b.style.borderColor=w?w.color+'33':'var(--border)';b.style.color=w?w.color+'77':'var(--muted)';b.style.background='none';});
  if(btn){const w=WORLDS_DATA.find(x=>x.id===worldId);if(w){btn.style.borderColor=w.color+'88';btn.style.color=w.color;btn.style.background=w.color+'15';}}
}

function renderWorldsList(){renderZoomExNihilo();}

function renderWorldDetail(world){renderZoomWorld(world.id);}

function navigateWorlds(){navigate('worlds');}

function renderWorldsLive() {
  const allPosts = loadPosts();
  const pub = allPosts.filter(p => p.status === 'published');
  const grid = document.getElementById('worlds-live-grid');
  if (!grid) return;

  const worldDefs = [
    { id: 'goa', name: 'G O A', sector: 'SECTOR_01', tagline: 'A terraformed supreme planet — perfectly governed, perfectly harmonized.', active: true },
    { id: 'dola-boronca', name: 'Dola Boronca', sector: 'SECTOR_02', tagline: 'Holographic dissonance. The city breathes anomaly.', active: true },
    { id: 'null-sector', name: 'Null Sector', sector: 'SECTOR_03', tagline: 'Under construction.', active: false },
  ];

  grid.innerHTML = worldDefs.map(w => {
    const worldPosts = pub.filter(p => p.world && p.world.toLowerCase().replace(/\s/g,'') === w.id.replace('-',''));
    const drafts = allPosts.filter(p => p.status === 'draft' && p.world && p.world.toLowerCase().replace(/\s/g,'') === w.id.replace('-',''));
    return `
    <div class="world-live-card" onclick="${w.active ? `navigate('worlds','${w.id}')` : ''}">
      <div class="world-live-status">
        <div class="world-live-status-dot" style="background:${w.active ? 'var(--accent)' : 'var(--muted)'};animation:${w.active ? 'pulse 2s infinite' : 'none'}"></div>
        <span style="color:${w.active ? 'var(--accent)' : 'var(--muted)'};font-family:var(--font-mono);font-size:0.45rem;letter-spacing:0.2em">${w.sector} — ${w.active ? 'ACTIVE' : 'DORMANT'}</span>
      </div>
      <div class="world-live-name">${w.name}</div>
      <div class="world-live-tagline">${w.tagline}</div>
      <div class="world-live-stats">
        <div>
          <span class="world-live-stat-val">${worldPosts.length}</span>
          Transmissions
        </div>
        <div>
          <span class="world-live-stat-val">${drafts.length}</span>
          In Draft
        </div>
        <div>
          <span class="world-live-stat-val">${w.active ? '◈' : '—'}</span>
          Status
        </div>
      </div>
    </div>`;
  }).join('');
}

Rubiculous.register("worlds", renderWorlds);
