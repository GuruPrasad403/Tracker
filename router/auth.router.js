import express from 'express';
import {UserValidation} from '../validations/user.validate.js';
import { UserModel } from '../models/user.js';
import bcrypt from 'bcrypt';
import GenerateOtp from '../utils/genrateOTP.js';
import { OtpModel } from '../models/otp.js';
import sendEmail from '../utils/sendMail.js';
import { JWT, pass } from '../config/env.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'

export const authRouter = express.Router ();

authRouter.get ('/', (req, res) => {
  res.status (200).json ({
    status: 1,
    msg: ' This the the Auth Router',
  });
});

authRouter.post ('/signup', async (req, res,next) => {
  try {
    const {email} = req.body
    const validation = UserValidation.safeParse(req.body);
    const otp = GenerateOtp()
        if(!validation.success){
                res.json ({
                  msg:"Invalid Inputs",
                  success:0,
                  errors:validation.error.issues
                });
            }
    validation.data.password = await bcrypt.hash(validation.data.password,10)
    const Exist_user = await UserModel.findOne({email})
    console.log(Exist_user)
    if(Exist_user)
      return res.status(200).json({
        success:1,
        msg :"User Exist please login",
        Exist_user
      })
    const user =await UserModel.create(validation.data)
    const hashedOTP = await bcrypt.hash(otp,10)
    const userOtp = new OtpModel({
        userId: user._id, // Ensure this is a valid ObjectId
        UserOTP: hashedOTP,
        expiryTime: new Date(Date.now() + 300 * 1000) 
    });
    
    userOtp.save().then(() => {
        console.log("OTP saved successfully");
        sendEmail(validation?.data?.email,"OTP Verification By Tracker",otp)
    }).catch(err => {
        console.error("Error saving OTP:", err);
    });
    res.json({
      msg:"User Created",
      success:1,
      user})
    
} catch (e) {
    console.log("Error in the line 24")
    next(e)
}
});


authRouter.post("/otp",async(req,res,next)=>{
  try {
    const {userId,otp} = req.body;
    const id = new  mongoose.Types.ObjectId(userId)
    const userOtp = await OtpModel.findOne({userId : id})
    console.log(userOtp)
    if(!userOtp||!userOtp.UserOTP){
      return res.status(200).json({
        success:0,
        msg:"User not found or Invalid User Id"
      })
    }
      const compareOtp = userOtp?.UserOTP
      const validation = compareOtp?await bcrypt.compare(otp,userOtp?.UserOTP) : false
      if(validation){
        const user = await UserModel.findByIdAndUpdate({_id:id},{ $set: { isVerified: true } },{new : true})
        res.status(200).json({
          success:1,
          msg:"User Verified ✔️",
          validation,user})
      }
      else{
        res.status(400).json({
          success:0,
          msg:"Invalid User OTP"
        })
      }    
  } catch (e) {
    console.log("Error in 57 Auth Router",e)
    next(e)
  }
})


authRouter.post("/sendotp", async (req, res, next) => {
  try {
    const { email, userId } = req.body;
    console.log("User ID:", userId,email);

    // Validate the format of userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: 0,
        msg: "Invalid User ID format.",
      });
    }

    const otp = GenerateOtp();
    const hashedOTP = await bcrypt.hash(otp, 5);

    const id = new mongoose.Types.ObjectId(userId);

    const userOtp = await OtpModel.findOne(
      { userId: id }
    )
    if(userOtp){
      userOtp.UserOTP = hashedOTP
    }
    else{
       await OtpModel.create({
        userId:userId,
        UserOTP:hashedOTP,
      })
    }
    userOtp.save()
    const isSent = sendEmail(email, "OTP Verification By Tracker", otp);

    if(isSent){
    return res.status(200).json({
      success: 1,
      msg: "OTP sent to " + email,
    });
  }
  else {
    return res.status(400).json({
      success: 0,
      msg: "Failed to send Otp to  " + email,
    
  })
}

  } catch (e) {
    console.log("Error in /sendotp", e);
    next(e);
  }
});

authRouter.get("/signin",async(req,res,next)=>{
  try{
    const {email,password} = req.query;
    const user = await UserModel.findOne({email:email})
    console.log(user)
    if(!user){
      return res.status(401).json({
        success:0,
        msg:"User Not Found" 
      })
    }
    const validate = await bcrypt.compare(password,user?.password)
    if(!validate)
      return res.status(401).json({
        success:0,
        msg:"Invalid Email or Password" 
      })
    const token = jwt.sign(user.email, JWT)
    res.status(200).json({
      success:1,
      token,
      user,
      msg:"User Signed In"
    })
  }
  catch(e){
    console.log("Error in sign",e)
    next(e)
  }

})

authRouter.get("/find",async(req,res,next)=>{
  try {
    const {email} = req.body
    const user = await UserModel.findOne({email})
    if(!user){
      return res.status().json({
        sucess:0,
        msg:"User Not Found",
      })
    }
    res.status(200).json({
      success:1,
      msg :'User Found'
    })

  } catch (e) {
    console.log("Error in /find",e)
    next(e)
  }
})

authRouter.post("/rest",async(req,res,next)=>{
  try{
    const {email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10)
    const user = await UserModel.findOneAndUpdate({email},{
      $set:{password:hashedPassword}
    },{new: true})  
   res.status(200).json({
    success:1,
    msg:"Password Reset Done",
    user
   }) 
  }catch(e){

  }
})
