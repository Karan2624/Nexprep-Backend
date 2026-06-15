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
const getAllCompanyReviews = asyncHandler(async (req, res) => {
    const reviews = await CompanyReview.find();

    return res.status(200).json(
        new ApiResponse(
            200,
            reviews,
            "All reviews fetched successfully"
        )
    );
});
const getCompanyReviewById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await CompanyReview.findById(id);

    if (!review) {
        throw new ApiError(
            404,
            "Review not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            review,
            "Review fetched successfully"
        )
    );
});

export {
    createCompanyReview,
    getAllCompanyReviews,
    getCompanyReviewById
};