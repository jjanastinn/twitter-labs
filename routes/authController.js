const express = require('express');
const authController = express.Router();

// User model
const User = require('../models/user');

// Bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

authController.get('/', (req, res) => {
  res.redirect('/login');
});

authController.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

authController.post('/signup', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === '' || password === '') {
    res.render('auth/signup', {
      errorMessage: 'Indicate a username and a password to sign up'
    });
    return;
  }

  User.findOne({ 'username': username }, 'username', (err, user) => {
    if (user !== null) {
      res.render('auth/signup', {
        errorMessage: 'The username already exists'
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render('auth/signup', {
          errorMessage: 'Something went wrong when signing up'
        });
      } else {
        res.redirect('/login');
      }
    });
  });
});

authController.get('/login', (req, res, next) => {
  res.render('auth/login');
});

authController.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Indicate a username and a password to log in'
    });
    return;
  }

  User.findOne({ 'username': username },
    '_id username password following',
    (err, user) => {
      if (err || !user) {
        res.render('auth/login', {
          errorMessage: "The username doesn't exist"
        });
      } else {
        if (bcrypt.compareSync(password, user.password)) {
          req.session.currentUser = user;
          // logged in
        } else {
          res.render('auth/login', {
            errorMessage: 'Incorrect password'
          });
        }
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.redirect('/tweets');
      } else {
        res.render('auth/login', {
          errorMessage: 'Incorrect password'
        });
      }
    });
});

authController.get('/logout', (req, res, next) => {
  if (!req.session.currentUser) { res.redirect('/'); return; }

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

module.exports = authController;
