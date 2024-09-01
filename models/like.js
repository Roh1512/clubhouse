const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Posts", required: true },
  createdAt: { type: Date, default: Date.now() },
});

LikeSchema.index({ createdAt: -1, _id: 1 });

module.exports = mongoose.model("Likes", LikeSchema);
