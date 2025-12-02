import mongoose, {Schema, Types} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const contentType =  [
    "youtube","x","pdf","website","github","linkedln","google docs"
]



const userSchema = new mongoose.Schema({
    username : {
        type:String,
        required : true,
        unique : false,
        lowercase : true,
        trim : true,
        index:true
    },
    password : {
        type : String,
        require : [true,'password is required']
    }
})

const contentSchema = new mongoose.Schema({
    link: {
        type:String,
        required: true
    },
    type : {
        type:String,
        enum : contentType,
        required: true,
        lowercase : true
    },
    title: {
        type:String,
        required : true
    },
    tags : [{
        type:Types.ObjectId, ref:"Tag"
    }],
    userId: {
            type:Types.ObjectId,
            ref:"User",
            required : true
    }
})


export const User = mongoose.model("User",userSchema);
export const Content = mongoose.model("Content",contentSchema);