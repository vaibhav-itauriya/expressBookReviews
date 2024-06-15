const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Session middleware setup
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware using JWT
app.use("/customer/auth/*", function auth(req, res, next) {
  // Extract the JWT token from the request headers or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, 'access');
    req.user = decoded; // Attach the decoded user information to the request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." });
  }
});

// Mounting authenticated routes for customers
app.use("/customer", customer_routes);

// General routes (not requiring authentication)
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
