import { Identity, makeEither, Maybe, Monad, IO } from './monad'

interface MonadCtor {
    name: string
    of: <T>(arg: T) => Monad<T>
}

function LeftId<T, U>(M: MonadCtor, v: T, f: (i: T) => U) {
    const fn = (i: T) => M.of(i).map(f)
    return mEqual(M.of(v).flatMap(fn), fn(v))
}

function RightId<T>(M: MonadCtor, v: T) {
    const m = M.of(v)
    return mEqual(m.flatMap(i => M.of(i)), m)
}

function Associative<T, U, V>(M: MonadCtor, v: T, f: (i: T) => U, g: (i: U) => V) {
    const m = M.of(v)
    const fn = (i: T) => M.of(f(i))
    const gn = (i: U) => M.of(g(i))
    return mEqual(m.flatMap(fn).flatMap(gn), m.flatMap(i => fn(i).flatMap(gn)))
}

type Dict = Record<string, any>
export function mEqual(a: Dict, b: Dict) {
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) {
        return false
    }
    for (const key of keys) {
        if (typeof a[key] === 'function' && typeof b[key] === 'function') {
            if (a[key]() !== b[key]()) {
                return false
            }
            continue
        }
        if (a[key] !== b[key]) return false
    }
    return true
}

const f = (i: number) => i * 5
const g = (i: number) => `it's ${i}`

function test(monad: MonadCtor, value: any) {
    const suite = [[LeftId, value, f], [RightId, value], [Associative, value, f, g]]
    suite.forEach(([law, ...rest]) => {
        if (!law(monad, ...rest)) {
            console.log(`${monad.name} doesn't obey ${law.name} law`)
        }
    })
}

test(Identity, 1)
test(Maybe, 2)
test(Maybe, null)
const Either = makeEither((i: number) => i > 0, 'Must be positive') as MonadCtor
test(Either, 1)
test(Either, -1)
test(IO, 1)
