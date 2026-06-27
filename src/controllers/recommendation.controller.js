import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { LeetcodeStat } from "../models/leetcodeStat.model.js";
import { CodeforcesStat } from "../models/codeforcesStat.model.js";
import { LeetcodeRecommendation } from "../models/leetcodeRecommendation.model.js";
import { CodeforcesRecommendation } from "../models/codeforcesRecommendation.model.js";
import { User } from "../models/user.model.js";

const mlApiBase = process.env.FASTAPI_BASE_URL;
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;

const getLeetcodeUsername = async (userId) => {
    const stat = await LeetcodeStat.findOne({ userId });
    
    if (!stat || !stat.username) {
        throw new ApiError(404, "Please link your LeetCode account first to get recommendations.");
    }
    return stat.username;
};

const getCodeforcesHandle = async (userId) => {
    const stat = await CodeforcesStat.findOne({ userId });
    if (!stat || !stat.handle) {
        throw new ApiError(404, "Please link your Codeforces account first.");
    }
    return stat.handle;
};

const getLeetcodeRecommendations = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const lastRefresh = user.lastLcRefreshAt ? new Date(user.lastLcRefreshAt).getTime() : 0;
    const timeSinceLastRefresh = Date.now() - lastRefresh;

    if (timeSinceLastRefresh < CACHE_DURATION_MS) {
        const cachedData = await LeetcodeRecommendation.findOne({ userId: req.user._id });
        if (cachedData) {
            return res.status(200).json(new ApiResponse(200, cachedData, "Recommendations served from cache"));
        }
    }

    const username = await getLeetcodeUsername(req.user._id);
    const top_k = req.query.top_k || 10;
    
    try {
        const response = await fetch(`${mlApiBase}/api/v1/recommend/${username}?top_k=${top_k}`);
        
        if (!response.ok) {
            throw new Error("FastAPI response not ok");
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
            { returnDocument: "after", upsert: true }
        );

        await User.findByIdAndUpdate(req.user._id, {
            $set: { lastLcRefreshAt: Date.now() }
        });

        return res.status(200).json(new ApiResponse(200, data, "Recommendations fetched successfully"));
            
    } catch (error) {
        const cachedData = await LeetcodeRecommendation.findOne({ userId: req.user._id });
        if (cachedData) {
            return res.status(200).json(new ApiResponse(200, cachedData, "Served old recommendations due to API error"));
        }
        throw new ApiError(500, "Error connecting to recommendation service and no cached data found");
    }
});

const getWeakspots = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    const lastRefresh = user.lastWeakspotsRefreshAt ? new Date(user.lastWeakspotsRefreshAt).getTime() : 0;
    const timeSinceLastRefresh = Date.now() - lastRefresh;

    if (timeSinceLastRefresh < CACHE_DURATION_MS) {
        const cachedData = await LeetcodeRecommendation.findOne({ userId: req.user._id });

        if (cachedData && cachedData.weakspotsData) {
            return res.status(200).json(new ApiResponse(200, cachedData.weakspotsData, "Weakspots data served from cache"));
        }
    }

    const username = await getLeetcodeUsername(req.user._id);
    
    try {
        const response = await fetch(`${mlApiBase}/api/v1/weakspots/${username}`);
        if (!response.ok) {
            throw new Error("FastAPI response not ok");
        }
        const data = await response.json();

        await LeetcodeRecommendation.findOneAndUpdate(
            { userId: req.user._id },
            { $set: { weakspotsData: data } },
            { returnDocument: "after", upsert: true }
        );

        await User.findByIdAndUpdate(req.user._id, {
            $set: { lastWeakspotsRefreshAt: Date.now() }
        });

        return res.status(200).json(new ApiResponse(200, data, "Weakspots data fetched and saved successfully"));
    } catch(error) {
        const cachedData = await LeetcodeRecommendation.findOne({ userId: req.user._id });
        if (cachedData && cachedData.weakspotsData) {
            return res.status(200).json(new ApiResponse(200, cachedData.weakspotsData, "Served old weakspots data due to API error"));
        }
        throw new ApiError(500, "Error connecting to weakspots service and no cached data found");
    }
});

