import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{type:String,required: true, trim:true},
    email:{type:String,required: true, trim:true,unique:true},
    password:{type:String,required: true},
    plan:{type:String,default:"free",enum:["free","pro"]},
    analysisCount:{type: Number,default:0},
    lastAnalysisDate:{type:Date , default:null},

} ,{timestamps:true})

const User = mongoose.model("User",userSchema);

export default User;