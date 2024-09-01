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
  const searchQuery = (req.query.search || "").trim();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  let query = {};
  if (searchQuery) {
    const regex = new RegExp(`^${searchQuery}`, "i"); // 'i' for case-insensitive
    console.log(regex);

    query = {
      $or: [{ username: regex }, { firstName: regex }],
    };
  }

  const all_users = await User.find(query)
    .select("-password")
    .sort({ username: 1, id: 1 })
    .skip(skip)
    .limit(limit)
    .exec();
  /* res.render("all_users", {
    title: "All Users",
    all_users: all_users.map((user) => user.toObject({ virtuals: true })),
  }); */

  const totalUsers = await User.countDocuments(query).exec();
  const totalPages = Math.ceil(Number(totalUsers) / limit);

  return res.status(200).json({
    all_users: all_users.map((user) => {
      return user.toObject({ virtuals: true });
    }),
    currentPage: page,
    totalPages: totalPages,
  });
});

//Get individual user
exports.userdetails_get = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select("-password").exec();

  const { password, ...sanitizedUser } = user;

  return res.status(200).json(sanitizedUser);
});

//Signup routes handlers
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
      /* res.render("signup_form", {
        title: "Sign Up",
        errors: errors.array(),
      }); */
      return res.status(400).json({ errors: errors.array() });
    } else {
      // Data from form is valid.
      // Check if User with same username already exists.
      const userExists = await User.findOne({
        username: req.body.username,
      }).exec();
      if (userExists) {
        // User exists, send error response.
        /* res.render("signup_form", {
          title: "Sign Up",
          errors: [{ msg: "Username already exists." }],
        }); */
        return res
          .status(409)
          .json({ errors: [{ msg: "Username already exists" }] });
      }
      // Hash password before saving it.
      bcrypt.hash(
        req.body.password,
        Number(process.env.PW_HASH),
        async (err, hashedPassword) => {
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
          console.log("signUp User: ", result);
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            // return res.redirect("/");
            const { password, ...sanitizedUser } = req.user._doc || req.user;
            return res.status(200).json({
              msg: "User registered successfully.",
              user: sanitizedUser,
            });
          });
        }
      );
    }
  }),
];

//Change password
exports.change_password = [
  body("currentPassword")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password must not be empty.")
    .isAlphanumeric()
    .withMessage("Password must contain only letters and numbers.")
    .escape(),
  body("newPassword")
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
      /* res.render("login_form", { title: "Login", errors: errors.array() });
      return; */
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.user) {
      // res.redirect("/loginerror");
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const userId = req.user._id;
    const user = await User.findById(userId);
    const match = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const newPassword = req.body.newPassword;
    if (req.body.newPassword !== "" || undefined) {
      bcrypt.hash(
        newPassword,
        Number(process.env.PW_HASH),
        async (err, hashedPassword) => {
          if (err) {
            return next(err);
          }
          user.password = hashedPassword;
          const updatedUser = await user.save();
          return res.status(200).json({ msg: "Password updated successfully" });
        }
      );
    } else {
      return res.status(500).json({ msg: "Error changing password" });
    }
  }),
];

//Login controller
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
      /* res.render("login_form", { title: "Login", errors: errors.array() });
      return; */
      return res.status(400).json({ errors: errors.array() });
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        // next(err);
        return res
          .status(500)
          .json({ errors: [{ msg: "Authentication failed." }] });
      }
      if (!user) {
        /* return res.render("login_form", {
          title: "Login",
          errors: [{ msg: info.message }],
        }); */
        return res.status(404).json({ errors: [{ msg: info.message }] });
      }
      req.logIn(user, (err) => {
        if (err) {
          // return next(err);
          return res.status(500).json({ errors: [{ msg: "Login failed" }] });
        }
        // return res.redirect("/");
        const { password, ...sanitizedUser } = req.user._doc || req.user;
        return res.status(200).json({
          msg: "Login successfull",
          user: sanitizedUser,
        });
      });
    })(req, res, next);
  }),
];

//Edit profile data
exports.edit_profile = [
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
      /* res.render("login_form", { title: "Login", errors: errors.array() });
      return; */
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.user) {
      // res.redirect("/loginerror");
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const userId = req.user._id;
    const enteredPassword = req.body.password;
    const user = await User.findById(userId);
    const match = await bcrypt.compare(enteredPassword, user.password);

    if (!match) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    user.username = req.body.username || user.username;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    const updatedUser = await user.save();

    const { password, ...sanitizedUser } = updatedUser;
    return res.status(200).json({
      msg: "Successfully updated profile",
      user: sanitizedUser,
    });
  }),
];

//Logout
exports.logout_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      // return next(err);
      return res.status(500).json({ errors: [{ msg: "Cannot Logout" }] });
    }
    // res.redirect("/");
    return res.status(200).json({ msg: "Logout successfull" });
  });
});

//profile
exports.profile_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    // res.redirect("/loginerror");
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const { password, ...serializedUser } = req.user;

  /* res.render("profile", {
    title: "Profile",
    posts_by_user: posts_by_user.map((post) =>
      post.toObject({ virtuals: true })
    ),
    currentPage: page,
    totalPages: totalPages,
    user: req.user,
  }); */

  return res.status(200).json({
    user: serializedUser,
  });
});

//delete post
exports.delete_user_post = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const password = req.body.password || "";
  console.log(password);

  const user = await User.findById(userId);

  const match = await bcrypt.compare(password, user.password);

  if (match) {
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
      res.status(200).json({
        msg: "User account deleted",
      });
    });
  } else {
    res.status(400).json({ msg: "Incorrect password" });
  }
});
