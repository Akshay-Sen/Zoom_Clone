import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name : {type:String,required:true},
    username :{type:String,reruired:true,unique:true},
    password:{type:String,required:true},
    token:{type : String}
   
})

const User = mongoose.model("User",userSchema)

export {User};