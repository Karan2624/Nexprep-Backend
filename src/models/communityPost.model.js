import mongoose, { Schema } from "mongoose";

const communityPostSchema = new Schema({
    authorId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    tags: [{ 
        type: String, 
        trim: true 
    }],
    upvotedBy: [{ 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    }],
    isResolved: { 
        type: Boolean, 
        default: false 
    },
    replyCount: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

export const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);