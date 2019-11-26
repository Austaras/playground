import { Properties } from 'csstype'

import { isText } from './utils'

const TYPE_TEXT = Symbol.for('text')

interface BasicFiber {
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
}

interface NormalFiber extends BasicFiber {
    type?: HTMLElementTagName
    dom?: HTMLElement
    props: JSXProps
}

interface TextFiber extends BasicFiber {
    type: typeof TYPE_TEXT
    dom?: Text
    props: text
}

type Fiber = TextFiber | NormalFiber

function createNode(fiber: Fiber) {
    if (fiber.type === undefined) return undefined
    if (fiber.type === TYPE_TEXT) return document.createTextNode(fiber.props as string)
    const node: HTMLElement = document.createElement(fiber.type)
    const { children, style, ...native } = fiber.props
    let prop: keyof typeof native
    for (prop in native) node.setAttribute(prop, native[prop] as any)
    if (style) {
        let key: keyof Properties
        for (key in style) (node.style as any)[key] = style[key]
    }
    return node
}

let nextUnitofWork: Fiber | null = null
export function render(element: JSXElement | JSXElement[], container: HTMLElement) {
    nextUnitofWork = {
        dom: container,
        props: {
            children: Array.isArray(element) ? element : [element]
        }
    }
}

function workloop(deadline: IdleDeadline) {
    let shouldYield = false
    while (nextUnitofWork !== null && !shouldYield) {
        nextUnitofWork = performUnitOfWork(nextUnitofWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workloop)
}

function performUnitOfWork(fiber: Fiber) {
    if (!fiber.dom) {
        fiber.dom = createNode(fiber)
    }
    if (fiber.parent && fiber.dom) {
        fiber.parent.dom!.appendChild(fiber.dom)
    }
    const { children = [] } = fiber.props as {
        children: (text | JSXElement)[]
    }
    let index = 0
    let prevSibling: Fiber | null = null
    while (index < children.length) {
        const child = children[index]
        if (child === null) {
            index++
            continue
        }
        const newFiber: Fiber = isText(child) ? {
            type: TYPE_TEXT,
            props: child,
            parent: fiber
        } : {
            type: child.type,
            props: child.props,
            parent: fiber
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling!.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }

    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent!
    }

    return null
}

requestIdleCallback(workloop)
