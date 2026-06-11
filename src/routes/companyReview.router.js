import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCompanyReview } from "../controllers/companyReview.controller.js";

const router = Router();

router.route("/")
.post(verifyJWT, createCompanyReview);

export default router;