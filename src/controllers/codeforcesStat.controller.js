import { response } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CodeforcesStat } from "../models/codeforcesStat.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


const fetchCodeforcesUserInfo = async(handle) => {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();
    if(data.status!=="OK"){
        throw new ApiError(400,"Codeforces handle not found");
    }
    return data.result[0];
}

const fetchCodeforcesContest = async(handle) => {
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const data = await response.json();
    if(data.status !== "OK") {
        throw new ApiError(401,"Codeforces handle not found");
    }
    return data.result.map((contest) =>({
        contestId : contest.contestId,
        rank : contest.rank,
        contestName : contest.contestName,
        oldRating : contest.oldRating,
        newRating : contest.newRating,
        contestDate : new Date(contest.ratingUpdateTimeSeconds*1000),
    }));
}

const fetchCodeforcesMetrics = async(handle) => {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await response.json();
    const solvedProblems = new Set();
    const solvedByProblemRating = {};
    const topicBreakdown = {};

    if(data.status==="OK"){
        data.result.forEach(submission => {
        if(submission.verdict==="OK"){
            const problemId = `${submission.problem?.contestId}-${submission.problem?.index}`;
            if(!solvedProblems.has(problemId)){
                solvedProblems.add(problemId);
                if(submission.problem?.rating){
                    const ratingStr = submission.problem.rating.toString();
                    solvedByProblemRating[ratingStr] = (solvedByProblemRating[ratingStr] || 0) + 1;
                }
                if(submission.problem?.tags && submission.problem.tags.length>0){
                    submission.problem.tags.forEach(tag => {
                        topicBreakdown[tag] = (topicBreakdown[tag] || 0) + 1;
                    });
                }
            }

           
        }
    });
    }

    return {
        totalQuestionSolved : solvedProblems.size,
        topicBreakdown,
        solvedByProblemRating
    };

}



const linkCodeforcesHandle = asyncHandler(async(req,res) => {
    const {handle} = req.body;
    if(!handle){
        throw new ApiError(400, "Codeforces Handle is required");
    }
    const existingStat = await CodeforcesStat.findOne({userId : req.user?._id});
    if(existingStat){
        throw new ApiError(400, "Codeforces handle already linked");
    }

    try{
        const [userInfo,contestHistory,metrics] = await Promise.all([
            fetchCodeforcesUserInfo(handle),
            fetchCodeforcesContest(handle),
            fetchCodeforcesMetrics(handle)
        ]);

        const newStat = await CodeforcesStat.create({
            userId : req.user?._id,
            handle : handle,
            rating : userInfo.rating || 0,
            maxRating : userInfo.maxRating || 0,
            rank : userInfo.rank || "unrated",
            maxRank : userInfo.maxRank || "unrated",
            totalQuestionSolved : metrics.totalQuestionSolved,
            solvedByProblemRating : metrics.solvedByProblemRating,
            topicBreakdown : metrics.topicBreakdown,
            contestHistory

        })
         return res
        .status(201)
        .json(
            new ApiResponse(200,newStat,"Codeforces id successfully linked")
        );

    } catch(err){
        throw new ApiError(500,err.message || "Failed to connect with codeforces API");
    }

   


})

const syncCodeforcesStat = asyncHandler(async(req,res) => {
    const stat = await CodeforcesStat.findOne({userId : req.user?._id});
    if(!stat) {
        throw new ApiError(404,"No codeforces profile linked, please link it");
    }

    const oneHour = 3600000;
    const timeSinceLastSync = Date.now() - stat.lastSyncedAt;
    if (timeSinceLastSync < oneHour) {
        const minutesLeft = Math.ceil((oneHour - timeSinceLastSync) / 60000);
        throw new ApiError(429, `Please wait ${minutesLeft} minutes before syncing again.`);
    }
        try{
        const [userInfo,contestHistory,metrics] = await Promise.all([
            fetchCodeforcesUserInfo(stat.handle),
            fetchCodeforcesContest(stat.handle),
            fetchCodeforcesMetrics(stat.handle)
        ]);

      
        stat.userId = req.user?._id;
        stat.rating = userInfo.rating || 0;
        stat.maxRating = userInfo.maxRating || 0;
        stat.rank = userInfo.rank || "unrated";
        stat.maxRank = userInfo.maxRank || "unrated";
        stat.totalQuestionSolved = metrics.totalQuestionSolved;
        stat.solvedByProblemRating = metrics.solvedByProblemRating;
        stat.topicBreakdown = metrics.topicBreakdown;
        stat.contestHistory = contestHistory;
        stat.lastSyncedAt = Date.now();
        await stat.save();


    } catch(err){
        throw new ApiError(500,err.message || "Failed to connect with codeforces API");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,stat,"Codeforces stat synced successfully")
    );
})

const getCodeforcesStat = asyncHandler(async (req, res) => {
    const stat = await CodeforcesStat.findOne({ userId: req.user._id });
    if (!stat) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No Codeforces account linked yet"));
    }
    return res
        .status(200)
        .json(new ApiResponse(200, stat, "Codeforces stats fetched successfully"));
});

export { linkCodeforcesHandle, syncCodeforcesStat, getCodeforcesStat };
