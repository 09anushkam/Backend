# CHAI AUR BACKEND  

## Lec 1 - Roadmap  

- A Programming language and a database

- Structure of folders :  
DB  
Models  
Controllers  
Routes  
Middlewares  
Utils  
More (depends) eg:views  

## Lec 2 - Deployment  

npm init or npm init -y  
npm start or npm run start  
npm i express  
npm i dotenv  

.env file -> port  

## Lec 3 - Connectivity  

- Backend :  
Create a simple express app  

Note -  
import express from "express" - works asynchronously  
for using import add "type":"module" in package.json after main  

const express=require("express"); - works synchronously  

- Frontend :  
npm create vite@latest .  
npm i  
npm run dev  
npm i axios  

- Connectivity :  
to get data of backend in frontend we use proxy  
vite.config.js -

        export default defineConfig({  
            server:{  
                proxy:{  
                    '/api':`http://localhost:8000`,  
                },  
            },  
            plugins:[react()],  
        });  

server.js -  

    // middleware - if we move `dist` of frontend to backend (but actually this is a bad practice)  
    // app.use(express.static("dist"))  

RUN USING - `num run dev`  

## Lec 4 - Data Modelling  

export const User=mongoose.model("User",userSchema);  
model: User->users in backend  
timestaps gives createdAt and updatedAt  

example -  

            import mongoose from "mongoose";

            const userSchema=new mongoose.Schema({
              username:{
                type:String,
                required:true,
                unique:true,
              },
              email:{
                type:String,
                required:true,
                unique:true,
                lowercase:true, //strict
              },
              password:{
                type:String,
                required:[true,"password is required"],
              },
            },{timestamps:true});

            export const User=mongoose.model("User",userSchema);

## Lec 5 - Professional Project Setup  

npm init  
npm i express  
npm i mongoose  
npm i dotenv  
npm i nodemon -D  
npm i prettier -D  
Folder Structure  

## Lec 6 - Database Connection  

1. database connection -> try catch  
2. "Database is always in another continent"  
so use async await while connecting db  

- src/db/connection.js -  

        import mongoose from "mongoose";
        import { DB_NAME } from "../constants";

        const connectDB=async()=>{
            try {
                const connectionInstance=await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
                console.log(`\n MongoDB Connected! DB HOST : ${connectionInstance.connection.host}`);
            } catch (error) {
                console.log("MONGODB connection error ",error);
                process.exit(1);
            }
        }

export default connectDB;

- package.json -  

          "scripts": {
            "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
          },

- index.js -  

        // require('dotenv').config({path:'./env'})
        import dotenv from "dotenv"
        import connectDB from "./db/connection.js";

        // .env config

        dotenv.config({
            path:'./env'
        });

        // calling connectDB

        connectDB()

## Lec 7 - Custom Api  

npm i cookie-parser  
npm i cors  

in .env file add ->  
MONGO_URL->mongodb url with password  
CORS_ORIGIN=* # request coming from anywhere is accepted  

middlewares -  
app.use();  
it has 4 parameteres - (err,req,res,next)  

- src/app.js -  

        import express from "express"
        import cors from "cors"
        import cookieParser from "cookie-parser"

        const app=express();

        // middlewares
        app.use(cors({origin:process.env.CORS_ORIGIN,credentials:true}));
        app.use(express.json({limit:"16kb"}));
        app.use(express.urlencoded({extended:true,limit:"16kb"})); // for spaces in url -> + or %20
        app.use(express.static("public"));
        app.use(cookieParser());

        export {app}

- index.js -  

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

- src/utils/asyncHandler.js -  

        // Async await and try catch
        // closure - func return func
        const asyncHandler=(func)=>async(req,res,next)=>{
            try {
                await func(req,res,next);
            } catch (error) {
                res.status(err.code || 500).json({
                    success:false,
                    message:err.message,
                });
            }
        }

        // Promises
        const asyncHandler=(requestHandler)=>{
            return (req,res,next)=>{
                Promise
                .resolve(requestHandler(req,res,next))
                .catch((err)=>next(err))
            }
        }

        export {asyncHandler}

