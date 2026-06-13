import { Router } from "express"
import { acceptComment, addComment, deleteComment, getPostComments, toggleCommentUpvote, updateComment } from "../controllers/communityComment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:postId/add-comment").post(verifyJWT,addComment);
router.route("/:postId/get-comment").get(verifyJWT,getPostComments);
router.route("/update/:commentId").patch(verifyJWT,updateComment);
router.route("/delete/:commentId").delete(verifyJWT,deleteComment);
router.route("/toggle-upvote/:commentId").post(verifyJWT,toggleCommentUpvote);
router.route("/toggle-accept/:commentId").patch(verifyJWT,acceptComment);
export default router;