const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const { cloudinary, upload } = require("../config/cloudinaryConfig");
const streamifier = require("streamifier");

const User = require("../models/user");
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment"); // Import Comment model

exports.all_posts_get = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const all_posts = await Post.find({})
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

  all_posts.forEach((post) => {
    post.imageUrls.forEach((image) => {
      if (image && image.url) {
        const transformation = "c_auto,f_auto,q_auto:best";
        image.url = image.url.replace("/upload/", `/upload/${transformation}/`);
      }
    });
  });

  res.render("all_posts", {
    title: "All Posts",
    all_posts: all_posts.map((post) => post.toObject({ virtuals: true })),
    currentPage: page,
    totalPages: totalPages,
    user: req.user,
  });
});

//Like a post
exports.like_post = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Assuming req.user contains the authenticated user
  const postId = req.params.id;
  const { page = 1, limit = 10, redirect_from, user_id } = req.query;

  // Check if the user already liked the post
  const existingLike = await Like.findOne({
    user: userId,
    post: postId,
  }).exec();

  if (existingLike) {
    // If the like exists, unlike the post
    await Like.deleteOne({ user: userId, post: postId }).exec();
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: existingLike._id },
    });
  } else {
    // If the like doesn't exist, add a new like
    const newLike = new Like({ user: userId, post: postId });
    await newLike.save();
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: newLike._id },
    });
  }
  // Redirect based on the source page
  if (redirect_from === "post_details") {
    res.redirect(`/posts/${postId}`);
  } else if (redirect_from === "user_details") {
    res.redirect(`/users/${user_id}?page=${page}&limit=${limit}`);
  } else {
    res.redirect(`/posts?page=${page}&limit=${limit}`);
  }
});

exports.post_details_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    const userId = req.user._id; // Assuming req.user contains the authenticated user
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate("user")
      .populate({
        path: "likes",
        populate: { path: "user", select: "_id" }, // Populate likes' user
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "username url" }, // Populate comments' user
        options: { sort: { createdAt: -1 } }, // Sort comments by date, descending
      })
      .exec();

    if (!post) {
      return next(new Error("Post not found"));
    }
    post.imageUrls.forEach((image) => {
      const transformation = "c_fit,f_auto,q_auto:best";
      image.url = image.url.replace("/upload/", `/upload/${transformation}/`);
    });
    // Render the post details view
    res.render("post_details", {
      title: post.title,
      post: post.toObject({ virtuals: true }),
      user: req.user,
    });
  } else {
    res.redirect("/loginerror");
  }
});

exports.add_post_get = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.render("add_post_form", {
    title: "Add Post",
    user: user,
  });
});

exports.add_post_post = [
  upload.array("images", 10), // Limit to 10 images
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("add_post_form", {
        title: "Add Post",
        user: req.user,
        errors: errors.array(),
      });
    }

    const imageUrls = [];
    for (const file of req.files) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "clubhousePosts" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        imageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({ message: "Failed to upload images." });
      }
    }
    const newPost = new Post({
      title: req.body.title,
      description: req.body.description,
      user: req.user._id,
      imageUrls: imageUrls,
    });

    await newPost.save();
    res.redirect("/users/profile");
  }),
];

exports.add_comment_post = [
  body("comment", "Comment should not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user._id;
    const errors = validationResult(req);
    const post = await Post.findById(postId)
      .populate("user")
      .populate({
        path: "likes",
        populate: { path: "user", select: "_id" }, // Populate likes' user
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "username url" }, // Populate comments' user
        options: { sort: { createdAt: -1 } }, // Sort comments by date, descending
      })
      .exec();
    if (!post) {
      return next(new Error("Post not found"));
    }
    if (!errors.isEmpty()) {
      res.render("post_details", {
        title: post.title,
        post: post.toObject({ virtuals: true }),
        user: req.user,
        errors: errors.array(),
      });
      return;
    }
    const comment = new Comment({
      content: req.body.comment,
      user: userId,
      post: postId,
    });
    await comment.save();
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });
    res.redirect(`/posts/${postId}`);
  }),
];

exports.delete_post_get = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const post = await Post.findById(postId).exec();
  if (!post) {
    res.render("delete_post_form", {
      title: "Delete Post",
      errors: [{ msg: "Post not found." }],
    });
    return;
  }
  res.render("delete_post_form", {
    title: "Delete Post",
    post: post,
  });
});

exports.delete_post_post = asyncHandler(async (req, res, next) => {
  const postId = req.body.postId;
  const post = await Post.findById(postId).exec();
  if (!post) {
    res.render("delete_post_form", {
      title: "Delete Post",
      errors: [{ msg: "Post not found." }],
    });
    return;
  }
  for (const like of post.likes) {
    await Like.findByIdAndDelete(like);
  }
  for (const comment of post.comments) {
    await Comment.findByIdAndDelete(comment);
  }
  // Delete images from Cloudinary
  if (post.imageUrls.length > 0) {
    for (const image of post.imageUrls) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }
  await Post.findByIdAndDelete(postId);
  res.redirect("/users/profile");
});

exports.delete_comment_post = asyncHandler(async (req, res, next) => {
  const commentId = req.body.comment;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);

  // Ensure the user owns the comment
  if (comment.user.toString() !== userId.toString()) {
    res.redirect("/commenterror");
    return;
  }
  // Find the post containing the comment
  const post = await Post.findOne({ comments: commentId });
  if (!post) {
    res.redirect("/commenterror");
    return;
  }
  // Remove the comment from the post's comments array
  post.comments = post.comments.filter(
    (id) => id.toString() !== commentId.toString()
  );
  await post.save();

  // Delete the comment from the comments collection
  await Comment.findByIdAndDelete(commentId);

  res.redirect(`/posts/${post._id}`);
});
