const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const { cloudinary, upload } = require("../config/cloudinaryConfig");
const streamifier = require("streamifier");

const User = require("../models/user");
const Post = require("../models/post");
const Like = require("../models/like");
const Comment = require("../models/comment"); // Import Comment model

exports.all_posts_by_current_user = asyncHandler(async (req, res) => {
  const user = req.user;
  const userId = user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  const all_posts = await Post.find({ user: userId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip) // Skip the appropriate number of posts for pagination
    .limit(limit) // Limit the number of posts returned
    .populate("user", "username")
    .populate({
      path: "likes",
      populate: { path: "user", select: "_id" },
    })
    .exec();

  const totalPosts = await Post.countDocuments({ user: userId }).exec();
  const totalPages = Math.ceil(totalPosts / limit);

  all_posts.forEach((post) => {
    post.imageUrls.forEach((image) => {
      if (image && image.url) {
        const transformation = "c_auto,f_auto,q_auto:best";
        image.url = image.url.replace("/upload/", `/upload/${transformation}/`);
      }
    });
  });

  res.status(200).json({
    all_posts,
    currentPage: page,
    totalPages,
  });
});

exports.all_Posts_by_userid = asyncHandler(async (req, res, next) => {
  const userId = req.params.userid;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  const skip = (page - 1) * limit;

  const all_posts = await Post.find({ user: userId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip) // Skip the appropriate number of posts for pagination
    .limit(limit) // Limit the number of posts returned
    .populate("user", "username")
    .populate({
      path: "likes",
      populate: { path: "user", select: "_id" },
    })
    .exec();

  const totalPosts = await Post.countDocuments({ user: userId }).exec();
  const totalPages = Math.ceil(totalPosts / limit);

  // Apply image transformations
  all_posts.forEach((post) => {
    post.imageUrls.forEach((image) => {
      if (image && image.url) {
        const transformation = "c_auto,f_auto,q_auto:best";
        image.url = image.url.replace("/upload/", `/upload/${transformation}/`);
      }
    });
  });

  // Send the response back to the client
  return res.json({
    all_posts,
    totalPages,
    currentPage: page,
  });
});

exports.all_posts_get = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  const all_posts = await Post.find({})
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip) // Skip the appropriate number of posts for pagination
    .limit(limit) // Limit the number of posts returned
    .populate("user", "username")
    .populate({
      path: "likes",
      populate: { path: "user", select: "_id" },
    })
    .exec();

  const totalPosts = await Post.countDocuments().exec();
  const totalPages = Math.ceil(Number(totalPosts) / limit);

  all_posts.forEach((post) => {
    post.imageUrls.forEach((image) => {
      if (image && image.url) {
        const transformation = "c_auto,f_auto,q_auto:best";
        image.url = image.url.replace("/upload/", `/upload/${transformation}/`);
      }
    });
  });

  /* res.render("all_posts", {
    title: "All Posts",
    all_posts: all_posts.map((post) => post.toObject({ virtuals: true })),
    currentPage: page,
    totalPages: totalPages,
    user: req.user,
  }); */
  return res.status(200).json({
    all_posts: all_posts.map((post) => post.toObject({ virtuals: true })),
    currentPage: page,
    totalPages: totalPages,
  });
});

exports.get_comments_by_post = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const all_comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit) // Skip the appropriate number of posts for pagination
    .limit(limit) // Limit the number of posts returned
    .populate({ path: "user", select: ["_id", "username"] })
    .exec();

  return res.json(all_comments);
});

//Like a post
exports.like_post = asyncHandler(async (req, res, next) => {
  const userId = req.user._id; // Assuming req.user contains the authenticated user
  const postId = req.params.id;

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
    const newLike = new Like({
      user: userId,
      post: postId,
      createdAt: new Date(),
    });
    await newLike.save();
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: newLike._id },
    });
  }

  const post = await Post.findById(postId)
    .populate({
      path: "likes",
      populate: { path: "user", select: "_id" },
    })
    .exec();

  return res.status(200).json(post);
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
    /* res.render("post_details", {
      title: post.title,
      post: post.toObject({ virtuals: true }),
      user: req.user,
    }); */
    res.status(200).json(post);
  } else {
    // res.redirect("/loginerror");
    res.status(500).json({ msg: "Error" });
  }
});

