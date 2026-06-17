import { Router } from "express";
import { completeTask, createDailyTask, deleteDailyTask, getDailyTasks } from "../controllers/dailyTask.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-task").post(verifyJWT,createDailyTask);
router.route("/delete-task/:taskId").delete(verifyJWT,deleteDailyTask);
router.route("/list").get(verifyJWT,getDailyTasks);
router.route("/complete-task/:taskId").patch(verifyJWT,completeTask);


export default router;

