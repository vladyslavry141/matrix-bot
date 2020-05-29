'use strict';

const ratFract = require('./rationalFractions.js')

class Matrix {
  constructor(matrix) {
    this.matrix = matrix;
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
    if (!Matrix.areAgreed(matr1, matr2)) return false;
    const res = [];
    for (let i = 0; i < matr1.matrix.length; i++) {
      res[i] = [];
      for (let j = 0; j < matr2.matrix[0].length; j++) {
        let sum = 0;
        for (let e = 0; e < matr1.matrix[0].length; e++) {
          const stepSum =  ratFract.mult(matr1.matrix[i][e], matr2.matrix[e][j]);
          sum = ratFract.sum(sum, stepSum);
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
    const mainD = ratFract.mult(matr.matrix[0][0], matr.matrix[1][1]);
    const sideD = ratFract.mult(matr.matrix[0][1], matr.matrix[1][0]);
    return ratFract.substract(mainD, sideD);
};

  multByNum(num) {
  const res = [];
    for (let i = 0; i < this.matrix.length; i++) {
      const row = this.matrix[i];
      const multRow = row.map(el => ratFract.mult(el, num));
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

  isSqure() {
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
    if (!this.isSqure()) return false;
    if (this.matrix.length < 3) return Matrix.getDet2x2(this);
    let det = 0;
    for (let j = 0; j < this.matrix[0].length; j++) {
      const minorMatr = this.getMatrixForMinor(0, j);
      const el = this.matrix[0][j]; 
      det+= ((-1)**(j)) * minorMatr.getDet() * el;
    }
    return det;
  }

  adjunctMatr() {
    const res = this.matrix.map(el => []);
    for (let i = 0; i < this.matrix.length; i++) {
      for (let j = 0; j < this.matrix[0].length; j++) {
        const minorMatr = this.getMatrixForMinor(i, j);
        console.table(minorMatr.matrix)
        res[i][j] = ((-1)**(i + j)) * minorMatr.getDet();
        console.log(res[i][j]);
      }
    }
    const matr = new Matrix(res);
    return matr.transpose();
  }

  invertMatr() {
    const det = this.getDet();
    if (!det) return false;
    if (this.matrix.length === 1) {
      const invertNum = ratFract.div(1, this.matrix[0][0]);
      return new Matrix([[invertNum]]);
    }
    const num = ratFract.div(1, det);
    const adjMatr = this.adjunctMatr();
    return adjMatr.multByNum(num);
  }

  stepMatr() {
    let startRowInd = 0
    const matr = this.matrix.map(row => Array.from(row));
    const res = new Matrix(matr);
    for (let j = startRowInd; j < res.matrix[0].length; j++) {
      let start = -1;
      for (let i = startRowInd + 1; i < res.matrix.length; i++) {
        const elem = res.matrix[i][j];
        if (!elem) continue;
        start = i;
        break;
      }
      if (start === -1) continue;
      startRowInd = start;
      const elemOfMatr = res.matrix[start][j];
      const mainRow = res.matrix[start].map(el => ratFract.div(el, elemOfMatr));
      for (let i = startRowInd + 1; i < res.length; i++) {
        const stepRow = res.matrix[i];
        const stepElem = stepRow[j];
        const substrRow = mainRow.map(el => ratFract.mult(el, stepElem));
        res.matrix[i] = Matrix.elemByElemFunct([stepRow], [substrRow], ratFract.substract).flat();
      }
    }
    return res;
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

const arr1 = [ 
[1, 2, 3, 1, 1, 2, 3, ],
[4, 2, 3, 2, 2, 2, 3, ],
[10, 5, 3, 3, 3, 2, 3, ],
[12, 5, 3, 5, 4, 3, 3, ],
[12, 5, 3, 5, 5, 4, 5, ],
[12, 5, 3, 5, 6, 2, 6, ],
[12, 5, 3, 5, 7, 2, 7, ],
[12, 5, 3, 5, 7, 2, 145, ],
];

const matr1 = new Matrix(arr1);

const arr2 = [
[1, 5],
[1, 2],
];

const matr2 = new Matrix(arr2);


const arr3 = [ 
[1, 2, 3, 1, 1, 2, 3, ],
[4, 2, 3, 2, 2, 2, 3, ],
[10, 5, 3, 3, 3, 2, 3, ],
];

const matr3 = new Matrix(arr3);


const arr4 = [
[0,0,0,0],
[0,0,1,2],
[0,0,1,2],
[0,0,0,3],
];

const matr4 = new Matrix(arr4);

const arr5 = [ 
[1, 2, 3, 1, 1, 2, 3, ],
[4, 2, 3, 2, 2, 2, 3, ],
[10, 5, 3, 3, 3, 2, 3, ],
[12, 5, 3, 5, 4, 3, 3, ],
[12, 5, 3, 5, 5, 4, 5, ],
[12, 5, 3, 5, 6, 2, 6, ],
[12, 5, 3, 5, 7, 2, 7, ],
];

const matr5 = new Matrix(arr5);

const arr6 = [
[1,1,1,1],
[0,0,1,2],
[0,0,1,2],
[0,0,0,3],
];

const matr6 = new Matrix(arr6);

const arr7 = [
[1, 1, 1],
[1, 1, 1],
[1, 1, 1],
];

const matr7 = new Matrix(arr7);

const arr8 = [[4]];

const matr8 = new Matrix(arr8);


// console.log(matr3.getDet())
console.table(matr6.stepMatr().matrix)