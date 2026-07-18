import puppeteer from "puppeteer";
import fs from "fs";
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    req.continue();
  });
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("codolio.com") && (url.includes("api") || url.includes("graphql"))) {
      try {
        const text = await res.text();
        const safeName = url.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 100);
        fs.writeFileSync(`response_${safeName}.json`, text, "utf8");
        console.log(`Wrote response_${safeName}.json`);
      } catch (err) {}
    }
  });
  await page.goto("https://codolio.com/profile/anshgoel_01", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await browser.close();
})();





