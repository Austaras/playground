import { AsyncCalculation } from './async-calculation'

const asyncCalc = new AsyncCalculation(2)

function fib(n: number): number {
  return n === 0 || n === 1 ? 1 : fib(n - 1) + fib(n - 2)
}

asyncCalc.calc(fib, 40).then(res => console.log('fib, may take long time', res))

// four ways of define function
function add0(a: number, b: number) {
  return a + b
}
const add1 = function (a: number, b: number) {
  return a + b
}
const add2 = (a: number, b: number) => a + b
// eslint-disable-next-line
const add3 = (a: number, b: number) => {
  return a + b
}

asyncCalc.calc(add0, 1, 2).then(res => console.log('add0', res))
asyncCalc.calc(add1, 1, 2).then(res => console.log('add1', res))
asyncCalc.calc(add2, 1, 2).then(res => console.log('add2', res))
asyncCalc.calc(add3, 1, 2).then(res => console.log('add3', res))

// @ts-ignore: noImplicitAny
const square = x => x * x
const mislead = () => {
  // eslint-disable-next-line
  x: 1
}
const empty = () => ({})
asyncCalc.calc(square, 50).then(res => console.log('square', res))
asyncCalc.calc(mislead).then(res => console.log('mislead, should get undefined', res))
asyncCalc.calc(empty).then(res => console.log('empty object', res))

function defaultAdd(a: number, b = 1) {
  return a + b
}
function optionalAdd(a: number, b?: number) {
  return a + (b ? b : 1)
}
function multiAdd(a: number, ...b: number[]) {
  return a + b.reduce((acc, val) => acc + val, 0)
}

asyncCalc.calc(defaultAdd, 4).then(res => console.log('defalut param', res))
asyncCalc.calc(optionalAdd, 4).then(res => console.log('optional param', res))
asyncCalc.calc(multiAdd, 1, 2, 3, 4).then(res => console.log('rest param', res))
