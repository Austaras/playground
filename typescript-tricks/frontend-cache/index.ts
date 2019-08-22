export function cache(interval: number) {
    return function(obj: any, prop: string, descriptor: PropertyDescriptor) {
        // don't set cache twice
        const sym = Symbol.for(prop)
        if (obj[sym]) return
        obj[sym] = {}
        const orig = descriptor.value
        descriptor.value = function(...args: any[]) {
            const argStr = JSON.stringify(args)
            let cached = obj[sym][argStr]
            if (!cached || Date.now() - cached.time > interval) {
                cached = {
                    result: orig.apply(this, args),
                    time: Date.now()
                }
                obj[sym][argStr] = cached // in case cached is undefined
            }
            return cached.result
        }
    }
}

class Wiki {
    @cache(1000)
    @cache(1000)
    public get(term: string) {
        return fetch('https://en.wikipedia.org/w/api.php' +
            `?origin=*&action=opensearch&search=${term}&limit=1`)
            .then(res => res.json())
    }
}

const wiki = new Wiki()
wiki.get('test')
    .then(result => console.log(result))
wiki.get('test')
    .then(result => console.log(result))
wiki.get('function')
    .then(result => console.log(result))
setTimeout(() =>
    wiki.get('test')
        .then(result => console.log(result)), 2000)
setTimeout(() =>
    wiki.get('function')
        .then(result => console.log(result)), 500)
