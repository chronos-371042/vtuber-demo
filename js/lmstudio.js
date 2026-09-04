/* LM Studio OpenAI-compatible local API. */
const LMS = {
  base: "/v1",
  model: null,
  history: []
};

function parseJsonLoose(text) {
  if (!text) return null;
  const t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : t;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch (_) { return null; }
}

async function listChatModels() {
  const r = await fetch(LMS.base + "/models");
  if (!r.ok) throw new Error("LM Studio models " + r.status);
  const data = await r.json();
  const ids = (data.data || []).map((m) => m.id).filter(Boolean);
  return ids.filter((id) => !/embed/i.test(id));
}

async function pickModel() {
  const ids = await listChatModels();
  if (!ids.length) throw new Error("no chat model loaded in LM Studio");
  const prefer = ids.find((id) => /mai-ui/i.test(id))
    || ids.find((id) => !/gemma-4-e2b/i.test(id))
    || ids[0];
  LMS.model = prefer;
  return prefer;
}

async function chat(messages, { max_tokens = 280 } = {}) {
  if (!LMS.model) await pickModel();
  const r = await fetch(LMS.base + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LMS.model,
      messages,
      temperature: 0.85,
      max_tokens
    })
  });
  if (!r.ok) throw new Error("chat " + r.status);
  const data = await r.json();
  const msg = data.choices && data.choices[0] && data.choices[0].message;
  return (msg && (msg.content || msg.reasoning_content)) || "";
}

function clampLine(s) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if ([...t].length <= 36) return t;
  return [...t].slice(0, 36).join("");
}

function toTurn(obj, lastPick) {
  const a = String(obj.a || obj.choice_a || obj.left || "").trim();
  const b = String(obj.b || obj.choice_b || obj.right || "").trim();
  if (!a || !b) return null;
  const line = clampLine(obj.line || obj.caption || `みんな、${a}と${b}、どっちいく？`);
  const sa = obj.stat_a || obj.statA || "bond";
  const sb = obj.stat_b || obj.statB || "guts";
  return {
    line,
    topicLabel: (obj.chapter || obj.topic || "序章"),
    options: [
      { id: "a-" + lastPick + "-" + a, label: a, mention: a, tags: [sa], stat: sa, delta: 2 },
      { id: "b-" + lastPick + "-" + b, label: b, mention: b, tags: [sb], stat: sb, delta: 2 }
    ]
  };
}

async function nextTurn(state) {
  const last = state.lastLabel || null;
  const stats = state.stats || { bond: 12, talent: 10, guts: 8 };
  const chapter = (window.VTuberGen && VTuberGen.chapterOf(stats)) || "序章";
  const sys = [
    "You write a Japanese visual-novel growth route for 星灯ルナ.",
    "Return ONLY JSON: {\"line\":\"...\",\"a\":\"...\",\"b\":\"...\",\"stat_a\":\"bond|talent|guts\",\"stat_b\":\"bond|talent|guts\",\"chapter\":\"...\"}.",
    "Choices are relationship/growth actions (特訓、休む、本音、本番、手紙), NOT food or games.",
    "line: max 30 Japanese chars, names both a and b.",
    "a and b: max 12 chars, opposing growth routes.",
    "No markdown."
  ].join(" ");
  const user = last
    ? `章=${chapter} 絆${stats.bond} 才能${stats.talent} 勇気${stats.guts}。今「${last}」を選んだ。次の成長2択。`
    : `序章スタート。最初の成長2択（例: 特訓についていく / 今日は一緒に休む）。`;

  const messages = [
    { role: "system", content: sys },
    ...LMS.history.slice(-6),
    { role: "user", content: user }
  ];

  let raw = await chat(messages);
  let obj = parseJsonLoose(raw);
  if (!obj) {
    raw = await chat(messages.concat([{ role: "user", content: "JSONだけ。例 {\"line\":\"特訓と休憩、どっちの私？\",\"a\":\"特訓についていく\",\"b\":\"今日は一緒に休む\",\"stat_a\":\"talent\",\"stat_b\":\"bond\",\"chapter\":\"序章\"}" }]), { max_tokens: 400 });
    obj = parseJsonLoose(raw);
  }
  const turn = obj && toTurn(obj, last || "start");
  if (!turn) throw new Error("bad json from model");
  LMS.history.push({ role: "user", content: user });
  LMS.history.push({ role: "assistant", content: JSON.stringify({ line: turn.line, a: turn.options[0].label, b: turn.options[1].label }) });
  if (LMS.history.length > 10) LMS.history = LMS.history.slice(-10);
  return turn;
}

window.VTuberLms = { pickModel, nextTurn, LMS };
