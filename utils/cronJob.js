import cron from "node-cron";

import { Notification } from "../src/models/notification.model.js";
import { DailyTask } from "../src/models/dailyTask.model.js";

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
};

export { startCronJobs };