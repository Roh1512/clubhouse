const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");

const postController = require("../controllers/postController");

//All posts page
router.get("/", isAuthenticated, postController.all_posts_get);

router.get(
  "/currentuser",
  isAuthenticated,
  postController.all_posts_by_current_user
);

router.get(
  "/user/:userid",
  isAuthenticated,
  postController.all_Posts_by_userid
);

// Like a post
router.post("/:id/like", isAuthenticated, postController.like_post);

router.get(
  "/:postId/comments",
  isAuthenticated,
  postController.get_comments_by_post
);

//Post add post
router.post("/create", isAuthenticated, postController.add_post_post);

//Single post page
router.get("/:id", isAuthenticated, postController.post_details_get);

router.post(
  "/:id/addcomment",
  isAuthenticated,
  postController.add_comment_post
);

router.put("/:id/edit", isAuthenticated, postController.edit_post);

//Post delete POST
router.delete("/:id/delete", isAuthenticated, postController.delete_post_post);

router.delete(
  "/:postId/comments/delete",
  isAuthenticated,
  postController.delete_comment_post
);

module.exports = router;
