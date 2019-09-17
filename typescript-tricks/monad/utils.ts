type Head<T extends any[]> = T extends [infer U, ...any[]] ? U : never
type Tail<T extends any[]> = ((...args: T) => any) extends ((_: any, ...rest: infer U) => any) ? U : never
type HasTail<T extends any[]> = T extends ([] | [any]) ? false : true

type Curry<P extends any[], R> = (arg0: Head<P>) => HasTail<P> extends true ? Curry<Tail<P>, R> : R

export function curry<P extends any[], R>(fn: (...args: P) => R): Curry<P, R> {
    function curried(...args: any) {
        return args.length === fn.length ? fn(...args) : (arg: any) => curried(...args, arg)
    }
    if (fn.length === 0 || fn.length === 1) return fn as any
    return (arg: any) => curried(arg) as any
}

export function compose<U, V>(f: (arg: U) => V, g: () => U): () => V
export function compose<T, U, V>(f: (arg: U) => V, g: (arg: T) => U): (arg: T) => V
export function compose<T, U, V>(f: (arg: U) => V, g: (arg: T) => U) {
    return (arg: T) => f(g(arg))
}
