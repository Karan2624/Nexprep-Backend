import jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const initializeChatSocket = (io) => {
    io.use(async (socket,next)=> {
        try{
            const token = socket.handshake?.auth?.token;
            if(!token) return next(new Error("Unauthorized"));

            const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select("-password  -refreshToken");
            if(!user){
                return next(new Error("Invalid token!"));
            }
            socket.user = user;
            next();
        } catch(err){
            next(new Error("Authentication Error"));
        }
    });

    io.on("connection",(socket) => {
        console.log(`🟢 User connected: ${socket.user?.username || socket.id}`);
        socket.on("joinGroup",(groupId) => {
            socket.join(groupId);
            console.log(`User joined room: ${groupId}`);
        });
        socket.on("leaveGroup",(groupId) => {
            socket.leave(groupId);
            console.log(`User left room: ${groupId}`);
        });
        socket.on("disconnect",() => {
            console.log(`🔴 User disconnected: ${socket.user?.username || socket.id}`);
        })
    })
}