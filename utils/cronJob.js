import cron from "node-cron";

import { Notification } from "../src/models/notification.model.js";
import { DailyTask } from "../src/models/dailyTask.model.js";
import updateHeatmap from "./heatmapUpdater.js";
import { LeetcodeStat } from "../src/models/leetcodeStat.model.js";
import { CodeforcesStat } from "../src/models/codeforcesStat.model.js";
import { User } from "../src/models/user.model.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Safe JSON fetch that handles rate-limit HTML responses from alfa-leetcode-api
const safeFetch = async (url, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        const res = await fetch(url);
        if (res.status === 429 || !res.ok) {
            console.warn(`Rate limited or error (${res.status}) for ${url}, waiting 60s... (attempt ${i + 1}/${retries + 1})`);
            await delay(60000);
            continue;
        }
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            console.warn(`Non-JSON response for ${url}, waiting 60s... (attempt ${i + 1}/${retries + 1})`);
            await delay(60000);
            continue;
        }
    }
    throw new Error(`Failed after ${retries + 1} attempts: ${url}`);
};

// Safe CF fetch that handles server downtime with retries
const safeCfFetch = async (url, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`CF API error (${res.status}) for ${url}, waiting 30s... (attempt ${i + 1}/${retries + 1})`);
                await delay(30000);
                continue;
            }
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (data.status !== "OK") {
                    console.warn(`CF API returned status "${data.status}" for ${url}, waiting 30s... (attempt ${i + 1}/${retries + 1})`);
                    await delay(30000);
                    continue;
                }
                return data;
            } catch {
                console.warn(`Non-JSON response from CF for ${url}, waiting 30s... (attempt ${i + 1}/${retries + 1})`);
                await delay(30000);
                continue;
            }
        } catch (err) {
            console.warn(`Network error fetching CF ${url}: ${err.message}, waiting 30s... (attempt ${i + 1}/${retries + 1})`);
            await delay(30000);
            continue;
        }
    }
    throw new Error(`CF API failed after ${retries + 1} attempts: ${url}`);
};

const fetchCfUser = async (handle) => {
    const data = await safeCfFetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    return data.result[0];
};

const fetchCfContest = async (handle) => {
    const data = await safeCfFetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    return data.result.map((c) => ({
        contestId: c.contestId,
        rank: c.rank,
        contestName: c.contestName,
        oldRating: c.oldRating,
        newRating: c.newRating,
        contestDate: new Date(c.ratingUpdateTimeSeconds * 1000),
    }));
};

const fetchCfMetrics = async (handle) => {
    const data = await safeCfFetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const solved = new Set();
    const ratings = {};
    const topics = {};
    let totalSubmissions = data.result.length;

    data.result.forEach((sub) => {
        if (sub.verdict === "OK") {
            const pid = `${sub.problem?.contestId}-${sub.problem?.index}`;
            if (!solved.has(pid)) {
                solved.add(pid);
                if (sub.problem?.rating) {
                    const rStr = sub.problem.rating.toString();
                    ratings[rStr] = (ratings[rStr] || 0) + 1;
                }
                if (sub.problem?.tags) {
                    sub.problem.tags.forEach((t) => {
                        topics[t] = (topics[t] || 0) + 1;
                    });
                }
            }
        }
    });

    return { total: solved.size, ratings, topics, totalSubmissions };
};

const fetchLcProfile = async (user) => {
    return safeFetch(`https://alfa-leetcode-api.onrender.com/${user}/profile`);
};

const fetchLcSolved = async (user) => {
    return safeFetch(`https://alfa-leetcode-api.onrender.com/${user}/solved`);
};

const fetchLcContest = async (user) => {
    return safeFetch(`https://alfa-leetcode-api.onrender.com/${user}/contest`);
};

const fetchLcSkill = async (user) => {
    return safeFetch(`https://alfa-leetcode-api.onrender.com/${user}/skill`);
};

const getLcTopics = (skl) => {
    const map = new Map();
    const all = [...(skl.fundamental || []), ...(skl.intermediate || []), ...(skl.advanced || [])];
    all.forEach((t) => map.set(t.tagName, t.problemsSolved));
    return Object.fromEntries(map);
};

