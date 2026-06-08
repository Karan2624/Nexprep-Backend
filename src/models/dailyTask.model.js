import mongoose, { Schema } from "mongoose";

const dailyTaskSchema = new Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    title : {
        type : String,
        required : true,
        trim : true
    },
    type : {
        type : String,
        enum : ["Coding","Academic","Project"],
        required : true,
    },
    priority : {
        type : String,
        enum : ["Low","Medium","High"],
        default : "Medium",
    },
    isCompleted : {
        type : Boolean,
        default : false
    },
    targetDate : {
        type : Date,
        required : true,
        index : true,
        default : Date.now
    },
    estimatedMinutes: {
        type: Number,
        default: 0
    },
    timeSpentMinutes: {
        type: Number,
        default: 0
    },
    linkedPyqId : {
        type : Schema.Types.ObjectId,
        ref : "CompanyPyq",
        default : null

    }
},{timestamps : true});

export const DailyTask = mongoose.model("DailyTask",dailyTaskSchema);