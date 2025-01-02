import mongoose from "mongoose";
export default async function  linkToDatabase(dburl){
    try{
        
        await mongoose.connect(dburl)
        console.log("Data Base Conneted ")
        return true
    }        
    catch (e){
        console.log(e)
        console.log("Error in db.js",e)
        return false
    }

}