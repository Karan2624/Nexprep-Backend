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
        type  : Number
    },
    maxRating : {
        type : Number
    },
    totalQuestionSolved : {
        type : Number
    },
    solvedByProblemRating : {
        type : Map,
        of : Number
    },
    topicBreakdown : {
        type : Map,
        of : Number
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
    ]

},{timestamps : true});

export const CodeforcesStat = mongoose.model("CodeforcesStat",codeforcesStat);