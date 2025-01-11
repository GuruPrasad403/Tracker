import mongoose from "mongoose";

const UserBank = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        unique: true,
        ref: "user"
    },
    bankNames: [
        {
            name: {
                type: String,
                enum: ["bank", "wallet", "savings"],
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                default: 0.00
            },
            created: {
                type: Date,
                default: Date.now(),
                immutable: true
            },
            updated: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    created: {
        type: Date,
        default: Date.now(),
        immutable: true
    },
    updated: {
        type: Date,
        default: Date.now()
    }
});

export const UserBankModel = mongoose.model("Bank", UserBank);
