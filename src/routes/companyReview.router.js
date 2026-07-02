import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCompanyReview, getAllCompanyReviews, getCompanyReviewById } from "../controllers/companyReview.controller.js";

const router = Router();

router.route("/")
.post(verifyJWT, createCompanyReview)
.get(getAllCompanyReviews);
router.route("/:id")
.get(getCompanyReviewById);


export default router;