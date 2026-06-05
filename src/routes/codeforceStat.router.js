import { Router } from "express";
import { CodeforcesStat } from "../models/codeforcesStat.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { linkCodeforcesHandle, syncCodeforcesStat } from "../controllers/codeforcesStat.controller.js";

const router = Router();

router.route("/link-codeforces").post(verifyJWT,linkCodeforcesHandle);
router.route("/sync-codeforces").post(verifyJWT,syncCodeforcesStat);

export default router;