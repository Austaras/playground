import { pipe } from './transducer'
import { filter, map, tap } from './reducer'

function range(start = 0, end = 0) {
    const arr = []
    for (let i = start; i < end; i++) {
        arr.push(i)
    }
    return arr
}

const hundred = range(0, 100)
const op = pipe(
    map((i: number) => i + 55),
    filter((i: number) => i % 2 === 0),
    map((i: number) => `${i}`),
    tap((i: string) => console.log(i))
)

hundred.reduce(op((a, c) => a.concat([c])), [])
