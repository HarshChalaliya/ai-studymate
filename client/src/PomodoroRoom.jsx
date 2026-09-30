import { useState, useEffect, useRef } from "react";
import "./PomodoroRoom.css";

function PomodoroRoom() {
  const [mode, setMode] = useState("work"); // 'work' (25m) | 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSound, setActiveSound] = useState(null); // 'rain' | 'waves' | 'cafe' | 'fireplace' | null

  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      if (mode === "work") {
        setMode("break");
        setTimeLeft(5 * 60);
        alert("🎉 Work session completed! Take a 5-minute break.");
      } else {
        setMode("work");
        setTimeLeft(25 * 60);
        alert("⚡ Break time over! Back to focus work.");
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  // Web Audio Synthesis for Ambient Sounds
  const toggleSound = (soundType) => {
    if (activeSound === soundType) {
      stopAudio();
      setActiveSound(null);
      return;
    }

    stopAudio();
    setActiveSound(soundType);

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (soundType === "rain") {
          // Pink noise for rain
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else if (soundType === "waves") {
          // Ocean waves modulation
          const mod = Math.sin((i / bufferSize) * Math.PI * 4);
          output[i] = white * 0.1 * (mod + 1);
        } else {
          // Warm ambient noise
          output[i] = white * 0.05;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = soundType === "rain" ? "lowpass" : "bandpass";
      filter.frequency.value = soundType === "rain" ? 1000 : 400;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } catch (e) {
      console.error("Web Audio Error:", e);
    }
  };

  const stopAudio = () => {
    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); } catch (e) {}
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === "work" ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="pomo-page">
      <div className="pomo-header">
        <div>
          <h1>⏱️ AI Pomodoro Focus Room</h1>
          <p>25-minute deep work timer with synthesised ambient sounds and break micro-refreshes.</p>
        </div>
      </div>

      <div className="pomo-container">
        <div className="pomo-card">
          <div className="mode-switch">
            <button
              className={`pomo-tab ${mode === "work" ? "active" : ""}`}
              onClick={() => switchMode("work")}
            >
              🧠 Deep Work (25m)
            </button>
            <button
              className={`pomo-tab ${mode === "break" ? "active" : ""}`}
              onClick={() => switchMode("break")}
            >
              ☕ Short Break (5m)
            </button>
          </div>

          <div className="timer-display">{formatTimer(timeLeft)}</div>

          <div className="timer-controls">
            <button
              className="primary-btn start-btn"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? "⏸️ Pause" : "▶️ Start Focus Session"}
            </button>
            <button
              className="secondary-btn"
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
              }}
            >
              🔄 Reset Timer
            </button>
          </div>
        </div>

        <div className="ambient-sounds-card">
          <h3>🎧 Ambient Focus Soundscape</h3>
          <p>Synthesized background noise to enhance concentration during study sessions.</p>

          <div className="sound-buttons-grid">
            <button
              className={`sound-btn ${activeSound === "rain" ? "active" : ""}`}
              onClick={() => toggleSound("rain")}
            >
              🌧️ Rain Sound {activeSound === "rain" && "🔊"}
            </button>
            <button
              className={`sound-btn ${activeSound === "waves" ? "active" : ""}`}
              onClick={() => toggleSound("waves")}
            >
              🌊 Ocean Waves {activeSound === "waves" && "🔊"}
            </button>
            <button
              className={`sound-btn ${activeSound === "cafe" ? "active" : ""}`}
              onClick={() => toggleSound("cafe")}
            >
              ☕ Lo-Fi Cafe Noise {activeSound === "cafe" && "🔊"}
            </button>
            <button
              className={`sound-btn ${activeSound === "fireplace" ? "active" : ""}`}
              onClick={() => toggleSound("fireplace")}
            >
              🌲 Fireplace {activeSound === "fireplace" && "🔊"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomodoroRoom;
