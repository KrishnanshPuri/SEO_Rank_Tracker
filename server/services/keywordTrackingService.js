import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
  try {
    let res;

    for (let i = 1; i <= 2; i++) {
      res = await rankTracker(tracking.keyword, tracking.domain);
      if (res.success && res.data.totalResultsScanned > 0) break;
      if (i < 2) await new Promise((r) => setTimeout(r, res.success ? 3000 : 5000));
    }

    if (res.success) {
      const prev = tracking.currentPosition;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tracking.currentPosition = res.data.position;
      tracking.currentPage = res.data.page;
      tracking.competitors = res.data.competitors;
      tracking.lastChecked = new Date();
      tracking.status = "completed";

      tracking.positionChange = prev && res.data.position ? prev - res.data.position : 0;
      
      if (res.data.position && (!tracking.bestPosition || res.data.position < tracking.bestPosition)) {
        tracking.bestPosition = res.data.position;
      }

      const entry = {
        date: today,
        position: res.data.position,
        page: res.data.page,
        title: res.data.title,
        snippet: res.data.snippet,
      };

      const idx = tracking.rankHistory.findIndex((h) => h.date.toDateString() === today.toDateString());
      
      if (idx >= 0) tracking.rankHistory[idx] = entry;
      else tracking.rankHistory.push(entry);
      
    } else {
      tracking.status = "failed";
    }

    await tracking.save();
    return res;

  } catch (err) {
    console.error("Rank update error:", err.message);
    tracking.status = "failed";
    await tracking.save().catch(() => {});
    return {success:false,message:error.message};
  }
}