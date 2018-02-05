const express = require('express');
const authController = express.Router();

// User model
const User = require('../models/user');

// Bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

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
        req.session.currentUser = newUser;
        res.redirect('/');
      }
    });
  });
});

module.exports = authController;
