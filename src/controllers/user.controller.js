import { ApiError } from "../../utils/ApiError.js";
import { APiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { User } from "../models/user.model.js";

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
        avatarUrl : avatar?.url || "",
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
        new APiResponse(200,createdUser,"User has been reigstered succesfully")
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

const loginUser = asyncHandler(async(req,res)=> {
    // get login details
    //check whether details are present
    // check whether user is present or not
    //check whether password is correct or not
    //create tokens for login
    //send cookie
    const {email,username,password} = req.body;
    if(!username && !email){
        throw new ApiError(400,"Username or email is required");
    }
    const user = await User.findOne({
        $or : [{email},{username}]
    });
    if(!user){
        throw new ApiError(400,"user doesn't exist");
    }
    const isPassword = await user.isPasswordCorrect(password);
    if(!isPassword){
        throw new ApiError(401,"Invalid credentials");
    }
    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id);
    console.log("ACCESS:", accessToken);
    console.log("REFRESH:", refreshToken);
    console.log(typeof accessToken);
    console.log(typeof refreshToken);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly : true,
        secure : false,
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new APiResponse(200,
            {
                loggedInUser,
                accessToken,
                refreshToken
            },"User logged in successfully")
    );
})


export {registerUser,loginUser};