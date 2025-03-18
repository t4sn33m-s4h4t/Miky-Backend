const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/cathcAsync");
const User = require("../Models/userModel");

const isAuthenticated = catchAsync(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new AppError("You are not logged in! Please log in to access.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError("Unauthorized Access", 401));
    }

    req.user = currentUser;
    next();
});

module.exports = isAuthenticated;
