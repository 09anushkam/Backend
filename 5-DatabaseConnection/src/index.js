// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/connection.js";

// .env config

dotenv.config({
    path:'./env'
})

// calling connectDB

connectDB()







// Unprofessional Approach - writing everything in index.js
/*
import mongoose from "mongoose"
import { DB_NAME } from "./constants";
import express from "express"
const app=express();

(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR : ", error);
            throw error
        });
        app.listen(process.env.port,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        });
    } 
    
    catch (error) {
        console.error("ERROR : ",error);
        throw err
    }
})()
*/