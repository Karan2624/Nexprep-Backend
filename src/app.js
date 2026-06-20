import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.router.js";
import CodeforcesStatRouter from "./routes/codeforceStat.router.js";
import LeetcodeStatRouter from "./routes/leetcode.routes.js";
import companyRouter from "./routes/company.router.js";
import companyPyqRouter from "./routes/companyPyq.router.js";

import companyReviewRouter from "./routes/companyReview.router.js";
import dailyTaskRouter from "./routes/dailyTask.router.js"
import studyGroupRouter from "./routes/studyGroup.router.js";
import chatMessageRouter from "./routes/chatMessage.router.js"
import communityPostRouter from "./routes/communityPost.router.js";
import communityCommentRouter from "./routes/communityComment.router.js";
import notificationRouter from "./routes/notification.router.js";
import { ApiError } from "../utils/ApiError.js";



app.use("/api/v1/users",userRouter);
app.use("/api/v1/codeforcesStat",CodeforcesStatRouter);
app.use("/api/v1/company",companyRouter)
app.use("/api/v1/company-pyq",companyPyqRouter);
app.use("/api/v1/company-review", companyReviewRouter);
app.use("/api/v1/dailyTask",dailyTaskRouter);
app.use("/api/v1/study-group",studyGroupRouter);
app.use("/api/v1/chat-message",chatMessageRouter);
app.use("/api/v1/leetcodeStat", LeetcodeStatRouter);
app.use("/api/v1/community-post",communityPostRouter);
app.use("/api/v1/community-comment",communityCommentRouter);
app.use("/api/v1/notification",notificationRouter);


app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
    }
    console.error("UNEXPECTED ERROR:", err);
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export { app };