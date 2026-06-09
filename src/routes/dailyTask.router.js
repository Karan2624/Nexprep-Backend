import { Router } from "express";
import { createDailyTask, deleteDailyTask } from "../controllers/dailyTask.controller.js";

const router = Router();

router.route("/create-task").post(createDailyTask);
router.route("/delete-task",deleteDailyTask);

export default router;

