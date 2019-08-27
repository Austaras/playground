function* Counter() {
    for (let i = 2; ; i++) {
        yield i
    }
}

function* PrimeFilter(prime: number, input: IterableIterator<number>) {
    for (const i of input) {
        if (i % prime !== 0) {
            yield i
        }
    }
}

function* PrimeSieve() {
    let c = Counter()
    for(;;) {
        const prime = c.next().value
        yield prime
        const newC = PrimeFilter(prime, c)
        c = newC
    }
}

const prime = PrimeSieve()
for (let i = 0; i <= 100; i++) {
    console.log(prime.next().value)
}
