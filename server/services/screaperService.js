import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeUrl(url) {
  try {
    const t = Date.now();
    const res = await axios.get(url, { timeout: 10000 });
    const statusCode = res.status; 
    const $ = cheerio.load(res.data);

    const getMeta = (n) => 
      $(`meta[name="${n}"]`).attr("content") || 
      $(`meta[property="${n}"]`).attr("content") || 
      "";

   
    let internalLinks = 0;
    let externalLinks = 0;
    let totalLinks = 0;
    const currentHost = new URL(url).hostname;

    $("a[href]").each((_, el) => {
      totalLinks++;
      try {
        const href = $(el).attr("href");
        if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
        const linkUrl = new URL(href, url); 
        if (linkUrl.hostname === currentHost) internalLinks++;
        else externalLinks++;
      } catch (e) {}
    });

   
    const rawBodyText = $("body").text() || "";
    const wordCount = rawBodyText.split(/\s+/).filter(w => w.length > 0).length;
    const bodyText = rawBodyText.substring(0, 3000);

    const data = {
      metaData: {
        title: $("title").text().trim() || "",
        description: getMeta("description"),
        canonical: $('link[rel="canonical"]').attr("href") || "",
        robots: getMeta("robots"),
        ogTitle: getMeta("og:title"),
        ogDescription: getMeta("og:description"),
        ogImage: getMeta("og:image"),
        twitterCard: getMeta("twitter:card"),
        viewPort: getMeta("viewport"),
        charSet: $("meta[charset]").attr("charset") || ""
      },
      headings: {
        h1: $("h1").length,
        h2: $("h2").length,
        h3: $("h3").length,
        h4: $("h4").length,
        h5: $("h5").length,
        h6: $("h6").length,
        h1Texts: $("h1").map((_, e) => $(e).text().trim()).get()
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        total: totalLinks
      },
      images: {
        total: $("img").length,
        missingAlt: $("img:not([alt]), img[alt='']").length,
        WithAlt: $("img[alt][alt!='']").length
      },
      wordCount,
      pageSize: Buffer.byteLength(res.data, "utf8"),
      bodyText,
      loadTime: Date.now() - t,
      statusCode,
      url
    };

    return { success: true, data };
    
  } catch (err) {
    console.error("Scraping failed:", err.message);
    const statusCode = err.response ? err.response.status : 0;
    return { success: false, error: err.message, data: { statusCode, url } };
  }
}