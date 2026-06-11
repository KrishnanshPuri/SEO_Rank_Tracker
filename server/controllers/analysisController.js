import Analysis from "../models/analysis.js";
import { scrapeUrl } from "../services/screaperService.js";


export const analyseUrl = async(req,res)=>{
       try {
          const {url} = req.body;
          if(!url){
             return res.status(400).json({success:false,message:"URL is Required"})
          }     
 
          let validUrl;
          try{
             validUrl = new URL(url.startsWith("http"?url:`https://${url}`))
          }
          catch(err){
             return res.status(400).json({success:false,message:"Invalid URL Format"});
          }


          const analysis = await Analysis.create({userId:req.userId,url:validUrl,status:"processing" })
         res.json({success:true,message:"Analysis started",analysisId:analysis._id})

          try {
            const scrapeResult = await scrapeUrl(validUrl.href);

            if(!scrapeResult.success){
                analysis.status = "failed";
                await analysis.save();
                return;
            }

            // GEMINI ANALYSIS :)

          } catch (error) {
            console.error("Background Error",error.message);
            try{
                analysis.status="failed";
                await analysis.save();

            }
            catch(err){
                console.error("Failed to save ",err.message);
            }
          }

       } catch (error) {
        console.error("Analyze URL error",error.message);
        if(!res.headersSent)
        res.satus(500).json({success:false,message:"Server Error"})
       }
}

export const getAnalysis = async(req,res)=>{
              
}

export const getAnalyse = async(req,res)=>{

}
