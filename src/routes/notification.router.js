import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserNotifications, markAllAsRead, markAsRead } from "../controllers/notification.controller.js";

const router = Router();

router.route("/get-notifications").get(verifyJWT,getUserNotifications);
router.route("/read/:notificationId").patch(verifyJWT,markAsRead);
router.route("/read-all").patch(verifyJWT,markAllAsRead);


export default router;
