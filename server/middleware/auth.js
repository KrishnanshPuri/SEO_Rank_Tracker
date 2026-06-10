import jwt from "jsonwebtoken";
import User from "../models/User.js";
const auth = async(req,res,next)=>{
   // This time we aint using cookies so like now _id directly instead we use local storage so use Bearer token 
    try {
     const authHeader = req.headers.authorization;
     if(!authHeader || !authHeader.startsWith("Bearer ")){
         return res.json({success:false,message:'No token'});

     }
    const token =  authHeader.split(" ")[1];
    const tokenDecoded =   jwt.verify(token,process.env.JWT_SECRET);

     req.body.userId = tokenDecoded.id;

    next();
        
    } catch (error) {
        console.error("Auth MiddleWare Error: ",error.message )
        res.json({success:false,message:error.message});
    }
}

export default auth;