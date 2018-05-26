import "reflect-metadata"

function getService(name: string) {
    return name[0].toLowerCase() + name.replace("Service", "").slice(1)
}

export function trace(obj: any, watch: Function[]) {
    const handler = {
        get(target: any, propKey: string, receiver: any) {
            const origMethod = target[propKey]
            if (typeof origMethod !== "function") return origMethod
            return function(...args: any[]) {
                if (typeof args[0] === "function") watch.push(...args)
                return origMethod.apply(this, args)
            }
        }
    };
    return new Proxy(obj, handler)
}

export function mount(constructor: { new(...args: any[]): {} }, ser: Services): Warpped {
    const param = Reflect.getMetadata("design:paramtypes", constructor)
    const data: any[] = new Array(param.length)
    const watch: any = {}
    param.forEach((i: Function, ind: number) => {
        if (i.name.indexOf("Service") !== -1) {
            const name = getService(i.name)
            watch[name] = []
            data[ind] = trace(ser[name], watch[name])
        }
    })
    const comp: any = new constructor(...data)
    comp.watch = watch
    return comp
}

export function unmount(comp: Warpped, services: Services) {
    if (comp.watch) {
        for (const [key, val] of Object.entries(comp.watch)) {
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
