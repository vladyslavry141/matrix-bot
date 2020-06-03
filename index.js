'use strict';

const TelegramBot = require('node-telegram-bot-api');
const Matrix = require('./matrixClass.js');
const token = require('./token.json');

if (token.split(':').length !== 2 || token.split(':')[1].length !== 35) {
  throw new Error('The variable token seems to be malformatted.')
}

const bot = new TelegramBot(token, { polling: true });
const matrices = {};
const answ = {
  start : `Привіт, це бот для елементарних дій з матрицями, щоб додати матрицю напиши /m
     і назву твоєї матриці(Латинська велика літера)`,
  sendName: 'Name of your matrix is: ',
  enterMatr: 'Please enter your matrix:',
  invalidMatr: 'Matrix is invalid.\nPlease enter your matrix:',
  matrNotExist: 'This matrix didnt exist',
};

const isComand = msg => {
  console.log(msg.text[0])
  return msg.text[0] === '/';
}
const matrixToText = matr => {
  let res = '';
  for (const row of matr) {
    res += row.join('  ') + '\n';
  }
  return res
}

const isValidName = name => {
  if (name === '' || !isNaN(Number(name))) {
    return false;
  }
  return true;
};

const determinant = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1]
  const matr = matrices[name];
  if (!matr) {
    bot.sendMessage(chatId, answ.matrNotExist);
  }
  else {
    const det = matr.getDet();
    bot.sendMessage(chatId, `${det}`);    
  }
}

const parseMatrix = (msg, name) => {
  const chatId = msg.chat.id;
  if (isComand(msg)) return;
  const rows = msg.text.split('\n');
  const matr = rows.map(row => row.split(' '));
  bot.sendMessage(chatId,`Is your matrix:\n${matrixToText(matr)}`);
  if (Matrix.isValid(matr)) {
    matrices[name] = new Matrix(matr)
    bot.sendMessage(msg.chat.id, 'What do you want to do ?', {
      "reply_markup": {
      "keyboard": [[`/print ${name}`],
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


const addName = msg => {
  const chatId = msg.chat.id;
  const name = msg.text;
  if (!isValidName(name)) {
    if (name[0] === '/') return;
    bot.sendMessage(chatId, answ.invalidName);
    bot.once('message', addName);
  } else {
    bot.sendMessage(chatId, answ.enterMatr);
    bot.once('message', msg => parseMatrix(msg, name));
  }
};

const addMatrix = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  bot.sendMessage(chatId, `${answ.sendName}${name}`);  
  bot.sendMessage(chatId, answ.enterMatr);
  bot.once('message', msg => parseMatrix(msg, name))   
};

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, answ.start, {
    "reply_markup": {
    "keyboard": [["/help"]]
    }
  });
});

bot.onText(/\/m ([A-Z]{1})/, addMatrix);
bot.onText(/\/determinant ([A-Z]{1})/, determinant);

bot.on('polling_error', (error) => {
  console.log(error);
});