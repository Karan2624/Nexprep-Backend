import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true 
    },
    type: { 
        type: String, 
        enum: ["reply", "system", "task"],
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    linkUrl: { 
        type: String, 
        default: "" 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true }); 

export const Notification = mongoose.model("Notification", notificationSchema);