const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return error(res, "Not authorized. Token missing.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return error(res, "User not found.", 401);
    }

    if (user.status !== "active") {
      return error(res, "Account is not active. Contact support.", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, "Not authorized. Invalid or expired token.", 401);
  }
};

module.exports = { protect };
