const Post = require("./models/post");
const User = require("./models/user");
const Like = require("./models/like");
const Comment = require("./models/comment");
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

let posts;
let users;
const likes = [];
const comments = [];

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  users = await User.find().exec();
  posts = await Post.find().exec();
  await createLikes();
  await createComments();
  console.log(users);
  console.log(posts);
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}
main().catch((err) => console.log(err));

async function likeCreate(index, user, post) {
  const like = new Like({
    user: user,
    post: post,
  });
  await like.save();
  likes[index] = like;
  console.log(`Added Like ${index}`);

  post.likes.push(like);
  await post.save();
  console.log(`Added Like ${index} to post`);
}
async function createLikes() {
  console.log("Creating Likes");
  await Promise.all([
    likeCreate(0, users[0], posts[0]),
    likeCreate(1, users[1], posts[1]),
  ]);
}

async function commentCreate(index, content, user, post) {
  const comment = new Comment({
    content: content,
    user: user,
    post: post,
  });
  await comment.save();
  comments[index] = comment;
  console.log(`Added Comment: ${content}`);

  post.comments.push(comment);
  await post.save();
  console.log(`Added Comment ${index} to post`);
}

async function createComments() {
  console.log("Creating comments");
  await Promise.all([
    commentCreate(0, "Nice", users[0], posts[0]),
    commentCreate(1, "Nice Cat", users[1], posts[1]),
  ]);
}
