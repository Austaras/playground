import { Fiber, TYPE_TEXT, RenderedFiber, TextFiber } from './fiber'
import { update } from './reconcile'
import { DELETE, diffProperties } from './utils'

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

export function appendNode(parent: HTMLElement, fiber: Fiber) {
    let newFiber = fiber
    while (!newFiber.dom) {
        newFiber = newFiber.child!
    }
    parent.appendChild(newFiber.dom)
}

export function createNode(fiber: Fiber) {
    if (fiber.type === undefined) return undefined
    if (fiber.type === TYPE_TEXT) return document.createTextNode(fiber.props as string)
    const node: HTMLElement = document.createElement(fiber.type as HTMLElementTagName)
    const { children, ...native } = fiber.props
    let prop: keyof typeof native
    const ev: EventRecord = {}
    for (prop in native) {
        if (prop === 'className') {
            node.setAttribute('class', native[prop] + '')
        } else if (prop === 'style') {
            const style = native[prop]
            // @ts-ignore
            for (const key in style) node.style[key] = style[key]
        } else if (prop.startsWith('on')) {
            const event = (prop[2].toLowerCase() + prop.slice(3)) as HTMLEventName
            ev[event] = native[prop] as any
        } else {
            node.setAttribute(prop, native[prop] + '')
        }
    }
    if (Object.keys(ev).length > 0) globalEvent.set(node, ev)
    return node
}

function updateStyle(dom: HTMLElement, styles: any[]) {
    for (let i = 0; i < styles.length; i += 2) {
        const key: string = styles[i]
        let value: string | typeof DELETE = styles[i + 1]
        if (value === DELETE) value = ''
        dom.style[key as any] = value
    }
}
const excludeProps = new Set(['children'] as const)
export function updateNode(fiber: RenderedFiber | TextFiber, prevProps: JSXProps | text) {
    if (fiber.type === TYPE_TEXT) {
        return (fiber.dom!.nodeValue = fiber.props as string)
    }
    const diff = diffProperties(fiber.props, prevProps as JSXProps, excludeProps)
    const ev: EventRecord = {}
    for (let i = 0; i < diff.length; i += 2) {
        let key: string = diff[i]
        const value: keyof JSXProps | typeof DELETE = diff[i + 1]
        if (key === 'className') key = 'class'
        if (value === DELETE) {
            if (!key.startsWith('on')) fiber.dom.removeAttribute(key)
        } else {
            if (key === 'className') {
                fiber.dom.setAttribute('class', value + '')
            } else if (key === 'style') {
                updateStyle(fiber.dom, value as any)
            } else if (key.startsWith('on')) {
                const event = (key[2].toLowerCase() + key.slice(3)) as HTMLEventName
                ev[event] = value as any
            } else {
                fiber.dom.setAttribute(key, value + '')
            }
        }
    }
    if (Object.keys(ev).length > 0) globalEvent.set(fiber.dom, ev)
}

export function removeNode(parent: HTMLElement, fiber: Fiber) {
    if (fiber.dom instanceof HTMLElement) globalEvent.delete(fiber.dom)
    parent.removeChild(fiber.dom!)
}
