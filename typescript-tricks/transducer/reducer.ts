import { Step } from './transducer'

// primary
export const map = <T, R>(f: (val: T, ind: number) => R) => (step: Step<R>) =>
    ((acc: any, val: T, ind: number) => step(acc, f(val, ind), ind)) as Step<T>

export const filter = <T>(predicate: (val: T, ind: number) => boolean) => (step: Step<T>) => (
    acc: T[],
    val: T,
    ind: number
) => (predicate(val, ind) ? step(acc, val, ind) : acc)

// secondary
export const mapTo = <T, R>(value: R) => map((_: T) => value)
export const tap = <T>(action: (val: T, ind: number) => any) => (step: Step<T>) =>
    ((acc: any, val: T, ind: number) => {
        action(val, ind)
        return step(acc, val, ind)
    }) as Step<T>
