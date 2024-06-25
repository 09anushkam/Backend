import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if([name,description].some(field=>field.trim()==="")){
        throw new ApiError(400,"name and description is required");
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id,
    });

    if(!playlist){
        throw new ApiError(400,"There was some error while creating the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist was created successfully")
    );

});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"User id is required");
    }

    const playlist=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"owner",
                            }
                        }
                    },
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"owner",
                }
            }
        },
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    
    const playlist=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner"
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"owner"
                            }
                        }
                    }
                ]
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"owner"
                }
            }
        }
    ]);

    if(!playlist)
        {
            throw new ApiError(400,"Playlist not found")
        }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Play list is returned successfully")
    );

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(playlistId&&videoId)){
        throw new ApiError(400,"Playlist id and Video id is required");
    }

    const playlist=await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist was not found");
    }

    playlist.videos.push(new mongoose.Types.ObjectId(videoId)); // new

    const updatedPlaylist=await playlist.save({validateBeforeSave: false});

    if(!updatedPlaylist){
        throw new ApiError(400,"There was a problem while updating the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Video was added to Playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    // TODO: remove video from playlist

    if(!(playlistId&&videoId)){
        throw new ApiError(400,"The playlist id and video id is required");
    }

    const playlist=await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    playlist.videos=playlist.videos.filter(item=>item._id!==videoId); // videos with different id (other than selected one) will remain

    const updatedPlaylist=await playlist.save({validateBeforeSave:false});

    if(!updatedPlaylist){
        throw new ApiError(400,"There was some issue while removing videos from playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Removed Video from Playlist successfully")
    );

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Playlist id is required");
    }
    
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist){
        throw new ApiError(400,"There was some issue while deleting the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Playlist deleted successfully")
    );

});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId){
        throw new ApiError(400,"playlist id is required");
    }

    if([name,description].some(field=>field.trim()==="")){
        throw new ApiError(400,"Name and description is required");
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate({
        name,description
    });

    if(!updatedPlaylist){
        throw new ApiError(400,"There was some error while updating playlist");
    }

    return res
    .status()
    .json(
        new ApiResponse(200,updatedPlaylist,"Playlist updated successfully")
    );

});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
