export function h<T = {}>(
    type: HTMLElementTagName,
    config?: JSXConfig<T> | null,
    ...children: JSXChildrenType[]
): JSXElement<T> {
    const props: JSXElement<T>['props'] = { ...config } as any
    if (children.length === 1) {
        props.children = children[0]
    }
    if (children.length > 1) {
        props.children = children.slice(0)
    }
    return { type, props }
}
