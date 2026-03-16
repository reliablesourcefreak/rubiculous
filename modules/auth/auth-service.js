
/*
 Auth Service
 Transitional auth/session boundary for admin access.
 Keeps auth intent separate from UI rendering.
*/

window.AuthService = {

  isAuthenticated() {
    try {
      return !!window.isAdminAuthenticated;
    } catch (err) {
      return false;
    }
  },

  login(password) {
    if (typeof adminLogin === "function") {
      return adminLogin(password);
    }
    if (typeof loginAdmin === "function") {
      return loginAdmin(password);
    }
    return false;
  },

  logout() {
    if (typeof adminLogout === "function") return adminLogout();
    if (typeof logoutAdmin === "function") return logoutAdmin();
    return true;
  }

};


/* Extracted from legacy app.js during de-monolith pass */

function adminLogin() {
  const pass = document.getElementById('admin-pass').value;
  if (pass === ADMIN_PASS) {
    sessionStorage.setItem('rub_auth', '1');
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    document.getElementById('admin-err').style.display = 'none';
    renderAdminList();
  } else {
    document.getElementById('admin-err').style.display = 'block';
  }
}

function adminLogout() {
  sessionStorage.removeItem('rub_auth');
  renderAdmin();
}

