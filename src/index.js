import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { startCronJobs } from "../utils/cronJob.js";
import { Server } from "socket.io";
import {createServer} from "http";
import { initializeChatSocket } from "./socket/chatSocket.js";



dotenv.config({
    path : './env'
})

const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors : {
        origin : process.env.CORS_ORIGIN,
        credentials : true
    }
})

app.set("io",io);

initializeChatSocket(io);


connectDB()
.then(() => {

    startCronJobs();

    httpServer.listen(process.env.PORT || 8000,() => {
        console.log(` Server and WebSockets are running at port: ${process.env.PORT || 8000}`);
    })

    app.on("error",(error) => {
        console.log("Error : ",error);
        throw error;
    })
})
.catch((err) => {
    console.log("Mongodb connection failed !!!! ",err);
})
