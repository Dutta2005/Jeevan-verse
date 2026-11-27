import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

postSchema.index({ createdAt: -1, _id: -1 });

export const Post = mongoose.model('Post', postSchema);
