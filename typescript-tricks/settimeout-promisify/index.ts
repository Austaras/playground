function timeoutPromise(time: number) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, time)
    })
}

console.log(performance.now())
timeoutPromise(1000)
    .then(() => console.log(performance.now()))