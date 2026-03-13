
/*
 Graph Layout
 Pure layout helpers for graph and map views.
*/

window.GraphLayout = {

  circleLayout(nodes, radius, centerX, centerY) {
    if (!Array.isArray(nodes) || nodes.length === 0) return [];
    const r = typeof radius === "number" ? radius : 180;
    const cx = typeof centerX === "number" ? centerX : 300;
    const cy = typeof centerY === "number" ? centerY : 300;

    return nodes.map((node, i) => {
      const angle = (Math.PI * 2 * i) / nodes.length;
      return Object.assign({}, node, {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r
      });
    });
  },

  bounds(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    const xs = nodes.map(n => n.x || 0);
    const ys = nodes.map(n => n.y || 0);

    return {
      minX: Math.min.apply(null, xs),
      minY: Math.min.apply(null, ys),
      maxX: Math.max.apply(null, xs),
      maxY: Math.max.apply(null, ys)
    };
  }

};
