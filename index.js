'use strict';

const TelegramBot = require('node-telegram-bot-api');
const Matrix = require('./matrixClass.js');
const { token } = require('./token.json');
const answ = require('./answers.json');

if (token.split(':').length !== 2 || token.split(':')[1].length !== 35) {
  throw new Error('The variable token seems to be malformatted.');
}

const bot = new TelegramBot(token, { polling: true });
const matrices = {};

const isComand = msg => msg.text[0] === '/';

const matrixToText = matr => {
  let res = '';
  for (const row of matr) {
    res += row.join('  ') + '\n';
  }
  return res;
};

const isValidName = name => {
  if (name === '' || !isNaN(Number(name))) {
    return false;
  }
  return true;
};

const determinant = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  const matr = matrices[chatId][name];
  if (!matr) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const det = matr.getDet();
    bot.sendMessage(chatId, `${det}`);
  }
};

const print = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  const matr = matrices[chatId][name];
  if (!matr) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const text = matrixToText(matr.matrix);
    bot.sendMessage(chatId, text);
  }
};

const transpose = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  const matr = matrices[chatId][name];
  if (!matr) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const transposedMatr = matr.transpose();
    const text = matrixToText(transposedMatr.matrix);
    bot.sendMessage(chatId, text);
  }
};

const invert = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  const matr = matrices[chatId][name];
  if (!matr) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const invertedMatr = matr.getInvert();
    const text = typeof invertedMatr === 'string' ?
      invertedMatr :
      matrixToText(invertedMatr.matrix);
    bot.sendMessage(chatId, text);
  }
};

const matrToFract = matr => {
  for (let i = 0; i < matr.length; i++) {
    for (let j = 0; j < matr[0].length; j++) {
      const el = Number(matr[i][j]);
      if (!isNaN(el)) {
        matr[i][j] = el;
      }
    }
  }
};

const parseMatrix = (msg, name) => {
  const chatId = msg.chat.id;
  if (isComand(msg)) return;
  const rows = msg.text.split('\n');
  const matr = rows.map(row => row.split(' '));
  bot.sendMessage(chatId, `Is your matrix:\n${matrixToText(matr)}`);
  if (Matrix.isValid(matr)) {
    matrToFract(matr);
    matrices[chatId] = {};
    matrices[chatId][name] = new Matrix(matr);
    bot.sendMessage(msg.chat.id, 'What do you want to do ?', {
      'reply_markup': {
        'keyboard': [[`/print ${name}`],
          [`/transpose ${name}`],
          [`/invert ${name}`],
          [`/determinant ${name}`],
        ]
      }
    });

  } else {
    bot.sendMessage(chatId, answ.invalidMatr);
    bot.once('message', msg => parseMatrix(msg, name));
  }
};

const addMatrix = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  bot.sendMessage(chatId, `${answ.sendName}${name}`);
  bot.sendMessage(chatId, answ.enterMatr);
  bot.once('message', msg => parseMatrix(msg, name));
};

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, answ.start, {
    'reply_markup': {
      'keyboard': [['/help']]
    }
  });
});

bot.onText(/\/m ([A-Z]{1})/, addMatrix);
bot.onText(/\/determinant ([A-Z]{1})/, determinant);
bot.onText(/\/print ([A-Z]{1})/, print);
bot.onText(/\/invert ([A-Z]{1})/, invert);
bot.onText(/\/transpose ([A-Z]{1})/, transpose);

bot.on('polling_error', error => {
  console.log(error);
});
