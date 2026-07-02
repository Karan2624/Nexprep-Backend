import jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const initializeChatSocket = (io) => {
    io.use(async (socket, next) => {
        try {
            // 1. Grab the raw cookie string from the handshake headers
            const cookieString = socket.request.headers.cookie || "";
            
            // 2. Parse the cookie string to find the 'accessToken'
            // (If you named your cookie something else like 'token', change 'accessToken=' below)
            const token = cookieString
                .split('; ')
                .find(row => row.startsWith('accessToken='))
                ?.split('=')[1];

            if (!token) return next(new Error("Unauthorized: No token found in cookies"));

            // 3. Verify exactly as you were before
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select("-password  -refreshToken");
            
            if (!user) {
                return next(new Error("Invalid token!"));
            }
            
            socket.user = user;
            next();
        } catch(err) {
            next(new Error("Authentication Error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected via Cookie: ${socket.user?.username || socket.id}`);
        
        socket.on("joinGroup", (groupId) => {
            socket.join(groupId);
            console.log(`User joined room: ${groupId}`);
        });
        
        socket.on("leaveGroup", (groupId) => {
            socket.leave(groupId);
            console.log(`User left room: ${groupId}`);
        });
        
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user?.username || socket.id}`);
        });
    });
}