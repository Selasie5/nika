import { db } from "@/config/firebase.config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

type WrapPeriod = "weekly" | "monthly";

type Achievement = {
  id: string;
  achievement?: string;
  date?: string;
  image?: string | null;
};

type WrapDoc = {
  id: string;
  userId: string;
  periodType: WrapPeriod;
  periodKey: string;
  title: string;
  theme: string;
  narrative: string;
  quote?: string;
  tags: string[];
  imageUrl?: string;
  imagePrompt: string;
  winsCount: number;
  rangeStart: string;
  rangeEnd: string;
  createdAt: string;
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_TEXT_MODEL = "stepfun/step-3.5-flash";
const OPENROUTER_IMAGE_MODEL = "bytedance-seed/seedream-4.5";

const NARRATIVE_SYSTEM_PROMPT = `You are Nika — a calm, observant reflection companion that narrates a user’s growth with warmth and subtle cinematic awareness.

Your tone is grounded, intimate, and emotionally intelligent.
You are never preachy, loud, exaggerated, or motivational in an influencer style.
You do not use emojis.
You do not use exclamation marks.

You write like a thoughtful journal entry written by someone who has been quietly paying attention.

Your job is not to summarize activity.
Your job is to narrate identity in motion.

Focus on patterns, energy shifts, consistency, resilience, and momentum.

Keep paragraphs short.
Use soft but intentional language.
Leave breathing room between ideas.

When data is limited, reflect gently.
When data is rich, surface meaningful patterns.

Always end with a subtle forward-looking line, never a command.`;

const BASE_IMAGE_STYLE =
  "Soft editorial painterly digital illustration, warm earth tones (olive, beige, terracotta), golden hour lighting, subtle texture, intimate but cinematic framing, shallow depth of field, modern lifestyle illustration, minimal composition, vertical 4:5 mobile layout.";

const WEEKLY_IMAGE_PROMPT =
  "Young adult sitting indoors at sunset reviewing weekly reflections on their phone, soft golden light through a window, calm and contemplative expression, subtle glowing checkmarks floating gently nearby, muted earth tones, painterly digital illustration, intimate framing, warm and reflective mood.";

const MONTHLY_IMAGE_PROMPT =
  "Young adult at a desk or balcony reviewing monthly wins, calendar subtly visible with highlighted days, warm sunset light filling the room, gentle light streaks symbolizing accumulated progress, earthy muted tones, painterly cinematic style, slightly wider framing than weekly.";

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function toIsoDate(date: Date): string {
  return date.toISOString();
}

function buildPeriodKey(periodType: WrapPeriod, date: Date): string {
  if (periodType === "weekly") {
    const start = startOfWeek(date);
    return `week-${start.toISOString().slice(0, 10)}`;
  }
  return `month-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function fetchAchievementsForRange(
  userId: string,
  rangeStartIso: string,
): Promise<Achievement[]> {
  const q = query(
    collection(db, "achievements"),
    where("userId", "==", userId),
    where("date", ">=", rangeStartIso),
    orderBy("date", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    return {
      id: doc.id,
      achievement: data.achievement,
      date: data.date,
      image: data.image ?? null,
    };
  });
}

function inRange(isoDate: string | undefined, start: Date, end: Date): boolean {
  if (!isoDate) return false;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed >= start && parsed <= end;
}

function deriveThemes(wins: Achievement[]): string[] {
  const buckets: Record<string, number> = {
    Focus: 0,
    Wellness: 0,
    Relationships: 0,
    Creativity: 0,
    Learning: 0,
    Discipline: 0,
  };

  wins.forEach((win) => {
    const text = (win.achievement || "").toLowerCase();
    if (/work|project|task|ship|finish|deep/.test(text)) buckets.Focus += 1;
    if (/walk|run|gym|sleep|rest|health|meditat/.test(text))
      buckets.Wellness += 1;
    if (/friend|family|team|call|support|mentor/.test(text))
      buckets.Relationships += 1;
    if (/write|design|create|music|art|build/.test(text))
      buckets.Creativity += 1;
    if (/learn|read|study|course|practice/.test(text)) buckets.Learning += 1;
    if (/habit|consisten|routine|daily|show up/.test(text))
      buckets.Discipline += 1;
  });

  return Object.entries(buckets)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([theme]) => theme);
}

function deriveEnergyPattern(wins: Achievement[]): string {
  if (!wins.length)
    return "Limited activity this period; energy looked gentle and steady.";

  let morning = 0;
  let afternoon = 0;
  let evening = 0;
  wins.forEach((win) => {
    if (!win.date) return;
    const hour = new Date(win.date).getHours();
    if (hour < 12) morning += 1;
    else if (hour < 18) afternoon += 1;
    else evening += 1;
  });

  const max = Math.max(morning, afternoon, evening);
  if (max === morning)
    return "Energy peaked earlier in the day and settled by evening.";
  if (max === afternoon)
    return "Energy tended to build through the day, strongest in the afternoon.";
  return "Energy gathered late, with stronger momentum toward the evening.";
}

function deriveConsistencyPattern(
  wins: Achievement[],
  periodType: WrapPeriod,
  start: Date,
): string {
  const days = new Set<string>();
  wins.forEach((win) => {
    if (!win.date) return;
    days.add(win.date.slice(0, 10));
  });

  const periodDays =
    periodType === "weekly"
      ? 7
      : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const ratio = days.size / periodDays;

  if (ratio >= 0.7)
    return "High consistency with a reliable rhythm through the period.";
  if (ratio >= 0.4)
    return "Moderate consistency with a few gaps and steady return.";
  return "Early rhythm is still forming, with selective but meaningful check-ins.";
}

function deriveHighlight(wins: Achievement[]): string {
  if (!wins.length) return "A quieter period of reflection and reset.";
  const withImage = wins.find((win) => !!win.image && !!win.achievement);
  if (withImage?.achievement) return withImage.achievement;

  return (
    [...wins].sort(
      (a, b) => (b.achievement?.length || 0) - (a.achievement?.length || 0),
    )[0]?.achievement || "A series of small wins that compounded."
  );
}

function deriveMonthlyShift(wins: Achievement[], start: Date): string {
  if (!wins.length) return "A gentle reset month with sparse entries.";
  const mid = new Date(
    start.getFullYear(),
    start.getMonth(),
    15,
    23,
    59,
    59,
    999,
  );
  const firstHalf = wins.filter((w) =>
    w.date ? new Date(w.date) <= mid : false,
  ).length;
  const secondHalf = wins.length - firstHalf;
  if (secondHalf > firstHalf)
    return "Momentum rose in the second half of the month.";
  if (secondHalf < firstHalf)
    return "The month started strong, then softened into recovery.";
  return "A steady pace held from start to finish.";
}

function buildNarrativeUserPrompt(
  periodType: WrapPeriod,
  wins: Achievement[],
  rangeStart: Date,
  rangeEnd: Date,
): string {
  const winsText = wins
    .map(
      (win) =>
        `- ${win.achievement || "Logged win"} (${(win.date || "").slice(0, 10)})`,
    )
    .join("\n");
  const themes = deriveThemes(wins);
  const highlight = deriveHighlight(wins);
  const energy = deriveEnergyPattern(wins);
  const consistency = deriveConsistencyPattern(wins, periodType, rangeStart);
  const dominantCategory = themes[0] || "Consistency";
  const shift = deriveMonthlyShift(wins, rangeStart);

  const sharedInstruction = `Return strict JSON only, no markdown, with keys:
title: string
theme: string (1 sentence)
quote: string (short)
narrative: string (2-4 short paragraphs)
tags: string[] (3-5 items)`;

  if (periodType === "weekly") {
    return `${sharedInstruction}

Generate a weekly reflection wrap.

Time period: Weekly
Range: ${rangeStart.toISOString().slice(0, 10)} to ${rangeEnd.toISOString().slice(0, 10)}
Wins logged:
${winsText || "- No wins logged"}
Total wins: ${wins.length}
Core themes detected: ${themes.join(", ") || "Early momentum"}
Energy trend: ${energy}
Highlight moment: ${highlight}
Consistency score: ${consistency}

Focus on:
- A calm observational tone
- Subtle pattern recognition
- One key moment of growth
- Gentle acknowledgment of consistency

Do not exaggerate achievements.
Do not use hype language.
End with a soft forward-looking sentence.`;
  }

  return `${sharedInstruction}

Generate a monthly reflection wrap.

Time period: Monthly
Range: ${rangeStart.toISOString().slice(0, 10)} to ${rangeEnd.toISOString().slice(0, 10)}
Total wins: ${wins.length}
Dominant themes: ${themes.join(", ") || "Early momentum"}
Strongest category: ${dominantCategory}
Most consistent time: ${energy}
Shift observed: ${shift}
Major milestone: ${highlight}

Focus on:
- Accumulation and rhythm
- Behavioral shifts
- How small actions shaped identity

End with a gentle line that suggests quiet momentum building.`;
}

function buildImagePrompt(periodType: WrapPeriod): string {
  const periodPrompt =
    periodType === "weekly" ? WEEKLY_IMAGE_PROMPT : MONTHLY_IMAGE_PROMPT;
  return `${BASE_IMAGE_STYLE} ${periodPrompt}`;
}

function parseJsonFromModelOutput(raw: string): Record<string, any> {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function openRouterTextCompletion(
  systemPrompt: string,
  userPrompt: string,
) {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENROUTER_API_KEY.");
  }

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.EXPO_PUBLIC_OPENROUTER_SITE_URL || "https://nika.app",
      "X-Title": process.env.EXPO_PUBLIC_OPENROUTER_APP_NAME || "Nika",
    },
    body: JSON.stringify({
      model: OPENROUTER_TEXT_MODEL,
      provider: {
        allow_fallbacks: true,
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter text generation failed: ${response.status} ${errorText}`,
    );
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenRouter text generation returned empty content.");
  }
  return parseJsonFromModelOutput(content);
}

