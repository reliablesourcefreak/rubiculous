// radio kernel

function renderRadio() {
  const el = document.getElementById('hero-radio');
  if (!el) return;

  const stations = [
    { name: 'The Rubiculous Broadcast', freq: '∞',     mood: 'Generative lofi · always transmitting',     live: true,  color: '#d4a853', mode: 'lofi'     },
    { name: 'Concept & Atmosphere',     freq: '91.40', mood: 'Dark ambient · deep cinematic drone',        live: false, color: '#9b59b6', mode: 'ambient'  },
    { name: 'Work In Progress',         freq: '103.60',mood: 'Minimal jazz · brushed focus signal',        live: false, color: '#4a9eff', mode: 'jazz'     },
    { name: 'Deep Space Radio',         freq: '108.00',mood: 'Synthwave · grid frequencies transmitted',   live: false, color: '#00ffc8', mode: 'synth'    },
    { name: 'Groove Salad',             freq: '94.20', mood: 'Chillhop · beats from the garden',           live: false, color: '#27ae60', mode: 'chillhop' },
    { name: 'Encrypted Channel',        freq: '???',   mood: 'Signal not yet released',                    live: false, color: '#5a5448', mode: null, locked: true },
  ];

  let current = 0;
  let playing = false;
  let audioCtx = null;
  let masterGain = null;
  let activeNodes = [];
  let beatTimer = null;
  let vizAnim = null;

  el.innerHTML = `
    <div class="radio-widget">
      <div class="radio-top">
        <div class="radio-left">
          <div class="radio-bars" id="radio-bars"></div>
          <div class="radio-info">
            <div class="radio-name" id="radio-name"></div>
            <div class="radio-freq" id="radio-freq"></div>
          </div>
        </div>
        <div class="radio-right">
          <button class="radio-tune-btn" id="radio-tune-btn">▶ Tune In</button>
        </div>
      </div>
      <div id="radio-player-panel" style="display:none;border-top:1px solid var(--border);">
        <canvas id="radio-viz" width="800" height="120" style="width:100%;height:120px;display:block;"></canvas>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 1.4rem 0.8rem;">
          <span id="radio-now-playing" style="font-family:'DM Mono',monospace;font-size:0.5rem;letter-spacing:0.12em;color:var(--muted);text-transform:uppercase;"></span>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <span style="font-family:'DM Mono',monospace;font-size:0.48rem;color:var(--dim);letter-spacing:0.1em;text-transform:uppercase;">VOL</span>
            <input type="range" id="radio-vol" min="0" max="100" value="70" style="width:80px;accent-color:var(--primary);cursor:pointer;">
          </div>
        </div>
      </div>
      <div class="radio-stations" id="radio-pills"></div>
    </div>`;

  const nameEl    = document.getElementById('radio-name');
  const freqEl    = document.getElementById('radio-freq');
  const tuneBtn   = document.getElementById('radio-tune-btn');
  const panel     = document.getElementById('radio-player-panel');
  const canvas    = document.getElementById('radio-viz');
  const ctx2d     = canvas.getContext('2d');
  const pillsEl   = document.getElementById('radio-pills');
  const barsEl    = document.getElementById('radio-bars');
  const nowEl     = document.getElementById('radio-now-playing');
  const volSlider = document.getElementById('radio-vol');

  pillsEl.innerHTML = stations.map((st, i) =>
    `<button class="radio-station-pill${i===0?' active':''}${st.locked?' locked':''}" data-idx="${i}">${st.name}</button>`
  ).join('');

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volSlider.value / 100;
    masterGain.connect(audioCtx.destination);
  }

  function stopAll() {
    activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
    activeNodes = [];
    if (beatTimer) { clearTimeout(beatTimer); beatTimer = null; }
  }

  function noteFreq(note, octave) {
    const notes = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
    return 440 * Math.pow(2, (notes[note] + (octave - 4) * 12 - 9) / 12);
  }

  function playTone(freq, type, startT, dur, vol, attack, release, detune) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(vol, startT + (attack||0.05));
    g.gain.setValueAtTime(vol, startT + dur - (release||0.1));
    g.gain.linearRampToValueAtTime(0, startT + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(startT); osc.stop(startT + dur + 0.05);
    activeNodes.push(osc);
  }

  function playNoise(startT, dur, vol, lpFreq) {
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0; i<d.length; i++) d[i] = Math.random()*2-1;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = lpFreq || 800;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(vol, startT+0.005);
    g.gain.exponentialRampToValueAtTime(0.001, startT+dur);
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(startT); src.stop(startT+dur+0.05);
    activeNodes.push(src);
  }

  function scheduleLofi() {
    const t = audioCtx.currentTime;
    const bpm = 75; const beat = 60/bpm;
    const scale = [noteFreq('C',3), noteFreq('E',3), noteFreq('G',3), noteFreq('B',3), noteFreq('D',4), noteFreq('F',4), noteFreq('A',4)];
    [0,2,3,5,3,2].forEach((si, i) => {
      if (Math.random()>0.25) playTone(scale[si%scale.length]*2, 'triangle', t+i*beat*0.5, beat*0.45, 0.08, 0.02, 0.15);
    });
    playTone(noteFreq('C',2), 'sawtooth', t, beat*4, 0.06, 0.01, 0.3);
    playTone(noteFreq('G',2), 'sawtooth', t+beat*2, beat*2, 0.05, 0.01, 0.3);
    playNoise(t, beat*4, 0.018, 3000);
    [0,1.5,2,3].forEach(b => {
      const kt = t+b*beat;
      const ko = audioCtx.createOscillator(); const kg = audioCtx.createGain();
      ko.frequency.setValueAtTime(150,kt); ko.frequency.exponentialRampToValueAtTime(40,kt+0.12);
      kg.gain.setValueAtTime(0.25,kt); kg.gain.exponentialRampToValueAtTime(0.001,kt+0.2);
      ko.connect(kg); kg.connect(masterGain); ko.start(kt); ko.stop(kt+0.25); activeNodes.push(ko);
    });
    [1,3].forEach(b => playNoise(t+b*beat, 0.1, 0.12, 6000));
    beatTimer = setTimeout(scheduleLofi, beat*4*1000 - 100);
  }

  function scheduleAmbient() {
    const t = audioCtx.currentTime;
    const freqs = [55, 82.4, 110, 146.8, 220];
    freqs.forEach((f,i) => {
      playTone(f, 'sine', t, 8, 0.07, 1.5, 2.0, (Math.random()-0.5)*8);
      playTone(f*2, 'sine', t+i*0.3, 8, 0.04, 2, 2.5, (Math.random()-0.5)*5);
    });
    playNoise(t, 8, 0.015, 400);
    beatTimer = setTimeout(scheduleAmbient, 6500);
  }

  function scheduleJazz() {
    const t = audioCtx.currentTime;
    const bpm = 120; const beat = 60/bpm;
    const bassNotes = [noteFreq('C',2),noteFreq('E',2),noteFreq('G',2),noteFreq('B',2),noteFreq('A',2),noteFreq('F',2),noteFreq('G',2),noteFreq('E',2)];
    bassNotes.forEach((f,i) => playTone(f,'triangle',t+i*beat*0.5,beat*0.45,0.1,0.01,0.1));
    [[noteFreq('C',3),noteFreq('E',3),noteFreq('G',3)],[noteFreq('F',3),noteFreq('A',3),noteFreq('C',4)]].forEach((chord,ci) => {
      chord.forEach(f => playTone(f,'sine',t+ci*beat*2,beat*1.8,0.055,0.05,0.3));
    });
    for(let i=0;i<8;i++) playNoise(t+i*beat*0.5,0.04,0.06,10000);
    [1,3].forEach(b => playNoise(t+b*beat,0.15,0.07,5000));
    beatTimer = setTimeout(scheduleJazz, beat*4*1000 - 80);
  }

  function scheduleSynth() {
    const t = audioCtx.currentTime;
    const bpm = 128; const beat = 60/bpm;
    const scale = [noteFreq('C',3),noteFreq('D',3),noteFreq('F',3),noteFreq('G',3),noteFreq('A',3)];
    [0,2,4,3,1,4,2,0].forEach((si,i) => {
      playTone(scale[si]*2,'sawtooth',t+i*beat*0.25,beat*0.22,0.07,0.005,0.1);
    });
    [noteFreq('C',3),noteFreq('G',3),noteFreq('E',3)].forEach((f,i) =>
      playTone(f,'sawtooth',t,beat*4,0.05,0.2,0.5,i*7));
    for(let i=0;i<4;i++) {
      const kt=t+i*beat;
      const ko=audioCtx.createOscillator(); const kg=audioCtx.createGain();
      ko.frequency.setValueAtTime(200,kt); ko.frequency.exponentialRampToValueAtTime(50,kt+0.1);
      kg.gain.setValueAtTime(0.3,kt); kg.gain.exponentialRampToValueAtTime(0.001,kt+0.18);
      ko.connect(kg); kg.connect(masterGain); ko.start(kt); ko.stop(kt+0.2); activeNodes.push(ko);
    }
    [0.5,1.5,2.5,3.5].forEach(b => playNoise(t+b*beat,0.05,0.08,12000));
    beatTimer = setTimeout(scheduleSynth, beat*4*1000 - 80);
  }

  function scheduleChillhop() {
    const t = audioCtx.currentTime;
    const bpm = 85; const beat = 60/bpm;
    const scale = [noteFreq('F',3),noteFreq('A',3),noteFreq('C',4),noteFreq('E',4),noteFreq('G',4)];
    [0,2,4,3,1,null,2,0].forEach((si,i) => {
      if (si!==null && Math.random()>0.2) playTone(scale[si],'triangle',t+i*beat*0.5,beat*0.4,0.07,0.02,0.12);
    });
    playTone(noteFreq('F',2),'sawtooth',t,beat*2,0.08,0.01,0.2);
    playTone(noteFreq('C',2),'sawtooth',t+beat*2,beat*2,0.07,0.01,0.2);
    [0,0.05,1.75].forEach(b => {
      const kt=t+b*beat;
      const ko=audioCtx.createOscillator(); const kg=audioCtx.createGain();
      ko.frequency.setValueAtTime(160,kt); ko.frequency.exponentialRampToValueAtTime(45,kt+0.15);
      kg.gain.setValueAtTime(0.22,kt); kg.gain.exponentialRampToValueAtTime(0.001,kt+0.22);
      ko.connect(kg); kg.connect(masterGain); ko.start(kt); ko.stop(kt+0.25); activeNodes.push(ko);
    });
    playNoise(t+beat,0.12,0.1,7000);
    playNoise(t+beat*3,0.12,0.1,7000);
    playNoise(t,beat*4,0.012,2000);
    beatTimer = setTimeout(scheduleChillhop, beat*4*1000 - 100);
  }

  function startStation(mode) {
    stopAll();
    if (!mode) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    ({lofi:scheduleLofi,ambient:scheduleAmbient,jazz:scheduleJazz,synth:scheduleSynth,chillhop:scheduleChillhop}[mode] || function(){})();
  }

  let vizPhase = 0;
  function drawViz() {
    const s = stations[current];
    const W = canvas.width, H = canvas.height;
    ctx2d.clearRect(0,0,W,H);
    ctx2d.fillStyle = 'rgba(0,0,0,0.9)';
    ctx2d.fillRect(0,0,W,H);
    if (!playing) {
      ctx2d.fillStyle = 'rgba(255,255,255,0.1)';
      ctx2d.font = "11px 'DM Mono',monospace";
      ctx2d.textAlign = 'center';
      ctx2d.fillText('NO SIGNAL', W/2, H/2+4);
      vizAnim = requestAnimationFrame(drawViz);
      return;
    }
    vizPhase += 0.04;
    const bars = 64;
    const barW = W / bars;
    const color = s.color || '#d4a853';
    for (let i=0; i<bars; i++) {
      const t2 = Date.now()/1000;
      let h;
      if (s.mode==='ambient') {
        h = (Math.sin(i*0.18+vizPhase)*0.5+0.5)*H*0.6+4;
        h *= (0.7+0.3*Math.sin(t2*0.3+i*0.1));
      } else if (s.mode==='synth') {
        h = Math.abs(Math.sin(i*0.25+vizPhase*1.8))*H*0.75+4;
        h *= (0.6+0.4*Math.sin(t2*2+i*0.3));
      } else if (s.mode==='jazz') {
        h = (Math.sin(i*0.15+vizPhase*0.9)*0.4+Math.random()*0.15+0.3)*H*0.55+4;
      } else {
        h = (Math.sin(i*0.2+vizPhase)*0.35+0.4+Math.random()*0.15)*H*0.65+4;
      }
      const alpha = 0.5+0.5*(h/H);
      const hex = Math.round(alpha*255).toString(16).padStart(2,'0');
      ctx2d.fillStyle = color + hex;
      ctx2d.fillRect(i*barW+1, H-h, barW-2, h);
      ctx2d.fillStyle = color + '18';
      ctx2d.fillRect(i*barW+1, 0, barW-2, h*0.25);
    }
    ctx2d.fillStyle = 'rgba(0,0,0,0.12)';
    for(let y=0;y<H;y+=3) ctx2d.fillRect(0,y,W,1);
    vizAnim = requestAnimationFrame(drawViz);
  }

  function animateBars() {
    barsEl.innerHTML = Array.from({length:16},()=>`<div class="radio-bar" style="height:${4+Math.random()*20}px"></div>`).join('');
    if (window._radioBarInterval) clearInterval(window._radioBarInterval);
    window._radioBarInterval = setInterval(()=>{
      barsEl.querySelectorAll('.radio-bar').forEach(b=>{ b.style.height=(4+Math.random()*20)+'px'; });
    },300);
  }

  function updateDisplay() {
    const s = stations[current];
    nameEl.textContent = s.name;
    freqEl.innerHTML = (s.live ? '<span class="radio-live-dot"></span>LIVE &nbsp;&middot;&nbsp; ':'')
      + s.freq + (s.freq!=='???'?' MHz':'') + ' &nbsp;&middot;&nbsp; ' + s.mood;
    if (s.locked) {
      tuneBtn.textContent = '⊖ Encrypted';
      tuneBtn.classList.add('locked');
    } else {
      tuneBtn.classList.remove('locked');
      tuneBtn.innerHTML = playing ? '<span style="color:var(--accent)">■ Stop</span>' : '▶ Tune In';
    }
    pillsEl.querySelectorAll('.radio-station-pill').forEach((p,i)=>p.classList.toggle('active',i===current));
    nowEl.textContent = playing ? ('NOW PLAYING · '+stations[current].name.toUpperCase()) : '';
  }

  tuneBtn.addEventListener('click', function() {
    const s = stations[current];
    if (s.locked) return;
    playing = !playing;
    if (playing) {
      panel.style.display = 'block';
      startStation(s.mode);
      if (!vizAnim) drawViz();
    } else {
      stopAll();
      panel.style.display = 'none';
      if (vizAnim) { cancelAnimationFrame(vizAnim); vizAnim = null; }
    }
    updateDisplay();
  });

  pillsEl.addEventListener('click', function(e) {
    const btn = e.target.closest('.radio-station-pill');
    if (!btn) return;
    const i = parseInt(btn.dataset.idx);
    if (stations[i].locked) return;
    current = i;
    if (playing) startStation(stations[i].mode);
    updateDisplay();
  });

  volSlider.addEventListener('input', function() {
    if (masterGain) masterGain.gain.value = this.value / 100;
  });

  animateBars();
  updateDisplay();
  drawViz();
}

function initRadio() {
  // Bars
  const bars = document.getElementById('radio-bars');
  if (bars) {
    bars.innerHTML = Array.from({length:14}, (_,i) => `
      <div class="radio-bar" style="animation-duration:${0.4+Math.random()*0.8}s;animation-delay:${Math.random()*0.3}s"></div>`).join('');
  }

}
