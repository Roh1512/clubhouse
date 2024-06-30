const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

/* GET users listing. */
router.get("/", isAuthenticated, userController.allusers_get);

//User signup
router.get("/signup", userController.signup_get);
router.post("/signup", userController.signup_post);

//User login
router.get("/login", userController.login_get);
router.post("/login", userController.login_post);

//User logout
router.get("/logout", isAuthenticated, userController.logout_get);

//User profile
router.get("/profile", isAuthenticated, userController.profile_get);

//User profile delete
router.get("/profile/delete", isAuthenticated, userController.delete_user_get);
router.post(
  "/profile/delete",
  isAuthenticated,
  userController.delete_user_post
);

//Get a single user
router.get("/:id", isAuthenticated, userController.userdetails_get);

module.exports = router;
