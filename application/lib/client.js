'use strict';

const Session = require('./session');

const UNIX_EPOCH = 'Thu, 01 Jan 1970 00:00:00 GMT';
const COOKIE_EXPIRE = 'Fri, 01 Jan 2100 00:00:00 GMT';
const COOKIE_DELETE = `=deleted; Expires=${UNIX_EPOCH}; Path=/; Domain=`;

const parseHost = (host) => {
  if (!host) return 'no-host-name-in-http-headers';
  const portOffset = host.indexOf(':');
  if (portOffset > -1) host = host.substr(0, portOffset);
  return host;
};

class Client {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.host = parseHost(req.headers.host);
    this.method = req.method;
    this.body = null;
    this.token = undefined;
    this.cookie = {};
    this.preparedCookie = [];
    this.parseCookie();
  }

  static async getInstance(req, res) {
    const client = new Client(req, res);
    const url = req.url === '/' ? '/index.html' : req.url;
    const [first, second] = url.substring(1).split('/');
    if (first === 'api') {
      client.apiMethod = second;
    }
    if (client.method === 'POST') {
      client.body = await client.receiveArgs();
    }
    await Session.restore(client);
    return client;
  }

  httpResponse(status, message) {
    this.res.statusCode = status;
    this.res.end(message);
  }

  async receiveArgs() {
    const buffers = [];
    for await (const chunk of this.req) buffers.push(chunk);
    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data);
  }

  parseCookie() {
    const { req } = this;
    const { cookie } = req.headers;
    if (!cookie) return;
    const items = cookie.split(';');
    for (const item of items) {
      const parts = item.split('=');
      const key = parts[0].trim();
      const val = parts[1] || '';
      this.cookie[key] = val.trim();
    }
  }

  setCookie(name, val, httpOnly = false) {
    const { host } = this;
    const expires = `expires=${COOKIE_EXPIRE}`;
    let cookie = `${name}=${val}; ${expires}; Path=/; Domain=${host}`;
    if (httpOnly) cookie += '; HttpOnly';
    this.preparedCookie.push(cookie);
  }

  deleteCookie(name) {
    this.preparedCookie.push(name + COOKIE_DELETE + this.host);
  }

  sendCookie() {
    const { res, preparedCookie } = this;
    if (preparedCookie.length && !res.headersSent) {
      console.dir({ preparedCookie });
      res.setHeader('Set-Cookie', preparedCookie);
    }
  }
}

module.exports = Client;
