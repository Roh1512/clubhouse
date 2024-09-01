const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  try {
    res.status(200).json({
      msg: "Connected to server",
    });
  } catch (error) {
    next(Error("Error connecting"));
  }
});

module.exports = router;
