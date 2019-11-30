/* eslint-disable prefer-rest-params */

export function h<T = {}>(
    type: JSXType,
    config?: JSXConfig<T> | null,
    ...children: JSXChildren[]
): JSXElement<T> {
    const props: JSXElement<T>['props'] = { ...config } as any
    const len = arguments.length
    if (len === 3 && arguments[2] !== null) {
        props.children = arguments[2]
    }
    if (len > 3) {
        const arr = []
        for (let i = 2; i < len; i++) {
            arr[i - 2] = arguments[i]
        }
        props.children = arr
    }
    return { type, props }
}

export abstract class HElement<P = {}, S = {}, R = JSXElement> {
    abstract state: S
    constructor(props: P) {}
    public abstract render(): R
    public setState(state: Partial<S>) {
        this.state = { ...this.state, state }
        this.render()
    }
}
