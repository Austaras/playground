import 'reflect-metadata'

function getService(name: string) {
    return name[0].toLowerCase() + name.replace('Service', '').slice(1)
}

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

export function mount(constructor: { new(...args: any[]): {} }, ser: Services): Warpped {
    const param = Reflect.getMetadata('design:paramtypes', constructor)
    const data: any[] = new Array(param.length)
    const watch: Record<string, any> = {}
    param.forEach((i: Function, ind: number) => {
        if (i.name.includes('Service')) {
            const name = getService(i.name)
            watch[name] = []
            data[ind] = trace(ser[name], watch[name])
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
