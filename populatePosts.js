const Post = require("./models/post");
const User = require("./models/user");
require("dotenv").config();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

const posts = [];
let users;

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  users = await User.find().exec();
  console.log(users);
  await createPosts();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}
main().catch((err) => console.log(err));

async function postCreate(index, title, description, imageUrls, user) {
  const post = new Post({
    title: title,
    description: description,
    imageUrls: [imageUrls],
    user: user,
  });
  await post.save();
  posts[index] = post;
  console.log(`Added post: ${title}`);
}

async function createPosts() {
  console.log("Creating Posts");
  await Promise.all([
    postCreate(
      0,
      "My Cat",
      "This is my cat",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRlyjPcPffxNpgT1o9kl461g1Fs0yoVZWdUQ&s",
      users[0]
    ),
    postCreate(
      1,
      "My Cat2",
      "This is my cat2",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRlyjPcPffxNpgT1o9kl461g1Fs0yoVZWdUQ&s",
      users[1]
    ),
    postCreate(
      2,
      "My Cat2",
      "This is my cat2",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRlyjPcPffxNpgT1o9kl461g1Fs0yoVZWdUQ&s",
      users[2]
    ),
  ]);
}
