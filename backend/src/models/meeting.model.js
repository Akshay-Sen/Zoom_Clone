import mongoose, { Schema } from "mongoose";

 const meetingSchema = new Schema({
    user_id : {type:String, require:true},
    meeting_code : {type:String, require:true},
   
 })

 const Meeting = mongoose.model("Meeting",meetingSchema);

 export {Meeting};