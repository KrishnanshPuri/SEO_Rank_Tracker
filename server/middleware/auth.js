import jwt from "jsonwebtoken";
import User from "../models/User";
const auth = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false,message:'Not authorized token failed'});
    }

    try {
     
    const tokenDecoded =   jwt.verify(token,process.env.JWT_SECRET);

    if(tokenDecoded.id){
        req.body = req.body || {};
        req.body.userId = tokenDecoded.id;
    }
    else{
          return res.json({success:false,message:'No token Id'});
    }

    next();
        
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export default userAuth;