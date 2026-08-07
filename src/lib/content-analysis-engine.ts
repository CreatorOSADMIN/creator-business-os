// Deterministic, fully local simulation engine for the Content Analysis demo.
// No network calls, no AI models, no persistence — every value here is
// derived mathematically from the submitted demo session so the same
// session always reproduces the same report.

import type { CaGoal, CaPlatform, ContentAnalysisSession } from "@/lib/content-analysis";

export interface FeatureScore {
  key: string;
  label: string;
  score: number;
  explanation: string;
  confidence: number;
}

export interface WinningPattern {
  title: string;
  body: string;
}

export interface BlueprintItem {
  label: string;
  value: string;
}

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface ConfidenceIndicator {
  label: string;
  value: ConfidenceLevel;
  pct: number;
}

export interface ContentAnalysisReport {
  contentScore: number;
  scoreSummary: string;
  featureScores: FeatureScore[];
  patterns: WinningPattern[];
  blueprint: BlueprintItem[];
  strengths: string[];
  opportunities: string[];
  confidence: ConfidenceIndicator[];
}

// ---------------------------------------------------------------------------
// Deterministic PRNG — FNV-1a hash for the seed, mulberry32 for the stream.
// ---------------------------------------------------------------------------

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, options: readonly T[]): T {
  return options[Math.floor(rng() * options.length) % options.length];
}

