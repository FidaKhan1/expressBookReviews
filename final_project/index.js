const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_access_secret';

app.use(express.json());

app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'fingerprint_customer',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use('/customer/auth', function auth(req, res, next) {
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(403).json({ message: 'User not logged in.' });
  }

  return jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({ message: 'User authentication failed.' });
    }

    req.user = user;
    return next();
  });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = Number(process.env.PORT) || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
