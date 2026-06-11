import mongoose, { Schema } from "mongoose";

const companyReviewSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },

        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        roleAppliedFor: {
            type: String,
            required: true,
        },

        verdict: {
            type: String,
            enum: ["Offered", "Rejected", "Ghosted"],
            required: true,
        },

        year: {
            type: Number,
            required: true,
        },

        reviewText: {
            type: String,
            required: true,
        },

        topicsAsked: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const CompanyReview = mongoose.model(
    "CompanyReview",
    companyReviewSchema
);