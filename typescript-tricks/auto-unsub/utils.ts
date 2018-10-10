import 'reflect-metadata'

export function trace<T extends { [k: string]: any }>(obj: T, watch: Function[]) {
    const handler: ProxyHandler<T> = {
        get(target: T, propKey: string) {
            const origMethod = target[propKey]
            if (typeof origMethod !== 'function') return origMethod
            return function(this: T, ...args: any[]) {
                if (typeof args[0] === 'function') watch.push(...args)
                return origMethod.apply(this, args)
            }
        }
    }
    return new Proxy(obj, handler)
}

export function mount(constructor: { new(...args: any[]): {} }, services: Services): Warpped {
    const param = Reflect.getMetadata('design:paramtypes', constructor)
    const data: any[] = new Array(param.length)
    const watch: Record<string, any> = {}
    param.forEach((ctor: Function, ind: number) => {
        for (const name in services) {
            if (services[name] instanceof ctor) {
                data[ind] = services[name]
                break
            }
        }
    })
    const comp: Warpped = new constructor(...data)
    comp._watch = watch
    return comp
}

export function unmount(comp: Warpped, services: Services) {
    if (comp._watch) {
        for (const [key, val] of Object.entries(comp._watch)) {
            val.forEach((f: Function) => {
                services[key].unsub(f)
            })
        }
    }

    comp = {}
}

export function Inject(constructor: Function) {
    /* tslint:disable:no-empty */
}
