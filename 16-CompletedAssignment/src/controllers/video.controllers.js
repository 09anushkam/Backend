import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    // Extract query parameters with default values
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId } = req.query;
    
    // Ensure page and limit are numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Create the filter object
    const filter = {};

    if (query) {
        // Use text search for the query parameter
        filter.$text = { $search: query };
    }

    if (userId) {
        // Add userId to the filter if provided
        filter.userId = userId;
    }

    // Determine the sort order
    const sortOrder = sortType === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Fetch videos based on filter, pagination, and sorting
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalVideos / limitNumber);

    // Send the response with videos and pagination info
    res.status(200).json(new ApiResponse(200, {
        videos,
        pagination: {
            totalVideos,
            totalPages,
            currentPage: pageNumber,
            pageSize: limitNumber,
        }
    }, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if([title,description].some((field)=>field.trim()==="")){
        throw new ApiError(400,"Title and description is required");
    }

    // video and thumbnail - multiple files - req.files.filename[0].path
    const videoLocalPath=req.files?.videoFile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;

    if(!(videoLocalPath && thumbnailLocalPath)){
        throw new ApiError(400,"Video and thumbnail is required");
    }

    const video=await uploadOnCloudinary(videoLocalPath);
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);

    if(!(video && thumbnail)){
        throw new ApiError(500,"There was a problem while uploading Video and thumbnail to cloud");
    }

    const uploadedVideo=await Video.create({
        title,
        description,
        thumbnail:thumbnail.url,
        videoFile:video.url,
        duration:video.duration, // new
        owner:ref.user._id, // new (doubt : from where they are getting user)
    });

    if(!uploadedVideo){
        throw new ApiError(500,"There was a problem while uploading video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,uploadedVideo,"Video uploaded successfully")
    );

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    if(!videoId){
        throw new ApiError(400,"Video Id is required");
    }

    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"No video exists with such Id");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video fetched successfully")
    );

});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body;

    if(!videoId){
        throw new ApiError(400,"Video id is required");
    }

    if([title,description].some((field)=>field.trim()==="")){
        throw new ApiError(400,"New title and description is required");
    }

    const thumbnailLocalPath=req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required");
    }

    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail){
        throw new ApiError(500,"There was some while uploading thumbnail");
    }

    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        $set:title,description,thumbnail:thumbnail.url,
    },{
        new:true
    });

    if(!updateVideo){
        throw new ApiError(400,"Video was not uploaded due to some error");
    }
0
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400,"Video id is required");
    }

    const deleteVideo=await Video.findByIdAndDelete(videoId);

    if(!deleteVideo){
        throw new ApiError(500,"There was some issue while deleting the video");
    }

    return res
    .status(200)
    .json(200,{},"Video deleted successfully");
    
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId){
        throw new ApiError(400,"Video id is required");
    }
    const video=await Video.findByIdAndUpdate(videoId,{
        $set:!isPublished,
    },{
        new:true,
    });
    if(!video){
        throw new ApiError(400,"Video was not updated");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video was updated")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
