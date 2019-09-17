type Tail<T extends any[]> = ((...args: T) => any) extends ((_: any, ...rest: infer U) => any)
    ? U
    : never

export type Reducer<T, S> = (acc: S, val: T, ind: number) => S
export type Transducer<T, R> = <S>(reducer: Reducer<R, S>) => Reducer<T, S>
type HeadParam<T extends Transducer<any, any>[]> = T extends [
    (args: Reducer<infer U, any>) => any,
    ...any[]
]
    ? U
    : never
type HeadReturn<T extends Transducer<any, any>[]> = T extends [
    (...args: any) => Reducer<infer U, any>,
    ...any[]
]
    ? U
    : never

type Pipeable<T extends Transducer<any, any>[], A, R> = {
    done: Transducer<A, R>
    next: Pipeable<Tail<T>, A, unknown extends HeadParam<T> ? R : HeadParam<T>>
    wrong: never
}[T extends [] ? 'done' : R extends HeadReturn<T> ? 'next' : 'wrong']

export function pipe<T extends Transducer<any, any>[], A, R>(
    first: Transducer<A, R>,
    ...rest: T
): Pipeable<T, A, R> {
    return rest.reduce((f, g) => arg => f(g(arg)), first) as any
}

export function transduce<T, R>(item: Iterable<T>, reducer: Reducer<T, R>, init: R) {
    let state = init
    let count = 0
    for (const value of item) {
        state = reducer(state, value, count)
        count++
    }
    return state
}
