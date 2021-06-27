'use strict'

const crypto = require('crypto');

module.exports = async (email, password) => {
  const user = await global.database.getUserByEmail(email);
  const response = {
    statusCode: 0,
    err: null,
    data: null
  };
  if (!user) {
    response.statusCode = 404;
    response.err = "User with this email does not exist";
    return response;
  }

  const {salt} = await global.database.getSaltByUserId(user.id);
  if (!salt) {
    response.statusCode = 500;
    response.err = "Salt not found";
    return response;
  }

  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  if (hash === user.password) {
    response.statusCode = 200;
    response.data = user;
    return response;
  }

  response.statusCode = 403;
  response.err = "Wrong password";
  return response;
};
