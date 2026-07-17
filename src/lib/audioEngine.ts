/**
 * Programmatic Web Audio API Synthesis Engine for CHQAO Quest.
 * Generates genuine high-fidelity military audio effects and retro chiptune SFX
 * on the fly without external media dependencies.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private bgmVolume: number = 0.2;
  private sfxVolume: number = 0.8;
  private currentBgmType: string | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolumes(bgm: number, sfx: number) {
    this.bgmVolume = bgm;
    this.sfxVolume = sfx;
    // If playing, restart BGM to apply volume immediately
    if (this.currentBgmType) {
      this.playBGM(this.currentBgmType);
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopBGM();
      this.stopNoiseLoop();
    } else {
      if (this.currentBgmType) {
        this.playBGM(this.currentBgmType);
      }
      if (this.isImmersiveAmbientEnabled) {
        this.startNoiseLoop();
      }
    }
  }

  public getMuteStatus() {
    return this.isMuted;
  }

  /**
   * PLAY SOUND EFFECT
   */
  public playSFX(type: string) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      switch (type) {
        case 'click': {
          // Metallic buckle/button click sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'acerto': {
          // Double chime "ding-ding!" in a soldier "Padrão!" vibe
          const notes = [659.25, 880]; // E5, A5
          notes.forEach((freq, idx) => {
            const time = now + idx * 0.12;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, time);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(this.sfxVolume * 0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

            osc.start(time);
            osc.stop(time + 0.28);
          });
          break;
        }

        case 'erro': {
          // Buzzer sound + lower failure note
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc2.type = 'triangle';

          osc1.frequency.setValueAtTime(120, now);
          osc2.frequency.setValueAtTime(123, now);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.5);
          osc2.stop(now + 0.5);
          break;
        }

        case 'combo': {
          // Ascending military trumpet salute notes
          const freqs = [329.63, 392.00, 523.25, 659.25]; // E4, G4, C5, E5
          freqs.forEach((freq, idx) => {
            const time = now + idx * 0.15;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(this.sfxVolume * 0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

            osc.start(time);
            osc.stop(time + 0.25);
          });
          break;
        }

        case 'medalha': {
          // Metal strike "clink-shimmer"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc.start(now);
          osc.stop(now + 0.62);

          // Add a low metallic thud
          const thud = ctx.createOscillator();
          const thudGain = ctx.createGain();
          thud.type = 'triangle';
          thud.frequency.setValueAtTime(60, now);
          thud.frequency.exponentialRampToValueAtTime(20, now + 0.25);
          thud.connect(thudGain);
          thudGain.connect(ctx.destination);
          thudGain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
          thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          thud.start(now);
          thud.stop(now + 0.25);
          break;
        }

        case 'cunhete': {
          // Wood chest creak: sweeping frequency + low noise click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(40, now);
          osc.frequency.linearRampToValueAtTime(350, now + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }

        case 'carimbo': {
          // Dull thud paper seal stamp "boom-shh" with friction noise burst
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.exponentialRampToValueAtTime(10, now + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          osc.start(now);
          osc.stop(now + 0.2);

          // Add a friction noise burst for stamp texturing on paper
          try {
            const bufferSize = Math.floor(ctx.sampleRate * 0.1);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(450, now);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            noise.start(now + 0.02); // start slightly after the impact
            noise.stop(now + 0.12);
          } catch (e) {}
          break;
        }

        case 'alarme': {
          // Disciplinary sirens!
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.2);
          osc.frequency.linearRampToValueAtTime(600, now + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }

        case 'voice_caramelo': {
          // A throaty, warm canine bark using a band-pass noise filter and triangle wave.
          // Pitched lower (180 Hz -> 75 Hz) to sound like a medium-sized dog (Caramelo).
          try {
            // Core pitch oscillator
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(75, now + 0.12);

            // Create white noise for air turbulence/raspiness
            const bufferSize = Math.floor(ctx.sampleRate * 0.14);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(320, now);
            noiseFilter.Q.setValueAtTime(2.5, now);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.start(now);
            noise.start(now);
            osc.stop(now + 0.14);
            noise.stop(now + 0.14);

            // Second part of double bark (Au au!) after 105ms
            setTimeout(() => {
              if (this.isMuted) return;
              const now2 = ctx.currentTime;
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.type = 'triangle';
              osc2.frequency.setValueAtTime(160, now2);
              osc2.frequency.exponentialRampToValueAtTime(65, now2 + 0.1);

              const noise2 = ctx.createBufferSource();
              noise2.buffer = buffer;
              const noiseGain2 = ctx.createGain();
              noiseGain2.gain.setValueAtTime(this.sfxVolume * 0.18, now2);
              noiseGain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.09);

              const noiseFilter2 = ctx.createBiquadFilter();
              noiseFilter2.type = 'bandpass';
              noiseFilter2.frequency.setValueAtTime(300, now2);
              noiseFilter2.Q.setValueAtTime(2.5, now2);

              noise2.connect(noiseFilter2);
              noiseFilter2.connect(noiseGain2);
              noiseGain2.connect(ctx.destination);

              osc2.connect(gain2);
              gain2.connect(ctx.destination);
              gain2.gain.setValueAtTime(this.sfxVolume * 0.32, now2);
              gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.11);

              osc2.start(now2);
              noise2.start(now2);
              osc2.stop(now2 + 0.11);
              noise2.stop(now2 + 0.11);
            }, 105);
          } catch (e) {
            // Fallback to simple oscillator if noise fails to build
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(170, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
          }
          break;
        }

        case 'typewriter': {
          // Typing tactile pulse
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1100, now);
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(this.sfxVolume * 0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }

        case 'fanfarra': {
          // Majestic brassy bugle salute
          const timeline = [
            { f: 261.63, d: 0.15 }, // C4
            { f: 329.63, d: 0.15 }, // E4
            { f: 392.00, d: 0.15 }, // G4
            { f: 523.25, d: 0.45 }  // C5
          ];
          let cumulativeTime = 0;
          timeline.forEach((item) => {
            const time = now + cumulativeTime;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = 'sawtooth';
            osc2.type = 'triangle';

            osc1.frequency.setValueAtTime(item.f, time);
            osc2.frequency.setValueAtTime(item.f * 1.005, time); // detune slightly for chorus

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(this.sfxVolume * 0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + item.d);

            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + item.d);
            osc2.stop(time + item.d);

            cumulativeTime += item.d - 0.02; // overlap slightly
          });
          break;
        }

        case 'bizu': {
          // Binocular slide zoom "shh-whoosh"
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(1600, now + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'radio_tuning': {
          // Tactical radio sintonization effect
          // 1. Morse code beeps: E.g., three quick dit-dit-dah beeps
          const morseTimeline = [0.0, 0.08, 0.16];
          const morseDurations = [0.04, 0.04, 0.12];
          morseTimeline.forEach((timeOffset, idx) => {
            const time = now + timeOffset;
            const dur = morseDurations[idx];
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000 + Math.random() * 200, time); // high code beep
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            gain.gain.setValueAtTime(this.sfxVolume * 0.18, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            
            osc.start(time);
            osc.stop(time + dur + 0.02);
          });

          // 2. Radio static sweep (white noise with bandpass frequency modulation)
          try {
            const bufferSize = Math.floor(ctx.sampleRate * 0.5);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, now);
            // sweep filter frequency to simulate dial turning!
            filter.frequency.linearRampToValueAtTime(2500, now + 0.35);
            filter.frequency.linearRampToValueAtTime(1200, now + 0.5);
            filter.Q.setValueAtTime(5, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.05, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
            noise.stop(now + 0.5);
          } catch (e) {
            // Sweep fallback osc
            const fallback = ctx.createOscillator();
            const fallbackGain = ctx.createGain();
            fallback.type = 'triangle';
            fallback.frequency.setValueAtTime(300, now);
            fallback.frequency.linearRampToValueAtTime(900, now + 0.4);
            fallback.connect(fallbackGain);
            fallbackGain.connect(ctx.destination);
            fallbackGain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
            fallbackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            fallback.start(now);
            fallback.stop(now + 0.45);
          }
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.warn('Could not play synthesized audio effect:', e);
    }
  }

  /**
   * PLAY BACKGROUND MUSIC (BGM)
   * Programmatically synthesizes simple loop patterns
   */
  public playBGM(type: string) {
    if (this.isMuted) {
      this.currentBgmType = type;
      return;
    }
    this.stopBGM();
    this.currentBgmType = type;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      if (type === 'qg') {
        // Soft military drum beat loop and parade flutes
        let index = 0;
        this.bgmInterval = setInterval(() => {
          const now = ctx.currentTime;
          // Every 4th beat is a kick thud, other beats are subtle snare clicks
          if (index % 4 === 0) {
            // Bass drum kick
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(55, now);
            osc.frequency.linearRampToValueAtTime(15, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(this.bgmVolume * 0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.32);
          } else {
            // Snare tick noise
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(this.bgmVolume * 0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.09);
          }

          // Whistle/Flute ambient melody note on major steps
          if (index % 8 === 0) {
            const melodies = [261.63, 293.66, 329.63, 392.00, 392.00, 349.23, 329.63, 293.66];
            const note = melodies[Math.floor(index / 8) % melodies.length];
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note * 2, now); // flute high pitch
            osc.connect(gain);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(this.bgmVolume * 0.15, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.35);
          }

          index = (index + 1) % 64;
        }, 360); // tempo pace
      } else if (type === 'missao') {
        // Tense tactical rhythmic synth beat
        let index = 0;
        this.bgmInterval = setInterval(() => {
          const now = ctx.currentTime;
          // Steady tactical bass drum kick
          if (index % 4 === 0) {
            const kick = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kick.type = 'triangle';
            kick.frequency.setValueAtTime(50, now);
            kick.frequency.linearRampToValueAtTime(15, now + 0.25);
            kick.connect(kickGain);
            kickGain.connect(ctx.destination);
            kickGain.gain.setValueAtTime(this.bgmVolume * 0.28, now);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            kick.start(now);
            kick.stop(now + 0.27);
          }

          // Pulsing contrabaixo in semiminimas (moving between 45Hz and 55Hz)
          if (index % 2 === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteFreq = index % 8 < 4 ? 45 : 55;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(noteFreq, now);
            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.setValueAtTime(110, now);

            osc.connect(lowpass);
            lowpass.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(this.bgmVolume * 0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.25);
          }

          // Tension sweep
          if (index === 0 || index === 16) {
            const sweep = ctx.createOscillator();
            const sweepGain = ctx.createGain();
            sweep.type = 'sine';
            sweep.frequency.setValueAtTime(220, now);
            sweep.frequency.linearRampToValueAtTime(140, now + 2.0);
            sweep.connect(sweepGain);
            sweepGain.connect(ctx.destination);
            sweepGain.gain.setValueAtTime(0, now);
            sweepGain.gain.linearRampToValueAtTime(this.bgmVolume * 0.1, now + 1.0);
            sweepGain.gain.linearRampToValueAtTime(0, now + 2.0);
            sweep.start(now);
            sweep.stop(now + 2.05);
          }

          index = (index + 1) % 32;
        }, 250);
      } else if (type === 'rancho') {
        // Relaxing acoustic blues rhythm
        let index = 0;
        this.bgmInterval = setInterval(() => {
          const now = ctx.currentTime;
          const bassNotes = [110, 110, 146.83, 110, 164.81, 146.83, 110, 110]; // Blues scale in A
          const bassFreq = bassNotes[Math.floor(index / 2) % bassNotes.length];

          if (index % 2 === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bassFreq / 2, now); // low bass
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(this.bgmVolume * 0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
            osc.start(now);
            osc.stop(now + 0.48);
          }

          if (index % 4 === 1) {
            // Blues chord acoustic pluck
            const plucks = [220, 277.18, 329.63, 392.00]; // A7 notes
            plucks.forEach((f, idx) => {
              const pluckOsc = ctx.createOscillator();
              const gainPluck = ctx.createGain();
              pluckOsc.type = 'sine';
              pluckOsc.frequency.setValueAtTime(f, now + idx * 0.035);
              pluckOsc.connect(gainPluck);
              gainPluck.connect(ctx.destination);
              gainPluck.gain.setValueAtTime(this.bgmVolume * 0.15, now);
              gainPluck.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
              pluckOsc.start(now);
              pluckOsc.stop(now + 0.75);

              // Delay/Echo effect: Trigger a secondary pluck 200ms later at 40% volume
              const echoTime = now + 0.2 + idx * 0.035;
              const echoOsc = ctx.createOscillator();
              const echoGain = ctx.createGain();
              echoOsc.type = 'sine';
              echoOsc.frequency.setValueAtTime(f, echoTime);
              echoOsc.connect(echoGain);
              echoGain.connect(ctx.destination);
              echoGain.gain.setValueAtTime(this.bgmVolume * 0.06, echoTime);
              echoGain.gain.exponentialRampToValueAtTime(0.001, echoTime + 0.5);
              echoOsc.start(echoTime);
              echoOsc.stop(echoTime + 0.55);
            });
          }

          index = (index + 1) % 16;
        }, 450);
      }
    } catch (e) {
      console.warn('Could not launch procedural background music:', e);
    }
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgmType = null;
  }

  // Immersive Noise Option (White-ish/Brown Sound of Military Barracks/Quarter/Cafeteria)
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isNoiseActive: boolean = false;
  public isImmersiveAmbientEnabled: boolean = false;
  private ambientInterval: any = null;

  public setImmersiveAmbientEnabled(enabled: boolean) {
    this.isImmersiveAmbientEnabled = enabled;
    if (enabled) {
      this.startNoiseLoop();
    } else {
      this.stopNoiseLoop();
    }
  }

  public getImmersiveAmbientEnabled(): boolean {
    return this.isImmersiveAmbientEnabled;
  }

  public startNoiseLoop() {
    if (this.isNoiseActive) return;
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      // 2 seconds buffer of white-ish brown filtered noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // High quality brown-skewed comfort noise
        data[i] = Math.random() * 2 - 1;
      }
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      // Filter to sound like "Warm barracks atmosphere" / distant low-freq hum
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      
      const peaking = ctx.createBiquadFilter();
      peaking.type = 'peaking';
      peaking.frequency.setValueAtTime(95, ctx.currentTime);
      peaking.Q.setValueAtTime(1.2, ctx.currentTime);
      peaking.gain.setValueAtTime(5, ctx.currentTime);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.32 * this.sfxVolume, ctx.currentTime);
      
      source.connect(filter);
      filter.connect(peaking);
      peaking.connect(gain);
      gain.connect(ctx.destination);
      
      source.start();
      this.noiseSource = source;
      this.noiseGain = gain;
      this.isNoiseActive = true;
      
      this.startAmbientIntervals();
    } catch (e) {
      console.warn("Could not start noise loop:", e);
    }
  }

  public stopNoiseLoop() {
    this.isNoiseActive = false;
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
      } catch (e) {}
      this.noiseSource = null;
    }
    this.noiseGain = null;
    this.stopAmbientIntervals();
  }

  private startAmbientIntervals() {
    this.stopAmbientIntervals();
    const ctx = this.initContext();
    if (!ctx) return;
    
    this.ambientInterval = setInterval(() => {
      if (this.isMuted || !this.isNoiseActive) return;
      const now = ctx.currentTime;
      const r = Math.random();
      
      if (r < 0.45) {
        // High cafeteria fork strike
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 + Math.random() * 700, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.006 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (r < 0.75) {
        // Faint low frequency footstep thump or general barracks rattle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(45 + Math.random() * 25, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.016 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    }, 1900);
  }

  private stopAmbientIntervals() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }
}

export const audioEngine = new AudioEngine();
