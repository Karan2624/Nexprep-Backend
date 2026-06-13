import mongoose, { Schema } from "mongoose";

const communityCommentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: "CommunityPost",
        required: true,
        index: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    upvotedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    isAccepted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const CommunityComment = mongoose.model("CommunityComment", communityCommentSchema);