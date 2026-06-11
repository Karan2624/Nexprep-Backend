import { Router } from "express";
import { createDailyTask, deleteDailyTask, getDailyTasks } from "../controllers/dailyTask.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-task").post(verifyJWT,createDailyTask);
<<<<<<< HEAD
router.route("/delete-task/:taskId").post(verifyJWT,deleteDailyTask);
=======
router.route("/delete-task/:taskId").delete(verifyJWT,deleteDailyTask);
>>>>>>> karan-backend
router.route("/list").get(verifyJWT,getDailyTasks);


export default router;

