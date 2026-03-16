// registry ui kernel
(function () {
function switchRegistryTab(tab, btn) {
  document.querySelectorAll('.registry-tab-btn').forEach(b => {
    b.style.color = 'var(--muted)';
    b.style.borderBottom = 'none';
  });
  btn.style.color = 'var(--primary)';
  btn.style.borderBottom = '1px solid var(--primary)';
  ['characters','arcs','relationships','timeline'].forEach(t => {
    const el = document.getElementById('registry-tab-' + t);
    if (el) el.style.display = tab === t ? '' : 'none';
  });
  if (tab === 'arcs')          renderCharacterArcs();
  if (tab === 'relationships') renderRelationshipWeb();
}

function setRegistryFilter(world) {
  registryFilter = world;
  renderRegistryCharacters();
}

function openProfile(id) {
  const chars = loadRegistry();
  const char = chars.find(c => c.id === id);
  if (!char) return;
  const modal = document.getElementById('profile-modal');
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="profile-modal-bg" onclick="if(event.target===this)closeProfile()">
      <div class="profile-modal">
        <div class="profile-modal-topbar">
          <span class="profile-modal-id">ENTITY // ${char.id.toUpperCase()} // ${char.world}_SECTOR</span>
          <button class="profile-modal-close" onclick="closeProfile()">[ Close ]</button>
        </div>
        <div class="profile-modal-hero">
          <div class="profile-modal-name">${char.name}</div>
          <div class="profile-modal-designation">${char.designation}</div>
          <div class="profile-modal-meta">
            <div class="profile-meta-item">
              <div class="profile-meta-key">Type</div>
              <div class="profile-meta-val">${char.type}</div>
            </div>
            <div class="profile-meta-item">
              <div class="profile-meta-key">World</div>
              <div class="profile-meta-val">${char.world}</div>
            </div>
            <div class="profile-meta-item">
              <div class="profile-meta-key">Sector</div>
              <div class="profile-meta-val">${char.sector}</div>
            </div>
            <div class="profile-meta-item">
              <div class="profile-meta-key">Status</div>
              <div class="profile-meta-val" style="color:var(--accent)">${char.statusLabel}</div>
            </div>
          </div>
        </div>
        <div class="profile-modal-body">
          <div>
            <div class="profile-section-title">Appearance</div>
            <div class="profile-section-text">${char.appearance}</div>
          </div>
          <div>
            <div class="profile-section-title">Psyche</div>
            <div class="profile-section-text">${char.psyche}</div>
          </div>
          <div>
            <div class="profile-section-title">Directive</div>
            <div class="profile-section-text">${char.directive}</div>
          </div>
          <div>
            <div class="profile-section-title">Relationships</div>
            <div class="profile-relationships">
              ${char.relationships.map(r => `<div class="profile-rel-item">— ${r}</div>`).join('')}
            </div>
          </div>
          <div class="profile-section-full">
            <div class="profile-section-title">Appears In</div>
            <div class="profile-appearances-list">
              ${char.appearances.map(a => {
                const post = loadPosts().find(p => p.title === a);
                return `<span class="profile-appear-link" onclick="closeProfile();navigate('article','${post ? post.slug : ''}')">↗ ${a}</span>`;
              }).join('')}
            </div>
          </div>
        </div>
        <div class="profile-modal-quote">
          <blockquote>"${char.quote}"</blockquote>
          <cite>— ${char.name}</cite>
        </div>
        <div style="padding:1.5rem 2rem 2rem;">
          ${renderLinkedPanel(char.id, char.name)}
          
        </div>
      </div>
    </div>`;
  document.body.style.overflow = 'hidden';
}

function closeProfile() {
  document.getElementById('profile-modal').style.display = 'none';
  document.body.style.overflow = '';
}

  window.switchRegistryTab = switchRegistryTab;
  window.setRegistryFilter = setRegistryFilter;
  window.openProfile = openProfile;
  window.closeProfile = closeProfile;
})();

Rubiculous.register("informatics", renderInformatics);
