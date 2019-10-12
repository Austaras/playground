import { Middleware, Cont } from './middlewares'

export class Handler {
    private middlewares: Middleware[] = []
    public applyMiddleware(...middlewares: Middleware[]) {
        this.middlewares.push(...middlewares)
    }
    public handle(payload: object, callback: Cont = () => {}) {
        if (this.middlewares.length === 0) {
            callback(payload)
        } else {
            this.middlewares.reduce((f, g) => (load, cont) => f(load, load => g(load, cont)))(
                payload,
                callback
            )
        }
    }
}