- src/utils/ApiError.js -  

        class ApiError extends Error{
            constructor(
                statusCode,
                message="Something went error",
                error=[],
                statck=""
            ){
                super(message)
                this.statusCode=statusCode
                this.data=null
                this.message=message
                this.success=false;
                this.errors=errors

                if(statck){
                    this.stack=statck;
                }
                else{
                    Error.captureStackTrace(this,this.constructor);
                }
            }
        }

        export {ApiError}

- src/utils/ApiResponse.js -  

        class ApiResponse{
            constructor(statusCode,data,message="Success"){
                this.statusCode=statusCode
                this.data=data
                this.message=message
                this.success=statusCode < 400
            }
        }

        export {ApiResponse};

## Lec 8 - User and Video Model  

models -> user and video model  

- 1. npm i mongoose-aggregate-paginate-v2  

- used in video model  

      import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"  
      // video schema and exporting model
      videoSchema.plugin(mongooseAggregatePaginate);  

- 2. npm i bcrypt  
used for password hashing  

- src/models/user.models.js -  

      import bcrypt from "bcrypt"

      // pre hook or middleware
      // note - don't use arrow function here
      userSchema.pre("save",async function(next){

          //encrypt password only when it is set or modified
          if(!this.isModified("password")) return next(); 
      
          this.password=await bcrypt.hash(this.password,10);
          next();
      });
      
      userSchema.methods.isPasswordCorrect=async function(password){
          return await bcrypt.compare(password,this.password);
      }

- 3. npm i jsonwebtoken  
tokens  

- src/models/user.models.js -  

      import jwt from "jsonwebtoken"
      
      userSchema.methods.generateAccessToken=function(){
          return jwt.sign({
              _id:this._id,
              username:this.username,
              email:this.email,
              fullName:this.fullName,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn:process.env.ACCESS_TOKEN_EXPIRY }
          );
      }

      userSchema.methods.generateRefreshToken=function(){
          return jwt.sign({
              _id:this._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn:process.env.REFRESH_TOKEN_EXPIRY }
          );
      }

- Also don't forget to add those  
ACCESS_TOKEN_SECRET,  
ACCESS_TOKEN_EXPIRY,  
REFRESH_TOKEN_SECRET,  
REFRESH_TOKEN_EXPIRY  
in .env file  

## Lec 9 - File Uploading  

npm i multer - package to get file  
npm i cloudinary - storing service  

CLOUDINARY_CLOUD_NAME  
CLOUDINARY_API_KEY  
CLOUDINARY_API_SECRET  
in .env file  

- src/utils/cloudinary.js -  

        import { v2 as cloudinary } from 'cloudinary';
        import fs from "fs"

        cloudinary
        .config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_API_SECRET,  
        });

        const uploadOnCloudinary=async (localFilePath)=>{
            try {
                if(!localFilePath) return null
                // upload the file on cloudinary
                const response=await cloudinary.uploader.upload(localFilePath,{
                    resource_type:'auto'
                });
                // file has been uploaded successfully
                fs.unlinkSync(localFilePath);
                return response;
            }

            catch (error) {
                fs.unlinkSync(localFilePath); //removes the locally saved temporary file as the operation gets failed
                return null;
            }
        }

        export {uploadOnCloudinary};

- src/middlewares/multer.middlewares.js -  

        import multer from "multer"

        // middleware
        const storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, "./public/temp");
          },
          filename: function (req, file, cb) {
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            // cb(null, file.fieldname + '-' + uniqueSuffix)
            cb(null, file.originalname);
          }
        });

        export const upload = multer({ storage: storage });

## Lec 10 - HTTP Crash course  

http headers - meta data  
http status codes  
http methods - get,post,patch,put,delete  

## Lec 11 - Router and Controller  

- src/controllers/user.controllers.js -  

        import  { asyncHandler } from "../utils/asyncHandler.js"

        const registerUser=asyncHandler(async(req,res)=>{
            res.status(200).json({
                message:"ok",
            });
        });

        export {registerUser};

- src/routes/user.routes.js -  

        import {Router} from "express"
        import { registerUser } from "../controllers/user.controllers.js";

        const router=Router();

        router
        .route("/register")
        .post(registerUser);
    
        export default router;

## Lec 12 - Logic Building  

