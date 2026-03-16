
/*
 Worlds ViewModel
 Derived state helpers for world lists, entries, and filters.
*/

window.WorldsViewModel = {

  normalizeEntries(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.map(e => ({
      id: e.id ?? null,
      title: e.title ?? "Untitled",
      body: e.body ?? "",
      type: e.type ?? "note",
      worldId: e.worldId ?? null,
      created: e.created ?? Date.now(),
      updated: e.updated ?? e.created ?? Date.now()
    }));
  },

  filterByWorld(entries, worldId) {
    return (entries || []).filter(e => e.worldId === worldId);
  },

  filterByType(entries, type) {
    return (entries || []).filter(e => e.type === type);
  },

  sortRecent(entries) {
    return [...(entries || [])].sort((a, b) => (b.updated || 0) - (a.updated || 0));
  }

};
