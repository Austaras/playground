import { hasKey, isPlainObj, Watcher } from './shared'

type PatchMethod = 'push' | 'pop' | 'shift' | 'unshift'
    | 'splice' | 'sort' | 'reverse'

class WatchedArray<T> extends Array<T> {
    constructor(
        val: T[] | number,
        private watcher: Watcher,
        private key: string,
        private prop: string
    ) {
        super(typeof val === 'number' ? val : val.length)
        // this constructor maybe called by native method
        // in that case just give it a native array
        if (!watcher) return Array(val) as any
        for (let i = 0; i < this.length; i++) {
            this[i] = defineReactive((val as T[])[i], watcher, key, prop)
        }
    }
    private callSuper(method: PatchMethod, preserve: number, args: any[]) {
        const watchedArgs = args.slice(preserve).map(val =>
            defineReactive(val, this.watcher, this.key, this.prop))
        const superArgs = args.slice(0, preserve).concat(watchedArgs)
        const ret = (super[method] as Function)(...superArgs)
        this.watcher('set', this.key, this.prop, this)
        return ret
    }
    public push(...args: T[]) {
        return this.callSuper('push', 0, args)
    }
    public pop() {
        return this.callSuper('pop', 0, [])
    }
    public shift() {
        return this.callSuper('shift', 0, [])
    }
    public unshift(...args: T[]) {
        return this.callSuper('unshift', 0, args)
    }
    public sort(...args: [Function?]) {
        return this.callSuper('sort', 1, args)
    }
    public reverse() {
        return this.callSuper('reverse', 0, [])
    }
    public splice(...args: [number, number?, ...T[]]) {
        return this.callSuper('splice', 2, args)
    }
}

function defineReactive(val: any, watcher: Watcher, key: string, prop: string) {
    if (Array.isArray(val) && !(val instanceof WatchedArray)) {
        return new WatchedArray(val, watcher, key, prop)
    } else if (isPlainObj(val)) {
        return watch(val, watcher, prop)
    } else {
        return val
    }
}

export function watch<T extends Record<string, any>>(
    obj: T, watcher: Watcher, key = 'base'
) {
    const store: T = {} as any
    for (const prop in obj) {
        if (!hasKey(obj, prop)) continue
        store[prop] = defineReactive(obj[prop], watcher, key, prop)
        Object.defineProperty(obj, prop, {
            get() {
                return store[prop]
            },
            set(val: T[typeof prop]) {
                store[prop] = defineReactive(val, watcher, key, prop)
                watcher('set', key, prop, store[prop])
            }
        })
    }
    return obj
}