const getCfRecommendations = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    const lastRefresh = user.lastCfRefreshAt ? new Date(user.lastCfRefreshAt).getTime() : 0;
    const timeSinceLastRefresh = Date.now() - lastRefresh;

    if (timeSinceLastRefresh < CACHE_DURATION_MS) {
        const cachedData = await CodeforcesRecommendation.findOne({ userId: req.user._id });
        if (cachedData && cachedData.recommendations && cachedData.recommendations.length > 0) {
            return res.status(200).json(new ApiResponse(200, cachedData, "Codeforces recommendations served from cache"));
        }
    }

    const handle = await getCodeforcesHandle(req.user._id);
    
    try {
        const response = await fetch(`${mlApiBase}/api/cf/recommend/${handle}`);
        if (!response.ok) {
            throw new Error("FastAPI response not ok");
        }
        const data = await response.json();

        await CodeforcesRecommendation.findOneAndUpdate(
            { userId: req.user._id },
            {
                $set: {
                    recommendations: data.recommendations,
                }
            },
            { returnDocument: "after", upsert: true }
        );

        await User.findByIdAndUpdate(req.user._id, { 
            $set: { lastCfRefreshAt: Date.now() } 
        });
        
        return res.status(200).json(new ApiResponse(200, data, "Codeforces recommendations fetched successfully"));
    } catch (error) {
        const cachedData = await CodeforcesRecommendation.findOne({ userId: req.user._id });
        if (cachedData && cachedData.recommendations && cachedData.recommendations.length > 0) {
            return res.status(200).json(new ApiResponse(200, cachedData, "Served old Codeforces recommendations due to API error"));
        }
        throw new ApiError(500, "Error connecting to Codeforces recommendation service and no cached data found");
    }
});

const getCfProfile = asyncHandler(async(req,res) => {
    const user = await User.findById(req.user._id);
    const lastRefresh = user.lastCfProfileRefreshAt ? new Date(user.lastCfProfileRefreshAt).getTime() : 0;
    const timeSinceLastRefresh = Date.now() - lastRefresh;

    if (timeSinceLastRefresh < CACHE_DURATION_MS) {
        const cachedData = await CodeforcesRecommendation.findOne({ userId: req.user._id });
        if (cachedData && cachedData.cfProfile) {
            return res.status(200).json(new ApiResponse(200, cachedData.cfProfile, "Codeforces profile served from cache"));
        }
    }

    const handle = await getCodeforcesHandle(req.user._id);
    
    try {
        const response = await fetch(`${mlApiBase}/api/cf/profile/${handle}`);
        if (!response.ok) {
            throw new Error("FastAPI response not ok");
        }
        const data = await response.json();

        await CodeforcesRecommendation.findOneAndUpdate(
            { userId: req.user._id },
            {
                $set: {
                    cfProfile: data,
                }
            },
            { returnDocument: "after", upsert: true }
        );

        await User.findByIdAndUpdate(req.user._id, { 
            $set: { lastCfProfileRefreshAt: Date.now() } 
        });

        return res.status(200).json(new ApiResponse(200, data, "Codeforces profile fetched successfully"));
    } catch (error) {
        const cachedData = await CodeforcesRecommendation.findOne({ userId: req.user._id });
        if (cachedData && cachedData.cfProfile) {
            return res.status(200).json(new ApiResponse(200, cachedData.cfProfile, "Served old Codeforces profile due to API error"));
        }
        throw new ApiError(500, "Error connecting to Codeforces profile service and no cached data found");
    }
});

export { getLeetcodeRecommendations, getWeakspots, getCfRecommendations, getCfProfile };