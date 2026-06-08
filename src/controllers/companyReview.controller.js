import { CompanyReview } from "../models/companyReview.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createCompanyReview = asyncHandler(async (req, res) => {
    const {
        companyId,
        roleAppliedFor,
        verdict,
        year,
        reviewText,
        topicsAsked
    } = req.body;

    if (
        !companyId ||
        !roleAppliedFor ||
        !verdict ||
        !year ||
        !reviewText
    ) {
        throw new ApiError(400, "All required fields are missing");
    }

    const review = await CompanyReview.create({
        companyId,
        authorId: req.user._id,
        roleAppliedFor,
        verdict,
        year,
        reviewText,
        topicsAsked
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            review,
            "Review created successfully"
        )
    );
});

export { createCompanyReview };