async function openRouterImageGeneration(
  prompt: string,
): Promise<string | undefined> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENROUTER_API_KEY.");
  }

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.EXPO_PUBLIC_OPENROUTER_SITE_URL || "https://nika.app",
      "X-Title": process.env.EXPO_PUBLIC_OPENROUTER_APP_NAME || "Nika",
    },
    body: JSON.stringify({
      model: OPENROUTER_IMAGE_MODEL,
      provider: {
        allow_fallbacks: true,
      },
      modalities: ["image"],
      messages: [{ role: "user", content: prompt }],
      image_config: {
        aspect_ratio: "4:5",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter image generation failed: ${response.status} ${errorText}`,
    );
  }

  const json = await response.json();
  const first = json?.choices?.[0]?.message?.images?.[0];
  const url = first?.image_url?.url || first?.imageUrl?.url;
  const b64 = first?.image_url?.b64_json || first?.imageUrl?.b64_json;
  if (typeof url === "string" && url) return url;
  if (typeof b64 === "string" && b64) return `data:image/png;base64,${b64}`;
  return undefined;
}

async function findExistingWrap(
  userId: string,
  periodType: WrapPeriod,
  periodKey: string,
): Promise<WrapDoc | null> {
  const q = query(
    collection(db, "wraps"),
    where("userId", "==", userId),
    where("periodType", "==", periodType),
    where("periodKey", "==", periodKey),
    limit(1),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...(doc.data() as Omit<WrapDoc, "id">),
  };
}

async function createWrapForPeriod(
  userId: string,
  periodType: WrapPeriod,
): Promise<WrapDoc> {
  const now = new Date();
  const rangeStart =
    periodType === "weekly" ? startOfWeek(now) : startOfMonth(now);
  const rangeEnd = periodType === "weekly" ? endOfWeek(now) : endOfMonth(now);
  const periodKey = buildPeriodKey(periodType, now);

  const cached = await findExistingWrap(userId, periodType, periodKey);
  if (cached) return cached;

  const allSinceStart = await fetchAchievementsForRange(
    userId,
    toIsoDate(rangeStart),
  );
  const wins = allSinceStart.filter((win) =>
    inRange(win.date, rangeStart, rangeEnd),
  );
  const userPrompt = buildNarrativeUserPrompt(
    periodType,
    wins,
    rangeStart,
    rangeEnd,
  );
  const imagePrompt = buildImagePrompt(periodType);

  const modelResult = await openRouterTextCompletion(
    NARRATIVE_SYSTEM_PROMPT,
    userPrompt,
  );
  const imageUrl = await openRouterImageGeneration(imagePrompt);

  const wrapPayload: Omit<WrapDoc, "id"> = {
    userId,
    periodType,
    periodKey,
    title:
      typeof modelResult.title === "string" && modelResult.title.trim()
        ? modelResult.title.trim()
        : periodType === "weekly"
          ? "Weekly Reflection"
          : "Monthly Reflection",
    theme:
      typeof modelResult.theme === "string" && modelResult.theme.trim()
        ? modelResult.theme.trim()
        : "Quiet momentum and steady growth.",
    quote:
      typeof modelResult.quote === "string" ? modelResult.quote.trim() : "",
    narrative:
      typeof modelResult.narrative === "string" && modelResult.narrative.trim()
        ? modelResult.narrative.trim()
        : "A reflective period with subtle shifts taking shape.",
    tags: Array.isArray(modelResult.tags)
      ? modelResult.tags
          .filter((tag: unknown) => typeof tag === "string")
          .slice(0, 5)
      : deriveThemes(wins),
    imageUrl,
    imagePrompt,
    winsCount: wins.length,
    rangeStart: toIsoDate(rangeStart),
    rangeEnd: toIsoDate(rangeEnd),
    createdAt: new Date().toISOString(),
  };

  const createdRef = await addDoc(collection(db, "wraps"), wrapPayload);
  return {
    id: createdRef.id,
    ...wrapPayload,
  };
}

export async function ensureLatestWraps(userId: string): Promise<void> {
  await Promise.all([
    createWrapForPeriod(userId, "weekly"),
    createWrapForPeriod(userId, "monthly"),
  ]);
}

export async function getWrapsForUser(userId: string): Promise<WrapDoc[]> {
  const q = query(
    collection(db, "wraps"),
    where("userId", "==", userId),
    orderBy("rangeEnd", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<WrapDoc, "id">),
  }));
}

export async function getWrapById(id: string): Promise<WrapDoc | null> {
  const wrapRef = doc(db, "wraps", id);
  const snapshot = await getDoc(wrapRef);
  if (!snapshot.exists()) return null;
  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<WrapDoc, "id">),
  };
}

export type { WrapDoc, WrapPeriod };
