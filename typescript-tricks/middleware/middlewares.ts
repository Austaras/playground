export type Next = (payload: object) => any
export type Middleware = (payload: object, next: Next) => any

export const doNothingMiddleware: Middleware = (payload, next) => next(payload)

export const thanosMiddleware: Middleware = (payload, next) => {
    if (Math.random() > 0.5) {
        return next(payload)
    } else {
        console.log('snapped')
        return payload
    }
}

export const nextTickMiddleware: Middleware = (payload, next) =>
    Promise.resolve().then(() => next(payload))

export const logMiddleware: Middleware = (payload, next) => {
    console.log(payload)
    return next(payload)
}

export const makeAddMiddleware = (key: string, value: any): Middleware => (payload, next) =>
    next({ ...payload, [key]: value })
