import z from 'zod'

export const UserValidation = z.object({
    name:z.string().min(3).max(10).regex(new RegExp(/^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/), 'Name should contain only alphabets'),
    email:z.string().email(),
    password : z.string() .min(8, 'The password must be at least 8 characters long')
    .max(32, 'The password must be a maximun 32 characters')
    .regex(/^[a-zA-Z0-9!@#$%^&*]{6,32}$/),
    pin:z.number().min(4, "Pin must be 4 digit ").max(4,"Pin must be 4 digit").optional()
})