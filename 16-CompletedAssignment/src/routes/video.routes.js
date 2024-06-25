import { Router } from "express";
import {
    getAllVideos,
    getVideoById,
    publishAVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

const router=Router();

router.use(verifyJWT);

router
.route("/")
.get(getAllVideos)
.post(upload.fields([
    {
        name:"VideoFile",
        maxCount:1,
    },
    {
        name:"thumbnail",
        maxCount:1,
    }
]),publishAVideo);

router
.route("/:videoId")
.get(getVideoById)
.patch(upload.single("thumbnail"),updateVideo) // doubt - why we r not uploading video here
.delete(deleteVideo);

router
.route("/toggle/publish/:videoId")
.patch(togglePublishStatus);

export default router;