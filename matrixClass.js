'use strict';

const RatFract = require('./rationalFractions.js')

class Matrix {
  constructor(matrix) {
    this.matrix = matrix;
  }
  
  static isValid(matrix) {
    if (!Array.isArray(matrix)) {
      return false;
    }
    if (matrix.length < 1) {
      return false;
    }
    const mainLen = matrix[0].length;
    for (let i = 0; i < matrix.length; i++) {
      const len = matrix[i].length;
      if (len !== mainLen) {
        return false;
      }
      for (let j = 0; j < mainLen; j++) {
        if (!RatFract.isFract(matrix[i][j])) {
          return false;
        }
      }
    }
    return true;
  }

  static haveOneSize(matr1, matr2) {
    const columnLen1 = matr1.matrix.length;
    const rowLen1 = matr1.matrix[0].length;
    const columnLen2 = matr2.matrix.length;
    const rowLen2 = matr2.matrix[0].length;
    return columnLen1 === columnLen2 && rowLen1 === rowLen2;
  }
  static elemByElemFunct(matr1, matr2, funct) {
    if (!Matrix.haveOneSize(matr1, matr2)) {
      return false;
    } 
    const res = [];
    const columnNum = matr1.matrix.length;
    const rowNum = matr1.matrix[0].length;
    for (let i = 0; i < columnNum; i++) {
      res[i] = [];
      for (let j = 0; j < rowNum; j++) {
        res[i][j] = funct(matr1.matrix[i][j], matr2.matrix[i][j])
      }
    }
    return new Matrix(res);
  }

  static areAgreed(matr1, matr2) {
    const columnNum1 = matr1.matrix[0].length;
    const rowNum2 = matr2.matrix.length;
    return columnNum1 === rowNum2;  
  }

  static multMatrix(matr1, matr2) {
    if (!Matrix.areAgreed(matr1, matr2)) {
      return 'Matrices are not agreed';
    }
    const res = [];
    for (let i = 0; i < matr1.matrix.length; i++) {
      res[i] = [];
      for (let j = 0; j < matr2.matrix[0].length; j++) {
        let sum = 0;
        for (let e = 0; e < matr1.matrix[0].length; e++) {
          const stepSum =  RatFract.mult(matr1.matrix[i][e], matr2.matrix[e][j]);
          sum = RatFract.sum(sum, stepSum);
        }
        res[i][j] = sum;
      }
    }
    return new Matrix(res);
  }

  static areEqual(matr1, matr2) {
    if (!Matrix.haveOneSize(matr1, matr2)) return false;
    for (let i = 0; i < matr1.matrix.length; i++) {
      for (let j = 0; j < matr1.matrix[0].length; j++) {
        if (!(matr1.matrix[i][j] === matr2.matrix[i][j])) return false;
      }
    }
    return true;
  };

  static isNullRow(row) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== 0) return false;
    }
    return true;
  }

  static getDet2x2(matr) {
    if (matr.matrix.length === 1) return matr.matrix[0][0];
    const mainD = RatFract.mult(matr.matrix[0][0], matr.matrix[1][1]);
    const sideD = RatFract.mult(matr.matrix[0][1], matr.matrix[1][0]);
    return RatFract.substract(mainD, sideD);
};

  multByNum(num) {
  const res = [];
    for (let i = 0; i < this.matrix.length; i++) {
      const row = this.matrix[i];
      const multRow = row.map(el => RatFract.mult(el, num));
      res[i] = multRow;
    }
    return new Matrix(res);
  }

  getColumn(index) {
    const column = []
    for (let j = 0; j < this.matrix.length; j++) {
      column[j] = this.matrix[j][index];
    }
    return column;
  }

  transpose() {
    const transposed = this.matrix[0].map(el => []);
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[i].length; j++) {
        transposed[j][i] = this.matrix[i][j];
      }
    }
    return new Matrix(transposed);
  }

  isSymetric() {
    const transposed = this.transpose();
    return Matrix.areEqual(this, transposed);
  }

  isSquare() {
    return this.matrix.length === this.matrix[0].length;
  }

  getMatrixForMinor(i, j) {
    const res = this.matrix.map(el => Array.from(el));
    res.splice(i, 1);
    for (const row of res) {
      row.splice(j, 1);
    }
    return new Matrix(res);
  }

  getDet() {
    if (!this.isSquare()) {
      return 'Matrix is not square'
    };
    if (this.matrix.length < 3) return Matrix.getDet2x2(this);
    let det = 0;
    for (let j = 0; j < this.matrix[0].length; j++) {
      const minorMatr = this.getMatrixForMinor(0, j);
      const el = this.matrix[0][j]; 
      det+= ((-1)**(j)) * minorMatr.getDet() * el;
    }
    return det;
  }

  getAdjunct() {
    const res = this.matrix.map(el => []);
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[0].length; j++) {
        const minorMatr = this.getMatrixForMinor(i, j);
        res[i][j] = ((-1)**(i + j)) * minorMatr.getDet();
      }
    }
    const matr = new Matrix(res);
    return matr.transpose();
  }

  getInvert() {
    const det = this.getDet();
    if (typeof det === 'string') {
      return 'Matrix is not invertible';
    }
    if (this.matrix.length === 1) {
      const invertNum = RatFract.div(1, this.matrix[0][0]);
      return new Matrix([[invertNum]]);
    }
    const num = RatFract.div(1, det);
    const adjMatr = this.getAdjunct();
    return adjMatr.multByNum(num);
  }

  static copy(matrix) {
    const copiedMatr = matrix.map(row => Array.from(row));
    return new Matrix(copiedMatr);
  }

  findValidRow(startRowInd, startColInd) {
    let nextInd = -1;
    for (let i = startRowInd; i < this.matrix.length; i++) {
      const elem = this.matrix[i][startColInd];
      if (!elem) continue;
      nextInd = i;
      break;
    };
    return nextInd;
  }

  swapRow(firstInd, secondInd) {
    if (firstInd === secondInd) return;
    const [min, max] = [firstInd, secondInd].sort((a, b) => a - b);
    if (max > this.matrix.length) return;
    const row1 = this.matrix.splice(max, 1);
    const row2 = this.matrix.splice(min, 1);
    this.matrix.splice(min, 0, ...row1);
    this.matrix.splice(max, 0, ...row2);
  }

  getStepMatr() {
    let startRowInd = 0
    const stepMatr = Matrix.copy(this.matrix);
    for (let j = 0; j < stepMatr.matrix[0].length; j++) {
      const start = stepMatr.findValidRow(startRowInd, j);
      if (start === -1) continue;
      stepMatr.swapRow(start, startRowInd);
      const startRow = stepMatr.matrix[startRowInd];
      const denominator = startRow[j];
      const mainRow = startRow.map(el => RatFract.div(el, denominator));
      for (let i = startRowInd + 1; i < stepMatr.matrix.length; i++) {
        const stepRow = new Matrix([stepMatr.matrix[i]]);
        const stepElem = stepRow.matrix[0][j];
        const substrRow = new Matrix([mainRow.map(el => RatFract.mult(el, stepElem))]);
        const res = Matrix.elemByElemFunct(stepRow, substrRow, RatFract.substract);
        stepMatr.matrix[i] = res.matrix.flat();
      }
      startRowInd++;
    }
    return stepMatr;
  }

  getRange() {
    let nullRowNum = 0;
    const stepMatr = this.getStepMatr();
    const len = stepMatr.matrix.length;
    for (let i = 0; i < len; i++) {
      if (Matrix.isNullRow(stepMatr[i])) nullRowNum++;
    }
    return len - nullRowNum;
  }
}

module.exports = Matrix;

