import {z} from 'zod';

export const UserBankValidation = z.object({
    bankNames : z.object({
        name : z.enum(["bank","wallet","savings"]),
        amount:z.number().gte(0)
    })
})