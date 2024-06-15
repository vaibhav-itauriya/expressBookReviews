const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if the username already exists
    if (isValid(username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});


// asyncHandler for improving scope of Task 1-4
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get the book list available in the shop
public_users.get('/',asyncHandler(async (req, res) => {
    const bookList = Object.values(books).map(book => ({ title: book.title, author: book.author }));
    return res.status(200).json(bookList);
}));

// Get book details based on ISBN
public_users.get('/isbn/:isbn',asyncHandler(async (req, res) => {
    const isbn = req.params.isbn;

    const booksByISBN = Object.values(books).filter(book => book.isbn === isbn);
    if (booksByISBN.length > 0) {
      return res.status(200).json(booksByISBN);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
 }));
  
// Get book details based on author
public_users.get('/author/:author',asyncHandler(async (req, res) => {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
  
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "Books by author not found" });
    }
  
}));

// Get all books based on title
public_users.get('/title/:title',asyncHandler(async (req, res) => {
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: "Books with title not found" });
    }
}));

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const booksByISBN = Object.values(books).filter(book => book.isbn === isbn);
    if (booksByISBN.length > 0) {
      const reviews = booksByISBN[0].reviews;
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
