
/*
 Radio Runtime
 Runtime loop and state helpers for radio/audiovisual behavior.
 Keeps timing and animation concerns out of UI rendering.
*/

window.RadioRuntime = {

  state: {
    isPlaying: false,
    rafId: null,
    lastTick: 0
  },

  play() {
    this.state.isPlaying = true;
    this.startLoop();
  },

  pause() {
    this.state.isPlaying = false;
    this.stopLoop();
  },

  toggle() {
    if (this.state.isPlaying) this.pause();
    else this.play();
  },

  startLoop() {
    if (this.state.rafId) return;
    const tick = (ts) => {
      this.state.lastTick = ts || Date.now();

      if (typeof window.renderRadioFrame === "function") {
        try {
          window.renderRadioFrame(this.state.lastTick);
        } catch (err) {
          console.error("RadioRuntime frame error:", err);
        }
      }

      if (this.state.isPlaying) {
        this.state.rafId = window.requestAnimationFrame(tick);
      } else {
        this.state.rafId = null;
      }
    };

    this.state.rafId = window.requestAnimationFrame(tick);
  },

  stopLoop() {
    if (this.state.rafId) {
      window.cancelAnimationFrame(this.state.rafId);
      this.state.rafId = null;
    }
  }

};
