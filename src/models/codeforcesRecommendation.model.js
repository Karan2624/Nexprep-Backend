import mongoose, { Schema } from "mongoose";

const codeforcesRecommendationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recommendations: {
            type: [Schema.Types.Mixed],
            default: [],
        },
        cfProfile: {
            type: Schema.Types.Mixed, 
        }
    },
    { timestamps: true }
);

export const CodeforcesRecommendation = mongoose.model("CodeforcesRecommendation", codeforcesRecommendationSchema);