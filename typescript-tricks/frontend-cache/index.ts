interface Req {
    [key: string]: {
        [key: string]: {
            time: number,
            result: Promise<any>
        }
    }
}

const requests: Req = {}

function cache(interval: number) {
    return function(target: any, prop: string, descriptor: PropertyDescriptor) {
        requests[prop] = {}
        const orig = descriptor.value
        descriptor.value = function(...args: any[]) {
            const argStr = args.join("&")
            let cached = requests[prop][argStr]
            if (!cached || Date.now() - cached.time > interval) {
                cached = {
                    result: orig.apply(this, args),
                    time: Date.now()
                }
                requests[prop][argStr] = cached // in case cached is undefined
            }
            return cached.result
        }
    }
}

class Wiki {
    @cache(1000)
    public get(term: string) {
        return fetch("https://en.wikipedia.org/w/api.php" +
            `?origin=*&action=opensearch&search=${term}&limit=1`)
            .then((res) => res.json())
    }
}

const wiki = new Wiki()
wiki.get("test")
    .then((result) => console.log(result))
wiki.get("test")
    .then((result) => console.log(result))
wiki.get("function")
    .then((result) => console.log(result))
setTimeout(() =>
    wiki.get("test")
        .then((result) => console.log(result)), 2000)
setTimeout(() =>
    wiki.get("function")
        .then((result) => console.log(result)), 500)
