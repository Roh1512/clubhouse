const express = require("express");
const router = express.Router();

//All posts page
router.get("/", (req, res, next) => {
  res.send("Posts page");
});

//Single post page
router.get("/:id", (req, res, next) => {
  res.send(`Post ${req.params.id}'s page`);
});

//Post add get
router.get("/create", (req, res, next) => {
  res.send("Form to create post");
});

//Post add POST
router.post("/create", (req, res, next) => {
  res.send("Form to create post (POST)");
});

//Post update get
router.get("/:id/update", (req, res, next) => {
  res.send(`Form to edit post: ${req.params.id}`);
});

//Post update POST
router.post("/:id/update", (req, res, next) => {
  res.send(`Form to edit post: ${req.params.id} (POST)`);
});

//Post delete get
router.get("/:id/delete", (req, res, next) => {
  res.send(`Form to delete post: ${req.params.id}`);
});

//Post delete POST
router.post("/:id/delete", (req, res, next) => {
  res.send(`Form to delete post: ${req.params.id} POST`);
});

module.exports = router;
