const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/user");

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
  // Format the createdAt date to a human-readable format
  const userObject = user.toObject();
  userObject.createdAt = user.createdAt.toISOString().split("T")[0];
  res.render("user_detail", {
    title: userObject.username,
    userToDisplay: userObject,
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
        console.log(`User Registered.\n${result}`);
        res.redirect("/");
      });
    }
  }),
];

//Login controller
exports.login_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.render("loginError", (title = "Logged in"));
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
          return next(err);
        }
        return res.redirect("/");
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
    req.redirect("/users/login");
  }
  // Format the createdAt date to a human-readable format
  const user = req.user.toObject();
  user.createdAt = user.createdAt.toISOString().split("T")[0];

  res.render("profile", {
    title: "Profile",
    user,
  });
});