exports.add_post_post = [
  upload.array("images", 10), // Limit to 10 images
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      /* return res.render("add_post_form", {
        title: "Add Post",
        user: req.user,
        errors: errors.array(),
      }); */
      return res.status(409).json({
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
      createdAt: new Date(),
    });

    try {
      const result = await newPost.save();

      const populatedPost = await Post.findById(newPost._id)
        .populate("user", "username")
        .populate("user")
        .populate({
          path: "comments",
          populate: { path: "user", select: "username url _id" }, // Populate comments' user
          options: { sort: { createdAt: -1 } }, // Sort comments by date, descending
        })
        .exec();

      return res.status(200).json({ populatedPost });
    } catch (error) {
      return res.status(500).json({ message: "Failed to save post." });
    }
  }),
];

exports.edit_post = [
  upload.array("images", 10), // Limit to 10 images
  asyncHandler(async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(409).json({
          errors: errors.array(),
        });
      }

      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      // Only update images if new images are provided
      let imageUrls = post.imageUrls;

      if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary
        for (const image of post.imageUrls) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (error) {
            console.error("Error deleting old image:", error);
            return res
              .status(500)
              .json({ message: "Failed to delete old images." });
          }
        }

        // Upload new images to Cloudinary
        imageUrls = [];
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
            return res
              .status(500)
              .json({ message: "Failed to upload images." });
          }
        }
      }

      // Update post fields
      post.title = req.body.title || post.title;
      post.description = req.body.description || post.description;
      post.imageUrls = imageUrls;

      const updatedPost = await post.save();

      const populatedPost = await Post.findById(updatedPost._id)
        .populate("user", "username")
        .populate({
          path: "comments",
          populate: { path: "user", select: "username url _id" }, // Populate comments' user
          options: { sort: { createdAt: -1 } }, // Sort comments by date, descending
        })
        .exec();

      return res.status(200).json({ populatedPost });
    } catch (error) {
      console.error("Error in edit_post:", error); // Log the error with more context
      return res.status(500).json({ message: "An unexpected error occurred." });
    }
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

    // Check if there are validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the post
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
      return res.status(404).json({ errors: [{ msg: "Post not found" }] });
    }

    // Create a new comment
    const comment = new Comment({
      content: req.body.comment,
      user: userId,
      post: postId,
      createdAt: new Date(),
    });

    // Save the comment
    await comment.save();

    // Update the post with the new comment
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    // Update the user's comments array
    await User.findByIdAndUpdate(userId, {
      $push: { comments: comment._id },
    });

    // Populate the comment with user details
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "username _id") // Populate only username and _id
      .exec();

    // Send the response with the populated comment
    res.status(200).json(populatedComment);
  }),
];

exports.delete_post_post = asyncHandler(async (req, res, next) => {
  const postId = req.body.postId;
  const post = await Post.findById(postId).exec();
  console.log(post);

  if (!post) {
    /* res.render("delete_post_form", {
      title: "Delete Post",
      errors: [{ msg: "Post not found." }],
    });
    return; */
    throw new Error();
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
  res.status(200).json({ msg: "Post deleted" });
});

exports.delete_comment_post = asyncHandler(async (req, res, next) => {
  const commentId = req.body.comment;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);

  // Ensure the user owns the comment
  if (comment.user.toString() !== userId.toString()) {
    return res.status(401).json({
      errors: [{ msg: "Not your comment to delete" }],
    });
  }
  // Find the post containing the comment
  const post = await Post.findOne({ comments: commentId });
  if (!post) {
    return res.status(404).json({ errors: [{ msg: "Post not found" }] });
  }
  // Remove the comment from the post's comments array
  post.comments = post.comments.filter(
    (id) => id.toString() !== commentId.toString()
  );
  await post.save();

  // Delete the comment from the comments collection
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ commentId: commentId });
});
