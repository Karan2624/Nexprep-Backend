import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler( async(req,res) => {
    const {name,username,email,password} = req.body;
    if([name,username,email,password].some((field) => !field || field.trim()==="")){
        throw new ApiError(400,"All feild are required");
    }
    //get user details
    //check whether they exist or not 
    //check whether users already exist or not 
    // check for avatar
    //upload it on cloudinary 
    //create user object 
    // remove passwrod and refresh token from response
    //check for user creation

    const existingUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existingUser){
        throw new ApiError(401,"Username with email already exist")
    }
    const localAvatarPath = req.file?.path;
    console.log(req.file);
    const avatar = await uploadOnCloudinary(localAvatarPath);
    const user = await User.create({
        name,
        username : username.toLowerCase(),
        avatar : avatar?.url || "",
        email,
        password,

    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while adding user");
    }
    return res
.status(201)
.json(
    new ApiResponse(
        201,
        createdUser,
        "User has been registered successfully"
    )
);
})

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch(err){
        throw new ApiError(500,"Something went wrong while generating refresh and access token");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    console.log("LOGIN HIT");

    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(
            400,
            "Username or email is required"
        );
    }

    if (!password) {
        throw new ApiError(
            400,
            "Password is required"
        );
    }

    const user = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (!user) {
        throw new ApiError(
            400,
            "User doesn't exist"
        );
    }

    const isPasswordCorrect =
        await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const {
        accessToken,
        refreshToken
    } = await generateAccessandRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(
        user._id
    ).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .cookie(
            "accessToken",
            accessToken,
            options
        )
        .cookie(
            "refreshToken",
            refreshToken,
            options
        )
        .json(
            new ApiResponse(
                200,
                {
                    loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out"
            )
        );
});
const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken;
    console.log("Incoming Cookie Token:", incomingRefreshToken);
    if(!incomingRefreshToken){
        throw new ApiError(400,"Unauthorized request");
    }
    try{
        const decoded_token = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        if(!decoded_token){
            throw new ApiError(400,"Invalid refresh token");
        }
        const user = await User.findById(
            decoded_token._id
        );
        
        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }
        
        if (
            user.refreshToken !==
            incomingRefreshToken
        ) {
            throw new ApiError(
                401,
                "Refresh token is expired or invalid"
            );
        }
        const options = {
            httpOnly : true,
            secure : false
        };
        const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id);
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed")
        );

    } catch (err){
        throw new ApiError(401,err.message || "Invalid refresh token");
    }
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const localAvatarPath = req.file?.path;
    console.log(req.file?.path);
    if(!localAvatarPath){
        throw new ApiError(400,"Avatar fils is missing");
    }
    const avatar = await uploadOnCloudinary(localAvatarPath);
    if(!avatar){
        throw new ApiError(400,"Error while uploading file on cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                avatar : avatar.url
            }
        },{
            new : true
        }
    ).select("-password");
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar file is updated")
    );
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                req.user, 
                "Current user profile fetched successfully"
            )
        );
});

export {registerUser,loginUser, logoutUser,refreshAccessToken,updateUserAvatar,getCurrentUser};