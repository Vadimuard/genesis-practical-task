'use strict'

const fs = require('fs');
const path = require('path');

class Database {
  constructor(dataPath) {
    this.usersPath = path.join(dataPath, "users.json");
    // this.sessionsPath = path.join(dataPath, "session.json");
    this.saltPath = path.join(dataPath, "salt.json");
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

  async getSaltById(id) {

  }

  async serializeUser(newUser, salt) {
    const usersDb = this.deserializeUsersDb();
    const saltDb = this.deserializeSaltDb();
    for (user of usersDb.users) {
      if (user.email === newUser.email) return -1;
    }
    newUser.id = usersDb.nextId;
    usersDb.nextId += 1;
    usersDb.users.push(newUser);
    const err = await fs.promises.writeFile(this.usersPath, JSON.stringify(usersDb, null, 2));
    if (err) return -1;

    saltDb.push({
      userId: newUser.id,
      salt: salt
    });
    const err = await fs.promises.writeFile(this.saltPath, JSON.stringify(saltDb, null, 2));
    if (err) return -1;
    return newUser;
  }

  async serializeSession(newSession) {

  }
}

module.exports = Database;
