'use strict'

const fs = require('fs');
const path = require('path');

class Database {
  constructor(dataPath) {
    this.usersPath = path.join(dataPath, "users.json");
    this.saltPath = path.join(dataPath, "salt.json");
  }

  static getInstance(dataPath) {
    const database = new Database(dataPath);
    return database;
  }

  async deserializeUsersDb() {
    const data = await fs.promises.readFile(this.usersPath);
    return JSON.parse(data);
  }

  async deserializeSaltDb() {
    const data = await fs.promises.readFile(this.saltPath);
    return JSON.parse(data);
  }

  async deserializeSessionsDb() {
    const data = await fs.promises.readFile(this.sessionsPath);
    return JSON.parse(data);
  }

  async getUserByEmail(email) {
    const usersDb = await this.deserializeUsersDb();
    for (let user of usersDb.users) {
      if (user.email === email) {
        return user;
      }
    }
  }

  async getSaltByUserId(id) {
    const saltDb = await this.deserializeSaltDb();
    for (let salt of saltDb) {
      if (salt.userId === id) {
        return salt;
      }
    }
  }

  async serializeUser(newUser, salt) {
    const usersDb = await this.deserializeUsersDb();
    const saltDb = await this.deserializeSaltDb();

    const response = {
      statusCode: 0,
      err: null,
      data: null
    };

    for (let user of usersDb.users) {
      if (user.email === newUser.email) {
        response.statusCode = 409;
        response.err = "user with this email already exists";
        return response;
      }
    }
    newUser.id = usersDb.nextId;
    usersDb.nextId += 1;
    usersDb.users.push(newUser);

    const userErr = await fs.promises.writeFile(this.usersPath, JSON.stringify(usersDb, null, 2));
    if (userErr) {
      response.statusCode = 500;
      response.err = userErr;
      return response;
    }

    saltDb.push({
      userId: newUser.id,
      salt: salt
    });
    const saltErr = await fs.promises.writeFile(this.saltPath, JSON.stringify(saltDb, null, 2));

    if (saltErr) {
      response.statusCode = 500;
      response.err = saltErr;
      return response;
    }
    response.statusCode = 200;
    response.data = newUser;
    return response;
  }
}

module.exports = Database;
