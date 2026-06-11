import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    overallScore: { type: SchemaType.INTEGER },
    categories: {
      type: SchemaType.OBJECT,
      properties: {
        seo: { type: SchemaType.INTEGER },
        performance: { type: SchemaType.INTEGER },
        accessibility: { type: SchemaType.INTEGER },
        bestPractices: { type: SchemaType.INTEGER },
      },
      required: ["seo", "performance", "accessibility", "bestPractices"],
    },
    keywords: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          word: { type: SchemaType.STRING },
          count: { type: SchemaType.INTEGER },
          density: { type: SchemaType.NUMBER },
        },
        required: ["word", "count", "density"],
      },
    },
    issues: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          severity: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["critical", "warning", "info"],
          },
          category: { type: SchemaType.STRING },
          message: { type: SchemaType.STRING },
          recommendation: { type: SchemaType.STRING },
        },
        required: ["severity", "category", "message", "recommendation"],
      },
    },
  },
  required: ["overallScore", "categories", "keywords", "issues"],
};

export async function analyzeSeoData(d) {
  try {
    const p = `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${d.url}
Load Time: ${d.loadTime}ms
Status Code: ${d.statusCode}
Page Size: ${Math.round(d.pageSize / 1024)}KB
Word Count: ${d.wordCount}

META DATA:
- Title: "${d.metaData.title}" (${d.metaData.title.length} chars)
- Description: "${d.metaData.description}" (${d.metaData.description.length} chars)
- Canonical: "${d.metaData.canonical}"
- Robots: "${d.metaData.robots}"
- OG Title: "${d.metaData.ogTitle}"
- OG Description: "${d.metaData.ogDescription}"
- OG Image: "${d.metaData.ogImage}"
- Twitter Card: "${d.metaData.twitterCard}"
- Viewport: "${d.metaData.viewport}"
- Charset: "${d.metaData.charset}"

HEADINGS:
- H1: ${d.headings.h1} (texts: ${JSON.stringify(d.headings.h1Texts)})
- H2: ${d.headings.h2}
- H3: ${d.headings.h3}
- H4: ${d.headings.h4}
- H5: ${d.headings.h5}
- H6: ${d.headings.h6}

LINKS:
- Internal: ${d.links.internal}
- External: ${d.links.external}
- Total: ${d.links.total}

IMAGES:
- Total: ${d.images.total}
- Missing Alt Text: ${d.images.missingAlt}
- With Alt Text: ${d.images.withAlt}

PAGE CONTENT (first 3000 chars):
${d.bodyText}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Severity levels must be exactly one of: "critical", "warning", or "info".
Provide 5-15 issues sorted by severity (critical first). Be specific and actionable with recommendations.
Extract top 10 keywords by frequency from the page content.`;

    const m = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const res = await m.generateContent(p);
    return { success: true, data: JSON.parse(res.response.text()) };
  } catch (e) {
    console.error(e.message);
    return { success: false, error: e.message };
  }
}