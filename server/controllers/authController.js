import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
const generateToken=(id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: "7d" });
}


export const register = async (req, res) => {
    console.log('in register');
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Please fill all fields" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        const token = generateToken(user._id);

       
        return res.status(201).json({ success: true,token,user});

    } catch (error) {
        console.log('Register Error:',error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}


export const login = async (req, res) => {
    console.log('in login');
    const {email, password } = req.body;
    
    if (!email || !password) {
        return res.json({ success: false, message: "Please fill all fields" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }
         
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
             return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

       
        const token = generateToken(user._id);

       
        return res.status(201).json({ success: true, token,user});

    } catch (error) {
        console.log('Login Error:',error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getUser = async (req,res)=>{
    try {

        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(500).json({success:false,message:"User NOT Found"})

        }
        res.json({success:true,user})
    } catch (error) {
        console.error("Get user Error: ", error.message);
        res.status(500).json({success:false,message:error.message})
    }
}