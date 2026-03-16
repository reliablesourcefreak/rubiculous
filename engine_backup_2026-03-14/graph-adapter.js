
/*
 Graph Adapter
 Transforms domain entities into graph-friendly node/edge structures.
*/

window.GraphAdapter = {

  worldsToNodes(worlds) {
    if (!Array.isArray(worlds)) return [];
    return worlds.map(w => ({
      id: w.id ?? null,
      label: w.name ?? w.title ?? "Untitled World",
      type: "world"
    }));
  },

  charactersToNodes(chars) {
    if (!Array.isArray(chars)) return [];
    return chars.map(c => ({
      id: c.id ?? null,
      label: c.name ?? "Unnamed Character",
      type: "character",
      worldId: c.worldId ?? null
    }));
  },

  characterWorldEdges(chars) {
    if (!Array.isArray(chars)) return [];
    return chars
      .filter(c => c.worldId)
      .map(c => ({
        from: c.id ?? null,
        to: c.worldId,
        type: "belongs-to"
      }));
  }

};