/** Deterministic, order-preserving-free unique sample of `count` items. */
function pickN<T>(rng: () => number, options: readonly T[], count: number): T[] {
  const pool = [...options];
  const result: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

function confidenceLevel(pct: number): ConfidenceLevel {
  if (pct >= 80) return "High";
  if (pct >= 60) return "Medium";
  return "Low";
}

// ---------------------------------------------------------------------------
// Platform / goal tuning tables — these give the simulation its personality.
// ---------------------------------------------------------------------------

const PLATFORM_BASE_SCORE: Record<CaPlatform, number> = {
  TikTok: 79,
  Instagram: 75,
  YouTube: 72,
};

const GOAL_SCORE_MODIFIER: Record<CaGoal, number> = {
  "Maximize Views": 4,
  "Gain Followers": 1,
  "Increase Comments": -2,
  "Improve Engagement": 2,
};

const PLATFORM_POSTING_WINDOW: Record<CaPlatform, string> = {
  TikTok: "6–9pm on weekdays, when scroll sessions run longest",
  Instagram: "11am–1pm and 7–8pm, around lunch and evening wind-down",
  YouTube: "Weekend mornings, when longer watch sessions are more likely",
};

const PLATFORM_DURATION: Record<CaPlatform, string> = {
  TikTok: "21–34 seconds",
  Instagram: "26–45 seconds",
  YouTube: "6–9 minutes",
};

const PLATFORM_VISUAL_STYLE: Record<CaPlatform, string> = {
  TikTok: "Handheld, high-contrast, quick cuts every 2–3 seconds",
  Instagram: "Clean single-take with a consistent color grade",
  YouTube: "Structured b-roll with a stable, well-lit talking head",
};

const GOAL_CTA: Record<CaGoal, string> = {
  "Maximize Views": "Spoken tease of the next video in the final 2 seconds",
  "Gain Followers": "\"Follow for part 2\" spoken and on-screen at the end",
  "Increase Comments": "A direct either/or question inviting a comment reply",
  "Improve Engagement": "Ask viewers to share the one takeaway that landed",
};

const GOAL_TONE: Record<CaGoal, string> = {
  "Maximize Views": "High-energy and fast-paced from the first frame",
  "Gain Followers": "Personable and consistent, building a recognizable voice",
  "Increase Comments": "Slightly provocative — an opinion worth reacting to",
  "Improve Engagement": "Conversational, like talking to one specific viewer",
};

const HOOK_TYPES = [
  "Direct question in the first 2 seconds",
  "Bold claim or stat that contradicts expectation",
  "Mid-action cold open with no intro",
  "\"Nobody tells you this\" framing",
  "Visual surprise before any branding appears",
] as const;

// ---------------------------------------------------------------------------
// Feature score definitions
// ---------------------------------------------------------------------------

interface FeatureDef {
  key: string;
  label: string;
  baseRange: [number, number];
  confidenceRange: [number, number];
  explanations: string[];
}

const FEATURE_DEFS: FeatureDef[] = [
  {
    key: "hook",
    label: "Hook",
    baseRange: [68, 94],
    confidenceRange: [78, 95],
    explanations: [
      "Most videos open with motion or a question before any branding appears.",
      "The first frame is strong, but a few videos take too long to state the premise.",
      "Openings are consistent enough to read as a signature style.",
    ],
  },
  {
    key: "postingTime",
    label: "Posting Time",
    baseRange: [52, 88],
    confidenceRange: [55, 80],
    explanations: [
      "Publish times are scattered across the day, diluting the algorithm's early signal.",
      "Most uploads land inside a predictable window, which is helping consistency.",
      "A tighter posting window would likely compound your early engagement.",
    ],
  },
  {
    key: "duration",
    label: "Duration",
    baseRange: [60, 92],
    confidenceRange: [65, 90],
    explanations: [
      "Runtime sits close to the sweet spot for this platform and goal.",
      "A few videos run long past the point where the hook has paid off.",
      "Trimming the middle third would likely lift completion rate.",
    ],
  },
  {
    key: "editing",
    label: "Editing",
    baseRange: [62, 93],
    confidenceRange: [70, 92],
    explanations: [
      "Cut frequency keeps pace with the pacing this format rewards.",
      "Transitions are clean, though a couple of scenes run without a pattern break.",
      "Editing rhythm is consistent enough to feel intentional, not accidental.",
    ],
  },
  {
    key: "visualStyle",
    label: "Visual Style",
    baseRange: [58, 91],
    confidenceRange: [60, 88],
    explanations: [
      "Color and framing stay consistent across the sample, which builds recognizability.",
      "Lighting varies between videos, which softens the sense of a consistent look.",
      "Visual choices are distinct enough to stand out while scrolling.",
    ],
  },
  {
    key: "cta",
    label: "CTA",
    baseRange: [48, 86],
    confidenceRange: [55, 82],
    explanations: [
      "Calls-to-action are inconsistent — some videos skip them entirely.",
      "The CTA lands late enough that some viewers may already be gone.",
      "Spoken and on-screen CTAs reinforce each other well when both are present.",
    ],
  },
  {
    key: "storytelling",
    label: "Storytelling",
    baseRange: [55, 90],
    confidenceRange: [58, 85],
    explanations: [
      "Videos follow a clear setup-to-payoff arc rather than a flat list of points.",
      "A couple of videos front-load context that could move later without losing clarity.",
      "The narrative through-line is strong enough to justify longer runtimes.",
    ],
  },
];

// Small per-platform nudges so the same feature reads differently by platform.
const PLATFORM_FEATURE_OFFSET: Record<CaPlatform, Partial<Record<string, number>>> = {
  TikTok: { hook: 5, duration: 4, postingTime: 3, storytelling: -4 },
  Instagram: { visualStyle: 5, cta: 3, editing: 2 },
  YouTube: { storytelling: 6, editing: 4, hook: -3, postingTime: -3 },
};

// ---------------------------------------------------------------------------
// Winning pattern pool
// ---------------------------------------------------------------------------

const GENERAL_PATTERNS: WinningPattern[] = [
  {
    title: "Question hooks outperform statements",
    body: "Videos opening on a direct question hold viewers longer than ones that open with a statement or intro.",
  },
  {
    title: "Mid-roll pattern break",
    body: "A cut, caption change, or camera-angle shift around the 40% mark correlates with retention spikes.",
  },
  {
    title: "Subtitles lift retention",
    body: "Videos with on-screen captions retain viewers noticeably longer than caption-free videos in this sample.",
  },
  {
    title: "Face-forward first frame",
    body: "Thumbnails and opening frames with a clear face outperform text-only or product-only opens.",
  },
  {
    title: "Single-topic videos win",
    body: "Videos covering one idea end-to-end outperform videos that try to cover several points in one clip.",
  },
];

const PLATFORM_PATTERNS: Record<CaPlatform, WinningPattern> = {
  TikTok: {
    title: "Short-form sweet spot",
    body: "Videos between 21 and 34 seconds showed the strongest completion rate across the sample.",
  },
  Instagram: {
    title: "Save-worthy framing",
    body: "Videos framed as reference material ('save this for later') accumulated more saves than pure entertainment clips.",
  },
  YouTube: {
    title: "Chaptered structure",
    body: "Videos with a clear chapter structure held audience retention flatter through the middle section.",
  },
};

const GOAL_PATTERNS: Record<CaGoal, WinningPattern> = {
  "Maximize Views": {
    title: "Curiosity gap openings",
    body: "Videos that withhold the payoff until the final third accumulate more full watch-throughs.",
  },
  "Gain Followers": {
    title: "Series framing",
    body: "Videos explicitly framed as part of a series convert more first-time viewers into follows.",
  },
  "Increase Comments": {
    title: "Debatable takes",
    body: "Videos stating a clear, debatable opinion generate more comment replies than neutral how-to framing.",
  },
  "Improve Engagement": {
    title: "Direct address",
    body: "Videos that speak to a single viewer ('you') outperform videos narrated in the third person.",
  },
};

// ---------------------------------------------------------------------------
// Strengths / opportunities pools
// ---------------------------------------------------------------------------

function strengthsPool(platform: CaPlatform): string[] {
  return [
    "Strong opening hooks across most videos",
    "Consistent visual style and color palette",
    "Clear, legible on-screen captions",
    `Publishing cadence that fits how people browse ${platform}`,
    "Audio is clean and consistently mixed across the sample",
    "A recognizable presenter voice carries between videos",
  ];
}

function opportunitiesPool(platform: CaPlatform): string[] {
  return [
    "Retention drops after the 20-second mark on longer videos",
    "Calls-to-action are inconsistent between videos",
    "Posting times vary widely across the sample",
    `Hook variety is narrow for how competitive ${platform} discovery is right now`,
    "Endings trail off instead of closing with a clear next step",
    "Pacing dips in the middle third on the longer videos in the sample",
  ];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateContentAnalysisReport(
  session: ContentAnalysisSession
): ContentAnalysisReport {
  const { platform, goal, videos } = session;
  const videoCount = Math.max(videos.length, 1);
  const seed = hashSeed(`${platform}|${goal}|${videoCount}|${videos.join(",")}`);
  const rng = mulberry32(seed);

  // --- Content score --------------------------------------------------
  const videoCountBonus = clamp(Math.round((videoCount - 1) * 1.5), 0, 9);
  const variance = randInt(rng, -4, 4);
  const contentScore = clamp(
    PLATFORM_BASE_SCORE[platform] + GOAL_SCORE_MODIFIER[goal] + videoCountBonus + variance,
    52,
    97
  );

  const scoreBand =
    contentScore >= 85 ? "well above average" : contentScore >= 70 ? "above average" : "in a solid starting range";
  const scoreSummary = `Across ${videoCount} video${videoCount === 1 ? "" : "s"}, this sample scores ${scoreBand} for ${platform}, with the clearest signal coming from how it's optimized for "${goal.toLowerCase()}".`;

  // --- Feature scores ---------------------------------------------------
  const featureScores: FeatureScore[] = FEATURE_DEFS.map((def) => {
    const offset = PLATFORM_FEATURE_OFFSET[platform][def.key] ?? 0;
    const [minScore, maxScore] = def.baseRange;
    const score = clamp(randInt(rng, minScore, maxScore) + offset, 30, 99);
    const [minConf, maxConf] = def.confidenceRange;
    const confidence = clamp(randInt(rng, minConf, maxConf), 30, 99);
    return {
      key: def.key,
      label: def.label,
      score,
      explanation: pick(rng, def.explanations),
      confidence,
    };
  });

  // --- Winning patterns ---------------------------------------------------
  const patternPool = GENERAL_PATTERNS.filter(
    (p) => p.title !== PLATFORM_PATTERNS[platform].title
  );
  const patterns: WinningPattern[] = [
    PLATFORM_PATTERNS[platform],
    GOAL_PATTERNS[goal],
    ...pickN(rng, patternPool, 1),
  ];

  // --- Ideal video blueprint ---------------------------------------------
  const blueprint: BlueprintItem[] = [
    { label: "Duration", value: PLATFORM_DURATION[platform] },
    { label: "Hook", value: pick(rng, HOOK_TYPES) },
    { label: "Tone", value: GOAL_TONE[goal] },
    { label: "CTA", value: GOAL_CTA[goal] },
    { label: "Subtitles", value: "On-screen text, high-contrast, bottom third" },
    { label: "Posting Window", value: PLATFORM_POSTING_WINDOW[platform] },
    { label: "Visual Style", value: PLATFORM_VISUAL_STYLE[platform] },
  ];

  // --- Strengths / opportunities ------------------------------------------
  const strengths = pickN(rng, strengthsPool(platform), 3);
  const opportunities = pickN(rng, opportunitiesPool(platform), 3);

  // --- Confidence indicators ------------------------------------------------
  const confidenceLabels = [
    "Hook detection",
    "Engagement comparison",
    "Speech analysis",
    "Color profiling",
  ];
  const confidence: ConfidenceIndicator[] = confidenceLabels.map((label) => {
    const pct = clamp(randInt(rng, 45, 96), 30, 99);
    return { label, value: confidenceLevel(pct), pct };
  });

  return {
    contentScore,
    scoreSummary,
    featureScores,
    patterns,
    blueprint,
    strengths,
    opportunities,
    confidence,
  };
}
