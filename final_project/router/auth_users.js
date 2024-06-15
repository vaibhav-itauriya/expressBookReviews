const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid login credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username;
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }
  
    const booksByISBN = Object.values(books).filter(book => book.isbn === isbn);
    if (booksByISBN.length > 0) {
      if (booksByISBN[0].reviews[username]) {
        // If user already reviewed, modify the existing review
        booksByISBN[0].reviews[username] = review;
        return res.status(200).json({ message: "Review updated successfully" });
      } else {
        // If user hasn't reviewed, add a new review
        booksByISBN[0].reviews[username] = review;
        return res.status(200).json({ message: "Review added successfully" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
  
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
  
    const booksByISBN = Object.values(books).filter(book => book.isbn === isbn);
    if (booksByISBN.length > 0) {
      if (booksByISBN[0].reviews[username]) {
        // Delete the user's review
        delete booksByISBN[0].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(404).json({ message: "Review not found for the user" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
