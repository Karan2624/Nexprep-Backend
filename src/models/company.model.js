import mongoose, { mongo, Schema } from "mongoose";

const companySchema = new Schema({
    name : {
        type : String,
        required : true
    },
    normalizedName : {
        type : String,
        unique : true,
        required : true
    },
    logo : {
        type : String
    }

},{timestamps : true});

export const Company  = mongoose.model("Company",companySchema);