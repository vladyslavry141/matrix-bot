'use strict';

const answ = require('./answers.json');
const TelegramBot = require('node-telegram-bot-api');
const BotFunctions = require('./BotFunctions.js');
const { token } = require('./token.json');


const commands = {
  '/start': BotFunctions.start,
  '/addmatrix': BotFunctions.inputMatrix,
  '/print': BotFunctions.printMatr,
  '/transpose': BotFunctions.transposeMatr,
  '/invert': BotFunctions.invertMatr,
  '/det': BotFunctions.determinant,
  '/range': BotFunctions.rangeOfMatr,
  '/solveSoLE': BotFunctions.inputSoLe,
  '/help': BotFunctions.help,
};
const comm = BotFunctions.wrapFunctions(commands)

class MatrixBot extends TelegramBot {
  constructor(token, matrices) {
    super(token, { polling: true });
    this.matrices = matrices;
    this.comands = comm;
    this.started = MatrixBot.start(this);
  }


  static start(bot) {
    bot.on('message', bot.newMassage);
    return true;
  }

  static isComand(text) {
    return text[0] === '/';
  }

  isThereMatr(chatId, name) {
    if (this.matrices[chatId] && this.matrices[chatId][name]) {
      return true;
    }
    return false;
  }

  addCommand(command, funct) {
    this.comands[command] = funct;
  }

  addCommands(comands) {
    Object.assign(this.comands, comands);
  }


  newComand(chatId, text) {
    const [comandName, ...args] = text.split(' ');
    const com = this.comands[comandName];
    if (com) {
      if (!args[0] && com.noArgs) {
        this.sendMessage(chatId, answ.enterName);
        this.once(chatId, com.noArgs);
      } else {
        com.funct(this, chatId, args);
      }
    } else {
      this.sendMessage(chatId, answ.invalidComand);
    }
  }

  newMassage(msg) {
    const chatId = msg.chat.id;
    const listener = this.listeners(chatId)[0];
    const text = msg.text;
    if (MatrixBot.isComand(text)) {
      this.newComand(chatId, text);
      if (listener) {
        this.removeListener(chatId, listener);
      }
    } else if (listener) {
      this.emit(chatId, this, chatId, text);
    } else {
      this.sendMessage(chatId, answ.invalidInput);
    }
  }

}

module.exports = MatrixBot;
