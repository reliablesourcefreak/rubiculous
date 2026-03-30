(function () {

  function getScripts() {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    return scripts.map(s => s.getAttribute("src"));
  }

  function scan() {

    console.log("=== RUBICULOUS SYSTEM SCAN ===");

    const scripts = getScripts();

    const modules = scripts.filter(s => s.includes("modules/"));
    const engine = scripts.filter(s => s.includes("engine/"));

    console.log("\nENGINE FILES:");
    engine.forEach(f => console.log("•", f));

    console.log("\nMODULE FILES:");
    modules.forEach(f => console.log("•", f));

    console.log("\nTOTAL:");
    console.log("Engine:", engine.length);
    console.log("Modules:", modules.length);

    return {
      engine,
      modules
    };

  }

  function blast(name) {

    console.log("=== DYNAMIC BLAST RADIUS ===");
    console.log("Target:", name);

    const scripts = getScripts();

    const hits = scripts.filter(s => s.includes(name));

    if (hits.length === 0) {
      console.log("No matches found.");
      return;
    }

    hits.forEach(f => console.log("•", f));

    console.log("\nImpact size:", hits.length);

    return hits;

  }

  function map() {
    return Object.keys(Rubiculous.modules);
  }

  Rubiculous.modules.informatics = {
    map,
    blast,
    scan
  };

})();
