
/*
 Editor Controller
 Transitional CRUD/editor orchestration layer.
 Delegates to legacy editor/admin functions in app.js while extraction continues.
*/

window.EditorController = {

  renderAdmin() {
    if (typeof renderAdmin === "function") renderAdmin();
  },

  openEditor(id) {
    if (typeof openEditor === "function") openEditor(id);
  },

  save() {
    if (typeof saveEditor === "function") saveEditor();
    else if (typeof savePost === "function") savePost();
  },

  remove(id) {
    if (typeof deleteEditorItem === "function") deleteEditorItem(id);
    else if (typeof deletePost === "function") deletePost(id);
  },

  back() {
    if (typeof backToAdminList === "function") backToAdminList();
  }

};


/* Extracted from legacy app.js during de-monolith pass */

function renderAdmin() {
  const isAuth = sessionStorage.getItem('rub_auth') === '1';
  document.getElementById('admin-login').style.display = isAuth ? 'none' : 'block';
  document.getElementById('admin-dashboard').style.display = isAuth ? 'block' : 'none';
  document.getElementById('admin-editor').style.display = 'none';
  if (isAuth) renderAdminList();
}

function savePost(forceStatus) {
  posts = loadPosts();
  const title = document.getElementById('e-title').value.trim();
  if (!title) { alert('Title is required'); return; }

  const slugInput = document.getElementById('e-slug').value.trim() ||
    title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const raw = document.getElementById('e-body').value.trim();
  const wordCount = raw.replace(/<[^>]*>/g,'').split(/\s+/).length;

  const post = {
    id: editingId || Date.now(),
    title,
    subtitle: document.getElementById('e-subtitle').value.trim() || null,
    category: document.getElementById('e-category').value,
    world: document.getElementById('e-world').value.trim() || null,
    tags: document.getElementById('e-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
    excerpt: document.getElementById('e-excerpt').value.trim(),
    signalExtract: document.getElementById('e-signal').value.trim() || null,
    bodyHtml: raw,
    status: forceStatus || document.getElementById('e-status').value,
    slug: slugInput,
    featuredImageUrl: document.getElementById('e-img').value.trim() || null,
    publishDate: document.getElementById('e-date').value.trim(),
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    createdAt: editingId ? (posts.find(p=>p.id===editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
  };

  if (editingId) {
    const idx = posts.findIndex(p => p.id === editingId);
    if (idx !== -1) posts[idx] = post;
  } else {
    posts.unshift(post);
  }
  savePosts(posts);

  const msg = document.getElementById('save-msg');
  msg.textContent = 'Transmission saved — ' + post.status + '.';
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
  renderAdminList();
}

function deletePost(id) {
  if (!confirm('Delete this transmission permanently?')) return;
  posts = loadPosts().filter(p => p.id !== id);
  savePosts(posts);
  renderAdminList();
}



function renderAdminList() {
  posts = loadPosts();
  const list = document.getElementById('admin-posts-list');
  if (!posts.length) { list.innerHTML = '<div class="empty-state">The archive is empty.</div>'; return; }
  list.innerHTML = posts.map(p => `
    <div class="admin-post-row">
      <div class="admin-post-title font-display">${p.title}</div>
      <div class="admin-post-meta">${p.category} // ${p.publishDate}</div>
      <span class="status-badge ${p.status === 'published' ? 'status-published' : 'status-draft'}">${p.status}</span>
      <div class="admin-post-actions">
        <button class="admin-action-btn" onclick="editPost(${p.id})">Edit</button>
        <button class="admin-action-btn danger" onclick="deletePost(${p.id})">Delete</button>
      </div>
    </div>`).join('');
}

function showEditor() {
  editingId = null;
  document.getElementById('editor-heading').textContent = 'New Entry';
  document.getElementById('e-title').value = '';
  document.getElementById('e-subtitle').value = '';
  document.getElementById('e-category').value = 'Worlds';
  document.getElementById('e-status').value = 'draft';
  document.getElementById('e-world').value = '';
  document.getElementById('e-slug').value = '';
  document.getElementById('e-excerpt').value = '';
  document.getElementById('e-signal').value = '';
  document.getElementById('e-body').value = '';
  document.getElementById('e-img').value = '';
  document.getElementById('e-date').value = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'}).replace(/\//g,'.');
  document.getElementById('e-tags').value = '';
  document.getElementById('save-msg').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-editor').style.display = 'block';
}

function editPost(id) {
  posts = loadPosts();
  const post = posts.find(p => p.id === id);
  if (!post) return;
  editingId = id;
  document.getElementById('editor-heading').textContent = 'Edit Transmission';
  document.getElementById('e-title').value = post.title;
  document.getElementById('e-subtitle').value = post.subtitle || '';
  document.getElementById('e-category').value = post.category;
  document.getElementById('e-status').value = post.status;
  document.getElementById('e-world').value = post.world || '';
  document.getElementById('e-slug').value = post.slug;
  document.getElementById('e-excerpt').value = post.excerpt;
  document.getElementById('e-signal').value = post.signalExtract || '';
  document.getElementById('e-body').value = post.bodyHtml;
  document.getElementById('e-img').value = post.featuredImageUrl || '';
  document.getElementById('e-date').value = post.publishDate;
  document.getElementById('e-tags').value = (post.tags||[]).join(', ');
  document.getElementById('save-msg').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-editor').style.display = 'block';
}

function closeEditor() {
  document.getElementById('admin-editor').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
  editingId = null;
}

Rubiculous.register("admin", renderAdmin);
