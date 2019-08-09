export type Next = (payload: object) => any
export type Middleware = (next: Next) => Next

export const thanosMiddleware: Middleware = (next: Next) => (payload: object) => {
    if (Math.random() > 0.5) {
        return next(payload)
    } else {
        console.log('snapped')
        return payload
    }
}

export const doNothingMiddleware: Middleware = (next: Next) => (payload: object) => next(payload)

export const logMiddleware: Middleware = (next: Next) => (payload: object) => {
    console.log(payload)
    return next(payload)
}

export const makeAddMiddleware = (key: string, value: any) => (next: Middleware) => (payload: any) =>
    next({ ...payload, [key]: value })
