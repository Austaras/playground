export {}

// type YinYang = (a: YinYang) => void
// function Yin(yinNext: YinYang) {
//     console.log('@')
//     console.log('*')
//     yinNext((yangNext: YinYang) => {
//         console.log('*')
//         yinNext(yangNext)
//     })
// }
// this will do the work, but I want a more controllable example

type YinYang = (next: YinYang) => Generator<string>

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
