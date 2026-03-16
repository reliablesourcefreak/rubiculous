
/*
 Plot ViewModel
 Derived helpers for plot/codex/arcs views.
*/

window.PlotViewModel = {

  normalizeBeats(beats) {
    if (!Array.isArray(beats)) return [];
    return beats.map(b => ({
      id: b.id ?? null,
      title: b.title ?? "Untitled",
      body: b.body ?? "",
      tags: b.tags ?? [],
      created: b.created ?? Date.now()
    }));
  },

  sortChronological(beats) {
    return [...beats].sort((a,b)=> (a.created||0)-(b.created||0));
  }

};
