import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, 
      required: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users', 
      required: true,
    },
    tags: {
      type: [String],
      require: false,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Users', 
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
