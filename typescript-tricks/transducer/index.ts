import { filter, map, take } from './transducer'
import { pipe, transduce } from './utils'

function range(start = 0, end = 0) {
    const arr = []
    for (let i = start; i < end; i++) {
        arr.push(i)
    }
    return arr
}

function* rangeG(start = 0, end = 0) {
    let num = start
    while (num < end) {
        yield num
        num++
    }
}

const transducer = pipe(
    map((i: number) => i + 55),
    filter((i: number) => i % 2 === 0),
    map((i: number) => `${i}`),
    take(10)
)

console.log(transduce(range(0, 100), transducer((a, v) => a.concat([v])), [] as string[]))
console.log(transduce(rangeG(0, 100), transducer((a, v) => `${a} ${v}`), ''))
