const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/user");
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment");

const { cloudinary, upload } = require("../config/cloudinaryConfig");

//get all users
exports.allusers_get = asyncHandler(async (req, res, next) => {
  const searchQuery = req.query.search || "";
  let query = {};
  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i"); // 'i' for case-insensitive
    query = {
      $or: [{ username: regex }, { firstName: regex }, { lastName: regex }],
    };
  }

  const all_users = await User.find(query).sort({ username: 1 }).exec();
  res.render("all_users", {
    title: "All Users",
    all_users: all_users.map((user) => user.toObject({ virtuals: true })),
  });
});

//Get individual user
exports.userdetails_get = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).exec();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  const posts_by_user = await Post.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit) // Skip the appropriate number of posts for pagination
    .limit(limit) // Limit the number of posts returned
    .populate("user", "username")
    .populate({
      path: "likes",
      populate: { path: "user", select: "_id" },
    })
    .exec();
  const totalPosts = await Post.countDocuments({ user: req.params.id }).exec();
  const totalPages = Math.ceil(totalPosts / limit);
  // Format the createdAt date to a human-readable format
  res.render("user_detail", {
    title: user.username,
    userToDisplay: user,
    posts_by_user: posts_by_user.map((post) =>
      post.toObject({ virtuals: true })
    ),
    currentPage: page,
    totalPages: totalPages,
  });
});

//Signup routes handlers
exports.signup_get = asyncHandler(async (req, res, next) => {
  res.render("signup_form", {
    title: "Sign Up",
    errors: [{ msg: "Some error" }],
  });
});
exports.signup_post = [
  ////Validate and sanitize data
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must not be empty.")
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters long.")
    .isAlpha()
    .withMessage("First name must contain only alphabets.")
    .escape(),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name must not be empty.")
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters long.")
    .isAlpha()
    .withMessage("Last name must contain only alphabets.")
    .escape(),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username must not be empty.")
    .isLength({ max: 50 })
    .withMessage("Username must be less than 50 characters long.")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers.")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password must not be empty.")
    .isAlphanumeric()
    .withMessage("Password must contain only letters and numbers.")
    .escape(),
  body("membershipStatus")
    .trim()
    .isIn(["free", "premium"])
    .withMessage("Invalid membership status.")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("signup_form", {
        title: "Sign Up",
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if User with same username already exists.
      const userExists = await User.findOne({
        username: req.body.username,
      }).exec();
      if (userExists) {
        // User exists, send error response.
        res.render("signup_form", {
          title: "Sign Up",
          errors: [{ msg: "Username already exists." }],
        });
        return;
      }
      // Hash password before saving it.
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        // if err, do something
        if (err) {
          return next(err);
        }
        //Otherwise store hashedPassword in DB
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hashedPassword,
          membershipStatus: req.body.membershipStatus,
        });
        const result = await user.save();
        console.log("signUp User", result);
        req.logIn(user, (err) => {
          if (err) {
            console.log("Login Error from signup-post: ", err);
            return next(err);
          }
          res.redirect("/");
        });
      });
    }
  }),
];

//Login controller
exports.login_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.redirect("/");
    return;
  } else {
    res.render("login_form", {
      title: "Log in",
      errors: [],
    });
  }
});
exports.login_post = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username must not be empty.")
    .isLength({ max: 50 })
    .withMessage("Username must be less than 50 characters long.")
    .isAlphanumeric()
    .withMessage("Username must contain only letters and numbers.")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password must not be empty.")
    .isAlphanumeric()
    .withMessage("Password must contain only letters and numbers.")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //There are errors
      res.render("login_form", { title: "Login", errors: errors.array() });
      return;
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.log("Login Auth ", err);
        next(err);
      }
      if (!user) {
        return res.render("login_form", {
          title: "Login",
          errors: [{ msg: info.message }],
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.log("req.logIn() ", err);
          return next(err);
        }
        return res.redirect("/posts");
      });
    })(req, res, next);
  }),
];

//Logout
exports.logout_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//profile
exports.profile_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/loginerror");
    return;
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const posts_by_user = await Post.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit) // Skip the appropriate number of posts for pagination
    .limit(limit) // Limit the number of posts returned
    .populate("user", "username")
    .populate({
      path: "likes",
      populate: { path: "user", select: "_id" },
    })
    .exec();

  const totalPosts = await Post.countDocuments().exec();
  const totalPages = Math.ceil(totalPosts / limit);

  posts_by_user.forEach((post) => {
    post.imageUrls.forEach((image) => {
      if (image && image.url) {
        const transformation = "c_auto,f_auto,q_auto:best";
        image.url = image.url.replace("/upload/", `/upload/${transformation}/`);
      }
    });
  });

  res.render("profile", {
    title: "Profile",
    posts_by_user: posts_by_user.map((post) =>
      post.toObject({ virtuals: true })
    ),
    currentPage: page,
    totalPages: totalPages,
    user: req.user,
  });
});
exports.delete_user_get = asyncHandler(async (req, res, next) => {
  res.render("profile_delete_form", {
    title: "Delete Profile",
  });
});
exports.delete_user_post = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const userPosts = await Post.find({ user: userId });

  // Find all posts by the user and delete them
  for (const post of userPosts) {
    // Delete all likes related to the post
    for (const like of post.likes) {
      await Like.findByIdAndDelete(like);
    }
    //Delete all comments related to the post
    for (const comment of post.comments) {
      await Comment.findByIdAndDelete(comment);
    }
    //Delete all post images from cloudinary
    if (post.imageUrls.length > 0) {
      for (const image of post.imageUrls) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }
    // Delete the post itself
    await Post.findByIdAndDelete(post._id);
  }

  // Find and delete all comments made by the user
  const userComments = await Comment.find({ user: userId });
  for (const comment of userComments) {
    // Find the post containing the comment and remove it from the post's comments array
    const post = await Post.findOne({ comments: comment._id });
    if (post) {
      post.comments = post.comments.filter(
        (id) => id.toString() !== comment._id.toString()
      );
      await post.save();
    }
    // Delete the comment itself
    await Comment.findByIdAndDelete(comment._id);
  }
  // Find and delete all likes made by the user
  await Like.deleteMany({ user: userId });

  // Finally, delete the user
  await User.findByIdAndDelete(userId);
  // Log out the user
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // Redirect to the home page or a specific route after logout
    res.redirect("/");
  });
});
