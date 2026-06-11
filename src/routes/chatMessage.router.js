import { Router } from "express";
import { deleteMessage, getGroupMessages, sendMessage, updateMessage } from "../controllers/chatMessage.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:groupId/send-message").post(verifyJWT,sendMessage);
router.route("/:groupId/message").get(verifyJWT,getGroupMessages);
router.route("/update/:messageId").patch(verifyJWT,updateMessage);
router.route("/delete/:messageId").delete(verifyJWT,deleteMessage);



export default router;