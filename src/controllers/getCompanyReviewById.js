const getCompanyReviewById = asyncHandler(async (req, res) => {
    // your existing code
});

const getReviewsByCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const reviews = await CompanyReview.find({ companyId })
        .populate("authorId", "name username avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            reviews,
            "Company reviews fetched successfully"
        )
    );
});

export {
    createCompanyReview,
    getAllCompanyReviews,
    getCompanyReviewById,
    getReviewsByCompany
};