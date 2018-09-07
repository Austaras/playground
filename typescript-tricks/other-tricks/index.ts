function warn() {
    console.warn('need argument')
}

function foo(x = warn() as any) {
    console.log(x)
}

foo()

// absolutly EVIL

const arr = [1, 2, 3]
arr.length = 1
console.log(arr)
arr.length = 2
console.log(arr)

// circular array
const len = 60
const handler: ProxyHandler<number[]> = {
    get: (obj, key: number) => obj[key % len],
    set: (obj, key: number, val: number) => {
        obj[key % len] = val
        return true
    }
}
const orig = new Array(60).fill(0).map((_, i) => i)
const proxy = new Proxy(orig, handler)
console.log(proxy[3601])
