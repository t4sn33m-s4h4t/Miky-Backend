const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    text: {
        type: String,
        maxLength: [2200, "Comment should be less than 2200 charecters"],
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },    
},
    {
        timestamps: true
    }
);

commentSchema.index({
    user: 1,
    createdAt: -1,
})

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;