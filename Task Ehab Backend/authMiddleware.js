const jwt = require("jsonwebtoken");

// Middleware to validate access token
const validateToken = (req, res, next) => {
  const authToken = req.headers.authorization; // Get the token from the request header

  if (!authToken) {
    return res.status(401).json({ message: "Access token not provided" });
  }

  try {

    var token = authToken.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId; // Store the user ID in the request object
    next(); // Call the next middleware
  } catch (error) {
    return res.status(401).json({ message: "Invalid access token" });
  }
};

module.exports = validateToken;
