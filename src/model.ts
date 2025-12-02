import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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





export const User = mongoose.model("User",userSchema);