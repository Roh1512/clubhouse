const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

/* GET users listing. */
router.get("/", isAuthenticated, userController.allusers_get);

//User signup
router.post("/signup", userController.signup_post);

//User login
router.post("/login", userController.login_post);

//User logout
router.get("/logout", isAuthenticated, userController.logout_get);

//User profile
router.get("/profile", isAuthenticated, userController.profile_get);

router.post(
  "/profile/delete",
  isAuthenticated,
  userController.delete_user_post
);

router.put("/profile/edit", isAuthenticated, userController.edit_profile);

router.put(
  "/profile/editpassword",
  isAuthenticated,
  userController.change_password
);

//Get a single user
router.get("/:id", isAuthenticated, userController.userdetails_get);

module.exports = router;
