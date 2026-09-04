/* Visual-novel growth: 2 choices raise 絆 / 才能 / 勇気. Spoken line names both. */

const STATS = [
  { id: "bond", label: "絆", color: "#ff7ad9" },
  { id: "talent", label: "才能", color: "#7cf0ff" },
  { id: "guts", label: "勇気", color: "#ffd56a" }
];

const TONES = {
  genki: { id: "genki", templates: [
    "{a}か{b}、どっちの私になる？",
    "成長ルート、{a}と{b}だよ",
    "さあ。{a}？それとも{b}？"
  ]},
  sleepy: { id: "sleepy", templates: [
    "ふわぁ…{a}と{b}、どっちがいい",
    "今日はゆっくり。{a}か{b}"
  ]},
  mischief: { id: "mischief", templates: [
    "ふふっ、{a}？逃げて{b}？",
    "本気出す？{a}と{b}で決めて"
  ]},
  shy: { id: "shy", templates: [
    "えっと…{a}と{b}、選んでほしい",
    "ちょっと恥ずかしい。{a}？{b}？"
  ]},
  hype: { id: "hype", templates: [
    "勝負！{a}か{b}、いくよ！",
    "ここが分岐。{a}と{b}！"
  ]}
};

const TONE_ORDER = ["genki", "sleepy", "mischief", "shy", "hype"];

const OPTIONS = [
  { id: "train", label: "特訓についていく", mention: "特訓", stat: "talent", delta: 2, tags: ["grow", "talent"], tone: "hype" },
  { id: "rest", label: "今日は一緒に休む", mention: "休憩", stat: "bond", delta: 2, tags: ["bond", "calm"], tone: "sleepy" },
  { id: "confess", label: "本音を聞いてあげる", mention: "本音", stat: "bond", delta: 2, tags: ["bond"], tone: "shy" },
  { id: "tease", label: "ちょっとからかう", mention: "からかい", stat: "guts", delta: 1, tags: ["bond", "play"], tone: "mischief" },
  { id: "cheer", label: "全力で応援する", mention: "応援", stat: "bond", delta: 2, tags: ["bond", "grow"], tone: "hype" },
  { id: "strict", label: "厳しく向き合う", mention: "スパルタ", stat: "talent", delta: 2, tags: ["talent"], tone: "hype" },
  { id: "lesson", label: "基礎からやり直す", mention: "基礎練", stat: "talent", delta: 2, tags: ["talent"], tone: "shy" },
  { id: "stage", label: "本番ステージに立つ", mention: "本番", stat: "guts", delta: 2, tags: ["guts", "grow"], tone: "hype" },
  { id: "hide", label: "幕の陰で見守る", mention: "見守る", stat: "bond", delta: 1, tags: ["bond"], tone: "sleepy" },
  { id: "rival", label: "ライバルに宣戦布告", mention: "宣戦", stat: "guts", delta: 2, tags: ["guts"], tone: "hype" },
  { id: "help-rival", label: "ライバルを助ける", mention: "助ける", stat: "bond", delta: 2, tags: ["bond", "guts"], tone: "shy" },
  { id: "letter", label: "手紙を渡す", mention: "手紙", stat: "bond", delta: 2, tags: ["bond"], tone: "shy" },
  { id: "keep-secret", label: "秘密は胸にしまう", mention: "秘密", stat: "guts", delta: 1, tags: ["guts"], tone: "mischief" },
  { id: "night-talk", label: "夜更かしで話す", mention: "夜話", stat: "bond", delta: 2, tags: ["bond", "night"], tone: "sleepy" },
  { id: "dawn-run", label: "朝練に付き合う", mention: "朝練", stat: "talent", delta: 2, tags: ["talent", "guts"], tone: "genki" },
  { id: "new-song", label: "未完成の歌を聴く", mention: "未完成の歌", stat: "talent", delta: 2, tags: ["talent", "bond"], tone: "shy" },
  { id: "skip-song", label: "完成するまで待つ", mention: "完成待ち", stat: "bond", delta: 1, tags: ["bond"], tone: "sleepy" },
  { id: "festival", label: "祭りの屋台を歩く", mention: "祭り", stat: "bond", delta: 2, tags: ["bond"], tone: "genki" },
  { id: "shooting", label: "金魚すくいで勝負", mention: "勝負", stat: "guts", delta: 2, tags: ["guts"], tone: "mischief" },
  { id: "comfort", label: "泣いてる横にいる", mention: "そばにいる", stat: "bond", delta: 3, tags: ["bond"], tone: "shy" },
  { id: "push", label: "もう一度やれと言う", mention: "再挑戦", stat: "guts", delta: 2, tags: ["guts", "talent"], tone: "hype" },
  { id: "costume", label: "新しい衣装を勧める", mention: "新衣装", stat: "talent", delta: 1, tags: ["talent"], tone: "genki" },
  { id: "plain", label: "いつもの制服でいい", mention: "制服", stat: "bond", delta: 1, tags: ["bond"], tone: "sleepy" },
  { id: "promise", label: "約束を交わす", mention: "約束", stat: "bond", delta: 3, tags: ["bond"], tone: "shy" },
  { id: "free", label: "縛らないで見守る", mention: "自由", stat: "guts", delta: 1, tags: ["guts"], tone: "genki" },
  { id: "study", label: "楽譜を一緒に読む", mention: "楽譜", stat: "talent", delta: 2, tags: ["talent"], tone: "shy" },
  { id: "improv", label: "即興でぶつけてみる", mention: "即興", stat: "guts", delta: 2, tags: ["guts", "talent"], tone: "hype" },
  { id: "apology", label: "先に謝る", mention: "謝罪", stat: "bond", delta: 2, tags: ["bond"], tone: "shy" },
  { id: "pride", label: "意地を張る", mention: "意地", stat: "guts", delta: 2, tags: ["guts"], tone: "mischief" },
  { id: "duet", label: "二人で歌う", mention: "デュエット", stat: "talent", delta: 2, tags: ["talent", "bond"], tone: "genki" },
  { id: "solo", label: "一人で歌わせる", mention: "ソロ", stat: "guts", delta: 2, tags: ["guts", "talent"], tone: "hype" }
];

