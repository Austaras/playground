import { Handler } from './handler'
import { doNothingMiddleware, logMiddleware, thanosMiddleware, makeAddMiddleware } from './middlewares'

const handler = new Handler()
const addYMiddleware = makeAddMiddleware('y', 1)
handler.applyMiddleware(thanosMiddleware, addYMiddleware, doNothingMiddleware, logMiddleware)
const payload = { x: 1 }
for (let i = 0; i < 10; i++) {
    handler.handle(payload)
}
