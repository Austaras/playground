import { Action, hasKey, isObj, watcherFunc } from './shared'

// https://github.com/Microsoft/TypeScript/issues/1863
const sym: string = Symbol('__PROXIED__') as any

export function trap<T extends Record<string, any>>(
    object: T,
    watcher: typeof watcherFunc,
    key = 'base'
) {
    if (object[sym]) return object
    for (const i in object) {
        if (hasKey(object, i) && typeof object[i] === 'object') {
            object[i] = trap(object[i], watcher, i)
        }
    }
    const handler: ProxyHandler<T> = {
        get(obj: T, prop: string) {
            if (prop !== sym) {
                return obj[prop]
            }
            return true
        },
        set(obj: T, prop: keyof T & string, value: any) {
            const action: Action = hasKey(obj, prop) ? 'set' : 'add'
            watcher(action, key, prop, value)
            if (isObj(value)) {
                obj[prop] = trap(value, watcher, prop)
            } else {
                obj[prop] = value
            }
            return value
        },
        deleteProperty(obj: any, prop: string) {
            if (prop in obj) {
                watcher('delete', key, prop, undefined)
                delete obj[prop]
            }
            return true
        }
    }
    return new Proxy(object, handler)
}
