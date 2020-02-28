import { Middleware, Next } from './middlewares'

export class Handler {
    private middlewares: Middleware[] = []
    public applyMiddleware(...middlewares: Middleware[]) {
        this.middlewares.push(...middlewares)
    }
    public handle(payload: object, callback: Next = () => {}) {
        if (this.middlewares.length === 0) {
            callback(payload)
        } else {
            this.middlewares.reduce((f, g) => (load, next) => f(load, load => g(load, next)))(
                payload,
                callback
            )
        }
    }
}
