// navigation kernel

function navigate(page, param) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');

  currentPage = page;
  window.scrollTo(0, 0);

  if (page === 'home') renderHome();
  else if (page === 'archive') renderArchive();
  else if (page === 'gallery') renderGallery();
  else if (page === 'worlds') renderWorlds(param);
  else if (page === 'article') renderArticle(param);
  else if (page === 'admin') renderAdmin();
  else if (page === 'informatics') renderInformatics();
  else if (page === 'sandbox') renderSandbox();
  else if (page === 'plotroom') renderPlotRoom();
  else if (page === 'codex') renderCodex();
}

function toggleThemeMenu() {
  document.getElementById('theme-dropdown').classList.toggle('open');
  const mobileDD = document.getElementById('theme-dropdown-mobile');
  if (mobileDD) mobileDD.classList.toggle('open');
}

function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  const btn = document.getElementById('nav-hamburger');
  links.classList.toggle('open');
  btn.classList.toggle('open');
}
