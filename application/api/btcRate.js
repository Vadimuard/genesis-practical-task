'use strict';

const { request } = require('undici');

module.exports = async () => {
  const reqUrl =
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah';
  const { body } = await request(reqUrl);
  const data = await body.json();
  return data.bitcoin.uah;
};
