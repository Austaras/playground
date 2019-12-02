export const isObject = (i: unknown): i is object => i && typeof i === 'object'
export const isEmpty = (i: unknown): i is undefined | null | string =>
    i === null || i === undefined || i === ''

// eslint-disable-next-line @typescript-eslint/unbound-method
const has = Object.prototype.hasOwnProperty
export function diffObject<T extends object, S extends keyof T>(now: T, prev: T, exclude?: Set<S>) {
    type Key = Exclude<keyof T, S>
    const remove: Key[] = []
    const place: Key[] = []
    const update: Key[] = []
    let keys = Object.keys(now) as (keyof T)[]
    let key: keyof T
    for (key of keys) {
        if (exclude && exclude.has(key as any)) continue
        if (has.call(prev, key) && prev[key] !== now[key]) {
            update.push(key as Key)
        } else {
            place.push(key as Key)
        }
    }
    keys = Object.keys(prev) as (keyof T)[]
    for (key of keys) {
        if (exclude && exclude.has(key as any)) continue
        if (!has.call(now, key)) {
            remove.push(key as Key)
        }
    }
    return [remove, place, update]
}
