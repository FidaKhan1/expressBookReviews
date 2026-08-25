const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const public_users = express.Router();

const hasBook = (isbn) => Object.prototype.hasOwnProperty.call(books, isbn);

// Tasks 10-13: retrieve the data asynchronously with Axios. The internal
// endpoint keeps this project self-contained while still using an HTTP request.
const getBooksWithAxios = async (req) => {
  const port = req.socket.localPort || Number(process.env.PORT) || 5000;
  const response = await axios.get(`http://127.0.0.1:${port}/internal/books`, {
    proxy: false,
    timeout: 3000
  });
  return response.data;
};

public_users.get('/internal/books', (req, res) => res.status(200).json(books));

public_users.post('/register', (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  users.push({ username, password });
  return res.status(201).json({
    message: 'User successfully registered. Now you can login.'
  });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await getBooksWithAxios(req);
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const allBooks = await getBooksWithAxios(req);
    const book = allBooks[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve the book.' });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const allBooks = await getBooksWithAxios(req);
    const matches = Object.fromEntries(
      Object.entries(allBooks).filter(([, book]) => book.author.toLowerCase() === author)
    );

    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: 'No books found for that author.' });
    }

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books by author.' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const allBooks = await getBooksWithAxios(req);
    const matches = Object.fromEntries(
      Object.entries(allBooks).filter(([, book]) => book.title.toLowerCase() === title)
    );

    if (Object.keys(matches).length === 0) {
      return res.status(404).json({ message: 'No books found with that title.' });
    }

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books by title.' });
  }
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!hasBook(isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
module.exports.getBooksWithAxios = getBooksWithAxios;
