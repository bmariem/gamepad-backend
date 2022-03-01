const User = require("../models/User");

// only an authenticated user will be able to access the route where isAuthenticated is called
const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    if (!user) {
      // User does not exists in DB <=> error 401 <=> Unauthorized
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      // Creation of the User key in req
      req.user = user;
      return next();
    }
  } else {
    // error 401 <=> Unauthorized
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
