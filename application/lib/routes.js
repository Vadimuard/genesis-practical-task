'use strict';

const Session = require('../lib/session');
const validateEmail = require('email-validator').validate;
const btcRate = require('../api/btcRate');
const createUser = require('../api/createUser');
const authorizeUser = require('../api/authorizeUser');

const validateUserData = (user) => {
  console.dir(user);
  if (!user) return false;
  const { email, password } = user;
  return (
    email &&
    password &&
    typeof password === 'string' &&
    validateEmail(email) &&
    password.length > 7
  );
};

const routes = {
  '/user/create': async (client) => {
    const user = client.body;
    if (!validateUserData(user)) return;
    try {
      const processedUser = await createUser(user.email, user.password);
      return processedUser;
    } catch (err) {
      console.dir(err);
      return err;
    }
  },
  '/user/login': async (client) => {
    const user = client.body;
    if (!validateUserData(user)) return;
    try {
      const processedUser = await authorizeUser(user.email, user.password);
      if (!user) return 'user does not exist';
      Session.start(client);
      return processedUser;
    } catch (err) {
      return err;
    }
  },
  '/btcRate': async (client) => {
    if (client.session) {
      const rate = await btcRate();
      return rate;
    }
    return 403;
  },
};

module.exports = routes;
