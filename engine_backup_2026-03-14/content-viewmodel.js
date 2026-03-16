
/*
 Content ViewModel
 Derived helpers for archive, posts, and gallery displays.
*/

window.ContentViewModel = {

  normalizePosts(posts) {
    if (!Array.isArray(posts)) return [];
    return posts.map(p => ({
      id: p.id ?? null,
      title: p.title ?? "Untitled",
      body: p.body ?? "",
      status: p.status ?? "draft",
      created: p.created ?? Date.now(),
      updated: p.updated ?? p.created ?? Date.now()
    }));
  },

  published(posts) {
    return (posts || []).filter(p => p.status === "published");
  },

  sortRecent(posts) {
    return [...(posts || [])].sort((a,b)=>(b.updated||0)-(a.updated||0));
  },

  galleryItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(i=>({
      id: i.id ?? null,
      src: i.src ?? "",
      caption: i.caption ?? "",
      created: i.created ?? Date.now()
    }));
  }

};
