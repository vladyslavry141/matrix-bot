'use strict';

const TelegramBot = require('node-telegram-bot-api');
const Matrix = require('./matrixClass.js');
const { token } = require('./token.json');
const answ = require('./answers.json');
const Equations = require('./equationFunct.js');

if (token.split(':').length !== 2 || token.split(':')[1].length !== 35) {
  throw new Error('The variable token seems to be malformatted.');
}

const bot = new TelegramBot(token, { polling: true });
const matrices = {};

const isComand = text => text[0] === '/';

const isThereMatr = (chatId, name) => {
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
    return splited;
  });
  if (Matrix.isValid(matr)) {
    matrToFract(matr);
    return matr;
  } else {
    return false
  }
};

const printUsersMatr = chatId => {
  let text = 'Your matrices:\n';
  if (!matrices[chatId]) {
    bot.sendMessage(chatId, answ.emptyList);
  } else {
    for (const name in matrices[chatId]) {
      text += `${name}:\n`;
      const matr = matrices[chatId][name];
      text += matrixToText(matr.matrix);
    }
    bot.sendMessage(chatId, text);
  }
};

const printMatr = (chatId, args) => {
  if (args[0] === 'all') {
    printUsersMatr(chatId);
  } else {
    for (const name of args) {
      if (!isThereMatr(chatId, name)) {
        bot.sendMessage(chatId, answ.matrNotExist + name);
      } else {
        const matr = matrices[chatId][name];
        const text = matrixToText(matr.matrix);
        bot.sendMessage(chatId, `${name}:\n${text}`);
      }
    }
  }
};

const determinant = (chatId, args) => {
  for (const name of args) {
    if (!isThereMatr(chatId, name)) {
      bot.sendMessage(chatId, answ.matrNotExist + name);
    } else {
      const matr = matrices[chatId][name];
      const det = matr.getDet();
      bot.sendMessage(chatId, `Det of ${name} = ${det}`);
    }
  }
};

const transposeMatr = (chatId, args) => {
  for (const name of args) {
    if (!isThereMatr(chatId, name)) {
      bot.sendMessage(chatId, answ.matrNotExist + name);
    } else {
      const matr = matrices[chatId][name];
      const transposedMatr = matr.transpose();
      const text = matrixToText(transposedMatr.matrix);
      bot.sendMessage(chatId, `Tranposed matrix to ${name}:\n${text}`);
    }
  }
};

const invertMatr = (chatId, args) => {
  for (const name of args) {
    if (!isThereMatr(chatId, name)) {
      bot.sendMessage(chatId, answ.matrNotExist + name);
    } else {
      const matr = matrices[chatId][name];
      const invertedMatr = matr.getInvert();
      const text = typeof invertedMatr === 'string' ?
        invertedMatr :
        matrixToText(invertedMatr.matrix);
      bot.sendMessage(chatId, `Inverted to ${name}:\n${text}`);
    }
  }
};

const rangeOfMatr = (chatId, args) => {
  for (const name of args) {
    if (!isThereMatr(chatId, name)) {
      bot.sendMessage(chatId, answ.matrNotExist + name);
    } else {
      const matr = matrices[chatId][name];
      const range = matr.getRange();
      bot.sendMessage(chatId, `Range of ${name} is ${range}`);
    }
  }
};

const getKeyboardArr = name => [[`/print ${name}`],
  [`/det ${name}`],
  [`/range ${name}`],
  [`/transpose ${name}`],
  [`/invert ${name}`],
  ['/addmatrix'],
  ['/solveSoLE'],
  ['/help'],
];

const resOfSoLEtoText = res => {
  if (typeof res === 'string') {
    return res;
  }
  let text = 'Solution:\n';
  for (let i = 0; i < res.length; i++) {
    text += `  X${i + 1} = ${res[i]}\n`;
  }
  return text;
};

const solveSoLE = (chatId, text) => {
  const matr = parseMatrix(text);
  if (matr && matr[0].length > 1) {
    bot.sendMessage(chatId, systemToText(matr));
    const extendMatr = new Matrix(matr);
    const solution = Equations.findSolOfSoLE(extendMatr);
    const text = resOfSoLEtoText(solution);
    bot.sendMessage(chatId, text);
  } else {
    bot.sendMessage(chatId, answ.invalidSystem);
    bot.once(chatId, solveSoLE);
  }
};

const inputSoLe = chatId => {
  bot.sendMessage(chatId, answ.enterSystem);
  bot.once(chatId, solveSoLE);
};

const help = chatId => {
  bot.sendMessage(chatId, answ.help);
};

const start = chatId => {
  bot.sendMessage(chatId, 'Welkome', {
    'reply_markup': {
      'keyboard': [['/addmatrix'], ['/solveSoLE'], ['/help']]
    }
  });
};

const isValidName = str => /^[A-Z]$/.test(str);

const getNameWraper = (handler, name, chatId) => {
  if (isValidName(name)) {
    handler(chatId, name);
  } else {
    bot.sendMessage(chatId, answ.invalidName);
    bot.once(chatId, (chatId, text) => getNameWraper(handler, text, chatId));
  }
};

const addMatrix = (chatId, text, name) => {
  const matr = parseMatrix(text);
  bot.sendMessage(chatId, `Is your matrix:\n${matrixToText(matr)}`);
  if (matr) {
    if (!matrices[chatId]) {
      matrices[chatId] = {};
    }
    matrices[chatId][name] = new Matrix(matr);
    bot.sendMessage(chatId, 'What do you want to do ?', {
      'reply_markup': {
        'keyboard': getKeyboardArr(name),
      }
    });
  } else {
    bot.sendMessage(chatId, answ.invalidMatr);
    bot.once(chatId, (chatId, text) => addMatrix(chatId, text, name));
  }
};

const inputMatrix = (chatId, name) => {
  bot.sendMessage(chatId, answ.enterMatr);
  bot.once(chatId, (chatId, text) => addMatrix(chatId, text, name));
};

const comands = {
  '/start': start,
  '/addmatrix': inputMatrix,
  '/print': printMatr,
  '/transpose': transposeMatr,
  '/invert': invertMatr,
  '/det': determinant,
  '/range': rangeOfMatr,
  '/solveSoLE': inputSoLe,
  '/help': help,
};

const newComand = (chatId, text) => {
  const [comandName, ...args] = text.split(' ');
  const com = comands[comandName];
  if (com) {
    if (!args[0] && com.length > 1) {
      bot.sendMessage(chatId, answ.enterName);
      bot.once(chatId, (chatId, text) =>
        getNameWraper(com, text, chatId));
    } else {
      com(chatId, args);
    }
  } else {
    bot.sendMessage(chatId, answ.invalidComand);
  }
};

const newMassage = msg => {
  const chatId = msg.chat.id;
  const listener = bot.listeners(chatId)[0];
  const text = msg.text;
  if (isComand(text)) {
    newComand(chatId, text);
    if (listener) {
      bot.removeListener(chatId, listener);
    }
  } else if (listener) {
    bot.emit(chatId, chatId, text);
  } else {
    bot.sendMessage(chatId, answ.invalidInput);
  }
};

bot.on('message', newMassage);

bot.on('polling_error', error => {
  console.log(error);
});
