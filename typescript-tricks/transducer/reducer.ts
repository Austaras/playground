import { Step } from './transducer'

// primary
export const map = <T, R>(f: (val: T, ind: number) => R) => (step: Step<R>) => (
    acc: any,
    val: T,
    ind: number
) => step(acc, f(val, ind), ind)

export const filter = <T>(predicate: (val: T, ind: number) => boolean) => (step: Step<T>) => (
    acc: any,
    val: T,
    ind: number
) => (predicate(val, ind) ? step(acc, val, ind) : acc)

// secondary
export const mapTo = <T, R>(value: R) => map((_: T) => value)
export const take = <T>(num: number) => (step: Step<T>) => {
    let count = 0
    return (acc: any, val: T, ind: number) => (count++ >= num ? acc : step(acc, val, ind))
}
export const tap = <T>(action: (val: T, ind: number) => void) => (step: Step<T>) => (
    acc: any,
    val: T,
    ind: number
) => {
    action(val, ind)
    return step(acc, val, ind)
}
