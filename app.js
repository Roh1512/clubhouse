const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const favicon = require("serve-favicon");
const passport = require("passport");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");

const session = require("express-session");
const MongoStore = require("connect-mongo");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./config/passport");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.set("trust proxy", 1);

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 400,
});

const mongodb_uri = process.env.MONGODB_URI;
async function main() {
  try {
    await mongoose.connect(mongodb_uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

main();

// Apply rate limiter to all requests
app.use(limiter);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
      imgSrc: [
        "'self'", // Allow images from the same origin
        "https://res.cloudinary.com", // Allow images from Cloudinary
        "data:", // Allow data URIs for images
      ],
    },
  })
);

// view engine setup
/* app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug"); */

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, "public")));

//Session store setup
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: "Sessions",
  ttl: 24 * 60 * 60, // 1 day
});
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "None",
      domain: process.env.COOKIE_DOMAIN || undefined, // Set if needed
      path: "/", // Ensure the path is correct
    },
  })
);

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.user) {
    const { password, ...sanitizedUser } = req.user._doc || req.user; // Use _doc for Mongoose models
    res.locals.user = sanitizedUser;
  }
  next();
});

app.use((req, res, next) => {
  console.log("Cookies: ", req.cookies);
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});

// Serve favicon
app.use(favicon(path.join(__dirname, "public", "images", "logoicon.svg")));

// app.use("/", indexRouter);
app.get("/", (req, res) => {
  res.cookie("testCookie", "testValue");
  res.json("Cookie set!");
});
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

module.exports = app;
