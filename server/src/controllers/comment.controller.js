import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {getIO} from "../utils/webSocket.js"
import { Notification } from "../models/notification.model.js"

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
        .populate({
            path: 'user', 
            select: 'name status'
        })
        .populate({
            path: 'organization', 
            select: 'name'
        })
        .populate({
            path: 'replies',
            populate: [
                { path: 'user', select: 'name status' },
                { path: 'organization', select: 'name' }
            ]
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


const createNotification = async ({ userId, message, type = "comment", redirectUrl, data }) => {
    try {
        const existingNotification = await Notification.findOne({
            userId,
            type,
            redirectUrl,
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5-minute window
        });

        if (existingNotification) {
            // Extract the count from the existing notification's message
            const match = existingNotification.message.match(/(\d+) people commented/);
            let newCount = match ? parseInt(match[1]) + 1 : 2;

            existingNotification.message = `${newCount} people commented on your post`;
            existingNotification.data = { ...existingNotification.data, ...data };
            await existingNotification.save();
        } else {
            await Notification.create({
                userId,
                type,
                message,
                redirectUrl,
                data
            });
        }

        // Emit the updated notification
        const io = getIO();
        io.to(userId.toString()).emit("comment", {
            type,
            message,
            redirectUrl,
            data,
            createdAt: new Date()
        });

    } catch (error) {
        console.error("Error creating notification:", error);
    }
};


const addComment = asyncHandler(async (req, res) => {
    const { postId, parentCommentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    if (!postId && !parentCommentId) {
        throw new ApiError(400, "Either postId or parentCommentId must be provided");
    }

    const commentData = {};

    // Determine comment creator based on available information
    if (req.user) {
        commentData.user = req.user._id;
    } else if (req.organization) {
        commentData.organization = req.organization._id;
    } else {
        throw new ApiError(401, "Authentication required");
    }

    commentData.content = content;

    if (postId) {
        if (!mongoose.isValidObjectId(postId)) {
            throw new ApiError(400, "Invalid post id");
        }
        commentData.post = postId;

        // Find post creator to send notification
        const post = await mongoose.model('Post').findById(postId).select('author') || 
                    await mongoose.model('OrgPost').findById(postId).select('organization');
        
        if (post) {
            // Check which model the post belongs to
            const isOrgPost = post.constructor.modelName === 'OrgPost';
            const notificationData = {
                redirectUrl: isOrgPost ? `/post/${postId}` : `/discussions/${postId}`,
                data: {
                    postId,
                    commentId: commentData._id
                }
            };

            // If comment is by user
            if (req.user) {
                if (post.author) {  
                    await createNotification({
                        userId: post.author,  
                        message: `${req.user.name} commented on your post`,
                        ...notificationData
                    });
                } else if (post.organization) {
                    await createNotification({
                        userId: post.organization,  
                        message: `${req.user.name} commented on your post`,
                        ...notificationData
                    });
                }
            } else if (req.organization) {
                if (post.author) {
                    await createNotification({
                        userId: post.author,  
                        message: `${req.organization.name} commented on your post`,
                        ...notificationData
                    });
                } else if (post.organization) {
                    await createNotification({
                        userId: post.organization,
                        message: `${req.organization.name} commented on your post`,
                        ...notificationData
                    });
                }
            }
        }
    }

    if (parentCommentId) {
        if (!mongoose.isValidObjectId(parentCommentId)) {
            throw new ApiError(400, "Invalid parent comment id");
        }
        
        const parentComment = await Comment.findById(parentCommentId)
            .populate('user', 'name')
            .populate('organization', 'name');

        if (!parentComment) {
            throw new ApiError(404, "Parent comment not found");
        }
        
        commentData.parentComment = parentCommentId;

        const post = await mongoose.model('Post').findById(parentComment.post) || 
             await mongoose.model('OrgPost').findById(parentComment.post);

        const isOrgPost = post && post.constructor.modelName === 'OrgPost';

        // Notify parent comment creator about the reply
        if (parentComment.user) {
            await createNotification({
                userId: parentComment.user._id,
                message: req.user 
                    ? `${req.user.name} replied to your comment`
                    : `${req.organization.name} replied to your comment`,
                redirectUrl:  isOrgPost? `/post/${parentComment.post}` : `/discussions/${parentComment.post}` ,
                data: {
                    postId: parentComment.post,
                    parentCommentId,
                    commentId: commentData._id
                }
            });
        }
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

    if (!req.user && !req.organization) {
        throw new ApiError(401, "Authentication required");
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const query = req.organization
        ? { _id: commentId, organization: req.organization._id }
        : { _id: commentId, user: req.user._id };

    const comment = await Comment.findOne(query);

    if (!comment) {
        throw new ApiError(404, "Comment not found or you are not authorized to update this comment");
    }

    comment.content = content || comment.content;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, "Comment updated successfully", { comment }));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!req.user && !req.organization) {
        throw new ApiError(401, "Authentication required");
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const query = req.organization
        ? { _id: commentId, organization: req.organization._id }
        : { _id: commentId, user: req.user._id };

    const comment = await Comment.findOne(query);

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