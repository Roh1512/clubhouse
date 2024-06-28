const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const strategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("Incorrect Username");
      return done(null, false, { message: "Incorrect Username" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Incorrect Password");
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
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
