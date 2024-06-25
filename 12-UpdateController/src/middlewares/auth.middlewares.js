import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"

// verifyToken - Authorization - to get all info of user using token before user logout and save it for future reference
export const verifyJWT=asyncHandler(async(req,res,next)=>{

    try {
        // cookie(error)->cookies
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
        throw new ApiError(401,error?.message||"Invalid access token"); //
    }
});