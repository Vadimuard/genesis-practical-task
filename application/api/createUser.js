'use strict';

const Entity = require('../models/entity');
const { hashPassword } = require('../lib/security');
const User = new Entity('user', 'email');

module.exports = async (email, password) => {
  const hash = await hashPassword(password);
  return await User.create({ email, password: hash });
};
