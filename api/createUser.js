'use strict'

const crypto = require('crypto');

module.exports = async (email, password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

  const user = {
    email,
    password: hash
  };

  const newUser = global.database.serializeUser(user, salt);
  return newUser;
};
