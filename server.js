import express from 'express'
import {port,dburl } from './config/env.js'
import linkToDatabase from './config/db.js'
import { userRouter } from './router/user.router.js'
import { authRouter } from './router/auth.router.js'
const app = express()
app.use(express.json()) 
app.get("/", (req,res)=>{
    res.status(200).json({
        msg :"This is the Backend ",
        
    })
})

// User Router
app.use("/api/",authRouter)
app.use("/api/user",userRouter)



//Error Handleing

// Handle errors
app.use((err, req, res, next) => {
    if (! err) {
        return next();
    }

    res.status(500);
    res.send(err);
});
try{
    const valid = linkToDatabase(dburl)
    valid ? app.listen(port,()=>{
        console.log(`server Started http://localhost:${port}`,)
    }) : confirm.log("DB error")
}
catch(e){
        console.log(e)
}