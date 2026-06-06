import mongoose, { Schema } from "mongoose";

const leetcodeStat = new Schema({

    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
        index : true
    },

    username : {
        type : String,
        required : true
    },

    totalSolved : {
        type : Number,
        default : 0
    },

    easySolved : {
        type : Number,
        default : 0
    },

    mediumSolved : {
        type : Number,
        default : 0
    },

    hardSolved : {
        type : Number,
        default : 0
    },

    contestRating : {
        type : Number,
        default : 0
    },

    contestGlobalRanking : {
        type : Number,
        default : 0
    },

    topicBreakdown : {
        type : Map,
        of : Number,
        default : {}
    },

    contestParticipation: [
        {
            attended: Boolean,
            rating: Number,
            ranking: Number,
            trendDirection: String,
            problemsSolved: Number,
            totalProblems: Number,
            finishTimeInSeconds: Number,

            contestTitle: String,

            contestDate: Date
        }
    ],

    lastSyncedAt : {
        type : Date,
        default : Date.now
    }

}, { timestamps : true });

export const LeetcodeStat = mongoose.model(
    "LeetcodeStat",
    leetcodeStat
);