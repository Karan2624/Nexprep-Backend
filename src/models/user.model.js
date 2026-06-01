import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },
    username : {
        type :String,
        lowercase : true,
        required : true,
        unique : true,
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
    },
    password : {
        type : String,
        required :[ true,"Password is required"],
    
    },
    avatar : {
        type : String,
    },
    leetcodeProfileId : {
        type : Schema.Types.ObjectId,
        ref : "LeetcodeStats",
    },
    codeforcesProfileId : {
        type : Schema.Types.ObjectId,
        ref  : "CodeforcesStats"
    },
    combinedLeaderboardScore : {
        type : Number,
        default : 0
    },
    currentStreak :
    {
        type : Number,
        default : 0,
    },
    longestStreak : {
        type : Number,
        default : 0
    },
    activityHeatmap :{
        type : Map,
        of : new Schema ({

        leetcodeSubmissions : {
            type : Number,
            default : 0
        },
        codeforcesSubmission : {
            type : Number ,
            default : 0
        },
        appTasks : {
            type : Number,
            default : 0
        },
        total : {
            type : Number,
            default : 0,
        }
        
        },{_id : false})
    },
    lastMLRefreshAt : {
        type : Date,
    },
    refreshToken : {
        type : String
    },
    isActive : {
        type : Boolean,
        default : true,
    }
},{timestamps : true});

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash (this.password,10);

})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            name : this.name,
            username : this.username,
            email : this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY,
        }

    )
};
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY,
        }

    )
}



export const User = mongoose.model("User",userSchema);
