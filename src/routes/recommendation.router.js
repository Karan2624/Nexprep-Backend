import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLeetcodeRecommendations, getMastery, getWeakspots, getCfRecommendations } from "../controllers/recommendation.controller.js";

const router = Router();


router.use(verifyJWT);

router.route("/leetcode").get(getLeetcodeRecommendations);
router.route("/leetcode/mastery").get(getMastery);
router.route("/leetcode/weakspots").get(getWeakspots);

router.route("/codeforces").get(getCfRecommendations);

export default router;