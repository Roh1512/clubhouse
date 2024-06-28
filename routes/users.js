const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

/* GET users listing. */
router.get("/", userController.allusers_get);

//User signup
router.get("/signup", userController.signup_get);
router.post("/signup", userController.signup_post);

//User login
router.get("/login", userController.login_get);
router.post("/login", userController.login_post);

//User logout
router.get("/logout", userController.logout_get);

//User profile
router.get("/profile", userController.profile_get);

//Get a single user
router.get("/:id", userController.userdetails_get);

module.exports = router;
