const jwt = require("jsonwebtoken");

// Middleware to validate access token
const validateToken = (req, res, next) => {

  // Get the token from the request header
  const authToken = req.headers.authorization; 

  // If the auth header does not exist
  if (!authToken) {
    return res.status(401).json({ message: "Access token not provided" });
  }

  try {

    var token = authToken.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
    
  } catch (error) {
    return res.status(401).json({ message: "Invalid access token" });
  }
};

module.exports = validateToken;
