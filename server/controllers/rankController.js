import keywordTracking from "../models/keywordTracking.js";

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


    const existing = await keywordTracking.findOne({ 
        userId: req.userId, 
        keyword: keyword.toLowerCase().trim(), 
        domain 
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Already Tracking" });
    }
    const tracking = await keywordTracking.create({
      userId: req.userId,
      keyword: keyword.toLowerCase().trim(),
      url: url.startsWith("http") ? url : `https://${url}`,
      domain,
      status: "checking"
    });

    res.status(201).json({ success: true, message: "Keyword tracking started", tracking });

  } catch (error) {
    console.error("Add Keyword Error:", error);
    res.status(500).json({ success: false, message: "Server error while adding keyword" });
  }
}

export const getKeywords = async (req,res)=>{
    
}

export const getKeyword = async (req,res)=>{
    
}

export const refreshKeywords = async (req,res)=>{
    
}

export const deleteKeywords = async (req,res)=>{
    
}

export const toggleTracking = async (req,res)=>{
    
}