- src/routes/user.routes.js -  

        router
        .route("/register")
        .post(upload.fields([
            {name:"avatar",maxCount:1,},
            {name:"coverImage",maxCount:1},
            ]),
            registerUser);

- src/controllers/user.controllers.js -  

// Register controller (registerUser) :  
    // get user details from frontend  
    // validation - fields not empty  
    // check if user already exists - check using username or email  
    // check for images, check for avtar  
    // upload them to cloudinary, avtar  
    // create user object - create entry in db  
    // remove password and refresh token field from response  
    // check for user creation  
    // return res  

        import  { asyncHandler } from "../utils/asyncHandler.js";
        import { ApiError } from "../utils/ApiError.js";
        import { User } from "../models/user.models.js";
        import { uploadOnCloudinary } from "../utils/cloudinary.js";
        import { ApiResponse } from "../utils/ApiResponse.js";

        const registerUser=asyncHandler(async(req,res)=>{
            // get user details from frontend
            const {fullName,email,username,password}=req.body;

            // validation - fields not empty
            if([fullName,email,username,password].some((field)=>field?.trim()==="")){
                throw new ApiError(400,"All fields are required");
            }

            // check if user already exists - check using username or email
            const existedUser=await User.findOne({
                $or: [ {username} , {email} ]
            });
            if(existedUser){
                throw new ApiError(409,"User with same email or username already exists!");
            }

            // check for images, check for avtar
            const avatarLocalPath=req.files?.avatar[0]?.path;
            // const coverImageLocalPath=req.files?.coverImage[0]?.path;

            let coverImageLocalPath;
            if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
                coverImageLocalPath=req.files.coverImage[0].path;
            }

            if(!avatarLocalPath){
                throw new ApiError(400,"Avatar path is required");
            }

            // upload them to cloudinary, avtar
            const avatar=await uploadOnCloudinary(avatarLocalPath);
            const coverImage=await uploadOnCloudinary(coverImageLocalPath);

            if(!avatar){
                throw new ApiError(400,"Avatar file is required");
            }

            // create user object - create entry in db
            const user=await User.create({
                fullName,
                avatar:avatar.url,
                coverImage:coverImage?.url || "",
                email,
                password,
                username:username.toLowerCase(),
            });

            // remove password and refresh token field from response
            const createdUser=await User.findById(user._id).select("-password -refreshToken");

            // check for user creation
            if(!createdUser){
                throw new ApiError(500,"Something went wrong");
            }

            // return res
            return res.status(200).json(
                new ApiResponse(200,createdUser,"User registered Successfully"),
            );
        });

        export {registerUser};

## Lec 13 - How to use postman for testing  

## Lec 14 - Access, Refresh Token and Middlewares  

- src/controllers/user.controllers.js -  

        // generate access token method
        const generateAccessAndRefreshTokens=async(userId)=>{
            try {
                const user=await User.findById(userId);
                const accessToken=await user.generateAccessToken();
                const refreshToken=await user.generateRefreshToken();

                user.refreshToken=refreshToken; //storing refresh token in database
                await user.save({validateBeforeSave:false});

                return {accessToken,refreshToken};
            } 
            catch (error) {
                throw new ApiError(500,"Something went wrong while generating refresh and access token");
            }
        }

// Login Controller (loginUser) :  
// req body->data  
    // username or email  
    // find the user  
    // password check  
    // access and refresh tokens  
    // send cookie  

        const loginUser=asyncHandler(async(req,res)=>{
            // req body->data
            const {email,username,password}=req.body;

            // username or email
            if(!username || !email){
                throw new ApiError(400,"username or email is required");
            }

            // find the user based on their username or email
            const user=await User.findOne({
                $or: [ {username} , {email} ]
            });

            if(!user){
                throw new ApiError(404,"User does not exists");
            }

            // password check
            const isPasswordValid=await user.isPasswordCorrect(password);

            if(!isPasswordValid){
                throw new ApiError(401,"Invalid user credentials");
            }

            // access and refresh tokens
            const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
            const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

            // send cookie 
            // cookie is modifiable by server only
            const options={
                httpOnly:true,
                secure:true,
            }

            return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User Logged In Successfully"));

        });

