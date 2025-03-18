const sharp = require("sharp");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/cathcAsync");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");
const Post = require("../Models/postModel");
const User = require("../Models/userModel");
const Comment = require("../Models/commentModel")


exports.createPost = catchAsync(async (req, res, next) => {
    const { caption } = req.body;
    const image = req.file;
    const userId = req.user._id;

    if (!image) {
        return next(new AppError("Image is required for a post", 400));
    }

    const optimizedImageBuffer = await sharp(image.buffer)
        .resize({
            width: 800,
            height: 800,
            fit: "inside",
        })
        .toFormat("jpeg", {
            quality: 80,
        })
        .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;

    const cloudResponse = await uploadToCloudinary(fileUri);

    const post = await Post.create({
        caption,
        image: {
            url: cloudResponse.secure_url,
            publicId: cloudResponse.public_id,
        },
        user: userId,
    });

    const user = await User.findById(userId);
    if (user) {
        user.posts.push(post._id);
        await user.save({ validateBeforeSave: false });
    }

    await post.populate({
        path: "user",
        select: "username email bio profilePicture",
    });

    res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: {
            post,
        },
    });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find()
        .populate({
            path: "user",
            select: "username bio profilePicture",
        })
        .populate({
            path: 'comments',
            select: "text user ",
            populate: {
                path: "user",
                select: "username profilePicture",
            },
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        results: posts.length,
        data: {
            posts,
        },
    });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const posts = await Post.find({ user: userId })
        .populate({
            path: 'comments',
            select: "text user",
            pupulate: {
                path: "user",
                select: "username profilePicture",
            },
        })
        .sort({ createdAt: -1 });
 
    res.status(200).json({
        status: "success",
        results: posts.length,
        data: {
            posts,
        },
    });
});

exports.saveOrUnsavePost = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    
    if (!user.savedPosts.includes(postId)) {
        user.savedPosts.push(postId);
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            status: "success",
            data: user,
            message: "Post saved successfully",
        });
    } 
    
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId.toString());
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
        status: "success",
        data: user,
        message: "Post unsaved successfully",
    });
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;  
    const post = await Post.findById(postId);
    if (!post) {
        return next(new AppError("Post not found", 404));
    }
    if ((post.user.toString() !== userId.toString()) && !isAdmin ) {
        return next(new AppError("You are not authorized to delete this post", 403));
    }
    if (post.image && post.image.publicId) {
        try {
            await cloudinary.uploader.destroy(post.image.publicId);

        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
            return next(new AppError("Failed to delete image from Cloudinary", 500));
        }
    }
    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
    await User.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } });
    await Comment.deleteMany({ post: postId });
    await post.deleteOne();

    res.status(200).json({
        status: "success",
        message: "Post deleted successfully",
    });
});

exports.likeOrDislikePost = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
        return next(new AppError("Post not found", 404));
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
        post.likes.push(userId);
        await post.save({ validateBeforeSave: false });

        res.status(200).json({
            status: "success",
            message: "Post liked successfully",
        });
    } else {
        post.likes.splice(likeIndex, 1);
        await post.save({ validateBeforeSave: false });

        res.status(200).json({
            status: "success",
            message: "Post unliked successfully",
        });
    }
});

exports.addComment = catchAsync(async (req, res, next) => {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
        return next(new AppError("Comment cannot be empty", 400));
    }

    const post = await Post.findById(postId)
    if (!post) {
        return next(new AppError("Post not found", 404));
    }
    const comment = await Comment.create({
        text,
        user: userId,
        createdAt: Date.now(),
    });
    post.comments.push(comment);
    await post.save({ validateBeforeSave: false });
    await comment.populate({
        path: "user",
        select: "username profilePicture bio",
    });

    res.status(201).json({
        status: "success",
        message: "Comment added successfully",
        data: {
            comment,
        },
    });
});