const startCronJobs = () => {
  
    cron.schedule("0 * * * *", async () => {
        try {
            const now = new Date();
    
            const t2 = new Date(now.getTime() + (2 * 60 * 60 * 1000));
            const t3 = new Date(now.getTime() + (3 * 60 * 60 * 1000));

            const tasks = await DailyTask.find({
                targetDate: { $gte: t2, $lte: t3 },
                isCompleted: false, 
                reminderSent: false 
            });

            if (tasks.length === 0) return;

            for (const t of tasks) {
                await Notification.create({
                    userId: t.userId, 
                    type: "task",
                    message: `Action Required: Your task "${t.title}" is due in less than 3 hours.`,
                    linkUrl: `/tasks` 
                });

                t.reminderSent = true; 
                await t.save();
            }
        } catch (err) {
            console.error("Hourly Cron Error:", err);
        }
    });

    cron.schedule("1 0 * * *", async () => {
        try {
            console.log("Running Daily Streak Sweeper...");

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            const usersWithStreaks = await User.find({ currentStreak: { $gt: 0 } });

            let resetCount = 0;
            for (const user of usersWithStreaks) {
                if (!user.activityHeatmap.has(yesterdayString)) {
                    user.currentStreak = 0;
                    await user.save({ validateBeforeSave: false });
                    resetCount++;
                }
            }

            console.log(`Streak Sweeper finished: Reset ${resetCount} broken streaks.`);
        } catch (error) {
            console.error("Error in Midnight Streak Sweeper:", error);
        }
    });
    // Codeforces sync - every 6 hours
    cron.schedule("0 */6 * * *", async () => {
        console.log("[CF Sync] Codeforces sync started...");

        try {
            const cfStats = await CodeforcesStat.find({});
            for (const stat of cfStats) {
                try {
                    const uid = stat.userId;
                    const oldSubmissions = stat.totalSubmissions || 0;

                    const uInfo = await fetchCfUser(stat.handle);
                    await delay(5000); 
                    
                    const cHist = await fetchCfContest(stat.handle);
                    await delay(5000); 
                    
                    const met = await fetchCfMetrics(stat.handle);

                    const newSubmissions = met.totalSubmissions || oldSubmissions;
                    const diff = newSubmissions - oldSubmissions;
                    const newSol = met.total || stat.totalQuestionSolved || 0;

                    await CodeforcesStat.updateOne(
                        { _id: stat._id },
                        {
                            $set: {
                                rating: uInfo.rating || 0,
                                maxRating: uInfo.maxRating || 0,
                                rank: uInfo.rank || "unrated",
                                maxRank: uInfo.maxRank || "unrated",
                                totalQuestionSolved: newSol,
                                totalSubmissions: newSubmissions,
                                solvedByProblemRating: met.ratings,
                                topicBreakdown: met.topics,
                                contestHistory: cHist,
                                lastSyncedAt: Date.now()
                            }
                        }
                    );

                    await stat.save();

                    if (diff > 0 && uid) {
                        await updateHeatmap(uid, "codeforces", diff);
                    }
                    console.log(`Auto-synced Codeforces: ${stat.handle}`);
                } catch (err) {
                    console.error(`Error auto-syncing CF for ${stat.handle}:`, err.message);
                }
                await delay(5000); 
            }
        } catch (err) {
            console.error("Failed to query Codeforces documents:", err.message);
        }

        console.log("[CF Sync] Codeforces sync finished.");
    });

    // LeetCode sync - every 12 hours (with rate-limit protection)
    cron.schedule("0 */12 * * *", async () => {
        console.log("[LC Sync] LeetCode sync started...");

        try {
            const lcStats = await LeetcodeStat.find({});
            for (const stat of lcStats) {
                try {
                    const uid = stat.userId;
                    const oldSubmissions = stat.totalSubmissions || 0;

                    const prof = await fetchLcProfile(stat.username);
                    await delay(60000);
                    
                    const sol = await fetchLcSolved(stat.username);
                    await delay(60000);
                    
                    const cont = await fetchLcContest(stat.username);
                    await delay(60000);
                    
                    const skl = await fetchLcSkill(stat.username);

                    const parts = (cont.contestParticipation || []).map((item) => ({
                        attended: item.attended,
                        rating: item.rating,
                        ranking: item.ranking,
                        trendDirection: item.trendDirection,
                        problemsSolved: item.problemsSolved,
                        totalProblems: item.totalProblems,
                        finishTimeInSeconds: item.finishTimeInSeconds,
                        contestTitle: item.contest?.title,
                        contestDate: item.contest?.startTime 
                            ? new Date(item.contest.startTime * 1000) 
                            : new Date()
                    }));

                    let newSubmissions = oldSubmissions;
                    if (prof && prof.totalSubmissions) {
                        const allStats = prof.totalSubmissions.find(s => s.difficulty === "All");
                        if (allStats) newSubmissions = allStats.submissions;
                    }

                    const diff = newSubmissions - oldSubmissions;
                    const newSol = sol.solvedProblem || stat.totalSolved || 0;

                    await LeetcodeStat.updateOne(
                        {_id : stat._id},
                        {
                            $set : {
                                totalSolved : newSol,
                                totalSubmissions: newSubmissions,
                                easySolved : sol.easySolved || 0,
                                mediumSolved : sol.mediumSolved || 0,
                                hardSolved : sol.hardSolved || 0,
                                ranking : prof.ranking || 0,
                                reputation : prof.reputation || 0,
                                contestRating : cont.contestRating || 0,
                                contestGlobalRanking : cont.contestGlobalRanking || 0,
                                topicBreakdown : getLcTopics(skl),
                                contestParticipation : parts,
                                lastSyncedAt : Date.now(),
                            }
                        }
                    )

                    if (diff > 0 && uid) {
                        await updateHeatmap(uid, "leetcode", diff);
                    }
                    console.log(`Auto-synced LeetCode: ${stat.username}`);
                } catch (err) {
                    console.error(`Error auto-syncing LC for ${stat.username}:`, err.message);
                }
                
                await delay(60000); 
            }
        } catch (err) {
            console.error("Failed to query LeetCode documents:", err.message);
        }

        console.log("[LC Sync] LeetCode sync finished.");
    });
};

export { startCronJobs };