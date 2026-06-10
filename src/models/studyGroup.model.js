import mongoose, { Schema } from "mongoose";

const studyGroupSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    topic: {
        type: String,
        required: true
    },
    pinnedMessage: {
        type: String,
        default: null
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

export const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);