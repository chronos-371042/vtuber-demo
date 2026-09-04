/* Browser speechSynthesis, ja-JP. Lip-sync via viseme timer (~3s). */

const Tts = {
  speaking: false,
  timer: null,
  visemeTimer: null,
  utterance: null,
  voicesReady: false
};

function loadVoices() {
  return new Promise((resolve) => {
    const grab = () => speechSynthesis.getVoices();
    let v = grab();
    if (v && v.length) {
      Tts.voicesReady = true;
      resolve(v);
      return;
    }
    const done = () => {
      Tts.voicesReady = true;
      resolve(grab());
    };
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 800);
  });
}

function pickJaVoice(voices) {
  const list = voices || [];
  const ja = list.filter((v) => /ja(-JP)?/i.test(v.lang) || /Japanese/i.test(v.name));
  const prefer = ja.find((v) => /female|woman|girl|kyoko|nanami|haruka|ichiro/i.test(v.name)) || ja[0];
  return prefer || null;
}

function stopMouth(root) {
  if (Tts.visemeTimer) {
    clearInterval(Tts.visemeTimer);
    Tts.visemeTimer = null;
  }
  root.classList.remove("speaking", "viseme-0", "viseme-1", "viseme-2", "viseme-3");
}

function startMouth(root) {
  stopMouth(root);
  root.classList.add("speaking", "viseme-2");
  let i = 0;
  const seq = [2, 1, 3, 0, 2, 3, 1, 2];
  Tts.visemeTimer = setInterval(() => {
    root.classList.remove("viseme-0", "viseme-1", "viseme-2", "viseme-3");
    root.classList.add("viseme-" + seq[i % seq.length]);
    i++;
  }, 95);
}

function estimateMs(text) {
  const n = [...text].length;
  return Math.max(2600, Math.min(3800, 420 + n * 95));
}

function speak(text, { onStart, onEnd } = {}) {
  const root = document.getElementById("character");
  const fallbackMs = estimateMs(text);
  const token = (Tts.token = (Tts.token || 0) + 1);

  if (Tts.timer) {
    clearTimeout(Tts.timer);
    Tts.timer = null;
  }
  try { speechSynthesis.cancel(); } catch (_) {}

  const finish = () => {
    if (token !== Tts.token) return;
    Tts.speaking = false;
    if (Tts.timer) clearTimeout(Tts.timer);
    Tts.timer = null;
    try { speechSynthesis.cancel(); } catch (_) {}
    stopMouth(root);
    onEnd && onEnd();
  };

  Tts.speaking = true;
  startMouth(root);
  onStart && onStart();

  Tts.timer = setTimeout(finish, fallbackMs + 200);

  if (!window.speechSynthesis) {
    return { finish };
  }

  try { speechSynthesis.cancel(); } catch (_) {}

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 1.08;
  u.pitch = 1.18;
  u.volume = 1;
  const voice = pickJaVoice(speechSynthesis.getVoices());
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang || "ja-JP";
  }
  u.onend = finish;
  u.onerror = finish;
  Tts.utterance = u;

  try {
    speechSynthesis.speak(u);
  } catch (_) {
    /* mouth still runs on timer */
  }
  return { finish };
}

window.VTuberTts = { loadVoices, speak, stopMouth, startMouth, estimateMs };
