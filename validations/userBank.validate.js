import {z} from 'zod';

export const UserBankValidation = z.object({
    bankNames : z.object({
        name : z.enum(["Bank","Wallet","Savings"]),
        amount:z.number().gte(0)
    })
})