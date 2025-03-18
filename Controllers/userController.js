const AppError = require("../utils/appError");
const catchAsync = require("../utils/cathcAsync");
const { uploadToCloudinary } = require("../utils/cloudinary");
const User = require("../Models/userModel");
const getDataUri = require("../utils/dataUri")

exports.getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .select("-password -otp -otpExpires -confirmPassword -resetPasswordToken -resetPasswordTokenExpires")
        .populate({
            path: "posts",
            options: { sort: { createdAt: -1 } },
            populate: [
                {
                    path: "comments",
                    options: { sort: { createdAt: -1 } },
                    populate: {
                        path: "user",
                        select: "username profilePicture"
                    }
                },
                {
                    path: "user",
                   select: "username profilePicture"
                }
            ]
        })
        .populate({
            path: "savedPosts",
            options: { sort: { createdAt: -1 } },
            populate: [
                {
                    path: "comments",
                    options: { sort: { createdAt: -1 } },
                    populate: {
                        path: "user",
                        select: "username profilePicture"
                    }
                },
                {
                    path: "user",
                    select: "username profilePicture"
                }
            ]
        });

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: user,
    });
});


exports.editProfile = catchAsync(async (req, res, next) => {
    const userId = req.user.id
    const { username, bio } = req.body;
    const profilePicture = req.file;

    let cloudinaryResponse;

    if (!username && !bio && !profilePicture) return next(new AppError("Nothing Changed", 400));

    if (profilePicture) {
        const fileUri = getDataUri(profilePicture);

        cloudinaryResponse = await uploadToCloudinary(fileUri);
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
        return next(new AppError("User not found", 404));
    }
    if (username) {
        const existingUser = await User.findOne({ username });

        if (existingUser && existingUser.id !== userId) {
            return next(new AppError("Username is already taken", 400));
        }

        user.username = username;
    }
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = cloudinaryResponse.secure_url;

    await user.save({ validateBeforeSave: false })
    res.status(200).json({
        status: "success",
        message: "Profile Updated",
        data: user
    });
});


exports.suggestedUser = catchAsync(async (req, res, next) => {
    const loginUserId = req.user.id;

   
    const loginUser = await User.findById(loginUserId).select("following");

    const users = await User.find({ 
        _id: { $ne: loginUserId, $nin: loginUser.following } 
    }).select(
        "-password -confirmPassword -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
    );

    res.status(200).json({
        status: "success",
        data: {
            users,
        },
    });
});



exports.followUnfollow = catchAsync(async (req, res, next) => {
    const loginUserId = req.user._id;
    const targetUserId = req.params.id;


    if (loginUserId.toString() === targetUserId) {
        return next(new AppError("You cannot follow/unfollow yourself", 400));
    }


    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        return next(new AppError("User not found", 404));
    }


    const isFollowing = targetUser.followers.includes(loginUserId);

    if (isFollowing) {

        await User.findByIdAndUpdate(targetUserId, { $pull: { followers: loginUserId } });
        await User.findByIdAndUpdate(loginUserId, { $pull: { following: targetUserId } });


        const updatedUser = await User.findById(loginUserId);

        res.status(200).json({
            status: "success",
            message: "User unfollowed successfully",
            user: updatedUser,
        });
    } else {

        await User.findByIdAndUpdate(targetUserId, { $push: { followers: loginUserId } });
        await User.findByIdAndUpdate(loginUserId, { $push: { following: targetUserId } });


        const updatedUser = await User.findById(loginUserId);

        res.status(200).json({
            status: "success",
            message: "User followed successfully",
            user: updatedUser,
        });
    }
});


exports.getMe = catchAsync(async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new AppError("User not Authenticated", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Authenticated User",
        data: {
            user,
        },
    });
});


