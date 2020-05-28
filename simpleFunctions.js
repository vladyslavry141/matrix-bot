'use strict'

const multMatrByNum = (matrix, num) => {
  const res = [];
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const multRow = row.map(el => el * num);
    res[i] = multRow;
  }
  return res;
}

// const isValid = matrix => {
//   if (matrix.length === 0) return
// }

const haveOneSize = (matr1, matr2) => {
  const columnLen1 = matr1.length;
  const rowLen1 = matr1[0].length;
  const columnLen2 = matr2.length;
  const rowLen2 = matr2[0].length;
  return columnLen1 === columnLen2 && rowLen1 === rowLen2;
};

const sumFunct = (a, b) => a + b;
const multFunct = (a, b) => a * b;
const divFunct = (a, b) => a / b; 
const substractFunct = (a, b) => a - b;

const elemByElemFunct = (matr1, matr2, funct) => {
  if (!haveOneSize(matr1, matr2)) return false; 
  const res = [];
  const columnLen = matr1.length;
  const rowLen = matr1[0].length;
  for (let i = 0; i < matr1.length; i++) {
    res[i] = [];
    for (let j = 0; j < matr1[0].length; j++) {
      res[i][j] = funct(matr1[i][j], matr2[i][j])
    }
  }
  return res;
};

const areAgreed = (matr1, matr2) => {
  const columnNum1 = matr1[0].length;
  const rowNum2 = matr2.length;
  return columnNum1 === rowNum2;  
}

const getColumn = (matrix, index) => {
  const column = []
  for (let j = 0; j < matrix.length; j++) {
    column[j] = matrix[j][index];
  }
  return column;
}

const getRow = (matrix, index) => matrix[index];

const multMatrix = (matr1, matr2) => {
  if (!areAgreed(matr1, matr2)) return false;
  const res = [];
  for (let i = 0; i < matr1.length; i++) {
    res[i] = [];
    for (let j = 0; j < matr2[0].length; j++) {
      let sum = 0;
      for (let e = 0; e < matr1[0].length; e++) {
        sum += matr1[i][e] * matr2[e][j];
      }
      res[i][j] = sum;
    }
  }
  return res;
};

const transposeMatr = matrix => {
  const transposed = matrix[0].map(el => []);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }
  return transposed;
};

const areEqual = (matr1, matr2) => {
  if (!haveOneSize(matr1, matr2)) return false;
  for (let i = 0; i < matr1.length; i++) {
    for (let j = 0; j < matr1[0].length; j++) {
      if (!(matr1[i][j] === matr2[i][j])) return false;
    }
  }
  return true;
};

const isSymetric = matrix => {
  const transposed = transposeMatr(matrix);
  return areEqual(matrix, transposed);
};

const isSqure = matrix => matrix.length === matrix[0].length;

const getDet2x2 = matrix => {
  if (matrix.length === 1) return matrix;
  const mainD = matrix[0][0] * matrix[1][1];
  const sideD = matrix[0][1] * matrix[1][0];
  return mainD - sideD;
};

const getMatrixForMinor = (matrix, i, j) => {
  const res = matrix.map(el => Array.from(el));
  res.splice(i, 1);
  for (const row of res) {
    row.splice(j, 1);
  }
  return res
};

const getDet = matrix => {
  if (!isSqure(matrix)) return false;
  if (matrix.length < 3) return getDet2x2(matrix);
  let det = 0;
  for (let j = 0; j < matrix[0].length; j++) {
    const minorMatr = getMatrixForMinor(matrix, 0, j);
    const el = matrix[0][j]; 
    det+= ((-1)**(j)) * getDet(minorMatr) * el;
  }
  return det;
};

const getAdjunctMatr = matrix => {
  const res = matrix.map(el => []);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
    const minorMatr = getMatrixForMinor(matrix, i, j);
      res[i][j] = ((-1)**(i + j)) * getDet(minorMatr);
    }
  }
  return transposeMatr(res);
};

const getInvertMatr = matrix => {
  const det = getDet(matrix);
  if (det === 0) return false;
  console.log(1/det);
  const adjMatr = getAdjunctMatr(matrix);
  console.table(adjMatr)
  return multMatrByNum(adjMatr, 1/det);
}


const getStepMatr = matrix => {
  const res = matrix.map(row => Array.from(row));
  for (let j = 0; j < res[0].length; j++) {
    const elemOfMatr = res[j][j];
    const mainRow = res[j].map(el => el / elemOfMatr);
    for (let i = j + 1; i < res.length; i++) {
      const stepRow = res[i];
      const stepElem = stepRow[j];
      const substrRow = mainRow.map(el => el * stepElem);
      const result = elemByElemFunct([stepRow], [substrRow], substractFunct).flat();
      console.dir({mainRow, stepElem, substrRow, stepRow, result})
      res[i] = result;
      console.log(res[i]);
      console.table(res);
    }
  }
  return res;
}

const arr1 = [ 
[1, 2, 3, 1, 1, 2, 3, ],
[4, 2, 3, 2, 2, 2, 3, ],
[10, 5, 3, 3, 3, 2, 3, ],
[12, 5, 3, 5, 4, 3, 3, ],
[12, 5, 3, 5, 5, 4, 5, ],
[12, 5, 3, 5, 6, 2, 6, ],
[12, 5, 3, 5, 7, 2, 7, ],
];

const arr2 = [
[1, 5],
[1, 2],
];

// console.log(elemByElemFunct([arr2[0]], [arr2[1]], sumFunct))
getStepMatr(arr1);