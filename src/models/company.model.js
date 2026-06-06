import mongoose, { mongo, Schema } from "mongoose";

const companySchema = new Schema({
    name : {
        type : String,
        required : true
    },
    normalizedName : {
        type : String,
        unique : true,

        lowercase : true
    },
    logo : {
        type : String,
        default : null
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
    }

},{timestamps : true});

companySchema.pre("save", function(next){
    if(!this.name){
        return next();
    }
    this.normalizedName = this.name.trim().toLowerCase();

})

export const Company  = mongoose.model("Company",companySchema);