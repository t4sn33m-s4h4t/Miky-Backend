const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    caption: {
        type: String,
        maxLength: [2200, "Caption should be less than 2200 charecters"],
        trim: true,
    },
    image: {
        url: { type: String, required: true }, 
        publicId: {
            type: String,
            required: true,
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required'],
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
},
    {
        timestamps: true
    }
);
postSchema.index({
    user: 1,
    createdAt: -1,
});
const Post = mongoose.model('Post', postSchema);

module.exports = Post;