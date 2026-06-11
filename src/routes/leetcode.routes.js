import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    linkLeetcodeHandle,
    syncLeetcodeStat
} from "../controllers/leetcodeStat.controller.js";

const router = Router();

router.route("/link-leetcode")
.post(verifyJWT, linkLeetcodeHandle);

router.route("/sync-leetcode")
.post(verifyJWT, syncLeetcodeStat);

export default router;