'use strict';

const http = require('http');
const qs = require('querystring');

const Client = require('./client.js');
const Session = require('./session.js');
const Database = require('./database.js');

global.database = Database.getInstance("~/projects/genesis-practical-task/data")

const routing = {
  '/user/create': async client => {
    const body = client.body;
    return body;
  },
  '/user/login': async client => {
    Session.start(client);
    return `Session token is: ${client.token}`;
  },
  '/btcRate': async client => {
    const result = `Session destroyed: ${client.token}`;
    Session.delete(client);
    return result;
  },
};

const types = {
  object: JSON.stringify,
  string: s => s,
  number: n => n.toString(),
  undefined: () => 'not found',
};

http.createServer(async (req, res) => {
  const client = await Client.getInstance(req, res);
  const { method, url, headers } = req;
  console.log(`${method} ${url} ${headers.cookie}`);
  const handler = routing[url];

  let requestBody = "";
  req.on('data', data => {
    requestBody += data;
  });
  req.on('end', () => {
    client.body = qs.parse(requestBody);

    res.on('finish', () => {
      if (client.session) client.session.save();
    });
    if (!handler) {
      res.statusCode = 404;
      res.end('Not found 404');
      return;
    }
    handler(client).then(data => {
      const type = typeof data;
      const serializer = types[type];
      const result = serializer(data);
      client.sendCookie();
      res.end(result);
    }, err => {
      res.statusCode = 500;
      res.end('Internal Server Error 500');
      console.log(err);
    });
  });

}).listen(8000, () => {
  console.log(`Server has successfully started on port 8000`);
});
