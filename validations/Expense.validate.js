import {z} from 'zod';

export const ExpenseValidation = z.object({
    title:z.string()
    .min(3,"Title must be Atlest 3 char")
    .max(10,"Title can not be grater then 10 char"),
    description:z.string()
    .min(3, "Description must be atleast 2 char")
    .max(50, " Description can not be grater then 50 cahr"),
    amount : z.number().lte(-1, "Expense can not be a Postive ")
})