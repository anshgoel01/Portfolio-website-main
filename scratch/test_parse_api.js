import fs from "fs";

const raw = fs.readFileSync("codolio-profile-response.json", "utf8");
const json = JSON.parse(raw);
const data = json.data;

console.log("Keys in data:", Object.keys(data));
console.log("PlatformProfiles keys:", Object.keys(data.platformProfiles || {}));

if (data.platformProfiles && data.platformProfiles.platformProfiles) {
  for (const plat of data.platformProfiles.platformProfiles) {
    console.log(`\nPlatform: ${plat.platform}`);
    console.log("userStats:", plat.userStats);
    console.log("totalQuestionStats:", plat.totalQuestionStats);
    console.log("contestActivityStats:", plat.contestActivityStats ? "exists" : "null");
    if (plat.contestActivityStats) {
      console.log("contestActivityList sample:", plat.contestActivityStats.contestActivityList);
    }
  }
}
