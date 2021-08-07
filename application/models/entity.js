'use strict';

const fs = require('fs/promises');
const path = require('path');

class Entity {
  constructor(entity, primaryKey) {
    this.entity = entity;
    this.dataPath = path.join(__dirname, `../data/${entity}s.json`);
    this.primaryKey = primaryKey;
  }

  async getAll() {
    const data = await fs.readFile(this.dataPath);
    return JSON.parse(data);
  }

  async create(newObj) {
    const allObjects = await this.getAll();

    for (const obj of allObjects) {
      if (obj[this.primaryKey] === newObj[this.primaryKey]) {
        throw new Error(`${this.entity} already exists`);
      }
    }

    allObjects.push(newObj);
    await fs.writeFile(this.dataPath, JSON.stringify(allObjects, null, 2));
    return newObj;
  }

  async getByPrimaryKey(query) {
    const allObjects = await this.getAll();

    for (const obj of allObjects) {
      if (obj[this.primaryKey] === query) return obj;
    }

    return null;
  }
}

module.exports = Entity;
