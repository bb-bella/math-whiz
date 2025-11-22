
// Simple synthesizer using Web Audio API to avoid external asset dependencies
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0) => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration);
};

export const playSound = (type: 'correct' | 'wrong' | 'click' | 'skip') => {
  try {
    switch (type) {
      case 'correct':
        // Happy major chord up
        playTone(523.25, 'sine', 0.3, 0); // C5
        playTone(659.25, 'sine', 0.3, 0.1); // E5
        playTone(783.99, 'sine', 0.4, 0.2); // G5
        break;
      case 'wrong':
        // Sad buzz down
        playTone(150, 'sawtooth', 0.3, 0);
        playTone(100, 'sawtooth', 0.4, 0.2);
        break;
      case 'click':
        // Short blip
        playTone(800, 'sine', 0.05, 0);
        break;
      case 'skip':
        // Fast swoosh/descending slide
        playTone(400, 'triangle', 0.1, 0);
        playTone(300, 'triangle', 0.1, 0.05);
        playTone(200, 'triangle', 0.2, 0.1);
        break;
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
