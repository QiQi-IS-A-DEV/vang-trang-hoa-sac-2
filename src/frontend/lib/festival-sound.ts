// An original pentatonic chime loop. No external stream or copyrighted recording.
// Set this to /audio/trung-thu.mp3 after adding the club's chosen recording.
export const soundtrackUrl: string | null = null;

export function createFestivalChimes() {
  const context = new AudioContext();
  const output = context.createGain();
  output.gain.value = .055;
  output.connect(context.destination);
  const notes = [72, 76, 79, 81, 79, 76, 74, null, 72, 74, 76, 79, 76, 74, 72, null];
  let index = 0, next = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  function schedule() {
    while (next < context.currentTime + 1) {
      const note = notes[index++ % notes.length];
      if (note !== null) {
        const oscillator = context.createOscillator(), envelope = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
        envelope.gain.setValueAtTime(0, next);
        envelope.gain.linearRampToValueAtTime(.7, next + .04);
        envelope.gain.exponentialRampToValueAtTime(.001, next + 1.5);
        oscillator.connect(envelope); envelope.connect(output);
        oscillator.start(next); oscillator.stop(next + 1.6);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
      }
      next += .75;
    }
  }
  return {
    async play() { await context.resume(); next = context.currentTime + .05; schedule(); timer = setInterval(schedule, 250); },
    async pause() { clearInterval(timer); timer = undefined; await context.suspend(); },
    dispose() { clearInterval(timer); if (context.state !== 'closed') void context.close().catch(() => {}); },
  };
}
