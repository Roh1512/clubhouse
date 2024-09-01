module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware
    /*    console.log("Successfull authentication"); */

    return next();
  }
  // User is not authenticated, redirect to login page
  // res.redirect("/loginError");
  // console.log("Failed authentication");

  res.status(403).json({ msg: "Unauthorized" });
};
