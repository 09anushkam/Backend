import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Video id is required");
    }

    const LikeExists=await Like.findOne({
        $set:{
            video:videoId,
            likedBy:req.user._id,
        }
    });

    if(LikeExists){
        const removeLike=await Like.findByIdAndDelete(LikeExists._id);

        if(!removeLike){
            throw new ApiError(500,"There was some error while unliking the video");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Unliked Video successfully")
        );
    }

    const AddLike=await Like.create({
        video:videoId,
        likedBy:req.user._id,
    });

    if(!AddLike){
        throw new ApiError(500,"There was some error while liking the video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Liked Video successfully")
    );

});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId){
        throw new ApiError(400,"Comment id is required");
    }

    const LikeExists=await Like.findOne({
        $set:{
            comment:commentId,
            likedBy:req.user._id,
        }
    });

    if(LikeExists){
        const removeLike=await Like.findByIdAndDelete(Like._id);

        if(!removeLike){
            throw new ApiError(500,"There was some error while unliking the comment");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Unliked Comment successfully")
        );
    }

    const AddLike=await Like.create({
        comment:commentId,
        likedBy:req.user._id,
    });

    if(!AddLike){
        throw new ApiError(500,"There was some error while liking the comment");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Liked Comment Sucessfully")
    );

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!tweetId){
        throw new ApiError(400,"Tweet id is required");
    }

    const LikeExists=await Like.findOne({
        $set:{
            tweet:tweetId,
            likedBy:req.user._id,
        }
    });

    if(LikeExists){
        const removeLike=await Like.findByIdAndDelete(LikeExists);

        if(!removeLike){
            throw new ApiError(500,"There was some issue while unliking the tweet");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Unliked tweet successfully")
        );
    }

    const AddLike=await Like.create({
        tweetId:tweetId,
        likedBy:req.user._id,
    });

    if(!AddLike){
        throw new ApiError(500,"There was some issue while liking the tweet");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Liked Tweet Successfully")
    );

});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const AllLikes=await Like.find({
        likedBy:req.user._id,
        video:{$exists}, // not understood
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200,AllLikes,"Liked Video were uploaded successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}