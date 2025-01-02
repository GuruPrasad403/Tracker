import mongoose from "mongoose";
import { string } from "zod";

const OtpSchema = new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId,ref:"user"},
    UserOTP: {type:String},
    createdAt: { type: Date, default: Date.now, expires: 300 }
})

export const OtpModel = new mongoose.model("OTP",OtpSchema)