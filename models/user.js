const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserScheme = new Schema({
  firstName: { type: String, maxLength: 50, required: true },
  lastName: { type: String, maxLength: 50, required: true },
  username: { type: String, maxLength: 50, required: true },
  password: { type: String, required: true },
  membershipStatus: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  createdAt: { type: Date, default: Date.now() },
});

UserScheme.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserScheme.virtual("url").get(function () {
  return `/users/${this._id}`;
});

module.exports = mongoose.model("Users", UserScheme);
