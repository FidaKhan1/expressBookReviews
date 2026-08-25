# Express Book Reviews

A server-side bookstore API built with Express, session-based JWT
authentication, Axios, and async/await.

## Run

```bash
npm install
npm start
```

The server listens on `http://localhost:5000` by default.

## Endpoints

- `GET /` - list all books
- `GET /isbn/:isbn` - find a book by ISBN
- `GET /author/:author` - find books by author
- `GET /title/:title` - find books by title
- `GET /review/:isbn` - list a book's reviews
- `POST /register` - register a user
- `POST /customer/login` - log in and create an authenticated session
- `PUT /customer/auth/review/:isbn?review=...` - add or update a review
- `DELETE /customer/auth/review/:isbn` - delete the logged-in user's review
