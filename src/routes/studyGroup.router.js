import { Router } from "express";
import { getAllStudyGroups, joinGroup, leaveGroup } from "../controllers/studyGroup.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(verifyJWT,getAllStudyGroups);
router.route("/join/:groupId").post(verifyJWT,joinGroup);
router.route("/leave/:groupId").post(verifyJWT,leaveGroup);

export default router;