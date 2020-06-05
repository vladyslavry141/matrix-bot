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
const IsThereMatr = (chatId, name) => {
  if (matrices[chatId] && matrices[chatId][name]) {
    return true;
  }
  return false;
};

const matrixToText = matr => {
  let res = '';
  for (const row of matr) {
    res += row.join('  ') + '\n';
  }
  return res;
};

const systemToText = matr => {
  const rowNum = matr.length;
  const columnNum = matr[0].length;
  let text = 'Is your system:\n ';
  for (let i = 0; i < rowNum; i++) {
    for (let j = 0; j < columnNum - 2; j++) {
      text += `(${matr[i][j]})*X${j + 1} + `;
    }
    text += `(${matr[i][columnNum - 2]})*X${columnNum - 1} `;
    text += `= ${matr[i][columnNum - 1]}\n  `;
  }
  return text;
};

const printUsersMatr = msg => {
  const chatId = msg.chat.id;
  let text = 'Your matrices:\n';
  if (!matrices[chatId]) {
    bot.sendMessage(chatId, 'Your list of matrices is empty');
  } else {
    for (const name in matrices[chatId]) {
      text += `${name}:\n`;
      const matr = matrices[chatId][name];
      text += matrixToText(matr.matrix);
    }
    bot.sendMessage(chatId, text);
  }
};

const determinant = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  if (!IsThereMatr(chatId, name)) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const matr = matrices[chatId][name];
    const det = matr.getDet();
    bot.sendMessage(chatId, `${det}`);
  }
};

const printMatr = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  if (!IsThereMatr(chatId, name)) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const matr = matrices[chatId][name];
    const text = matrixToText(matr.matrix);
    bot.sendMessage(chatId, text);
  }
};

const transposeMatr = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  if (!IsThereMatr(chatId, name)) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const matr = matrices[chatId][name];
    const transposedMatr = matr.transpose();
    const text = matrixToText(transposedMatr.matrix);
    bot.sendMessage(chatId, text);
  }
};

const invertMatr = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  if (!IsThereMatr(chatId, name)) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const matr = matrices[chatId][name];
    const invertedMatr = matr.getInvert();
    const text = typeof invertedMatr === 'string' ?
      invertedMatr :
      matrixToText(invertedMatr.matrix);
    bot.sendMessage(chatId, text);
  }
};

const rangeOfMatr = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  if (!IsThereMatr(chatId, name)) {
    bot.sendMessage(chatId, answ.matrNotExist);
  } else {
    const matr = matrices[chatId][name];
    const range = matr.getRange();
    bot.sendMessage(chatId, `Range is ${range}`);
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

const deleteEmptyStr = arr => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === '') {
      arr.splice(i, 1);
    }
  }
};

const parseMatrix = text => {
  const rows = text.split('\n');
  const matr = rows.map(row => {
    const splited = row.split(' ');
    deleteEmptyStr(splited);
    return splited.map(el => el.trim());
  });
  return matr;
};

const getKeyboardArr = name => [[`/print ${name}`],
  [`/determinant ${name}`],
  [`/range ${name}`],
  [`/transpose ${name}`],
  [`/invert ${name}`],
  ['/help'],
];

const inputMatrix = (msg, name) => {
  const chatId = msg.chat.id;
  if (isComand(msg)) return;
  const matr = parseMatrix(msg.text);
  bot.sendMessage(chatId, `Is your matrix:\n${matrixToText(matr)}`);
  if (Matrix.isValid(matr)) {
    matrToFract(matr);
    if (!matrices[chatId]) {
      matrices[chatId] = {};
    }
    matrices[chatId][name] = new Matrix(matr);
    bot.sendMessage(msg.chat.id, 'What do you want to do ?', {
      'reply_markup': {
        'keyboard': getKeyboardArr(name),
      }
    });
  } else {
    bot.sendMessage(chatId, answ.invalidMatr);
    bot.once('message', msg => inputMatrix(msg, name));
  }
};


const solveSoLE = msg => {
  const chatId = msg.chat.id;
  const rows = msg.text.split('\n');
  const matr = rows.map(row => row.split(' '));
  if (Matrix.isValid(matr)) {
    matrToFract(matr);
    bot.sendMessage(chatId, systemToText(matr));
    const extendMatr = new Matrix(matr);
    const solution = Matrix.findSolOfSoLE(extendMatr);
    bot.sendMessage(chatId, solution);
  } else {
    bot.sendMessage(chatId, answ.invalidSystem);
    bot.once('message', solveSoLE);
  }
};

const inputSoLe = msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, answ.enterSystem);
  bot.once('message', solveSoLE);
};

const addMatrix = (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];
  bot.sendMessage(chatId, `${answ.sendName}${name}`);
  bot.sendMessage(chatId, answ.enterMatr);
  bot.once('message', msg => inputMatrix(msg, name));
};

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, '', {
    'reply_markup': {
      'keyboard': [['/solveSoLE'], ['/help']]
    }
  });
});


bot.onText(/\/m ([A-Z]{1})\b/, addMatrix);
bot.onText(/\/print ([A-Z]{1})/, printMatr);
bot.onText(/\/transpose ([A-Z]{1})/, transposeMatr);
bot.onText(/\/invert ([A-Z]{1})/, invertMatr);
bot.onText(/\/determinant ([A-Z]{1})/, determinant);
bot.onText(/\/range ([A-Z]{1})/, rangeOfMatr);
bot.onText(/\/solveSoLE/, inputSoLe);
bot.onText(/\/matrices/, printUsersMatr);
bot.onText(/\/help/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, answ.help);
});

bot.on('polling_error', error => {
  console.log(error);
});
