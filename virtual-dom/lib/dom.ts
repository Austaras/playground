import { Fiber, TYPE_TEXT } from './fiber'
import { diffObject } from './utils'

export function setStyle(dom: HTMLElement, style: JSXProps['style']) {
    // @ts-ignore
    for (const key in style) dom.style[key] = style[key]
}

export function createNode(fiber: Fiber) {
    if (fiber.type === undefined) return undefined
    if (fiber.type === TYPE_TEXT) return document.createTextNode(fiber.props as string)
    const node: HTMLElement = document.createElement(fiber.type as HTMLElementTagName)
    const { children, style, ...native } = fiber.props
    let prop: keyof typeof native
    for (prop in native) {
        if (prop.startsWith('on')) {
            const event = prop[2].toLowerCase() + prop.slice(3)
            // @ts-ignore
            node.addEventListener(event, native[prop])
        } else {
            // @ts-ignore
            node[prop] = native[prop]
        }
    }
    if (style) {
        setStyle(node, style)
    }
    return node
}

const excludeProps = new Set(['children'] as const)
export function updateDom(fiber: Fiber, prevProps: JSXProps | text) {
    if (fiber.type === TYPE_TEXT) {
        return (fiber.dom!.nodeValue = fiber.props as string)
    }
    const [remove, place, update] = diffObject(fiber.props, prevProps as JSXProps, excludeProps)
    remove.forEach(k => fiber.dom!.removeAttribute(k))
    place.forEach(k => {
        if (k === 'style') {
            setStyle(fiber.dom!, fiber.props.style)
        } else {
            // @ts-ignore
            fiber.dom[k] = fiber.props[k]
        }
    })
    update.forEach(k => {
        if (k === 'style') {
            // TODO: better
            fiber.dom!.removeAttribute('style')
            setStyle(fiber.dom!, fiber.props.style)
        } else if (k.startsWith('on')) {
            // TODO: event delegation
            const event = k[2].toLowerCase() + k.slice(3)
            // @ts-ignore
            fiber.dom.removeEventListener(event, prevProps[k])
            // @ts-ignore
            fiber.dom.addEventListener(event, fiber.props[k])
        } else {
            // @ts-ignore
            fiber.dom[k] = fiber.props[k]
        }
    })
}
