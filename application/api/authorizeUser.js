'use strict';

const { validatePassword } = require('../lib/security');

const Entity = require('../models/entity');
const User = new Entity('user', 'email');

module.exports = async (email, password) => {
  const user = await User.getByPrimaryKey(email);
  if (!user) return user;
  const arePasswordsEqual = await validatePassword(password, user.password);
  if (!arePasswordsEqual) {
    throw new Error('passwords dont match');
  }
  return user;
};
