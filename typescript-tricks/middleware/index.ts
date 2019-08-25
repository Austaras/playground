import { Handler } from './handler'
import {
    doNothingMiddleware,
    logMiddleware,
    nextTickMiddleware,
    thanosMiddleware,
    makeAddMiddleware
} from './middlewares'

const handler = new Handler()
const addYMiddleware = makeAddMiddleware('y', 1)

handler.applyMiddleware(
    thanosMiddleware,
    nextTickMiddleware,
    addYMiddleware,
    doNothingMiddleware,
    logMiddleware
)

for (let i = 0; i < 10; i++) {
    handler.handle({ x: Math.floor(Math.random() * 10) })
}
