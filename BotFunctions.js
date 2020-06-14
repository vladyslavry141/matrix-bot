'use strict';

const answ = require('./answers.json');
const Equations = require('./equationFunct.js');
const Matrix = require('./matrixClass.js');



class BotFunctions {

  static isValidName(str) {
    return /^[A-Z]$/.test(str);
  }

  static getNameWraper(handler, bot, chatId, name) {
    if (BotFunctions.isValidName(name)) {
      handler(bot, chatId, name);
    } else {
      bot.sendMessage(chatId, answ.invalidName);
      bot.once(chatId, BotFunctions.getNameWraper.bind(bot, handler));
    }
  }

  static functToObj(funct) {
    let noArgs = null;
    const wraper = BotFunctions.getNameWraper;
    if (funct.length > 2) {
      const newFunct = wraper.bind(null, funct);
      noArgs = newFunct;
    }
    return { funct, noArgs };
  }

  static wrapFunctions(list) {
    const res = {};
    for (const commName in list) {
      const funct = list[commName];
      res[commName] = BotFunctions.functToObj(funct);
    }
    return res;
  }

  static systemToString(matr) {
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
  }

  static resOfSoLEtoString(res) {
    if (typeof res === 'string') {
      return res;
    }
    let text = 'Solution:\n';
    for (let i = 0; i < res.length; i++) {
      text += `  X${i + 1} = ${res[i]}\n`;
    }
    return text;
  }

  static solveSoLE(bot, chatId, text) {
    const matr = Matrix.parse(text);
    if (matr && matr[0].length > 1) {
      bot.sendMessage(chatId, BotFunctions.systemToString(matr));
      const extendMatr = new Matrix(matr);
      const solution = Equations.findSolOfSoLE(extendMatr);
      const text = BotFunctions.resOfSoLEtoString(solution);
      bot.sendMessage(chatId, text);
    } else {
      bot.sendMessage(chatId, answ.invalidSystem);
      bot.once(chatId, BotFunctions.solveSoLE);
    }
  }

  static inputSoLe(bot, chatId) {
    bot.sendMessage(chatId, answ.enterSystem);
    bot.once(chatId, BotFunctions.solveSoLE);
  }


  static printUsersMatr(bot, chatId) {
    let text = 'Your matrices:\n';
    if (!bot.matrices[chatId]) {
      bot.sendMessage(chatId, 'Your list of matrices is empty');
    } else {
      for (const name in bot.matrices[chatId]) {
        text += `${name}:\n`;
        const matr = bot.matrices[chatId][name];
        text += matr.toString();
      }
      bot.sendMessage(chatId, text);
    }
  }

  static printMatr(bot, chatId, args) {
    if (args[0] === 'all') {
      BotFunctions.printUsersMatr(bot, chatId);
    } else {
      for (const name of args) {
        if (!bot.isThereMatr(chatId, name)) {
          bot.sendMessage(chatId, answ.matrNotExist + name);
        } else {
          const matr = bot.matrices[chatId][name];
          const text = matr.toString();
          bot.sendMessage(chatId, `${name}:\n${text}`);
        }
      }
    }
  }

  static determinant(bot, chatId, args) {
    for (const name of args) {
      if (!bot.isThereMatr(chatId, name)) {
        bot.sendMessage(chatId, answ.matrNotExist + name);
      } else {
        const matr = bot.matrices[chatId][name];
        const det = matr.getDet();
        bot.sendMessage(chatId, `Det of ${name} = ${det}`);
      }
    }
  }

  static transposeMatr(bot, chatId, args) {
    for (const name of args) {
      if (!bot.isThereMatr(chatId, name)) {
        bot.sendMessage(chatId, answ.matrNotExist + name);
      } else {
        const matr = bot.matrices[chatId][name];
        const transposedMatr = matr.transpose();
        const text = transposedMatr.toString();
        bot.sendMessage(chatId, `Tranposed matrix to ${name}:\n${text}`);
      }
    }
  }

  static invertMatr(bot, chatId, args) {
    for (const name of args) {
      if (!bot.isThereMatr(chatId, name)) {
        bot.sendMessage(chatId, answ.matrNotExist + name);
      } else {
        const matr = bot.matrices[chatId][name];
        const invertedMatr = matr.getInvert();
        const text = typeof invertedMatr === 'string' ?
          invertedMatr : invertedMatr.toString();
        bot.sendMessage(chatId, `Inverted to ${name}:\n${text}`);
      }
    }
  }

  static rangeOfMatr(bot, chatId, args) {
    for (const name of args) {
      if (!bot.isThereMatr(chatId, name)) {
        bot.sendMessage(chatId, answ.matrNotExist + name);
      } else {
        const matr = bot.matrices[chatId][name];
        const range = matr.getRange();
        bot.sendMessage(chatId, `Range of ${name} is ${range}`);
      }
    }
  }

  static help(bot, chatId) {
    bot.sendMessage(chatId, answ.help);
  }

  static start(bot, chatId) {
    bot.sendMessage(chatId, 'Welkome', {
      'reply_markup': {
        'keyboard': [['/addmatrix'], ['/solveSoLE'], ['/help']]
      }
    });
  }

  static getKeyboardArr(name) {
    return [[`/print ${name}`],
      [`/det ${name}`],
      [`/range ${name}`],
      [`/transpose ${name}`],
      [`/invert ${name}`],
      ['/addmatrix'],
      ['/solveSoLE'],
      ['/help'],
    ];
  }

 static addMatrix(name, bot, chatId, text) {
    const matr = Matrix.parse(text);
    if (matr) {
      if (!bot.matrices[chatId]) {
        bot.matrices[chatId] = {};
      }
      bot.sendMessage(chatId,
        `Is your matrix:\n${Matrix.toString(matr)}`);
      bot.matrices[chatId][name] = new Matrix(matr);
      bot.sendMessage(chatId, 'What do you want to do ?', {
        'reply_markup': {
          'keyboard': BotFunctions.getKeyboardArr(name),
        }
      });
    } else {
      bot.sendMessage(chatId, answ.invalidMatr);
      bot.once(chatId, BotFunctions.addMatrix.bind(null, name));
    }
  }

  static inputMatrix(bot, chatId, name) {
    bot.sendMessage(chatId, answ.enterMatr);
    bot.once(chatId, BotFunctions.addMatrix.bind(null, name));
  }

}

module.exports = BotFunctions;