let audioContext: AudioContext | null = null;
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let bgMusicGain: GainNode | null = null;
let isBgMusicPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.35);
    });

    const chimeTimes = [0.5, 0.55, 0.6];
    chimeTimes.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now + t);
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.06, now + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.25);
    });
  } catch { }
}

export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(277, now + 0.15);
    osc2.frequency.linearRampToValueAtTime(200, now + 0.4);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch { }
}

export function playCompletionSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const melody = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.45);
    });

    const finalChord = [1046.5, 1318.51, 1567.98];
    finalChord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + 1.1);
      gain.gain.setValueAtTime(0, now + 1.1);
      gain.gain.linearRampToValueAtTime(0.08, now + 1.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 1.1);
      osc.stop(now + 2.1);
    });
  } catch { }
}

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

function playBgNote(ctx: AudioContext, gain: GainNode) {
  const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();
  osc.type = Math.random() > 0.5 ? "sine" : "triangle";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  noteGain.gain.setValueAtTime(0, ctx.currentTime);
  noteGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
  noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.connect(noteGain);
  noteGain.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.6);
}

export function startBgMusic() {
  if (isBgMusicPlaying) return;
  try {
    const ctx = getAudioContext();
    bgMusicGain = ctx.createGain();
    bgMusicGain.gain.setValueAtTime(0.5, ctx.currentTime);
    bgMusicGain.connect(ctx.destination);
    isBgMusicPlaying = true;

    playBgNote(ctx, bgMusicGain);
    bgMusicInterval = setInterval(() => {
      if (bgMusicGain && isBgMusicPlaying) {
        // Create a more rhythmic pentatonic melody
        const coin = Math.random();
        if (coin > 0.3) {
          playBgNote(ctx, bgMusicGain);
        }

        // Occasional double notes (harmony)
        if (coin > 0.7) {
          setTimeout(() => {
            if (bgMusicGain && isBgMusicPlaying) {
              playBgNote(ctx, bgMusicGain);
            }
          }, 150);
        }
      }
    }, 600);
  } catch { }
}

export function stopBgMusic() {
  isBgMusicPlaying = false;
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  if (bgMusicGain) {
    try {
      bgMusicGain.gain.linearRampToValueAtTime(0, bgMusicGain.context.currentTime + 0.5);
    } catch { }
    bgMusicGain = null;
  }
}

export function isBgPlaying() {
  return isBgMusicPlaying;
}
