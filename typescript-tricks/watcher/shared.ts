export type Action = 'add' | 'set' | 'get' | 'delete'
export type Watcher = typeof watcherFunc

export function watcherFunc(action: Action, key: string, prop: string, value: any) {
    const str = `${action} ${key}.${prop} `
    if (value) {
        console.log(str + 'to', value)
    } else {
        console.log(str)
    }
}

export function isPlainObj(o: any): o is object {
    return Object.prototype.toString.call(o) === '[object Object]'
}

export function isObj(o: object) {
    return o !== null && typeof o === 'object'
}

// in case Object.create(null)
export function hasKey(o: object, k: string) {
    return Object.prototype.hasOwnProperty.call(o, k)
}
