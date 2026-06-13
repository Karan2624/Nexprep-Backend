import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CommunityComment } from "../models/communityComment.model.js";
import { CommunityPost } from "../models/communityPost.model.js";

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await CommunityComment.create({
        postId,
        authorId: req.user._id,
        content: content.trim()
    });

    post.replyCount += 1;
    await post.save();

    await comment.populate("authorId", "name avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Reply added successfully"));
});

const getPostComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const post = await CommunityPost.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comments = await CommunityComment.find({ postId })
        .sort({ isAccepted: -1, createdAt: 1 }) 
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("authorId", "name avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const comment = await CommunityComment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own comments");
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate("authorId", "name avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await CommunityComment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own comments");
    }

    await CommunityComment.deleteOne({ _id: comment._id });

    await CommunityPost.findByIdAndUpdate(comment.postId, {
        $inc: { replyCount: -1 }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const toggleCommentUpvote = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await CommunityComment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const hasUpvoted = comment.upvotedBy.includes(req.user._id);

    if (hasUpvoted) {
        comment.upvotedBy.pull(req.user._id);
    } else {
        comment.upvotedBy.push(req.user._id);
    }

    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { upvotes: comment.upvotedBy.length }, hasUpvoted ? "Upvote removed" : "Comment upvoted"));
});

const acceptComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const post = await CommunityPost.findById(comment.postId);
    if (!post) {
        throw new ApiError(404, "Original post not found");
    }


    if (post.authorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the author of the post can accept an answer");
    }

    if (comment.isAccepted) {
        comment.isAccepted = false;
        await comment.save();
        return res.status(200).json(new ApiResponse(200, { isAccepted: false }, "Answer un-accepted"));
    }

    await CommunityComment.updateMany(
        { postId: post._id },
        { $set: { isAccepted: false } }
    );

    comment.isAccepted = true;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { isAccepted: true }, "Answer marked as accepted"));
});

export {addComment ,getPostComments,updateComment,deleteComment,toggleCommentUpvote,acceptComment};