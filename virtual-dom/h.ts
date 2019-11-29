/* eslint-disable prefer-rest-params */

export function h<T = {}>(
    type: HTMLElementTagName,
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
