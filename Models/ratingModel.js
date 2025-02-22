// models/PostRatings.js
import mongoose from 'mongoose';

const postRatingSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    contentLength: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PostRatings = mongoose.model('PostRatings', postRatingSchema);

export default PostRatings;
