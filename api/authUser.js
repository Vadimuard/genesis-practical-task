'use strict'

const crypto = require('crypto');

module.exports = async (email, password) => {
  const user = global.database.getUserByEmail(email);
  if (!user) return 404;

  const salt = await global.database.getSaltByUserId(user.id);
  if (!salt) return 404;

  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  if (hash === user.password) {
    return user;
  }
  return 403;
};
