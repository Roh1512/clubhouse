const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const strategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      // console.log("Incorrect Username");
      return done(null, false, { message: "Incorrect Username" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // console.log("Incorrect Password");
      return done(null, false, { message: "Incorrect Password" });
    }
    console.log("Authentication successful");
    return done(null, user);
  } catch (error) {
    console.log("Error in strategy:", error);
    return done(error);
  }
});

passport.use(strategy);

passport.serializeUser((user, done) => {
  console.log("Serialize User:", user);
  const { password, ...sanitizedUser } = user._doc || user;
  done(null, sanitizedUser._id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user with ID:", id);
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      console.log("User not found in deserializeUser");
      return done(null, false);
    }
    console.log("Deserialized user:", user);
    const { password, ...sanitizedUser } = user._doc || user;
    done(null, sanitizedUser);
  } catch (error) {
    console.error("Error in deserializeUser:", error);
    done(error);
  }
});
