type Tail<T extends any[]> = ((...args: T) => any) extends ((_: any, ...rest: infer U) => any)
    ? U
    : never

export type Step<T> = (acc: any, val: T, ind: number) => any
export type Reducer<T, R> = (step: Step<R>) => Step<T>
type HeadParam<T extends Reducer<any, any>[]> = T extends [(args: Step<infer U>) => any, ...any[]]
    ? U
    : never
type HeadReturn<T extends Reducer<any, any>[]> = T extends [(...args: any) => Step<infer U>, ...any[]]
    ? U
    : never

type Pipeable<T extends Reducer<any, any>[], A, R> = {
    done: Reducer<A, R>
    next: Pipeable<Tail<T>, A, HeadParam<T>>
    wrong: never
}[T extends [] ? 'done' : R extends HeadReturn<T> ? 'next' : 'wrong']

export function pipe<T extends Reducer<any, any>[], A, R>(
    first: Reducer<A, R>,
    ...rest: T
): Pipeable<T, A, R> {
    return rest.reduce((f, g) => arg => f(g(arg)), first) as any
}
