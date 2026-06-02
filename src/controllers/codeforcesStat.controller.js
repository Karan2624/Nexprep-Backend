import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { CodeforcesStat } from "../models/codeforcesStat.model.js";


const fetchCodeforcesUserInfo = async(handle) => {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = response.json();
    if(data.status!=="OK"){
        throw new ApiError(400,"Codeforces handle not found");
    }
    return data.result[0];
}

const fetchCodeforcesContest = async(handle) => {
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const data = response.json();
    if(data.status !== "OK") {
        throw new ApiError(401,"Codeforces handle not found");
    }
    return data.result.map((contest) =>({
        contestId : contest.contestId,
        rank : contest.rank,
        contestName : contest.contestName,
        oldRating : contest.oldRating,
        newRating : contest.newRating,
        contestDate : new Date(contest.ratingUpdateTimeSecond*1000),
    }));
}



const linkCodeforcesHandle = asyncHandler(async(req,res) => {
    const {handle} = req.body;
    if(!handle){
        throw new ApiError(400, "Codeforces Handle is required");
    }
    const existingStat = await CodeforcesStat.findOne({userId : req.user?.user_id});
    if(existingStat){
        throw new ApiError(400, "Codeforces handle already linked");
    }



})