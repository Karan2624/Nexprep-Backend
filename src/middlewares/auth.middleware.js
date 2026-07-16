import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        console.log("TOKEN:", token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decoded_token = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        console.log("DECODED:", decoded_token);

        const user = await User.findById(decoded_token._id)
            .select("-password -refreshToken");

        console.log("USER:", user);

        if (!user) {
            throw new ApiError(400, "Invalid access token");
        }

        req.user = user;

        next();
    } catch (err) {
        console.log("JWT ERROR:", err);

        throw new ApiError(
            401,
            err.message || "Invalid Access token"
        );
    }
});

export { verifyJWT };