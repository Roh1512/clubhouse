const Post = require("./models/post");
const User = require("./models/user");
require("dotenv").config();

const users = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createUsers();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}
main().catch((err) => console.log(err));

async function userCreate(index, firstName, lastName, username, password) {
  const user = new User({
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: password,
  });
  await user.save();
  users[index] = user;
  console.log(`Added User: ${username}`);
}

async function createUsers() {
  console.log("Creating Users");
  await Promise.all([
    userCreate(0, "John", "Wick", "johnW", "123456"),
    userCreate(1, "Ada", "Novel", "AdaNovel", "123456"),
    userCreate(2, "Adam", "John", "AdamJohn", "123456"),
    userCreate(3, "John", "Doe", "JohnDoe", "123456"),
  ]);
}
