const mongoose  = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Post = require("./postModel");
const SavedPost = require("./postModel");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        minLength: 3,
        maxLength: 22,
        index: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: 6,
    },
    confirmPassword: {
        type: String,
        required: [true, "Password is required"],
        minLength: 6,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same!",
        },
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    profilePicture: {
        type: String,
    },
    bio: {
        type: String,
        maxLength: 100,
        default: "",
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],   
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Post,
    }],
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: SavedPost,
    }],
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp:{
        type: String,
        default: null,
    },
    otpExpires:{
        type: Date,
        default: null,
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordTokenExpires: {
        type: Date,
        default: null,
    },

},
    {timeStamps: true}
)

userSchema.pre("save", async function (next) { 
    if (this.isModified("username")) {
        this.username = this.username.replace(/\s+/g, "_");
    }
    
    if (this.isModified("isAdmin")) {
        this.isAdmin = false;
    }
 
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    
    next();
});

userSchema.methods.correctpassword = async function (userPassword, databasePassword){
    return await bcrypt.compare(userPassword, databasePassword);
}
 
const User = mongoose.model("User", userSchema);
 

module.exports = User; 