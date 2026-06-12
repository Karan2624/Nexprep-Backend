import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById, toggleResolved, toggleUpvote, updatePost } from "../controllers/communityPost.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-post").post(verifyJWT,createPost);
router.route("/get-all-post").get(verifyJWT,getAllPosts);
router.route("/get-post/:postId").get(verifyJWT,getPostById);
router.route("/update-post/:postId").patch(verifyJWT,updatePost);
router.route("/delete-post/:postId").delete(verifyJWT,deletePost);
router.route("/upvote/:postId").patch(verifyJWT,toggleUpvote);
router.route("/resolve/:postId").patch(verifyJWT,toggleResolved);

export default router;