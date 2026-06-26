import mongoose, { Schema } from "mongoose";

const leetcodeRecommendationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        calibration: {
            type: Schema.Types.Mixed, 
        },
        recommendations: {
            type: [Schema.Types.Mixed], 
            default: [],
        },
        masterySnapshot: {
            type: Schema.Types.Mixed,
        }
    },
    { timestamps: true }
);

export const LeetcodeRecommendation = mongoose.model("LeetcodeRecommendation", leetcodeRecommendationSchema);