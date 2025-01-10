import express from 'express'
import auth from '../middlewares/Auth.middlewares.js'
import { UserModel } from '../models/user.js'
import bcrypt from 'bcrypt'
import { UserBankValidation } from '../validations/userBank.validate.js'
import { UserBankModel } from '../models/account.js'
import mongoose from 'mongoose'
import { ExpenseValidation } from '../validations/Expense.validate.js'
import { ExpenseModel } from '../models/expense.js'
export const userRouter = express.Router()

userRouter.get("/",auth, (req,res)=>{
    res.status(200).json({
        message:"This is user Router"
    })
})

userRouter.post("/pin",auth,async (req,res,next)=>{
    try {
        const {pin} = req.body;
        const {validate} = req.user;
        const hashedPin = await bcrypt.hash(pin,5);
        if(![...pin].length==4)
            return res.status(400).json({
        success:0,
        msg :"Invalid Pin"
    })
        const user = await UserModel.findOneAndUpdate({email:validate},
            {$set : {pin:hashedPin}},
            {new :true}
        )
        res.status(200).json({
            success:1,
            msg:"Pin has been set",
            user
        })
    } catch (e) {
        console.log("error in the userRoute and /pin",e)
        next(e)
    }
})

userRouter.get("/pin",auth,async (req,res,next)=>{
    try{
        const {pin} =  req.body
        const user  = await UserModel.findOne({email:req.user.validate})
        const validate = await bcrypt.compare(pin,user?.pin);
    if(!validate){
        return res.status(401).json({
                success:0,
                msg:"Invalid Pin"
                })
    }
    res.status(200).json({
        success:1,
        msg:"Correct"
    })
    }
    catch(e){
        console.log("Error in the UserRoute /pin get",e)
        next(e)
    }
})
userRouter.post("/add-bank",auth,async(req,res,next)=>{
    try {
        const {user} = req.user
        const userId = new mongoose.Types.ObjectId(user)
        console.log(req.body)
        const validation = UserBankValidation.safeParse(req.body)
        if(!validation.success)
            return res.status(401).json({
        success:0,
        msg : "Invalid Inputs ",
        error : validation.error.issues
    })
    const {name , amount} = validation.data.bankNames;
    const checkUserExist = await UserBankModel.findOne({userId:userId})
        if(checkUserExist){
             const existingBank = checkUserExist.bankNames.find(bank => bank.name == name) 
             if(existingBank)
                existingBank.amount+=amount
            else {
                checkUserExist.bankNames.push({name,amount})
            }
            await checkUserExist.save()

            return res.status(200).json({
                success:1,
                msg :"Amount Added",
                checkUserExist

            })

        }
        else{
         const newUserBank = await UserBankModel.create({
            userId,
            bankNames: [
                {
                    name, amount
                }
            ]

         }) 
         return res.status(200).json({
            success:1,
            msg : "Bank Added",
            newUserBank
         })  
        }
    } catch (e) {
        console.log("Error in the post /add-bank",e)
        next(e)
    }
})

userRouter.delete("/delet-bank",auth,async(req,res,next)=>{
    try {
        const {user} = req.user
        const userId = new mongoose.Types.ObjectId(user)
        const deletedAccount = await UserBankModel.findByIdAndDelete(userId)
        res.status(200).json({
            success:0,
            msg:"User Account has been deleted",
            deletedAccount
        })
    } catch (e) {
        console.log("Error in the delet-bank",e)
        next(e)
    }
})

