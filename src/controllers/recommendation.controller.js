import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { LeetcodeStat } from "../models/leetcodeStat.model.js";
import { CodeforcesStat } from "../models/codeforcesStat.model.js";
import { LeetcodeRecommendation } from "../models/leetcodeRecommendation.model.js";
import { CodeforcesRecommendation } from "../models/codeforcesRecommendation.model.js";
import { User } from "../models/user.model.js";






const mlApiBase = process.env.FASTAPI_BASE_URL;


const getLeetcodeUsername = async (userId) => {
    const stat = await LeetcodeStat.findOne({ userId });
    
    if (!stat || !stat.username) {
        throw new ApiError(404, "Please link your LeetCode account first to get recommendations.");
    }
    return stat.username;
}






const getCodeforcesHandle = async (userId) => {
    const stat = await CodeforcesStat.findOne({ userId });
    if (!stat || !stat.handle) {
        throw new ApiError(404, "Please link your Codeforces account first.");
    }
    return stat.handle;
};



const getLeetcodeRecommendations = asyncHandler(async (req, res) => {
    const username = await getLeetcodeUsername(req.user._id);
    const top_k = req.query.top_k || 10
    try {
        const response = await fetch(`${mlApiBase}/api/v1/recommend/${username}?top_k=${top_k}`);
        
        if (!response.ok) {
            throw new ApiError(response.status, "Failed to fetch recommendations from ML engine.");
        }
        
        const data = await response.json();

        await LeetcodeRecommendation.findOneAndUpdate(
            { userId: req.user._id },
            {
                $set: {
                    calibration: data.calibration,
                    recommendations: data.recommendations,
                    masterySnapshot: data.mastery_snapshot
                }
            },
            { new: true, upsert: true }
        );

        await User.findByIdAndUpdate(req.user._id, {
            $set: { lastMLRefreshAt: Date.now() }
        });

       
        return res
            .status(200)
            .json(new ApiResponse(200, data, "Recommendations fetched successfully"));
            
    } catch (error) {
        throw new ApiError(500, error.message || "Error connecting to recommendation service");
    }
});


const getMastery = asyncHandler(async(req, res)=>{
    const username = await getLeetcodeUsername(req.user._id);
    try{
        const response = await fetch(`${mlApiBase}/api/v1/mastery/${username}`);
        if(!response.ok){
            throw new ApiError(response.status, "Failed to fetch mastery data from ML engine.");
        }
        const data = await response.json();
        return res.status(200).json(new ApiResponse(200, data, "Mastery data fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Error connecting to mastery service");
    }
});


const getWeakspots = asyncHandler(async(req, res) => {
    const username = await getLeetcodeUsername(req.user._id);
    try{
        const response = await fetch(`${mlApiBase}/api/v1/weakspots/${username}`);
        if(!response.ok){
            throw new ApiError(response.status, "Failed to fetch weakspots data from ML engine.");
        }
        const data = await response.json();
        return res.status(200).json(new ApiResponse(200, data, "Weakspots data fetched successfully"));
    }
    catch(error){
        throw new ApiError(500, error.message || "Error connecting to weakspots service");
    }
});





const getCfRecommendations = asyncHandler(async(req, res) => {
    const handle = await getCodeforcesHandle(req.user._id);
    
    const response = await fetch(`${mlApiBase}/api/cf/recommend/${handle}`);
    if (!response.ok){
        throw new ApiError(response.status, "Failed to fetch Codeforces recommendations");
    }
    const data = await response.json();

    await CodeforcesRecommendation.findOneAndUpdate(
        { userId: req.user._id },
        {
            $set: {
                recommendations: data.recommendations
            }
        },
        { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { $set: { lastMLRefreshAt: Date.now() } });

    return res.status(200).json(new ApiResponse(200, data, "Codeforces recommendations fetched successfully"));
});

export { getLeetcodeRecommendations, getMastery, getWeakspots, getCfRecommendations };