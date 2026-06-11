import { Router } from "express";
import { createPost } from "../controllers/communityPost.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-post").post(verifyJWT,createPost);

export default router;