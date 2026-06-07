import mongoose, { Schema } from "mongoose";

const companyPyqSchema = new Schema({
    companyId : {
        type : Schema.Types.ObjectId,
        ref : "Company"
    },
    authorId : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true,
    },
    difficulty : {
        type : String,
        enum : ["Easy","Medium","Hard"],
        required : true
    },
    yearAsked : {
        type : int 
    },
    tags : [
        {
            type : String,
        }
    ],
    sampleTest : [
        {
            input : {
                type : String,
            },
            output : {
                type : String,
            },
            explanation : {
                type : String,
            }
        }
    ]

},{timestamps : true});

export const CompanyPyq = mongoose.model("CompanyPyq",companyPyqSchema);