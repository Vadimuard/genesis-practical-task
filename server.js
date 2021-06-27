'use strict';

const http = require('http');
const qs = require('querystring');
const axios = require('axios');
const validate_email = require('email-validator').validate;

const Client = require('./client.js');
const Session = require('./session.js');
const Database = require('./database.js');
const createUser = require('./api/createUser.js');
const authUser = require('./api/authUser.js');

global.database = Database.getInstance(`${__dirname}/data`);

const routing = {
  '/user/create': async client => {
    const body = client.body;
    if (!(body["email"] && body["password"])) {
      if (!(typeof body["password"] === "string" && validate_email(body["email"]) && body["password"].length > 7)) {
        return 400;
      }
    }
    const newUser = createUser(
      body["email"],
      body["password"]
    );
    return newUser;
  },
  '/user/login': async client => {
    const body = client.body;
    if (!(body["email"] && body["password"])) {
      if (!(typeof body["password"] === "string" && validate_email(body["email"]) && body["password"].length > 7)) {
        client.res.statusCode = 400;
        return "Email or password are in incorrect format";
      }
    }
    const user = await authUser(body["email"], body["password"]);
    if (user === 404 || user === 403) return user;
    Session.start(client);
    return {
      user,
      sessionToken: client.token
    };
  },
  '/btcRate': async client => {
    if (client.session) {
      const req_url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah";
      const response = await axios.get(req_url);
      console.log(response.data.bitcoin.uah);
      return response.data.bitcoin.uah;
    }
    client.res.statusCode = 403;
    return "Access denied";
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
