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
    return function (target: any, prop: string, descriptor: PropertyDescriptor) {
        requests[prop] = {}
        const orig = descriptor.value
        descriptor.value = function (...args: any[]) {
            const argStr = args.join("&")
            let cache = requests[prop][argStr]
            if (cache && Date.now() - cache.time < interval) {
                return cache.result
            } else {
                const result = orig.apply(this, args)
                if (!cache) {
                    (requests[prop][argStr] as any) = {}
                    cache = requests[prop][argStr]
                }
                cache.result = result
                cache.time = Date.now()
                return result
            }
        }
    }
}

class Wiki {
    @cache(1000)
    get(term: string) {
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