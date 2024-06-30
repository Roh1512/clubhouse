const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.user) {
    res.render("index", { title: "Clubhouse" });
  } else {
    res.redirect("/posts");
  }
});

router.get("/loginerror", (req, res, next) => {
  res.render("loginError", {
    title: "You must Login First.",
  });
});

router.get("/commenterror", (req, res, next) => {
  res.render("comment_error", {
    title: "You can only delete comments posted by you.",
  });
});

module.exports = router;