- src/middlewares/auth.middlewares.js -  

        import {asyncHandler} from "../utils/asyncHandler.js"
        import {ApiError} from "../utils/ApiError.js"
        import jwt from "jsonwebtoken"
        import {User} from "../models/user.models.js"

        // verifyToken - Authorization - to get all info of user using token before user logout and save it for future reference
        export const verifyJWT=asyncHandler(async(req,res,next)=>{

            try {
                const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") //extracting token
    
                if(!token){
                throw new ApiError(401,"Unauthorized request");
                }
    
                const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
                const user=await User.findById(decodedToken._id).select("-password -refreshToken");
    
                if(!user){
                    throw new ApiError(401,"Invalid Access Token");
                }
    
                req.user=user; // now we have user object which we can use in log out
                return next();
            } 

            catch (error) {
                throw new ApiError(401,error?.message||"Invalid access token");
            }
        });

        export {verifyJWT};

- src/controllers/user.controllers.js -  

        const logoutUser=asyncHandler(async(req,res)=>{

            await User.findByIdAndUpdate(
                req.user._id,
                { $set:{ refreshToken: undefined } },
                { new:true },
            );

            const options={
                httpOnly:true,
                secure:true,
            }

            // clear cookies
            return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(200,{},"User Logged out")
        });

        export {logoutUser}  

- src/controllers/user.controllers.js -  

        const refreshAccessToken=asyncHandler(async(req,res)=>{
            const incomingrefreshToken=req.cookies.refreshToken || req.body.refreshToken;

            if(!incomingrefreshToken){
                throw new ApiError(401,"Unauthorized Request");
            }

            try {
                const decodedToken=jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET);
        
                const user=await User.findById(decodedToken?._id);
    
                if(!user){
                    throw new ApiError(401,"Invalid Refresh Token");
                }
    
                if(incomingrefreshToken!==user?.refreshToken){
                    throw new ApiError(401,"Refresh token is expired or used");
                }
    
                const options={
                    httpOnly:true,
                    secure:true,
                }
    
                const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id);
    
                return res
                .status(200)
                .cookie("accessToken",accessToken)
                .cookie("refreshToken",refreshToken)
                .json(  
                    new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token refreshed successfully")
                );
            } catch (error) {
                throw new ApiError(401,error?.message || "Invalid refresh token");
            }
        });

        export {refreshAccessToken}  

- src/routes/user.routes.js (login,logout routes are added) -  

        import { Router } from "express"
        import { registerUser,loginUser,logoutUser } from "../controllers/user.controllers.js";
        import { upload } from "../middlewares/multer.middlewares.js";
        import { verifyJWT } from "../middlewares/auth.middlewares.js";

        const router=Router();

        router
        .route("/register")
        .post(upload.fields([
            {name:"avatar",maxCount:1},
            {name:"coverImage",maxCount:1},
            ]),
            registerUser);

        router
        .route("/login")
        .post(loginUser);

        // secured routes
        router
        .route("/logout")
        .post(verifyJWT,logoutUser);

        router
        .route("/refresh-token")
        .post(refreshAccessToken);

        export default router;

## Lec 15 - Update Controller  

just a note for myself - req.body takes data fields send by user and not necessarily schema  
but if u want to store that data it should be in the schema  

