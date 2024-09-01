const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: { type: String, required: true, maxLength: 1000 },
  user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Posts", required: true },
  createdAt: { type: Date, default: Date.now() },
});

CommentSchema.index({ createdAt: -1, _id: 1 });

module.exports = mongoose.model("Comments", CommentSchema);
