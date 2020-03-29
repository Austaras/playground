import { Watcher, hasKey, isPlainObj } from './shared'

type PatchMethod = 'push' | 'pop' | 'shift' | 'unshift' | 'splice' | 'sort' | 'reverse'

class WatchedArray<T> extends Array<T> {
    constructor(
        val: T[] | number,
        private key: string,
        private child: string,
        private watcher: Watcher
    ) {
        super(typeof val === 'number' ? val : val.length)
        // this constructor maybe called by native method
        // in that case just give it a native array
        if (!watcher) return Array(val) as any
        for (let i = 0; i < this.length; i++) {
            this[i] = classify((val as any[])[i], key, child, watcher) as T
        }
    }
    // it should be private
    public callSuper(method: PatchMethod, preserve: number, args: any[]) {
        const watchedArgs = args
            .slice(preserve)
            .map(val => classify(val, this.key, this.child, this.watcher))
        const superArgs = args.slice(0, preserve).concat(watchedArgs)
        const ret = (super[method] as Function)(...superArgs)
        this.watcher('set', this.key, this.child, this)
        return ret
    }
}

const patch = [
    ['push', 0, true],
    ['pop', 0, false],
    ['shift', 0, false],
    ['unshift', 0, true],
    ['sort', 1, true],
    ['reverse', 0, false],
    ['splice', 2, true]
] as const

patch.forEach(([method, preserve, hasArg]) => {
    WatchedArray.prototype[method] = function(...args: any) {
        return this.callSuper(method, preserve, hasArg ? args : [])
    }
})

function classify(val: unknown, key: string, child: string, watcher: Watcher) {
    if (Array.isArray(val)) {
        return new WatchedArray(val, key, child, watcher)
    }
    if (isPlainObj(val)) {
        return watch(val, watcher, child)
    }
    return val
}

function defineReactive(
    obj: Record<string, any>,
    val: any,
    key: string,
    child: string,
    watcher: Watcher
) {
    val = classify(val, key, child, watcher)
    Object.defineProperty(obj, child, {
        get() {
            return val
        },
        set(value: any) {
            val = classify(value, key, child, watcher)
            watcher('set', key, child, val)
        }
    })
}

export function watch<T extends Record<string, any>>(obj: T, watcher: Watcher, key = 'base') {
    for (const child in obj) {
        if (!hasKey(obj, child)) continue
        defineReactive(obj, obj[child], key, child, watcher)
    }
    return obj
}
