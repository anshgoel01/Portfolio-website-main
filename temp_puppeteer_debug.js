import puppeteer from "puppeteer";
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://codolio.com/profile/anshgoel_01", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  const nextData = await page
    .$eval("#__NEXT_DATA__", (el) => el.textContent)
    .catch(() => null);
  console.log("NEXT_DATA exists:", !!nextData);
  if (nextData) {
    const parsed = JSON.parse(nextData);
    const entries = [];
    const visit = (obj, path = []) => {
      if (!obj || typeof obj !== "object") return;
      for (const [key, value] of Object.entries(obj)) {
        const p = [...path, key].join(".");
        if (/rating/i.test(key) && value != null) {
          entries.push({ path: p, value });
        }
        if (typeof value === "object") visit(value, [...path, key]);
      }
    };
    visit(parsed);
    console.log("rating-related entries count:", entries.length);
    console.log(entries.slice(0, 40));
  }
  const text = await page.evaluate(() => document.body.innerText);
  const lines = text.split(/\r?\n/).filter(Boolean);
  const idx = lines.findIndex((line) => /rating/i.test(line));
  console.log("rating line index", idx);
  for (let i = Math.max(0, idx - 5); i < Math.min(lines.length, idx + 6); i++) {
    console.log(i, lines[i]);
  }
  await browser.close();
})();
