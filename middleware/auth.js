module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware
    return next();
  }
  // User is not authenticated, redirect to login page
  res.redirect("/loginError");
};
