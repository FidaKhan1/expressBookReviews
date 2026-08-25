const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_access_secret';

let users = [];

const isValid = (username) => {
  const normalized = username.trim().toLowerCase();
  return !users.some((user) => user.username.toLowerCase() === normalized);
};

const authenticatedUser = (username, password) => users.some(
  (user) => user.username.toLowerCase() === username.trim().toLowerCase()
    && user.password === password
);

// Only registered users can login
regd_users.post('/login', (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const registeredUser = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );
  const accessToken = jwt.sign(
    { username: registeredUser.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username: registeredUser.username
  };

  return res.status(200).json({ message: 'User successfully logged in.' });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const reviewValue = req.query.review ?? req.body.review;
  const review = typeof reviewValue === 'string' ? reviewValue.trim() : '';

  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  if (!review) {
    return res.status(400).json({ message: 'A review is required.' });
  }

  const { username } = req.session.authorization;
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for ISBN ${isbn} added or updated successfully.`,
    reviews: books[isbn].reviews
  });
});

// Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const { username } = req.session.authorization;
  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({ message: 'No review from this user was found.' });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted successfully.`
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
