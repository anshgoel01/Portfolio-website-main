import fs from "fs";

const raw = fs.readFileSync("response_https___api_codolio_com_profile_userKey_anshgoel_01.json", "utf8");
const json = JSON.parse(raw);
const platforms = json.data.platformProfiles.platformProfiles;

let totalSolved = 0;
let easySolved = 0;
let mediumSolved = 0;
let hardSolved = 0;

// Combine submission calendars
const allActiveDates = new Set();

for (const plat of platforms) {
  if (plat.totalQuestionStats) {
    totalSolved += plat.totalQuestionStats.totalQuestionCounts || 0;
    easySolved += plat.totalQuestionStats.easyQuestionCounts || 0;
    mediumSolved += plat.totalQuestionStats.mediumQuestionCounts || 0;
    hardSolved += plat.totalQuestionStats.hardQuestionCounts || 0;
  }
  
  if (plat.dailyActivityStatsResponse && plat.dailyActivityStatsResponse.submissionCalendar) {
    const cal = plat.dailyActivityStatsResponse.submissionCalendar;
    for (const [timestampStr, count] of Object.entries(cal)) {
      if (count > 0) {
        // Convert timestamp to date string (YYYY-MM-DD) to get unique days
        const date = new Date(Number(timestampStr) * 1000).toISOString().split('T')[0];
        allActiveDates.add(date);
      }
    }
  }
}

console.log("Calculated Solved Counts:");
console.log("Total:", totalSolved);
console.log("Easy:", easySolved);
console.log("Medium:", mediumSolved);
console.log("Hard:", hardSolved);
console.log("\nTotal unique active days in combined submission calendars:", allActiveDates.size);

// Let's compute streak from the combined active dates
const sortedDates = Array.from(allActiveDates).sort();
let currentStreak = 0;
let maxStreak = 0;
let tempStreak = 0;
let lastDate = null;

// Helper to check if two date strings are consecutive days
const isConsecutive = (d1, d2) => {
  const diffTime = Math.abs(new Date(d2) - new Date(d1));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 1;
};

for (const d of sortedDates) {
  if (!lastDate) {
    tempStreak = 1;
  } else if (isConsecutive(lastDate, d)) {
    tempStreak++;
  } else {
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    tempStreak = 1;
  }
  lastDate = d;
}
if (tempStreak > maxStreak) {
  maxStreak = tempStreak;
}

// Check current streak: if the last active date is today or yesterday
if (lastDate) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }
}

console.log("Calculated current streak:", currentStreak);
console.log("Calculated max streak:", maxStreak);
