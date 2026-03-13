// Rubiculous canonical repo — persistence boundary
(function () {
  function rubGet(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function rubSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function rubRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function rubGetJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function rubSetJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function rubSessionGet(key, fallback) {
    try {
      var value = sessionStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function rubSessionSet(key, value) {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function rubSessionRemove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  window.rubGet = rubGet;
  window.rubSet = rubSet;
  window.rubRemove = rubRemove;
  window.rubGetJSON = rubGetJSON;
  window.rubSetJSON = rubSetJSON;
  window.rubSessionGet = rubSessionGet;
  window.rubSessionSet = rubSessionSet;
  window.rubSessionRemove = rubSessionRemove;
})();
