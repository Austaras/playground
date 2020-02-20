import { Fiber, TYPE_TEXT } from './fiber'
import { update } from './reconcile'
import { diffObject } from './utils'

export function render(element: JSXElement | JSXElement[], container: HTMLElement) {
    update({
        dom: container,
        props: {
            children: element
        }
    })
}

type HTMLEventName = 'click' | 'change' | 'focus' | 'input'
type EventRecord = Partial<Record<HTMLEventName, (e: Event) => void>>
const globalEvent = new Map<HTMLElement, EventRecord>()
function getCallback(name: HTMLEventName) {
    return (e: Event) => {
        if (!(e.target instanceof HTMLElement)) return
        const cb = globalEvent.get(e.target)
        if (cb && cb[name]) {
            cb[name]!(e)
        }
    }
}

const EVENT = ['click', 'change', 'focus', 'input'] as const
EVENT.forEach(name => document.addEventListener(name, getCallback(name)))

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
    const ev: EventRecord = {}
    for (prop in native) {
        if (prop.startsWith('on')) {
            const event = (prop[2].toLowerCase() + prop.slice(3)) as HTMLEventName
            ev[event] = native[prop] as any
        } else {
            // @ts-ignore
            node[prop] = native[prop]
        }
    }
    if (Object.keys(ev).length > 0) globalEvent.set(node, ev)
    if (style) {
        setStyle(node, style)
    }
    return node
}

export function appendNode(parent: HTMLElement, fiber: Fiber) {
    let newFiber = fiber
    while (!newFiber.dom) {
        newFiber = newFiber.child!
    }
    parent.appendChild(newFiber.dom)
}

const excludeProps = new Set(['children'] as const)
export function updateNode(fiber: Fiber, prevProps: JSXProps | text) {
    if (fiber.type === TYPE_TEXT) {
        return (fiber.dom!.nodeValue = fiber.props as string)
    }
    const [remove, place, update] = diffObject(fiber.props, prevProps as JSXProps, excludeProps)
    remove.forEach(k => fiber.dom!.removeAttribute(k))
    place.forEach(k => {
        if (k === 'style') {
            setStyle(fiber.dom!, fiber.props.style)
        } else {
            fiber.dom!.setAttribute(k, fiber.props[k] + '')
        }
    })
    const ev: EventRecord = {}
    update.forEach(k => {
        if (k === 'style') {
            // TODO: better
            fiber.dom!.removeAttribute('style')
            setStyle(fiber.dom!, fiber.props.style)
        } else if (k.startsWith('on')) {
            const event = (k[2].toLowerCase() + k.slice(3)) as HTMLEventName
            ev[event] = fiber.props[k] as any
        } else {
            // @ts-ignore
            fiber.dom[k] = fiber.props[k]
        }
    })
    if (Object.keys(ev).length > 0) globalEvent.set(fiber.dom!, ev)
}

export function removeNode(parent: HTMLElement, fiber: Fiber) {
    if (fiber.dom instanceof HTMLElement) globalEvent.delete(fiber.dom)
    parent.removeChild(fiber.dom!)
}
