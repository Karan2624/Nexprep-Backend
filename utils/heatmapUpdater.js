import { User } from "../src/models/user.model.js";

const updateHeatmap = async (userId, activityType, count = 1) => {
    try {
        const user = await User.findById(userId);

        if (!user) return;

        const today = new Date().toISOString().split("T")[0];
        if (!user.activityHeatmap) {
            user.activityHeatmap = new Map();
        }
        if (!user.activityHeatmap.has(today)) {
            user.activityHeatmap.set(today, {
                leetcodeSubmissions: 0,
                codeforcesSubmissions: 0,
                appTasks: 0,
                total: 0,
            });
        }

        const dailyTask = user.activityHeatmap.get(today);

        const isFirstActivityToday = dailyTask.total === 0;

        if (activityType === "codeforces") {
            dailyTask.codeforcesSubmissions += count;
        }

        if (activityType === "leetcode") {
            dailyTask.leetcodeSubmissions += count;
        }

        if (activityType === "task") {
            dailyTask.appTasks += count;
        }

        dailyTask.total += count;

        if (isFirstActivityToday) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split("T")[0];

            if (user.activityHeatmap.has(yesterdayKey)) {
                user.currentStreak += 1;
            } else {
                user.currentStreak = 1;
            }

            if (user.currentStreak > user.longestStreak) {
                user.longestStreak = user.currentStreak;
            }
        }

        await user.save({ validateBeforeSave: false });
    } catch (err) {
        console.log("Failed to update heatMap error", err);
    }
};

export default updateHeatmap;