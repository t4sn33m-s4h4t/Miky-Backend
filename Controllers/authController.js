const catchAsync = require("../utils/cathcAsync");
const generateOTP = require("../utils/generateOTP");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path"); 
const hbs = require("hbs");
const sendEmail = require("../utils/emailSend");
const AppError = require("../utils/appError"); 
const cathcAsync = require("../utils/cathcAsync");
const User = require("../Models/userModel");

const loadTemplate = (templateName, replacement) => {
    const templatePath = path.join(__dirname, "../emailtemplate", templateName);
    const source = fs.readFileSync(templatePath, "utf-8");
    const template = hbs.compile(source);
    return template(replacement);
};

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.cookie("token", token, cookieOptions);
    user.password = undefined;
    user.confirmPassword = undefined;
    user.otp = undefined;
    res.status(statusCode).json({
        status: "success",
        message,
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({
            status: "fail",
            message: "User already exists!",
        });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    req.body.otp = otp;
    req.body.otpExpires = otpExpires;

    const newUser = await User.create(req.body);

    const htmlTemplate = loadTemplate("otptemplate.hbs", {
        title: "OTP Verification - Miky",
        username: newUser.username,
        otp,
        message: "Your OTP for account verification is: ",
    });

    try {
        await sendEmail({
            email: newUser.email,
            subject: "OTP for Email verification",
            html: htmlTemplate,
        });

        createSendToken(newUser, 200, res, "Registration Successful. Check your email for OTP verification.");
    } catch (err) {
        await User.findByIdAndDelete(newUser.id);
        return next(new AppError("There was an error creating the account. Please try again later!", 500));
    }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp) {
        return next(new AppError("OTP is required for verification", 400));
    }

    const user = req.user;

    if (user.otp !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }
    if (Date.now() > user.otpExpires) {
        return next(new AppError("OTP has expired. Please request a new OTP", 400));
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, "Email has been verified.");
});


exports.resendOTP = cathcAsync(async(req, res, next)=>{
    const {email} = req.user;
    if(!email){
        return next(new AppError("Email is required.", 400))
    }
    const user = await User.findOne({email});
    if(!user){
        return next(new AppError("User Not found!", 404));
    }
    if(user.isVerified){
        return next(new AppError("This Account is Already Verified.", 400));
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp  = otp;
    user.otpExpires = otpExpires;
    await user.save({validateBeforeSave: false});
    
    const htmlTemplate = loadTemplate("otptemplate.hbs", {
        title: "OTP Verification - Miky",
        username: user.username,
        otp,
        message: "Your OTP for account verification is: ",
    });

    try {
        await sendEmail({
            email: user.email,
            subject: "Resend OTP for email verification - Miky",
            html: htmlTemplate,
        })
        res.status(200).json({
            status: 'success',
            message: "A new OTP is send to your email",
        })
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({validateBeforeSave: false})
        return next(new AppError("There is an error sending email. Try again later.", 500))
    }

})

exports.login = catchAsync(async(req, res, next)=>{
    const {email, password } = req.body;
    if(!email || !password){
        return nexr( new AppError("Please provide a email and password", 400));

    }
    const user = await User.findOne({email}) 
    if (!(user)) {
        return next(new AppError("Email Not Found!", 401));
    }
    if (!(await user.correctpassword(password, user.password))) {
        return next(new AppError("Incorrect password!", 401));
    } 
    createSendToken(user, 200, res, "Login Successful");
})

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError("Please provide an email", 400));
    }
 
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    user.resetPasswordToken  = otp;
    user.resetPasswordTokenExpires = otpExpires;
    await user.save({validateBeforeSave: false});
 

       
    const htmlTemplate = loadTemplate("otptemplate.hbs", {
        title: "Reset Password OTP - Miky",
        username: user.username,
        otp,
        message: "Your Password Reset OTP is: ",
    });

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset OTP (Valid for 6 min) - Miky",
            html: htmlTemplate
        });

        res.status(200).json({
            status: "success",
            message: "Password Reset OTP Sent to Your Email!"
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("Error sending email, try again later", 500));
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return next(new AppError("Please provide email, OTP, and new password", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }

    if (user.resetPasswordToken !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }

    if (Date.now() > user.resetPasswordTokenExpires) {
        return next(new AppError("OTP has expired. Please request a new one", 400));
    }

    user.password = newPassword;
    user.confirmPassword = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save({ validateBeforeSave: false }); 
    res.status(200).json({
        status: "success",
        data: user,
        message: "Password has been reset successfully.",
    });
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, newConfirmPassword } = req.body;

    if (newPassword !== newConfirmPassword) {
        return next(new AppError("New password and confirm password do not match!", 400));
    }
    if (!oldPassword || !newPassword || !newConfirmPassword) {
        return next(new AppError("Please provide old and new passwords", 400));
    }

    const user = await User.findById(req.user.id).select("password");
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const isMatch = await user.correctpassword(oldPassword, user.password);
    if (!isMatch) {
        return next(new AppError("Incorrect old password", 400));
    }

    user.password = newPassword;
    user.confirmPassword = newConfirmPassword;
    await user.save();

    createSendToken(user, 200, res, "Password changed successfully.");
});
