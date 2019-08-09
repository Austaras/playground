import { Handler } from './handler'
import { doNothingMiddleware, logMiddleware, thanosMiddleware, makeAddMiddleware } from './middlewares'

const handler = new Handler()
handler.applyMiddleware(thanosMiddleware, makeAddMiddleware('y', 1), doNothingMiddleware, logMiddleware)
const payload = { x: 1 }
for (let i = 0; i < 10; i++) {
    handler.handle(payload)
}
