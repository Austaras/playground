export {}

type YinYang = (a: YinYang) => Generator<string>

function* solution() {
    function* yin(yinNext: YinYang) {
        yield '@'

        function* yang(yangNext: YinYang) {
            yield '*'
            yield* yinNext(yangNext)
        }

        yield* yang(yang)
    }

    yield* yin(yin)
}

let buffer = ''
for (const char of solution()) {
    buffer += char
    if (buffer.length >= 65) { // 10 + 55
        break
    }
}

console.log(buffer)
