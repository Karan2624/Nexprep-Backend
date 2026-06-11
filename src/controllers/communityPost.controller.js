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

const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, tag, status } = req.query;
    const query = {};


    if (tag) {
        query.tags = {$regex : tag,$options : "i"};

    }


    if (status === "resolved") query.isResolved = true;
    if (status === "unresolved") query.isResolved = false;

    const posts = await CommunityPost.find(query)
    .sort({createdAt:-1})
    .skip((page-1)*limit)
    .limit(parseInt(limit))
    .populate("authorId","name avatar");
    

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "Community feed fetched successfully"));
});


const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId).populate("authorId", "name avatar");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post details fetched successfully"));
});


const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const post = await CommunityPost.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }


    if (post.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own posts");
    }

    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (tags) post.tags = tags;

    await post.save();
    await post.populate("authorId", "name avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own posts");
    }

    await CommunityPost.deleteOne({ _id: post._id });

    // i will also  delete all Comments associated with this postId here later after creating it!

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

// 6. Toggle Upvote (Like / Unlike)
const toggleUpvote = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const hasUpvoted = post.upvotedBy.includes(userId);

    if (hasUpvoted) {
        // User already upvoted, so we remove their ID (Unlike)
        post.upvotedBy.pull(userId);
    } else {
        // User hasn't upvoted, so we add their ID (Like)
        post.upvotedBy.push(userId);
    }

    await post.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { upvotes: post.upvotedBy.length }, hasUpvoted ? "Upvote removed" : "Post upvoted"));
});

// 7. Toggle Resolved Status (Only author)
const toggleResolved = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Security: Only the author can mark it resolved
    if (post.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the author can mark this post as resolved");
    }

    post.isResolved = !post.isResolved; // Flip the boolean
    await post.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { isResolved: post.isResolved }, post.isResolved ? "Marked as resolved" : "Marked as unresolved"));
});

export { 
    createPost, 
    getAllPosts, 
    getPostById, 
    updatePost, 
    deletePost, 
    toggleUpvote, 
    toggleResolved 
};