/* eslint-disable no-console */
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const exact = process.argv.find((arg) => arg === `--${name}`);
  if (exact) return "true";
  const withValue = process.argv.find((arg) => arg.startsWith(prefix));
  if (!withValue) return fallback;
  return withValue.slice(prefix.length);
}

function periodStart(date, periodType) {
  if (periodType === "weekly") {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function periodEnd(date, periodType) {
  if (periodType === "weekly") {
    const start = periodStart(date, periodType);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function periodKey(date, periodType) {
  if (periodType === "weekly") {
    const start = periodStart(date, periodType);
    return `week-${start.toISOString().slice(0, 10)}`;
  }
  return `month-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function deriveThemes(wins) {
  const buckets = {
    Focus: 0,
    Wellness: 0,
    Relationships: 0,
    Creativity: 0,
    Learning: 0,
    Discipline: 0,
  };

  wins.forEach((win) => {
    const text = String(win.achievement || "").toLowerCase();
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

function deriveEnergyPattern(wins) {
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

function deriveConsistency(wins, periodType, startDate) {
  const days = new Set();
  wins.forEach((w) => {
    if (!w.date) return;
    days.add(String(w.date).slice(0, 10));
  });

  const periodDays =
    periodType === "weekly"
      ? 7
      : new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
        ).getDate();
  const ratio = days.size / periodDays;
  if (ratio >= 0.7)
    return "High consistency with a reliable rhythm through the period.";
  if (ratio >= 0.4)
    return "Moderate consistency with a few gaps and steady return.";
  return "Early rhythm is still forming, with selective but meaningful check-ins.";
}

function deriveHighlight(wins) {
  if (!wins.length) return "A quieter period of reflection and reset.";
  const withImage = wins.find((win) => win.image && win.achievement);
  if (withImage) return withImage.achievement;
  return (
    [...wins].sort(
      (a, b) =>
        String(b.achievement || "").length - String(a.achievement || "").length,
    )[0]?.achievement || "A series of small wins that compounded."
  );
}

function deriveMonthlyShift(wins, startDate) {
  if (!wins.length) return "A gentle reset month with sparse entries.";
  const mid = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
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

function buildNarrativePrompt(periodType, wins, startDate, endDate) {
  const winsText = wins
    .map(
      (win) =>
        `- ${win.achievement || "Logged win"} (${String(win.date || "").slice(0, 10)})`,
    )
    .join("\n");

  const themes = deriveThemes(wins);
  const energy = deriveEnergyPattern(wins);
  const highlight = deriveHighlight(wins);
  const consistency = deriveConsistency(wins, periodType, startDate);
  const shift = deriveMonthlyShift(wins, startDate);

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
Range: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}
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
Range: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}
Total wins: ${wins.length}
Dominant themes: ${themes.join(", ") || "Early momentum"}
Strongest category: ${themes[0] || "Consistency"}
Most consistent time: ${energy}
Shift observed: ${shift}
Major milestone: ${highlight}

Focus on:
- Accumulation and rhythm
- Behavioral shifts
- How small actions shaped identity

End with a gentle line that suggests quiet momentum building.`;
}

function buildImagePrompt(periodType) {
  const periodPrompt =
    periodType === "weekly" ? WEEKLY_IMAGE_PROMPT : MONTHLY_IMAGE_PROMPT;
  return `${BASE_IMAGE_STYLE} ${periodPrompt}`;
}

function parseModelJson(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function openRouterText(userPrompt) {
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY.");

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://nika.app",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Nika Wrap Cron",
    },
    body: JSON.stringify({
      model: OPENROUTER_TEXT_MODEL,
      provider: {
        allow_fallbacks: true,
      },
      temperature: 0.8,
      messages: [
        { role: "system", content: NARRATIVE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenRouter text failed ${response.status}: ${await response.text()}`,
    );
  }

  const payload = await response.json();
  return parseModelJson(payload?.choices?.[0]?.message?.content);
}

async function openRouterImage(imagePrompt) {
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY.");

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://nika.app",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Nika Wrap Cron",
    },
    body: JSON.stringify({
      model: OPENROUTER_IMAGE_MODEL,
      provider: {
        allow_fallbacks: true,
      },
      modalities: ["image"],
      messages: [{ role: "user", content: imagePrompt }],
      image_config: {
        aspect_ratio: "4:5",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenRouter image failed ${response.status}: ${await response.text()}`,
    );
  }

  const payload = await response.json();
  const image = payload?.choices?.[0]?.message?.images?.[0];
  const url = image?.image_url?.url || image?.imageUrl?.url;
  const b64 = image?.image_url?.b64_json || image?.imageUrl?.b64_json;
  if (url) return url;
  if (b64) return `data:image/png;base64,${b64}`;
  return "";
}

function shouldRunNow(mode) {
  if (mode === "test") return true;
  const now = new Date();
  const isSunday = now.getDay() === 0;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isMonthEnd = tomorrow.getMonth() !== now.getMonth();
  return isSunday || isMonthEnd;
}

function initFirebaseAdmin() {
  if (admin.apps.length) return admin.firestore();

  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    const normalized = rawJson.replace(/\\n/g, "\n");
    const parsed = JSON.parse(normalized);
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
    return admin.firestore();
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);
    const file = fs.readFileSync(resolvedPath, "utf8");
    const parsed = JSON.parse(file);
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
    return admin.firestore();
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    return admin.firestore();
  }

  throw new Error(
    "Missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS.",
  );
}

function groupWinsByPeriod(achievements, periodType) {
  const groups = new Map();
  achievements.forEach((win) => {
    if (!win.userId || !win.date) return;
    const date = new Date(win.date);
    if (Number.isNaN(date.getTime())) return;

    const key = periodKey(date, periodType);
    const compound = `${win.userId}::${periodType}::${key}`;
    const current = groups.get(compound);
    if (current) {
      current.wins.push(win);
    } else {
      const start = periodStart(date, periodType);
      const end = periodEnd(date, periodType);
      groups.set(compound, {
        userId: win.userId,
        periodType,
        periodKey: key,
        rangeStart: start.toISOString(),
        rangeEnd: end.toISOString(),
        wins: [win],
      });
    }
  });
  return [...groups.values()];
}

async function wrapExists(db, userId, periodType, key) {
  const snapshot = await db
    .collection("wraps")
    .where("userId", "==", userId)
    .where("periodType", "==", periodType)
    .where("periodKey", "==", key)
    .limit(1)
    .get();
  return !snapshot.empty;
}

async function generateWrap(db, group) {
  const startDate = new Date(group.rangeStart);
  const endDate = new Date(group.rangeEnd);
  const userPrompt = buildNarrativePrompt(
    group.periodType,
    group.wins,
    startDate,
    endDate,
  );
  const imagePrompt = buildImagePrompt(group.periodType);

  const content = await openRouterText(userPrompt);
  const imageUrl = await openRouterImage(imagePrompt);
  const tags = Array.isArray(content.tags)
    ? content.tags.filter((tag) => typeof tag === "string").slice(0, 5)
    : deriveThemes(group.wins);

  await db.collection("wraps").add({
    userId: group.userId,
    periodType: group.periodType,
    periodKey: group.periodKey,
    title:
      typeof content.title === "string" && content.title.trim()
        ? content.title.trim()
        : group.periodType === "weekly"
          ? "Weekly Reflection"
          : "Monthly Reflection",
    theme:
      typeof content.theme === "string" && content.theme.trim()
        ? content.theme.trim()
        : "Quiet momentum and steady growth.",
    quote: typeof content.quote === "string" ? content.quote.trim() : "",
    narrative:
      typeof content.narrative === "string" && content.narrative.trim()
        ? content.narrative.trim()
        : "A reflective period with subtle shifts taking shape.",
    tags,
    imagePrompt,
    imageUrl,
    winsCount: group.wins.length,
    rangeStart: group.rangeStart,
    rangeEnd: group.rangeEnd,
    createdAt: new Date().toISOString(),
  });
}

async function runOnce(mode) {
  if (!shouldRunNow(mode)) {
    console.log(
      `[wraps-cron] skipped at ${new Date().toISOString()} (not Sunday/month-end).`,
    );
    return;
  }

  const db = initFirebaseAdmin();
  const achievementsSnap = await db.collection("achievements").get();
  const achievements = achievementsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const weeklyGroups = groupWinsByPeriod(achievements, "weekly");
  const monthlyGroups = groupWinsByPeriod(achievements, "monthly");
  const groups = [...weeklyGroups, ...monthlyGroups];

  let generated = 0;
  for (const group of groups) {
    const exists = await wrapExists(
      db,
      group.userId,
      group.periodType,
      group.periodKey,
    );
    if (exists) continue;

    await generateWrap(db, group);
    generated += 1;
    console.log(
      `[wraps-cron] generated ${group.periodType} wrap for user ${group.userId} (${group.periodKey}).`,
    );
  }

  console.log(
    `[wraps-cron] run complete. generated=${generated}, scanned=${groups.length}.`,
  );
}

function start() {
  const mode = getArg("mode", "test");
  const schedule = mode === "test" ? "*/30 * * * * *" : "0 5 23 * * *";

  console.log(
    `[wraps-cron] starting in ${mode} mode with schedule "${schedule}"`,
  );

  runOnce(mode).catch((error) => {
    console.error("[wraps-cron] startup run failed:", error);
  });

  cron.schedule(schedule, async () => {
    try {
      await runOnce(mode);
    } catch (error) {
      console.error("[wraps-cron] run failed:", error);
    }
  });
}

start();
