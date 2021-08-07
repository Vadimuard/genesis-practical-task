'use strict';
const http = require('http');
const routes = require('./lib/routes');
const Client = require('./lib/client');
const PORT = 8000;

const types = {
  object: JSON.stringify,
  string: (s) => s,
  number: (n) => n.toString(),
  undefined: () => 'not found',
};

const server = http.createServer(async (req, res) => {
  const client = await Client.getInstance(req, res);
  const { method, url, headers } = req;
  console.dir(`${method}, ${url}, ${headers}`);
  const handler = routes[url];
  res.on('finish', () => {
    if (client.session) client.session.save();
  });
  if (!handler) {
    res.statusCode = 404;
    res.end(`Error: method ${method} was not found`);
  }
  handler(client)
    .then((data) => {
      const type = typeof data;
      const serializer = types[type];
      res.statusCode = 200;
      client.sendCookie();
      res.end(serializer(data));
    })
    .catch((err) => {
      console.error(err);
    });
});

server.listen(8000, () => {
  console.log(`Server started on port ${PORT}`);
});
