import mongoose, { Schema } from "mongoose";

const codeforcesStat = new Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
        index : true
    },
    handle : {
        type : String,
        required: true,
        trim: true,
        lowercase : true
    },
    rating : {
        type  : Number,
        default: 0
    },
    maxRating : {
        type : Number,
        default: 0
    },
    rank : {
        type : String,
        default: "unrated"
    },
    maxRank : {
        type : String,
        default: "unrated"
    },
    totalQuestionSolved : {
        type : Number,
        default : 0
    },
    solvedByProblemRating : {
        type : Map,
        of : Number,
        default: {}
    },
    topicBreakdown : {
        type : Map,
        of : Number,
        default: {}
    },
    contestHistory : [
        {
            contestId : {
                type : Number
            },
            contestName : {
                type : String
            },
            rank : {
                type : Number
            },
            oldRating : {
                type : Number
            },
            newRating : {
                type : Number
            },
            contestDate: {
                type: Date
            }

        }
    ],
    lastSyncedAt : {
        type  : Date,
        default : Date.now
    }

},{timestamps : true});

export const CodeforcesStat = mongoose.model("CodeforcesStat",codeforcesStat);