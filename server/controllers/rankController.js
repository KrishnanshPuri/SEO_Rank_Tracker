import KeywordTracking from "../models/keywordTracking.js";
import { keywordTracking as runScraper } from "../services/keywordTrackingService.js";

export const addKeyword = async (req, res) => {
  try {
    const { keyword, url } = req.body;
    
    if (!keyword || !url) {
      return res.status(400).json({ success: false, message: "Keyword and URL are Required" });
    }
    
    let domain;
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = urlObj.hostname.replace("www.", ""); 
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid URL format" });
    }
    const existing = await KeywordTracking.findOne({ 
        userId: req.userId, 
        keyword: keyword.toLowerCase().trim(), 
        domain 
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Already Tracking" });
    }
    const tracking = await KeywordTracking.create({
      userId: req.userId,
      keyword: keyword.toLowerCase().trim(),
      url: url.startsWith("http") ? url : `https://${url}`,
      domain,
      status: "checking"
    });
    
    res.status(201).json({ success: true, message: "Keyword tracking started", tracking });
    runScraper(tracking);
  } catch (error) {
    console.error("Add Keyword Error:", error);
    res.status(500).json({ success: false, message: "Server error while adding keyword" });
  }
}

export const getKeywords = async (req, res) => {
    try {
         const keywords = await KeywordTracking.find({userId: req.userId}).sort({createdAt: -1}).select("-rankHistory");
         res.json({success: true, keywords});
    } catch (error) {
        console.log("get Keywords Error", error.message);
        res.status(500).json({success: false, message: "server error"});
    }
}

export const getKeyword = async (req, res) => {
     try {
         const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.userId});
         if(!tracking) return res.status(404).json({success: false, message: "Keyword Tracking Not Found"});
            
         res.json({success: true, tracking});
    } catch (error) {
        console.log("get Keyword Error", error.message);
        res.status(500).json({success: false, message: "server error"});
    }
}

export const refreshKeywords = async (req, res) => {
    try {
         
         const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.userId});
         if(!tracking){
            return res.status(404).json({success: false, message: "Keyword Tracking Not Found"});
         }
         
        tracking.status = "checking";
        await tracking.save();
        
        res.json({success: true, message: "Rank tracking started"});
        runScraper(tracking);
    } catch (error) {
        console.log("Refresh Keywords Error", error.message);
        res.status(500).json({success: false, message: "server error"});
    }
}

export const deleteKeywords = async (req, res) => {
     try {
         const tracking = await KeywordTracking.findOneAndDelete({_id: req.params.id, userId: req.userId});
         if(!tracking){
             return res.status(404).json({success: false, message: "Keyword Tracking Not Found"});
         }
         res.json({success: true, message: "Keyword Tracking Deleted"});
    } catch (error) {
        console.log("Delete Keyword Error", error.message);
        res.status(500).json({success: false, message: "server error"});
    }
}

export const toggleTracking = async (req, res) => {
     try {
         const tracking = await KeywordTracking.findOne({_id: req.params.id, userId: req.userId});
         if(!tracking){
            return res.status(404).json({success: false, message: "Keyword Tracking Not Found"});
         }
         tracking.active = !tracking.active;
         await tracking.save();
         
         res.json({success: true, tracking});
    } catch (error) {
        console.log("Toggle Tracking Error", error.message);
        res.status(500).json({success: false, message: "server error"});
    }
}