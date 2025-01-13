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



userRouter.post("/add-expense",auth,async(req,res,next)=>{

    try {
        const {user} = req.user;
        console.log(req.body)
        const {category,bank} =  req.body
        const userId = new mongoose.Types.ObjectId(user)
        const validate = ExpenseValidation.safeParse(req.body)
        console.log(validate)
        if(!validate.success || !bank)
            return res.status(401).json({
        success:0,
        msg : "Invalid Inputs or Bank Name Error ",
        errors : validate?.error?.issues

    })
    const userExist = await ExpenseModel.findOne({userId})
    const userAccount = await UserBankModel.findOne({userId})
    if(userExist){
        const {title,description,amount} = validate.data;
        console.log(userExist)
        userExist.expenses[category].push({title,description,amount})
        userAccount.bankNames.map((ele)=>{
            if(ele.name === bank){
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
        const { user } = req?.user;
        const userId = new mongoose.Types.ObjectId(user);
        console.log("User ID:", userId);
        //caluculate the user bank model and get the total amount
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
        //caluculaye the total expenditure of the user and get the total expenditure
        const userExpenditure = await ExpenseModel.findOne({userId})
        if(!userExpenditure)
            return res.status(404).json({
                success:0,
                msg:"User Not Found"
            })
        const totalExpenditure = Object.values(userExpenditure.expenses).reduce((acc,ele)=>{
            return acc + ele.reduce((acc,ele)=>acc+ele.amount,0)
        },0)
        return res.status(200).json({
            success: 1,
            msg: "Data Fetched",
            totalAmount,
            totalExpenditure
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

//route to get all the expenses based on the given time period 
userRouter.get("/expenses", auth, async (req, res, next) => {
    try {
        const { user } = req.user;
        const userId = new mongoose.Types.ObjectId(user);
        const { category, from, to } = req.query;

        // Convert `from` and `to` to Date objects
        const fromTime = new Date(from);
        const toTime = new Date(to);

        // Validate dates
        if (isNaN(fromTime.getTime()) || isNaN(toTime.getTime())) {
            return res.status(400).json({
                success: 0,
                msg: "Invalid date format for 'from' or 'to'. Please use ISO 8601 format.",
            });
        }

        // Fetch user data
        const userExist = await ExpenseModel.findOne({ userId });
        if (!userExist) {
            return res.status(404).json({
                success: 0,
                msg: "User not found",
            });
        }

        // Check if category exists
        if (!userExist.expenses[category]) {
            return res.status(400).json({
                success: 0,
                msg: `Invalid category '${category}'. Available categories are: ${Object.keys(userExist.expenses).join(", ")}`,
            });
        }

        // Filter expenses by date range
        const expenses = userExist.expenses[category].filter((ele) => {
            const createdDate = new Date(ele.created);
            return createdDate >= fromTime && createdDate <= toTime;
        });

        res.status(200).json({
            success: 1,
            expenses,
        });
    } catch (e) {
        console.error("Error in the /expenses route:", e);
        next(e);
    }
});




//route to get all the expenses of the user today 
userRouter.get("/expenses-today", auth, async (req, res, next) => {
    try {
        const { user } = req.user;
        const userId = new mongoose.Types.ObjectId(user);
        const userExist = await ExpenseModel.findOne({ userId });
        if (!userExist)
            return res.status(404).json({
                success: 0,
                msg: "User Not Found"
            });
        const today = new Date();
        const expenses = Object.entries(userExist.expenses).reduce((acc, [category, expenseList]) => {
            const filteredExpenses = expenseList.filter((ele) => {
                const createdDate = new Date(ele.created);
                return createdDate.getDate() === today.getDate();
            }).map(expense => ({ ...expense.toObject(), category }));
            return acc.concat(filteredExpenses);
        }, []);
        res.status(200).json({
            success: 1,
            expenses
        });
    } catch (e) {
        console.log("Error in the /expenses-today", e);
        next(e);
    }
});