(function () {
  const $ = (sel) => document.querySelector(sel);
  const caption = $("#caption");
  const topicChip = $("#topic");
  const viewers = $("#viewers");
  const btnA = $("#choice-a");
  const btnB = $("#choice-b");
  const gate = $("#gate");
  const startBtn = $("#start-btn");

  let state = { lastLabel: null };
  let current = null;
  let viewerBase = 1842 + Math.floor(Math.random() * 400);
  let audioUnlocked = false;
  let busy = false;
  let useLms = true;

  const STAT_LABEL = { bond: "絆", talent: "才能", guts: "勇気" };

  function paintStats(stats) {
    const s = stats || (state._gen && state._gen.stats) || { bond: 12, talent: 10, guts: 8 };
    document.querySelectorAll(".stat").forEach((el) => {
      const id = el.getAttribute("data-stat");
      const v = Math.max(0, Math.min(100, s[id] || 0));
      el.querySelector("b").style.width = v + "%";
    });
  }

  function renderTurn(turn) {
    current = turn;
    caption.textContent = turn.line;
    const st = (state._gen && state._gen.stats) || turn.stats;
    const ch = (state._gen && state._gen.chapter) || turn.topicLabel || "序章";
    topicChip.textContent = ch;
    paintStats(st);
    [btnA, btnB].forEach((btn, i) => {
      const opt = turn.options[i];
      btn.querySelector(".txt").textContent = opt.label;
      btn.dataset.id = opt.id;
      const sl = STAT_LABEL[opt.stat] || "";
      btn.querySelector(".key").textContent = sl ? (sl + " +" + (opt.delta || 2)) : ("ルート " + (i ? "B" : "A"));
    });
  }

  function playTurn(turn) {
    renderTurn(turn);
    VTuberTts.speak(turn.line);
  }

  async function fetchTurn() {
    if (useLms && window.VTuberLms) {
      try {
        return await VTuberLms.nextTurn(state);
      } catch (err) {
        console.warn("LM Studio failed, template fallback", err);
        useLms = false;
        topicChip.textContent = "TOPIC  fallback";
      }
    }
    if (!window.VTuberGen) throw new Error("no generator");
    if (!state._gen) state._gen = VTuberGen.createState();
    state.stats = state._gen.stats;
    return VTuberGen.nextTurn(state._gen);
  }

  async function unlockAndPlay(turn) {
    audioUnlocked = true;
    gate.classList.add("hidden");
    try { speechSynthesis.resume(); } catch (_) {}
    playTurn(turn || current);
  }

  async function begin() {
    if (busy) return;
    busy = true;
    try {
      if (!current) current = await fetchTurn();
      await unlockAndPlay(current);
    } finally {
      busy = false;
    }
  }

  async function choose(index) {
    if (!current || busy) return;
    const opt = current.options[index];
    state.lastLabel = opt.label;
    if (!state._gen && window.VTuberGen) state._gen = VTuberGen.createState();
    if (state._gen && window.VTuberGen) {
      state._gen = VTuberGen.applyChoice(state._gen, opt);
      state.stats = state._gen.stats;
      paintStats(state._gen.stats);
    }
    viewerBase += 3 + Math.floor(Math.random() * 18);
    busy = true;
    caption.textContent = "考えてる…";
    try {
      const turn = await fetchTurn();
      audioUnlocked = true;
      gate.classList.add("hidden");
      try { speechSynthesis.resume(); } catch (_) {}
      playTurn(turn);
    } catch (e) {
      caption.textContent = "LM Studioに届かない。起動とモデル読込を確認して。";
    } finally {
      busy = false;
    }
  }

  btnA.addEventListener("click", () => choose(0));
  btnB.addEventListener("click", () => choose(1));
  startBtn.addEventListener("click", begin);

  document.addEventListener("keydown", (e) => {
    if (e.key === "1") choose(0);
    if (e.key === "2") choose(1);
    if ((e.key === "Enter" || e.key === " ") && !gate.classList.contains("hidden")) begin();
  });

  setInterval(() => {
    const jitter = Math.floor(Math.sin(Date.now() / 800) * 7);
    viewers.textContent = (viewerBase + jitter).toLocaleString("ja-JP") + " watching";
  }, 900);

  VTuberTts.loadVoices().then(async () => {
    try {
      if (window.VTuberLms) await VTuberLms.pickModel();
    } catch (_) {
      useLms = false;
    }
    try {
      const turn = await fetchTurn();
      playTurn(turn);
      gate.classList.add("hidden");
      setTimeout(() => {
        const synth = window.speechSynthesis;
        const blocked = !synth || (!synth.speaking && !synth.pending);
        if (blocked && !audioUnlocked) gate.classList.remove("hidden");
      }, 550);
    } catch (e) {
      caption.textContent = "LM Studioに接続できない。Developer > ローカルサーバをONにして。";
      gate.classList.remove("hidden");
    }
  });
})();
