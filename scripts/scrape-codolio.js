import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_FILE = path.join(__dirname, "../public/codolio-stats.json");
const PROFILE_URL =
  process.env.CODOLIO_PROFILE_URL || "https://codolio.com/profile/anshgoel_01";
const EXPECTED_USERNAME = (
  process.env.CODOLIO_EXPECTED_USERNAME || "anshgoel_01"
).toLowerCase();

const log = (...args) => console.log("[codolio]", ...args);

const parseFirstInt = (text) => {
  if (!text) return null;
  const match = String(text).match(/(\d[\d,]*)/);
  if (!match) return null;
  const n = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

log("Starting Codolio scraper...");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetries(fn, attempts = 3, delay = 1000) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const backoff = delay * Math.pow(2, i);
      log(`Attempt ${i + 1} failed, retrying in ${backoff}ms`);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

const extractFromText = (bodyText) => {
  // reuse parsing logic similar to the browser evaluate block
  const parseFirstIntLocal = (text) => {
    if (!text) return null;
    const match = String(text).match(/(\d[\d,]*)/);
    if (!match) return null;
    const n = Number(match[1].replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const getFromBodyText = (patterns) => {
    for (const pattern of patterns) {
      const m = bodyText.match(pattern);
      if (!m) continue;
      const n = parseFirstIntLocal(m[1] ?? m[0]);
      if (typeof n === "number") return n;
    }
    return null;
  };

  const totalSolved =
    getFromBodyText([
      /Total\s+Questions\s*[:\-]?\s*(\d[\d,]*)/i,
      /Total\s+Questions\s+Solved\s*[:\-]?\s*(\d[\d,]*)/i,
      /Problems\s+Solved\s*[:\-]?\s*(\d[\d,]*)/i,
      /Total\s+Solved\s*[:\-]?\s*(\d[\d,]*)/i,
      /(\d[\d,]*)\s+Problems\s+Solved/i,
    ]) ||
    parseFirstIntLocal(
      bodyText.match(/(\d[\d,]*)\s+Problems\s+Solved/i)?.[1],
    ) ||
    0;

  const rank =
    getFromBodyText([
      /Global\s+Rank\s*[:\-#]?\s*(\d[\d,]*)/i,
      /Current\s+Rank\s*[:\-#]?\s*(\d[\d,]*)/i,
      /Rank\s*[:\-#]?\s*(\d[\d,]*)/i,
    ]) || 0;

  const streak =
    getFromBodyText([
      /Current\s+Streak\s*[:\-]?\s*(\d[\d,]*)/i,
      /Streak\s*[:\-]?\s*(\d[\d,]*)/i,
      /(\d[\d,]*)\s+day\s+streak/i,
    ]) || 0;

  const rating =
    getFromBodyText([
      /Contest\s+Rating\s*[:\-]?\s*(\d[\d,]*)/i,
      /Rating\s*[:\-]?\s*(\d[\d,]*)/i,
    ]) || 0;

  const maxStreak =
    getFromBodyText([
      /Max\s+Streak\s*[:\-]?\s*(\d[\d,]*)/i,
      /Longest\s+Streak\s*[:\-]?\s*(\d[\d,]*)/i,
    ]) || 0;

  const easySolved =
    parseFirstIntLocal(bodyText.match(/\bEasy\b\s*(\d[\d,]*)/i)?.[1]) || 0;
  const mediumSolved =
    parseFirstIntLocal(bodyText.match(/\bMedium\b\s*(\d[\d,]*)/i)?.[1]) || 0;
  const hardSolved =
    parseFirstIntLocal(bodyText.match(/\bHard\b\s*(\d[\d,]*)/i)?.[1]) || 0;

  const totalActiveDays =
    getFromBodyText([
      /Total\s+Active\s+Days\s*[:\-]?\s*(\d[\d,]*)/i,
      /Active\s+Days\s*[:\-]?\s*(\d[\d,]*)/i,
    ]) || 0;

  return {
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    rank,
    streak,
    rating,
    maxStreak,
    totalActiveDays,
    lastUpdated: new Date().toISOString(),
  };
};

async function tryPuppeteer() {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60_000);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    );
    await page.setViewport({ width: 1365, height: 768 });

    // Reduce trivial headless detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    log("Resource:", PROFILE_URL);
    const resp = await page.goto(PROFILE_URL, {
      waitUntil: "networkidle2",
      timeout: 60_000,
    });
    log("HTTP status:", resp?.status?.() ?? "(no response)");
    log("Final URL:", page.url());
    try {
      log("Title:", await page.title());
    } catch {}

    await page.waitForSelector("body");

    try {
      await page.waitForFunction(
        (u) =>
          (document.body?.innerText || "")
            .toLowerCase()
            .includes(String(u).toLowerCase()),
        { timeout: 20_000 },
        EXPECTED_USERNAME,
      );
    } catch {}

    await page.waitForFunction(
      () =>
        document.body &&
        document.body.innerText &&
        document.body.innerText.length > 200,
      { timeout: 30_000 },
    );

    let nextData = null;
    try {
      nextData = await page.$eval("#__NEXT_DATA__", (el) => el.textContent);
    } catch {}

    const nextStats = (() => {
      if (!nextData) return null;
      try {
        const parsed = JSON.parse(nextData);
        const matchesKey = (key) =>
          typeof key === "string" &&
          /total.*solv|problems.*solv|questions.*solv|global.*rank|current.*rank|\brank\b|current.*streak|\bstreak\b|contest.*rating|\brating\b|max.*streak|longest.*streak/i.test(
            key,
          );

        const found = {
          totalSolved: null,
          rank: null,
          streak: null,
          rating: null,
          maxStreak: null,
        };

        const visit = (value) => {
          if (!value) return;
          if (Array.isArray(value)) return value.forEach(visit);
          if (typeof value !== "object") return;
          for (const [k, v] of Object.entries(value)) {
            if (matchesKey(k)) {
              const key = k.toLowerCase();
              const n = typeof v === "number" ? v : parseFirstInt(v);
              if (typeof n === "number") {
                if (
                  /solv|questions.*solv|problems.*solv/.test(key) &&
                  found.totalSolved == null
                )
                  found.totalSolved = n;
                else if (
                  /max.*streak|longest.*streak/.test(key) &&
                  found.maxStreak == null
                )
                  found.maxStreak = n;
                else if (/streak/.test(key) && found.streak == null)
                  found.streak = n;
                else if (/rank/.test(key) && found.rank == null) found.rank = n;
                else if (/rating/.test(key) && found.rating == null)
                  found.rating = n;
              }
            }
            visit(v);
          }
        };

        visit(parsed);
        if (Object.values(found).every((v) => v == null)) return null;
        return found;
      } catch {
        return null;
      }
    })();

    const stats = await page.evaluate(() => {
      const parseFirstInt = (text) => {
        if (!text) return null;
        const match = String(text).match(/(\d[\d,]*)/);
        if (!match) return null;
        const n = Number(match[1].replace(/,/g, ""));
        return Number.isFinite(n) ? n : null;
      };

      const getFromBodyText = (patterns) => {
        const bodyText = document.body?.innerText || "";
        for (const pattern of patterns) {
          const m = bodyText.match(pattern);
          if (!m) continue;
          const n = parseFirstInt(m[1] ?? m[0]);
          if (typeof n === "number") return n;
        }
        return null;
      };

      const getTextByLabel = (label) => {
        const elements = Array.from(document.querySelectorAll("*"));
        const target = elements.find((el) =>
          el.textContent?.trim().toLowerCase().includes(label.toLowerCase()),
        );
        if (!target) return null;
        const parent = target.closest("div");
        if (!parent) return null;
        const text = parent.innerText || "";
        return parseFirstInt(text);
      };

      const totalSolved =
        getFromBodyText([
          /Total\s+Questions\s*[:\-]?\s*(\d[\d,]*)/i,
          /Total\s+Questions\s+Solved\s*[:\-]?\s*(\d[\d,]*)/i,
          /Problems\s+Solved\s*[:\-]?\s*(\d[\d,]*)/i,
          /Total\s+Solved\s*[:\-]?\s*(\d[\d,]*)/i,
          /(\d[\d,]*)\s+Problems\s+Solved/i,
        ]) ||
        getTextByLabel("Total Questions Solved") ||
        getTextByLabel("Total Solved") ||
        getTextByLabel("Problems Solved") ||
        0;

      const rank =
        getFromBodyText([
          /Global\s+Rank\s*[:\-#]?\s*(\d[\d,]*)/i,
          /Current\s+Rank\s*[:\-#]?\s*(\d[\d,]*)/i,
          /Rank\s*[:\-#]?\s*(\d[\d,]*)/i,
        ]) ||
        getTextByLabel("Global Rank") ||
        getTextByLabel("Current Rank") ||
        getTextByLabel("Rank") ||
        0;

      const streak =
        getFromBodyText([
          /Current\s+Streak\s*[:\-]?\s*(\d[\d,]*)/i,
          /Streak\s*[:\-]?\s*(\d[\d,]*)/i,
          /(\d[\d,]*)\s+day\s+streak/i,
        ]) ||
        getTextByLabel("Current Streak") ||
        getTextByLabel("Streak") ||
        0;

      const rating =
        getFromBodyText([
          /Contest\s+Rating\s*[:\-]?\s*(\d[\d,]*)/i,
          /Rating\s*[:\-]?\s*(\d[\d,]*)/i,
        ]) ||
        getTextByLabel("Contest Rating") ||
        getTextByLabel("Rating") ||
        0;

      const maxStreak =
        getFromBodyText([
          /Max\s+Streak\s*[:\-]?\s*(\d[\d,]*)/i,
          /Longest\s+Streak\s*[:\-]?\s*(\d[\d,]*)/i,
        ]) ||
        getTextByLabel("Max Streak") ||
        getTextByLabel("Longest Streak") ||
        0;

      const getDifficultyBreakdown = () => {
        const bodyText = document.body?.innerText || "";
        const lower = bodyText.toLowerCase();
        const idx = lower.indexOf("problems solved");
        const scope = idx >= 0 ? bodyText.slice(idx, idx + 2500) : bodyText;

        const easySolved =
          parseFirstInt(scope.match(/\bEasy\b\s*(\d[\d,]*)/i)?.[1]) ?? 0;
        const mediumSolved =
          parseFirstInt(scope.match(/\bMedium\b\s*(\d[\d,]*)/i)?.[1]) ?? 0;
        const hardSolved =
          parseFirstInt(scope.match(/\bHard\b\s*(\d[\d,]*)/i)?.[1]) ?? 0;

        return { easySolved, mediumSolved, hardSolved };
      };

      const { easySolved, mediumSolved, hardSolved } = getDifficultyBreakdown();

      const totalActiveDays =
        getFromBodyText([
          /Total\s+Active\s+Days\s*[:\-]?\s*(\d[\d,]*)/i,
          /Active\s+Days\s*[:\-]?\s*(\d[\d,]*)/i,
        ]) ||
        getTextByLabel("Total Active Days") ||
        getTextByLabel("Active Days") ||
        0;

      return {
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        rank,
        streak,
        rating,
        maxStreak,
        totalActiveDays,
        lastUpdated: new Date().toISOString(),
      };
    });

    const normalized = {
      totalSolved: Number(nextStats?.totalSolved ?? stats?.totalSolved) || 0,
      easySolved: Number(stats?.easySolved) || 0,
      mediumSolved: Number(stats?.mediumSolved) || 0,
      hardSolved: Number(stats?.hardSolved) || 0,
      rank: Number(nextStats?.rank ?? stats?.rank) || 0,
      streak: Number(nextStats?.streak ?? stats?.streak) || 0,
      rating: Number(nextStats?.rating ?? stats?.rating) || 0,
      maxStreak:
        Number(nextStats?.maxStreak ?? stats?.maxStreak ?? stats?.streak) ||
        Number(nextStats?.streak ?? stats?.streak) ||
        0,
      totalActiveDays: Number(stats?.totalActiveDays) || 0,
      lastUpdated:
        typeof stats?.lastUpdated === "string"
          ? stats.lastUpdated
          : new Date().toISOString(),
    };

    log("Extracted stats:", normalized);
    return { normalized, page, browser };
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

async function tryFetchFallback() {
  // Attempt to fetch the profile HTML and parse textContent from it
  const fetchImpl = globalThis.fetch ?? (await import("node-fetch")).default;
  const res = await fetchImpl(PROFILE_URL, { redirect: "follow" });
  const html = await res.text();

  // strip scripts and tags to approximate innerText
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const bodyText = withoutScripts.replace(/<[^>]+>/g, " ");
  const parsed = extractFromText(bodyText);
  log("Fetch fallback parsed:", parsed);
  return parsed;
}

async function main() {
  try {
    let result = null;

    try {
      const attempt = await withRetries(() => tryPuppeteer(), 3, 1000);
      result = attempt.normalized;
      // close browser if present
      try {
        if (attempt.browser) await attempt.browser.close();
      } catch {}
    } catch (puppErr) {
      log(
        "Puppeteer failed, falling back to fetch parser:",
        puppErr?.message || puppErr,
      );
      // try fetch fallback with retries
      result = await withRetries(() => tryFetchFallback(), 2, 1000);
    }

    if (!result || Number(result.totalSolved) === 0) {
      log(
        "Normalized result empty or zero; attempting fetch fallback as last resort",
      );
      try {
        const fallback = await tryFetchFallback();
        if (fallback) result = fallback;
      } catch (e) {
        log("Fetch fallback final attempt failed:", e?.message || e);
      }
    }

    if (!result) {
      console.error("[codolio] Unable to extract stats");
      process.exitCode = 1;
      return;
    }

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(result, null, 2) + "\n",
      "utf8",
    );
    log("Saved to", OUTPUT_FILE);
  } catch (error) {
    console.error("[codolio] Error scraping Codolio:", error);
    process.exitCode = 1;
  }
}

await main();
