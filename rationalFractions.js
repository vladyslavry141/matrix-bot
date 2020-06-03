'use strict';
class RationalFractions {

  static makeFract(numerator, denominator = 1) {
    if (denominator < 0) {
      numerator *= -1;
      denominator *= -1;
    }
    return `${numerator}/${denominator}`
  }

  static splitFract(fract) {
    const num = Number(fract);
    if (!isNaN(num)) {
      return [num, 1];
    }    const arr = fract.split('/');
    return arr.map(el => parseInt(el));    
  }

  static isFract(fract) {
    if (typeof fract === 'number') {
      return true;
    }
    if (typeof fract !== 'string') {
      return false;
    }
    const arr = fract.split('/');
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === '') return false;
    }
    if (arr.length === 1) {
      return !isNaN(Number(arr[0])) 
    }
    if (arr.length > 2) return false;
    const numerator = Number(arr[0]);
    const denominator = Number(arr[1]);
    if (isNaN(numerator) || isNaN(denominator)) return false
    return true;
  }

  static getfractWithBase10(fract) {
    const [numerator, denominator] = RationalFractions.splitFract(fract);
    return numerator / denominator;   
  }
  
  static findGCD() {
    const args = [];
    for (let i = 0; i < arguments.length; i++) {
      args[i] = Math.abs(arguments[i])
    }
    if (args.length == 2) {
      if (args[1] == 0) return args[0];
      else return RationalFractions.findGCD(args[1], args[0] % args[1]);
    } else if (args.length > 2) {
      var result = RationalFractions.findGCD(args[0], args[1]);
      for (let i = 2; i < args.length; i++)
        result = RationalFractions.findGCD(result, args[i]);
      return result;
    }
  }

  static reduceFract(fract) {
    let [numerator, denominator] = RationalFractions.splitFract(fract);
    while(true) {
      const gcd = RationalFractions.findGCD(numerator, denominator)
      if (gcd === 1) break;
      else {
        numerator /= gcd;
        denominator /= gcd;
      }
    }
    if (denominator === 1) return numerator;
    return RationalFractions.makeFract(numerator, denominator);    
  }
  static findLCM(a, b) {
    const mult = Math.abs(a * b);
    return mult / RationalFractions.findGCD(a, b);
  }

  static sum(fract1, fract2) {
    let [num1, det1] = RationalFractions.splitFract(fract1);
    let [num2, det2] = RationalFractions.splitFract(fract2);
    const denominator = RationalFractions.findLCM(det1, det2);
    const coef1 = denominator / det1;
    const coef2 = denominator / det2;
    const numerator = num1 * coef1 + num2 * coef2;
    const newFract = RationalFractions.makeFract(numerator, denominator)
    return RationalFractions.reduceFract(newFract);
  } 

  static substract(fract1, fract2) {
    let [num1, det1] = RationalFractions.splitFract(fract1);
    let [num2, det2] = RationalFractions.splitFract(fract2);
    const denominator = RationalFractions.findLCM(det1, det2);
    const coef1 = denominator / det1;
    const coef2 = denominator / det2;
    const numerator = num1 * coef1 - num2 * coef1
    const newFract = RationalFractions.makeFract(numerator, denominator)
    return RationalFractions.reduceFract(newFract);
  } 

  static mult(fract1, fract2) {
    let [num1, det1] = RationalFractions.splitFract(fract1);
    let [num2, det2] = RationalFractions.splitFract(fract2);
    const numerator = num1 * num2;
    const denominator = det1 * det2;
    const newFract = RationalFractions.makeFract(numerator, denominator)
    return RationalFractions.reduceFract(newFract);
  }

  static div(fract1, fract2){
    let [num2, det2] = RationalFractions.splitFract(fract2);    
    const newFract = RationalFractions.makeFract(det2, num2);
    return RationalFractions.mult(fract1, newFract);
  }

}

module.exports = RationalFractions;