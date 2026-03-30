(function () {

  console.log("Rubiculous Boot Check Starting...");

  const requiredModules = [
    "home",
    "worlds",
    "article",
    "gallery",
    "archive",
    "radio",
    "admin"
  ];

  function checkKernel() {
    if (!window.Rubiculous) {
      console.error("BOOT FAILURE: Rubiculous kernel not loaded");
      return false;
    }
    console.log("Kernel OK");
    return true;
  }

  function checkModules() {

    const registered = Rubiculous.list ? Rubiculous.list() : [];

    const missing = requiredModules.filter(m => !registered.includes(m));

    if (missing.length > 0) {
      console.warn("Missing Modules:", missing);
    } else {
      console.log("All core modules registered");
    }

  }

  function runBootCheck() {

    if (!checkKernel()) {
      return;
    }

    checkModules();

    console.log("Boot Check Complete");

  }

  window.RubiculousBootCheck = runBootCheck;

})();