// Route to get expense summaries
userRouter.get("/expenses-summary",auth, async (req, res, next) => {
    try {
        const { user } = req.user;

        if (!user || !mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({
                success: 0,
                msg: "Invalid or missing userId",
            });
        }

        const matchStage = {
            $match: {
                userId: new mongoose.Types.ObjectId(user),
            },
        };

        // Unwind each category
        const unwindStages = [
            { $unwind: { path: "$expenses", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Housing", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Transportation", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Food", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Medical", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Entertainment", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Education", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Insurance", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Taxes", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.PersonalCare", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$expenses.Others", preserveNullAndEmptyArrays: true } },
        ];

        // Aggregation pipeline for daily, weekly, monthly, yearly summaries
        const finalProjection = {
            $project: {
                _id: 0,
                period: "$_id",
                totalAmount: 1,
                transactions: 1,
            },
        };

        const expenses = await ExpenseModel.aggregate([
            matchStage,
            ...unwindStages,
            {
                $facet: {
                    daily: [
                        {
                            $group: {
                                _id: {
                                    day: { $dayOfYear: "$created" },
                                    year: { $year: "$created" },
                                },
                                totalAmount: { $sum: "$expenses.amount" },
                                transactions: { $push: "$expenses" },
                            },
                        },
                        finalProjection,
                    ],
                    weekly: [
                        {
                            $group: {
                                _id: {
                                    week: { $week: "$created" },
                                    year: { $year: "$created" },
                                },
                                totalAmount: { $sum: "$expenses.amount" },
                                transactions: { $push: "$expenses" },
                            },
                        },
                        finalProjection,
                    ],
                    monthly: [
                        {
                            $group: {
                                _id: {
                                    month: { $month: "$created" },
                                    year: { $year: "$created" },
                                },
                                totalAmount: { $sum: "$expenses.amount" },
                                transactions: { $push: "$expenses" },
                            },
                        },
                        finalProjection,
                    ],
                    yearly: [
                        {
                            $group: {
                                _id: { year: { $year: "$created" } },
                                totalAmount: { $sum: "$expenses.amount" },
                                transactions: { $push: "$expenses" },
                            },
                        },
                        finalProjection,
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: 1,
            msg: "Expense summary retrieved successfully",
            data: expenses[0], // Contains daily, weekly, monthly, and yearly summaries
        });
    } catch (e) {
        console.error("Error in /expenses-summary:", e);
        next(e);
    }
});

userRouter.post("/add-expense",auth,async(req,res,next)=>{

    try {
        const {user} = req.user;
        const {category,bank} =  req.body
        const userId = new mongoose.Types.ObjectId(user)
        const validate = ExpenseValidation.safeParse(req.body)
        if(!validate.success && !bank)
            return res.status(401).json({
        success:0,
        msg : "Invalid Inputs or Bank Name Error ",
        errors : validate.error.issues

    })
    const userExist = await ExpenseModel.findOne({userId})
    const userAccount = await UserBankModel.findOne({userId})
    if(userExist){
        const {title,description,amount} = validate.data;
        console.log(userExist)
        userExist.expenses[category].push({title,description,amount})
        userAccount.bankNames.map((ele)=>{
            if(ele.name == bank){
                ele.amount +=amount 
            }
        })
        await userExist.save()
        await userAccount.save()
        return res.status(200).json({
            success:1,
            msg:"Data Updated",
            userExist
        })
    }
    else {
        const {title,description,amount} = validate.data;
        const newUser =  await ExpenseModel.create({
            userId,
            expenses:{
                [category]:[{
            title,description,amount
            }]}
        })
        userAccount.bankNames.map((ele)=>{
            if(ele.name == bank){
                ele.amount +=amount 
            }
        })
        await userAccount.save()
        return res.status(200).json({
            success:1,
            msg:"Data Added",
            newUser,
            
        })
    }
} catch (e) {
        console.log("error in the /add-expense",e)
        next(e)
    }
})


userRouter.get("/total", auth, async (req, res, next) => {
    try {
        const { user } = req.user;
        const userId = new mongoose.Types.ObjectId(user);
        console.log("User ID:", userId);

        const User = await UserBankModel.findOne({ userId });
        console.log(User)
        if (!User || !User.bankNames) {
            return res.status(404).json({
                success: 0,
                msg: "User not found or no bank names data available",
            });
        }

        console.log("User Data:", User);

        const totalAmount = User.bankNames.reduce((acc, ele) => {
            console.log("Processing element:", ele);
            return acc + (ele.amount || 0);
        }, 0);

        return res.status(200).json({
            success: 1,
            msg: "Data Fetched",
            totalAmount,
        });
    } catch (e) {
        console.log("Error In the /total", e);
        next(e);
    }
});

userRouter.get("/info",auth, async (req,res,next)=>{
    try {
        const {user} = req.user
        const userId = new mongoose.Types.ObjectId(user)
        const BankInfo = await UserBankModel.findOne({userId})
        const userInfo = await UserModel.findOne({_id:user})
        if(!userInfo)
            return res.status(402).json({
        success:0,
    msg:"User Not Found",
    
})

    res.status(200).json({
        user:{
            name : userInfo?.name,
            email:userInfo?.email,
            joined : userInfo?.joined,
            BankInfo
        },
        success:1,
        
    })
    } catch (e) {
        console.log("Error in /info",e)
        next(e)
    }
})
