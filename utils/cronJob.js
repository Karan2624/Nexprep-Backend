import cron from "node-cron";

import { Notification } from "../src/models/notification.model.js";
import { DailyTask } from "../src/models/dailyTask.model.js";
import updateHeatmap from "./heatmapUpdater.js";
import { LeetcodeStat } from "../src/models/leetcodeStat.model.js";
import { CodeforcesStat } from "../src/models/codeforcesStat.model.js";
import { User } from "../src/models/user.model.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchCfUser = async (handle) => {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await res.json();
    if (data.status !== "OK") throw new Error("CF handle not found");
    return data.result[0];
};

const fetchCfContest = async (handle) => {
    const res = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const data = await res.json();
    if (data.status !== "OK") throw new Error("CF contest fetch failed");
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
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await res.json();
    const solved = new Set();
    const ratings = {};
    const topics = {};

    if (data.status === "OK") {
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
    }
    return { total: solved.size, ratings, topics };
};

const fetchLcProfile = async (user) => {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${user}`);
    return await res.json();
};

const fetchLcSolved = async (user) => {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${user}/solved`);
    return await res.json();
};

const fetchLcContest = async (user) => {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${user}/contest`);
    return await res.json();
};

const fetchLcSkill = async (user) => {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${user}/skill`);
    return await res.json();
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

    cron.schedule("0 */4 * * *", async () => {
        console.log("Background profiles sync process started...");
        

        try {
            const cfStats = await CodeforcesStat.find({});
            for (const stat of cfStats) {
                try {
                    const uid = stat.userId;
                    const oldSol = stat.totalQuestionSolved || 0;

                    const uInfo = await fetchCfUser(stat.handle);
                    await delay(5000); 
                    
                    const cHist = await fetchCfContest(stat.handle);
                    await delay(5000); 
                    
                    const met = await fetchCfMetrics(stat.handle);

                    const newSol = met.total || 0;
                    const diff = newSol - oldSol;

                    await CodeforcesStat.updateOne(
                        { _id: stat._id },
                        {
                            $set: {
                                rating: uInfo.rating || 0,
                                maxRating: uInfo.maxRating || 0,
                                rank: uInfo.rank || "unrated",
                                maxRank: uInfo.maxRank || "unrated",
                                totalQuestionSolved: newSol,
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

        try {
            const lcStats = await LeetcodeStat.find({});
            for (const stat of lcStats) {
                try {
                    const uid = stat.userId;
                    const oldSol = stat.totalSolved || 0;

 
                    const prof = await fetchLcProfile(stat.username);
                    await delay(35000);
                    
                    const sol = await fetchLcSolved(stat.username);
                    await delay(35000);
                    
                    const cont = await fetchLcContest(stat.username);
                    await delay(35000);
                    
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

                    const newSol = sol.solvedProblem || 0;
                    const diff = newSol - oldSol;

                    await LeetcodeStat.updateOne(
                        {_id : stat._id},
                        {
                            $set : {
                                totalSolved : newSol,
                                easySolved : sol.easySolved || 0,
                                mediumSolved : sol.mediumSolved || 0,
                                hardSolved : sol.hardSolved || 0,
                                ranking : sol.ranking || 0,
                                reputation : sol.reputation || 0,
                                contestRating : sol.contestRating || 0,
                                contestGlobalRanking : sol.contestGlobalRanking || 0,
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
                
                
                await delay(35000); 
            }
        } catch (err) {
            console.error("Failed to query LeetCode documents:", err.message);
        }

        console.log("Background profiles sync process finished complete.");
    });
};

export { startCronJobs };