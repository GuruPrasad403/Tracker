import dotenv from 'dotenv'

dotenv.config()
export const email =  process.env.EMAIL_USER
export const pass = process.env.EMAIL_PASS
export const port = process.env.PORT
export const dburl = process.env.DB_URL
export const JWT = process.env.JWT