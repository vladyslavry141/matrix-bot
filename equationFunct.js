'use strict';

const Matrix = require('./matrixClass.js');
const answ = require('./answers.json');
const RatFract = require('./rationalFractions.js');


class Equations {
  //SoLE = System of Linear Equations

  static systemHasntSol(extendMatr) {
    const systemMatr = Matrix.getSystemMatr(extendMatr.matrix);
    const sysRang = systemMatr.getRange();
    const extRang = extendMatr.getRange();
    const varNum = systemMatr.matrix[0].length;
    if (extRang > sysRang) {
      return 'System have not any solutions';
    }
    if (extRang !== varNum) {
      return 'System have infinitely many solutions';
    }
    return false;
  }

  static findSolOfSoLE(extendMatr) {
    const columnIndex = extendMatr.matrix[0].length - 2;
    const systHasntSol = Equations.systemHasntSol(extendMatr);
    if (systHasntSol) {
      return systHasntSol;
    }
    const step1Matr = extendMatr.getStepMatr(columnIndex);
    const step2Matr = step1Matr.getStepMatrReversed(columnIndex);
    const columnNum = step2Matr.matrix[0].length;
    let res = [];
    for (let i = 0; i < step2Matr.matrix.length; i++) {
      const coeff = step2Matr.matrix[i][i];
      const sum = step2Matr.matrix[i][columnNum - 1];
      const value = RatFract.div(sum, coeff);
      res[i] = value;
    }
    return res;
  }
}

module.exports = Equations;