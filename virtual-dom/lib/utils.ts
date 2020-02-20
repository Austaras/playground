export const isObject = (i: unknown): i is object => i && typeof i === 'object'
export const isEmpty = (i: unknown): i is undefined | null | string =>
    i === null || i === undefined || i === ''

// eslint-disable-next-line @typescript-eslint/unbound-method
const has = Object.prototype.hasOwnProperty
export const DELETE = Symbol('delete')
export function diffProperties<T extends object>(now: T, prev: T, exclude?: Set<keyof T>) {
    const result: any[] = []
    const keys = Array.from(new Set(Object.keys(now).concat(Object.keys(prev)) as (keyof T)[]))
    for (const key of keys) {
        if (exclude && exclude.has(key)) continue
        if (has.call(now, key)) {
            if (now[key] !== prev[key]) {
                // @ts-ignore
                result.push(key, key === 'style' ? diffProperties(now[key], prev[key]) : now[key])
            }
        } else {
            if (has.call(prev, key)) result.push(key, DELETE)
        }
    }
    return result
}

export const depEqual = (a: unknown[], b: unknown[]) => {
    for (const i in a) {
        if (a[i] !== b[i]) return false
    }
    return true
}
