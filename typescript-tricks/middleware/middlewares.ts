export type Cont = (payload: object) => any
export type Middleware = (payload: object, next: Cont) => any

export const doNothingMiddleware: Middleware = (payload, cont) => cont(payload)

export const thanosMiddleware: Middleware = (payload, cont) => {
    if (Math.random() > 0.5) {
        return cont(payload)
    } else {
        console.log('snapped')
        return payload
    }
}

export const nextTickMiddleware: Middleware = (payload, cont) =>
    Promise.resolve().then(() => cont(payload))

export const logMiddleware: Middleware = (payload, cont) => {
    console.log(payload)
    return cont(payload)
}

export const makeAddMiddleware = (key: string, value: any): Middleware => (payload, cont) =>
    cont({ ...payload, [key]: value })