- src/controllers/user.controllers.js -  

        const changeCurrentPassword=asyncHandler(async(req,res)=>{
            // take old and new password
            const {oldPassword,newPassword,confirmPassword}=req.body;

            if(newPassword!==confirmPassword){
                throw new ApiError(400,"New Password and Confirm Password did not match");
            }
    
            // take old password of a user and check for their old password correction
            const user=await User.findById(req.user?._id);
            const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

            if(!isPasswordCorrect){
                throw new ApiError(400,"Invalid Old Password");
            }

            // now the new password is the current password of the user
            user.password=newPassword;
            await user.save({validateBeforeSave:false}); // avoiding validation for other information while saving password

            // returning response
            return res
            .status(200)
            .json(
                new ApiResponse(200,{},"Password Changed Successfully")
            )
        });

        const getCurrentUser=asyncHandler(async(req,res)=>{
            return res
            .status(200)
            .json(
                new ApiResponse(200,req.user,"current user fetched successfully")
            )
        });

        const updateAccountDetails=asyncHandler(async(req,res)=>{
            const {fullName,email}=req.body;

            if(!fullName||!email){
                throw new ApiError(400,"All fields are required");
            }

            const user=await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $set:{
                        fullName,
                        email:email, //alternate syntax for previous line
                    }
                },
                {new:true},
            ).select("-password");

            return res
            .status(200)
            .json(
                new ApiResponse(200,user,"Account details updated successfully")
            );
        });

        const updateUserAvatar=asyncHandler(async(req,res)=>{

            // req.file comes from multer middleware
            const avatarLocalPath=req.file?.path;
    
            if(!avatarLocalPath){
                throw new ApiError(400,"Avatar file is missing");
            }

            const avatar=await uploadOnCloudinary(avatarLocalPath);

            if(!avatar.url){
                throw new ApiError(400,"Avatar file url is missing");
            }

            const user=await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $set:{
                        avatar:avatar.url,
                    }
                },
                {new:true},
            ).select("-password");

            return res
            .status(200)
            .json(
                new ApiResponse(200,user,"Avatar image updated successfully")
            );

          });

        const updateUserCoverImage=asyncHandler(async(req,res)=>{

            // req.file comes from multer middleware
            const coverImageLocalPath=req.file?.path;
    
            if(!coverImageLocalPath){
                throw new ApiError(400,"Avatar file is missing");
            }

            const coverImage=await uploadOnCloudinary(coverImageLocalPath);

            if(!coverImage.url){
                throw new ApiError(400,"Avatar file url is missing");
            }

            const user=await User.findByIdAndUpdate(
                req.user?._id,
                {
                    $set:{
                        coverImage:coverImage.url,
                    }
                },
                {new:true},
            ).select("-password");

            return res
            .status(200)
            .json(
                new ApiResponse(200,user,"Cover image updated successfully")
            )
        });

        export {changeCurrentPassword,getCurrentUser, updateAccountDetails,updateUserAvatar,updateUserCoverImage}  

## Lec 16 - Subscription Schema  

Subscription schema :  
subscribers
channels
1 document contains one user/subcriber and the channel they have subscribed
All are users only  
To count no. of subscribers of a channel match the name of channel in all the documents  
To count no. of channels subscribed by an user match the name of subscriber in all documents  

## Lec 17 - Mongodb Aggregation Pipeline  

example -  

2 pipelines  
[
    {
        <!-- for joining -->
        $lookup:{
            from:"authors",
            localField:"author_id",
            foreignField:"_id",
            as:"author_details"
        }
    },
    {
        <!-- adds new fields -->
        $addFields:{
            <!-- new fields -->
            author_details:{
                $first:"$author_details"
                $arrayElemAt:["$author_details",0]
            }
        }
    }
]  
<!-- project is passing this so and so field to next pipeline 
and 1 means true which means we are passing their value -->

- src/controllers/user.controllers.js -  

        // mongodb aggregation pipeline

        const getUserChannelProfile=asyncHandler(async(req,res)=>{
            const {username}=req.params;

            if(!username?.trim()){
                throw new ApiError(400,"username is missing");
            }

            const channel=await User.aggregate([
                {
                    $match:{
                        username: username?.toLowerCase()
                    }
                }, 
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"channel",
                        as:"subscribers"
                    }
                }, // 1st pipeline
                {
                    $lookup:{
                        from:"subscriptions",
                        localField:"_id",
                        foreignField:"subscriber",
                        as:"subscribedTo"
                    }
                }, // 2nd pipeline
                {
                    $addFields:{
                        subscribersCount:{
                            $size:"$subscribers"
                        },
                        channelsSubscribedToCount:{
                            $size:"$subscribedTo"
                        },
                        isSubscribed:{
                            $cond:{
                                if:{$in:[req.user?._id,"subscribers.subscriber"]},
                                then:true,
                                else:false,
                            }
                        }
                    }
                }, // 3rd pipeline
                {
                    $project:{
                        fullName:1,
                        username:1,
                        subscribersCount:1,
                        channelsSubscribedToCount:1,
                        avatar:1,
                        coverImage:1,
                        email:1,
                    }
                } // 4th pipeline
            ]);  

            if(!channel?.length){
                throw new ApiError(404,"Channel does not exist");
            }

            return res
            .status(200)
            .json(
                new ApiResponse(200,channel[0],"User channel fetched successfully")
            );
        });

        export {getUserChannelProfile}  

