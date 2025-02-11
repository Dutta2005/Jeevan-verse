import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const getComments = asyncHandler(async (req, res) => {
    const { postId, parentCommentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!postId && !parentCommentId) {
        throw new ApiError(400, "Either postId or parentCommentId must be provided");
    }

    const query = postId 
        ? { post: postId, parentComment: null }
        : { parentComment: parentCommentId };

    const comments = await Comment.find(query)
        .populate('user', 'name status')
        .populate({
            path: 'replies',
            populate: {
                path: 'user',
                select: 'name status'
            }
        })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({createdAt: -1});

    const totalComments = await Comment.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, "Comments fetched successfully",{
        comments, 
        totalComments, 
        currentPage: page, 
        totalPages: Math.ceil(totalComments / limit)
    }));
});

const addComment = asyncHandler(async (req, res) => {
    const { postId, parentCommentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    if (!postId && !parentCommentId) {
        throw new ApiError(400, "Either postId or parentCommentId must be provided");
    }

    const commentData = {
        content,
        user: req.user._id
    };

    if (postId) {
        if (!mongoose.isValidObjectId(postId)) {
            throw new ApiError(400, "Invalid post id");
        }
        commentData.post = postId;
    }

    if (parentCommentId) {
        if (!mongoose.isValidObjectId(parentCommentId)) {
            throw new ApiError(400, "Invalid parent comment id");
        }
        
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new ApiError(404, "Parent comment not found");
        }
        
        commentData.parentComment = parentCommentId;
    }

    const comment = await Comment.create(commentData);

    if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
            $push: { replies: comment._id }
        });
    }

    return res.status(201).json(new ApiResponse(201, "Comment added successfully", { comment }));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findOne({
        _id: commentId,
        user: req.user._id
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or you are not authorized to update this comment");
    }

    comment.content = content || comment.content;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, "Comment updated successfully", { comment }));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findOne({
        _id: commentId,
        user: req.user._id
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or you are not authorized to delete this comment");
    }

    if (comment.replies && comment.replies.length > 0) {
        comment.content = '[Deleted]';
        await comment.save();
    } else {
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: comment._id }
            });
        }

        await Comment.findByIdAndDelete(commentId);
    }

    return res.status(200).json(new ApiResponse(200, "Comment deleted successfully", {}));
});

export {
    getComments, 
    addComment, 
    updateComment,
    deleteComment
}
