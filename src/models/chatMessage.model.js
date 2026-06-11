import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "StudyGroup",
        required: true,
        index: true 
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null 
    },
    type: {
        type: String,
        enum: ["user", "system"],
        default: "user",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

chatMessageSchema.index({ groupId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);