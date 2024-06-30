const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/auth");

const postController = require("../controllers/postController");

//All posts page
router.get("/", isAuthenticated, postController.all_posts_get);

// Like a post
router.post("/:id/like", isAuthenticated, postController.like_post);

//Post add get
router.get("/create", isAuthenticated, postController.add_post_get);
//Post add post
router.post("/create", isAuthenticated, postController.add_post_post);

//Post add POST
router.post("/create", (req, res, next) => {
  res.send("Form to create post (POST)");
});

//Single post page
router.get("/:id", isAuthenticated, postController.post_details_get);

router.post(
  "/:id/addcomment",
  isAuthenticated,
  postController.add_comment_post
);

//Post update get
router.get("/:id/update", (req, res, next) => {
  res.send(`Form to edit post: ${req.params.id}`);
});

//Post update POST
router.post("/:id/update", (req, res, next) => {
  res.send(`Form to edit post: ${req.params.id} (POST)`);
});

//Post delete get
router.get("/:id/delete", isAuthenticated, postController.delete_post_get);

//Post delete POST
router.post("/:id/delete", isAuthenticated, postController.delete_post_post);

router.post(
  "/:id/comments/:commentid/delete",
  isAuthenticated,
  postController.delete_comment_post
);

module.exports = router;