## Lec 18 - Sub pipelines and routes  

- src/controllers/user.controllers.js -  

        // sub pipeline (not understood)

        const getWatchHistory=asyncHandler(async(req,res)=>{
            const user=await User.aggregate([
                {
                    $match:{
                        _id:new mongoose.Types.ObjectId(req.user._id) // imp
                    }
                },
                {
                    $lookup:{
                        from:"videos",
                        localField:"watchHistory",
                        foreignField:"_id",
                        as:"watchHistory", //
                        pipeline:[
                            {
                               $lookup:{
                                    from:"users",
                                    localField:"owner",
                                    foreignField:"_id",
                                    as:"owner", //
                                    pipeline:[
                                        {
                                            $project:{
                                                fullName:1,
                                                username:1,
                                                avatar:1,
                                            }
                                        },
                                        {
                                            $addFields:{
                                                owner:{
                                                    $first:"$owner"
                                                }
                                            }
                                        }
                                    ]
                               }
                            },
                        ]
                    }
                },
            ]);

            return res
            .status()
            .json(
                new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully")
            );
        });

        export {getWatchHistory}

- src/routes/user.routes.js -  

        // added new routes  

        router
        .route("/change-password")
        .post(verifyJWT,changeCurrentPassword);

        router
        .route("/current-user")
        .get(verifyJWT,getCurrentUser);

        router
        .route("/update-account")
        .patch(verifyJWT,updateAccountDetails);

        router
        .route("/avatar")
        .patch(verifyJWT,upload.single("avatar"),updateUserAvatar);

        router
        .route("/cover-image")
        .patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage); // /-?

        router
        .route("/channel/:username")
        .get(verifyJWT,getUserChannelProfile);

        router
        .route("/history")
        .get(verifyJWT,getWatchHistory);

## Lec 19 - Like and Tweet Models  

- src/models/comment.models.js -  

        import mongoose,{Schema} from "mongoose"
        import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

        const commentSchema=new Schema({
            content:{
                type:String,
                required:true,
            },
            video:{
                type:Schema.Types.ObjectId,
                ref:"Video",
            },
            owner:{
                type:Schema.Types.ObjectId,
                ref:"User",
            }
        },
        {timestamps:true});

        videoSchema.plugin(mongooseAggregatePaginate);

        export const Comment=mongoose.model("Comment",commentSchema);

- src/models/like.models.js -  

        import mongoose,{Schema} from "mongoose"

        const likeSchema=new Schema({
            video:{
                type:Schema.Types.ObjectId,
                ref:"Video",
            },
            comment:{
                type:Schema.Types.ObjectId,
                ref:"Comment",
            },
            tweet:{
                type:Schema.Types.ObjectId,
                ref:"Tweet",
            },
            likedBy:{
                type:Schema.Types.ObjectId,
                ref:"User",
            }
        },
        {timestamps:true});

        export const Like=mongoose.model("Like",likeSchema);

- src/playlist.models.js -  

        import mongoose,{Schema} from "mongoose"

        const playlistSchema=new Schema({
            name:{
                type:String,
                required:true,
            },
            description:{
                type:String,
                required:true,
            },
            videos:[
                {
                    type:Schema.Types.ObjectId,
                    ref:"Video",
                },
            ],
            owner:{
                type:Schema.Types.ObjectId,
                ref:"User",
            }
        },
        {timestamps:true});

        export const Playlist=mongoose.model("Playlist",playlistSchema);

- src/models/tweet.models.js -  

        import mongoose,{Schema} from "mongoose"

        const tweetSchema=new Schema({
            content:{
                type:String,
                required:true,
            },
            owner:{
                type:Schema.Types.ObjectId,
                ref:"User",
            },
        },
        {timestamps:true});

        export const Tweet=mongoose.model("Tweet",tweetSchema);

## Lec 20 - Assignments  

