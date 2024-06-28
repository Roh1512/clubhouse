const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, maxLength: 200 },
  description: { type: String, maxLength: 1000 },
  createdAt: { type: Date, default: Date.now() },
  imageUrls: [{ type: String }],
  user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "Likes" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
});

PostSchema.virtual("url").get(function () {
  return `/posts/${this._id}`;
});

module.exports = mongoose.model("Posts", PostSchema);
