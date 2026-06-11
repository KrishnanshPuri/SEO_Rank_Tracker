import Analysis from "../models/analysis.js";
import { analyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/screaperService.js";

export const analyseUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is Required" });
    }

    let validUrl;
    try {
      
      validUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid URL Format" });
    }

    const analysis = await Analysis.create({ userId: req.userId, url: validUrl.href, status: "processing" });
    res.json({ success: true, message: "Analysis started", analysisId: analysis._id });

    try {
      const scrapeResult = await scrapeUrl(validUrl.href);

      if (!scrapeResult.success) {
        analysis.status = "failed";
        await analysis.save();
        return;
      }

      // GEMINI ANALYSIS :)
      const aiResult = await analyzeSeoData(scrapeResult.data);

      if (!aiResult.success) {
        analysis.status = "failed";
        await analysis.save();
        return;
      }

      analysis.overallScore = aiResult.data.overallScore || 0;
      analysis.categories = aiResult.data.categories || {};
      analysis.metaData = scrapeResult.data.metaData || {};
      analysis.headings = scrapeResult.data.headings || {};
      analysis.links = scrapeResult.data.links || {};
      analysis.images = scrapeResult.data.images || {};
      analysis.keywords = aiResult.data.keywords || [];
      analysis.issues = aiResult.data.issues || [];
      analysis.loadTime = scrapeResult.data.loadTime || 0;
      analysis.pageSize = scrapeResult.data.pageSize || 0;
      analysis.wordCount = scrapeResult.data.wordCount || 0;
      analysis.status = "completed";

      await analysis.save();

    } catch (error) {
      console.error("Background Error", error.message);
      try {
        analysis.status = "failed";
        await analysis.save();
      } catch (err) {
        console.error("Failed to save ", err.message);
      }
    }

  } catch (error) {
    console.error("Analyze URL error", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
    if (!analysis) {
      return res.status(404).json({ success: false, message: "No Analysis Found" });
    }
  
    res.json({ success: true, analysis });
  } catch (error) {
   
    console.log("Get analysis error", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAnalyses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const analysis = await Analysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-issues -keywords');

    const total = await Analysis.countDocuments({ userId: req.userId });

   
    res.json({ success: true, analysis, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
   
    console.log("Get analyses error", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });

 
    res.json({ success: true, message: "Analysis Deleted" });
  } catch (error) {
    
    console.log("DeleteAnalysis error", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};