function hashSeed(parts) {
  let h = 2166136261;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let x = seed || 1;
  return function next() {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length) % arr.length];
}

function overlap(a, b) {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

function scoreOption(opt, state, used) {
  if (used.has(opt.id)) return -100;
  const tags = new Set(state.tags);
  let s = 1 + overlap(opt.tags, tags) * 3;
  if (opt.id === state.lastId) s -= 8;
  if (state.lastId && opt.tags.includes(topicOf(state.lastId))) s += 1;
  if (state.avoidTone && opt.tone === state.avoidTone) s -= 1;
  s += (hashSeed([opt.id, String(state.turn)]) % 5) * 0.2;
  return s;
}

function topicOf(id) {
  const o = OPTIONS.find((x) => x.id === id);
  return o ? o.tags[0] : "";
}

function weightedSample(rand, scored, k) {
  const pool = scored.slice();
  const out = [];
  for (let n = 0; n < k && pool.length; n++) {
    const min = Math.min(...pool.map((p) => p.score));
    const weights = pool.map((p) => Math.max(0.05, p.score - min + 0.2));
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = rand() * sum;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    idx = Math.min(idx, pool.length - 1);
    out.push(pool[idx].opt);
    pool.splice(idx, 1);
  }
  return out;
}

function clampLine(text) {
  const chars = [...text];
  if (chars.length < 18) return text + " 選んでね。";
  if (chars.length > 40) return chars.slice(0, 39).join("") + "…";
  return text;
}

function lineFor(a, b, toneId, rand, turn) {
  const tone = TONES[toneId] || TONES.genki;
  const extra = [
    `{a}と{b}、るなは両方好き`,
    `チャット、{a}か{b}で分岐するよ`,
    `今の気分は{a}…いや{b}かも`
  ];
  const bag = turn % 4 === 3 ? tone.templates.concat(extra) : tone.templates;
  const tmpl = pick(rand, bag);
  return clampLine(tmpl.replaceAll("{a}", a.mention).replaceAll("{b}", b.mention));
}

function createState() {
  return {
    turn: 0,
    tags: ["grow", "bond"],
    tone: "genki",
    lastId: null,
    history: [],
    avoidTone: null,
    stats: { bond: 12, talent: 10, guts: 8 },
    chapter: "序章"
  };
}

function nextTurn(state) {
  const seed = hashSeed([
    String(state.turn),
    state.lastId || "start",
    state.tone,
    state.tags.join(","),
    state.history.slice(-3).join("-")
  ]);
  const rand = rng(seed ^ (Date.now() & 0xffff));
  const used = new Set(state.history.slice(-6));
  const scored = OPTIONS.map((opt) => ({ opt, score: scoreOption(opt, state, used) }))
    .filter((x) => x.score > -50)
    .sort((a, b) => b.score - a.score);

  let pair;
  if (state.turn === 0 && !state.lastId) {
    pair = [
      OPTIONS.find((o) => o.id === "train"),
      OPTIONS.find((o) => o.id === "rest")
    ];
  } else {
    pair = weightedSample(rand, scored, 2);
  }
  if (pair.length < 2) {
    const rest = OPTIONS.filter((o) => o.id !== state.lastId);
    pair = [pick(rand, rest), pick(rand, rest.filter((o) => o.id !== rest[0]?.id))];
  }
  if (pair[0].id === pair[1].id) {
    pair[1] = OPTIONS.find((o) => o.id !== pair[0].id);
  }

  if (rand() < 0.35 && pair[0].tags[0] === pair[1].tags[0]) {
    const other = scored.find((s) => s.opt.tags[0] !== pair[0].tags[0] && s.opt.id !== pair[0].id);
    if (other) pair[1] = other.opt;
  }

  const line = lineFor(pair[0], pair[1], state.tone, rand, state.turn);
  const topicLabel = (state.chapter || "序章") + " · " + (pair[0].stat || "bond");

  return {
    options: pair,
    line,
    tone: state.tone,
    topicLabel,
    stats: state.stats
  };
}

function applyChoice(state, option) {
  const nextTags = [...(option.tags || [])];
  for (const t of state.tags) {
    if (!nextTags.includes(t) && nextTags.length < 4) nextTags.push(t);
  }
  const stats = Object.assign({ bond: 10, talent: 10, guts: 10 }, state.stats || {});
  const stat = option.stat || "bond";
  const delta = option.delta || 1;
  stats[stat] = Math.min(100, (stats[stat] || 0) + delta);
  const top = Object.keys(stats).sort((a, b) => stats[b] - stats[a])[0];
  const chapter = stats[top] >= 40 ? "終章前" : stats[top] >= 24 ? "中盤" : "序章";
  return {
    turn: state.turn + 1,
    tags: nextTags.slice(0, 4),
    tone: option.tone || state.tone,
    lastId: option.id,
    history: state.history.concat(option.id).slice(-24),
    avoidTone: state.tone === option.tone ? null : state.tone,
    stats,
    chapter,
    lastStat: stat,
    lastDelta: delta
  };
}

function applyStats(state, option) {
  return applyChoice(state._gen ? state._gen : state, option);
}

function chapterOf(stats) {
  const s = stats || {};
  const top = Math.max(s.bond || 0, s.talent || 0, s.guts || 0);
  if (top >= 40) return "終章前";
  if (top >= 24) return "中盤";
  return "序章";
}

window.VTuberGen = { OPTIONS, TONES, STATS, createState, nextTurn, applyChoice, chapterOf };
