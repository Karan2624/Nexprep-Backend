import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { LeetcodeStat } from "../models/leetcodeStat.model.js";

const fetchLeetcodeProfile = async (username) => {
    const response = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}`
    );

    const data = await response.json();

    if (!data || data.username === undefined) {
        throw new ApiError(400, "Leetcode username not found");
    }

    return data;
};
const fetchLeetcodeSkill = async (username) => {
    const response = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}/skill`
    );

    return await response.json();
};
const fetchLeetcodeSolved = async (username) => {
    const response = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}/solved`
    );

    return await response.json();
};

const fetchLeetcodeContest = async (username) => {
    const response = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}/contest`
    );

    return await response.json();
};
const getTopicBreakdown = (skill) => {
    const topicMap = new Map();

    const allTopics = [
        ...(skill.fundamental || []),
        ...(skill.intermediate || []),
        ...(skill.advanced || []),
    ];

    allTopics.forEach((topic) => {
        topicMap.set(
            topic.tagName,
            topic.problemsSolved
        );
    });

    return Object.fromEntries(topicMap);
};



const linkLeetcodeHandle = asyncHandler(async (req, res) => {
    const { username } = req.body;

    if (!username) {
        throw new ApiError(400, "Leetcode username is required");
    }

    const existingStat = await LeetcodeStat.findOne({
        userId: req.user?._id,
    });

    if (existingStat) {
        throw new ApiError(
            400,
            "Leetcode account already linked"
        );
    }

    try {
        const [profile, solved, contest, skill] = await Promise.all([
            fetchLeetcodeProfile(username),
            fetchLeetcodeSolved(username),
            fetchLeetcodeContest(username),
            fetchLeetcodeSkill(username),
        ]);
        const topicBreakdown = getTopicBreakdown(skill);
        const contestParticipation =
    (contest.contestParticipation || []).map(
        (item) => ({
            attended: item.attended,
            rating: item.rating,
            ranking: item.ranking,
            trendDirection:
                item.trendDirection,
            problemsSolved:
                item.problemsSolved,
            totalProblems:
                item.totalProblems,
            finishTimeInSeconds:
                item.finishTimeInSeconds,

            contestTitle:
                item.contest?.title,

            contestDate: new Date(
                item.startTime * 1000
            ),
        })
    );
        
        console.log("SKILL DATA:");
        console.log(JSON.stringify(skill, null, 2));

        const newStat = await LeetcodeStat.create({
            userId: req.user?._id,
            username,
        
            totalSolved: solved.solvedProblem || 0,
            easySolved: solved.easySolved || 0,
            mediumSolved: solved.mediumSolved || 0,
            hardSolved: solved.hardSolved || 0,
        
            ranking: profile.ranking || 0,
            reputation: profile.reputation || 0,
        
            contestRating: contest.contestRating || 0,
            contestGlobalRanking:
            contest.contestGlobalRanking || 0,

            topicBreakdown,
            contestParticipation,
        });
        return res.status(201).json(
            new ApiResponse(
                200,
                newStat,
                "Leetcode account linked successfully"
            )
        );
    } catch (error) {
        throw new ApiError(
            500,
            error.message ||
                "Failed to connect with Leetcode API"
        );
    }
});

const syncLeetcodeStat = asyncHandler(async (req, res) => {
    const stat = await LeetcodeStat.findOne({
        userId: req.user?._id,
    });

    if (!stat) {
        throw new ApiError(
            404,
            "No linked Leetcode account found"
        );
    }

    const oneHour = 3600000;
    const timeSinceLastSync =
        Date.now() - stat.lastSyncedAt;

    if (timeSinceLastSync < oneHour) {
        const minutesLeft = Math.ceil(
            (oneHour - timeSinceLastSync) / 60000
        );

        throw new ApiError(
            429,
            `Please wait ${minutesLeft} minutes before syncing again.`
        );
    }

    try {
        const [profile, solved, contest, skill] =
    await Promise.all([
        fetchLeetcodeProfile(stat.username),
        fetchLeetcodeSolved(stat.username),
        fetchLeetcodeContest(stat.username),
        fetchLeetcodeSkill(stat.username),
    ]);

const contestParticipation =
    (contest.contestParticipation || []).map(
        (item) => ({
            attended: item.attended,
            rating: item.rating,
            ranking: item.ranking,
            trendDirection: item.trendDirection,
            problemsSolved: item.problemsSolved,
            totalProblems: item.totalProblems,
            finishTimeInSeconds:
                item.finishTimeInSeconds,
            contestTitle:
                item.contest?.title,
            contestDate:
                new Date(item.startTime * 1000),
        })
    );
        stat.totalSolved = solved.solvedProblem || 0;
        stat.easySolved = solved.easySolved || 0;
        stat.mediumSolved = solved.mediumSolved || 0;
        stat.hardSolved = solved.hardSolved || 0;

        stat.ranking = profile.ranking || 0;
        stat.reputation = profile.reputation || 0;

        stat.contestRating =
            contest.contestRating || 0;

        stat.contestGlobalRanking =
            contest.contestGlobalRanking || 0;
            stat.lastSyncedAt = Date.now();

            stat.topicBreakdown =
                getTopicBreakdown(skill);
            
            stat.contestParticipation =
                contestParticipation;
            
            await stat.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                stat,
                "Leetcode stats synced successfully"
            )
        );
    } catch (error) {
        throw new ApiError(
            500,
            error.message ||
                "Failed to sync Leetcode stats"
        );
    }
});
const getLeetcodeStat = asyncHandler(async (req, res) => {
    const stat = await LeetcodeStat.findOne({
        userId: req.user._id,
    });

    if (!stat) {
        throw new ApiError(404, "Leetcode stats not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            stat,
            "Leetcode stats fetched successfully"
        )
    );
});

export {
    linkLeetcodeHandle,
    syncLeetcodeStat,
    getLeetcodeStat,
};