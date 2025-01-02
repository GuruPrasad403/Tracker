import mongoose from "mongoose";

const CommonFiledsSchema = new mongoose.Schema({
    title : {
        type:String,
        required:true,
    },
    description :{
        type:String,
    },
    amount:{
        type:Number,
        immutable:true,
    },
    created: {
      type:Date,
      default:Date.now(),  
      immutable:true
    }
})
const ExpenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        unique: true,
        ref: "user",
    },
    expenses: {
        Housing: [CommonFiledsSchema],
        Transportation: [CommonFiledsSchema],
        Food: [CommonFiledsSchema],
        Medical: [CommonFiledsSchema],
        Entertainment: [CommonFiledsSchema],
        Education: [CommonFiledsSchema],
        Insurance: [CommonFiledsSchema],
        Taxes: [CommonFiledsSchema],
        PersonalCare: [CommonFiledsSchema],
        Others: [CommonFiledsSchema],
    },
    created: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },
});



export const ExpenseModel = new mongoose.model("Expense",ExpenseSchema)
