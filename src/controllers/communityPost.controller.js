import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CommunityPost } from "../models/communityPost.model.js";

const createPost = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const post = await CommunityPost.create({
        authorId: req.user._id,
        title: title.trim(),
        content: content.trim(),
        tags: tags || [] 
    });

    await post.populate("authorId", "name avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, post, "Post created successfully"));
});

