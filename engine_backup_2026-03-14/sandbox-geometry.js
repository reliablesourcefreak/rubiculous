
/*
 Sandbox Geometry Kernel
 Pure calculations for board positioning and connection paths.
*/

window.SandboxGeometry = {

  distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  },

  midpoint(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };
  },

  linePath(a, b) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

};
