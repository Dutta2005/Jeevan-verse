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
        type: String,
        default: ""
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    thumbnail: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export const OrgPost = mongoose.model('OrgPost', postSchema);