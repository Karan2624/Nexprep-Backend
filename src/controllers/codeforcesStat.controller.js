import { response } from "express";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
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
        contestDate : new Date(contest.ratingUpdateTimeSecond*1000),
    }));
}

const fetchCodeforcesMetrics = async(handle) => {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await response.json();
    const solvedProblems = new Set();
    const solvedByProblemRating = {};
    const topicBreakdown = {};

    data.result.forEach(submission => {
        if(submission.verdict==="OK"){
            const problemId = `${submission.problem?.contestId}-${submission.problem?.index}`;
            if(!solvedProblems.has(problemId)){
                solvedProblems.add(problemId);
            }

            if(submission.problem?.rating){
                const ratingStr = submission.problem.rating.toString();
                solvedByProblemRating[ratingStr] = (solvedByProblemRating[ratingStr] || 0) + 1;
            }
            if(submission.problem?.tags && submission.problem.tags.length>0){
                submission.problem.tags.forEach(tag => {
                    topicBreakdown[tags] = (topicBreakdown[tags] || 0) + 1;
                });
            }
        }
    });

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
    const existingStat = await CodeforcesStat.findOne({userId : req.user?.user_id});
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
    } catch(err){
        throw new ApiError(500,err.message || "Failed to connect with codeforces API");
    }

    return res
    .satus(201)
    .json(
        new ApiResponse(200,newStat,"Codeforces id successfully linked")
    );



})

export {linkCodeforcesHandle};