import axios from "axios";

export async function rankTracker(keyword, targetDomain) {
  try {
    const cleanTarget = targetDomain.replace("www.", "").toLowerCase();
    
    const res = await axios.get("https://serpapi.com/search.json", {
      params: {
        api_key: process.env.SERP_API_KEY,
        q: keyword,
        num: 50,
        engine: "google",
        gl: "us",
        hl: "en"
      }
    });

    const results = res.data.organic_results || [];
    let found = null;
    const competitors = [];

    for (const r of results) {
      let dom = "";
      try {
        dom = new URL(r.link).hostname.replace("www.", "").toLowerCase();
      } catch { continue; }
      
      const cleanResult = {
        position: r.position,
        page: Math.ceil(r.position / 10),
        url: r.link,
        domain: dom,
        title: r.title || "",
        snippet: r.snippet || ""
      };

      if (!found && (dom.includes(cleanTarget) || cleanTarget.includes(dom))) {
        found = cleanResult;
      } else if (competitors.length < 10 && !dom.includes(cleanTarget) && !cleanTarget.includes(dom)) {
        competitors.push(cleanResult);
      }
    }

    return {
      success: true,
      data: {
        keyword,
        targetDomain,
        position: found?.position || null,
        page: found?.page || null,
        title: found?.title || "",
        snippet: found?.snippet || "",
        competitors,
        totalResultsScanned: results.length
      }
    };

  } catch (error) {
    console.error("SERP API Error:", error.message);
    return { success: false, message: "API Fetch failed" };
  }
}