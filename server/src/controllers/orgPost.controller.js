import { asyncHandler } from "../utils/asynchandler.js";
import { OrgPost as Post } from "../models/orgPost.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// create a new post
const createPost = asyncHandler(async(req, res) => {
    const { title, content, tags } = req.body;
    const organization = req.organization;

    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const file = req.files?.thumbnail?.[0];
    
    let thumbnail;

    try {

        if (file) {
            thumbnail = await uploadOnCloudinary(file.buffer);
        }

        if (!thumbnail && file) {
            throw new ApiError(500, "Failed to upload thumbnail");
        }

        const post = await Post.create({
            title,
            content,
            tags: tags,
            thumbnail: thumbnail?.url || "",
           organization: organization._id
        });

        if (!post) {
            throw new ApiError(500, "Post not created");
        }

        await post.save();

        return res.status(201).json(
            new ApiResponse(201, "Post created successfully", post)
        );

    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while creating post")
        )
    }
})

// get all posts
const getAllPosts = asyncHandler(async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; 
        const skip = (page - 1) * limit; 

        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find()
            .sort({ createdAt: -1 }) 
            .skip(skip) 
            .limit(limit)
            .populate("organization", "name");

        return res.status(200).json(
            new ApiResponse(200, "Posts fetched successfully", {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    postsPerPage: limit
                }
            })
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching posts")
        )
    }
})

// get post by id
const getPostById = asyncHandler(async(req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate("organization", "name");
        if (!post) {
            throw new ApiError(404, "Post not found");
        }
        return res.status(200).json(
            new ApiResponse(200, "Post fetched successfully", post)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching post")
        )
    }
})

// get posts by organization id
const getPostsByOrganizationId = asyncHandler(async(req, res) => {
    try {

        // const organizationId = req.organization._id;
        const organizationId = req.params.id;
        const posts = await Post.find({ organization: organizationId }).sort({ createdAt: -1 });

        if (!posts) {
            throw new ApiError(500, "Something went wrong while fetching Posts");
        }
        return res.status(200).json(
            new ApiResponse(200, "Posts fetched successfully", posts)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching posts")
        )
    }
})

// edit post
const editPost = asyncHandler(async(req, res) => {
    const postId = req.params.id;
    const { title, content, tags } = req.body;
    const organization = req.organization;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        if (post.organization.toString() !== organization._id.toString()) {
            throw new ApiError(403, "You are not authorized to edit this post");
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;

        await post.save();

        return res.status(200).json(
            new ApiResponse(200, "Post updated successfully", post)
        );

    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while updating post")
        )
    }
})

// delete post
const deletePost = asyncHandler(async(req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
    
        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        if (post.thumbnail) {
            const urlParts = post.thumbnail.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];

            const deleteImage = await deleteFromCloudinary(publicId);
            if (!deleteImage) {
                throw new ApiError(500, "Failed to delete thumbnail");
            }
        }
    
        return res.status(200).json(
            new ApiResponse(200, "Post deleted successfully")
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while deleting post")
        )
    }
})

export {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByOrganizationId,
    editPost,
    deletePost
}