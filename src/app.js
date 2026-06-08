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

app.use("/api/v1/users", userRouter);
app.use("/api/v1/codeforcesStat", CodeforcesStatRouter);
app.use("/api/v1/leetcodeStat", LeetcodeStatRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/company-pyq", companyPyqRouter);

export { app };