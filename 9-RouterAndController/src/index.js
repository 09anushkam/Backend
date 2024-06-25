// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/connection.js";


// .env config

dotenv.config({
    path:'./env'
});

// app
import {app} from "./app.js"

// calling connectDB

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB Connection failed !!",err);
});

