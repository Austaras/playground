import { PromisifyWorker } from './promisifyWorker'
function add0(a: number, b: number) {
    return a + b
}
const add1 = function(a: number, b: number) {
    return a + b
}
const add2 = (a: number, b: number) => a + b
const add3 = (a: number, b: number) => {
    return a + b
}

const promisifyWorker = new PromisifyWorker()
promisifyWorker.calc(add0, 1, 2).then(res => console.log('add0', res))
promisifyWorker.calc(add1, 1, 2).then(res => console.log('add1', res))
promisifyWorker.calc(add2, 1, 2).then(res => console.log('add2', res))
promisifyWorker.calc(add3, 1, 2).then(res => console.log('add3', res))

// @ts-ignore: noImplicitAny
const square = x => x * x
// tslint:disable-next-line
const mislead = () => { x: 1 }
promisifyWorker.calc(square, 50).then(res => console.log('square', res))
promisifyWorker.calc(mislead).then(
    res => console.log('mislead, should get undefined', res)
)

function fib(n: number): number {
    return (n === 0 || n === 1) ?
        1 : fib(n - 1) + fib(n - 2)
}

promisifyWorker.calc(fib, 40).then(
    res => console.log('fib, may take long time', res)
)
