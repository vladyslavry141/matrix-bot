'use strict';

const MatrixBot = require('./MatrixBot.js');
const { token } = require('./token.json');

const matrices = {};

const bot = new MatrixBot(token, matrices)

bot.on('polling_error', error => {
  console.log(error);
});
