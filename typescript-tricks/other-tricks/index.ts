function timeoutPromise(time: number) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, time)
    })
}

console.log(performance.now())
timeoutPromise(1000)
    .then(() => console.log(performance.now()))

// 

function warn() {
    console.warn("need argument")
}

function foo(x = warn() as any) {
    console.log(x)
}

foo()

// absolutly EVIL

const a = [1, 2, 3]
a.length = 1
console.log(a)
a.length = 2
console.log(a)