'use strict';
class RationalFractions {

  static makeFract(numerator, denominator = 1) {
    return `${numerator}/${denominator}`
  }

  static splitFract(fract) {
    if (typeof fract === 'number') return [fract, 1];
    const arr = fract.split('/');
    return arr.map(el => parseInt(el));    
  }
  
  static findGCD() {
    if (arguments.length == 2) {
      if (arguments[1] == 0) return arguments[0];
      else return RationalFractions.findGCD(arguments[1], arguments[0] % arguments[1]);
    } else if (arguments.length > 2) {
      var result = RationalFractions.findGCD(arguments[0], arguments[1]);
      for (let i = 2; i < arguments.length; i++)
        result = RationalFractions.findGCD(result, arguments[i]);
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
    console.dir({num1, det1, num2, det2})
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
console.log(RationalFractions.sum(1, '2/1'));
// module.exports = RationalFractions;