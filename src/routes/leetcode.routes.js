import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    linkLeetcodeHandle,
    syncLeetcodeStat,
    getLeetcodeStat,
} from "../controllers/leetcodeStat.controller.js";

const router = Router();

router.route("/")
.post(verifyJWT, linkLeetcodeHandle)
.get(verifyJWT, getLeetcodeStat);

router.route("/sync")
.post(verifyJWT, syncLeetcodeStat);

export default router;