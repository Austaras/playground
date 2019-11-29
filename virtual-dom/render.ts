import { isObject, isEmpty, isVoid, has } from './utils'

const TYPE_TEXT = Symbol.for('text')
enum EFFECT {
    UPDATE,
    PLACEMENT,
    DELETION
}

interface TextNode {
    type: typeof TYPE_TEXT
    props: text
}

interface BasicFiber {
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber
    alternate?: Fiber
    effectTag?: EFFECT
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

type RenderElement = TextNode | JSXElement
type Fiber = TextFiber | NormalFiber

function setStyle(dom: HTMLElement, style: JSXProps['style']) {
    // @ts-ignore
    for (const key in style) dom.style[key] = style[key]
}

function createNode(fiber: Fiber) {
    if (fiber.type === undefined) return undefined
    if (fiber.type === TYPE_TEXT) return document.createTextNode(fiber.props as string)
    const node: HTMLElement = document.createElement(fiber.type)
    const { children, style, ...native } = fiber.props
    let prop: keyof typeof native
    for (prop in native) (node[prop] as any) = native[prop]
    if (style) {
        setStyle(node, style)
    }
    return node
}

let nextUnitofWork: Fiber | null = null
let wipRoot: Fiber | null = null
let currentRoot: Fiber | undefined
let deletions: Fiber[] = []
export function render(element: JSXElement | JSXElement[], container: HTMLElement) {
    wipRoot = {
        dom: container,
        props: {
            children: element
        },
        alternate: currentRoot
    }
    deletions = []
    nextUnitofWork = wipRoot
}

function diffObject<T extends object, S extends keyof T>(now: T, prev: T, exclude?: Set<S>) {
    type Key = Exclude<keyof T, S>
    const remove: Key[] = []
    const place: Key[] = []
    const update: Key[] = []
    let keys = Object.keys(now) as (keyof T)[]
    let key: keyof T
    for (key of keys) {
        if (exclude && exclude.has(key as any)) continue
        if (has.call(prev, key) && prev[key] !== now[key]) {
            update.push(key as Key)
        } else {
            place.push(key as Key)
        }
    }
    keys = Object.keys(prev) as (keyof T)[]
    for (key of keys) {
        if (exclude && exclude.has(key as any)) continue
        if (!has.call(now, key)) {
            remove.push(key as Key)
        }
    }
    return [remove, place, update]
}

const excludeProps = new Set(['children'] as const)
function updateDom(fiber: Fiber, prevProps: JSXProps | text) {
    if (fiber.type === TYPE_TEXT) {
        return (fiber.dom!.nodeValue = fiber.props as string)
    }
    const [remove, place, update] = diffObject(fiber.props, prevProps as JSXProps, excludeProps)
    if (fiber.props.style) console.log(remove, place, update)
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
        } else {
            // @ts-ignore
            fiber.dom[k] = fiber.props[k]
        }
    })
}

function commitWork(fiber: Fiber | undefined) {
    if (!fiber) return
    const domParent = fiber.parent!.dom!
    if (fiber.dom) {
        switch (fiber.effectTag) {
            case EFFECT.PLACEMENT: {
                domParent.appendChild(fiber.dom)
                break
            }
            case EFFECT.UPDATE: {
                updateDom(fiber, fiber.alternate!.props)
                break
            }
            case EFFECT.DELETION: {
                return domParent.removeChild(fiber.dom)
            }
        }
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function workloop(deadline: IdleDeadline) {
    let shouldYield = false
    while (nextUnitofWork && !shouldYield) {
        nextUnitofWork = performUnitOfWork(nextUnitofWork)
        shouldYield = deadline.timeRemaining() < 1
    }

    if (!nextUnitofWork && wipRoot) {
        deletions.forEach(commitWork)
        commitWork(wipRoot.child)
        currentRoot = wipRoot
        delete currentRoot.alternate
        wipRoot = null
    }
    requestIdleCallback(workloop)
}

function buildNode(node: text | JSXElement): RenderElement {
    if (typeof node === 'object') return node
    return {
        type: TYPE_TEXT,
        props: node
    }
}

function buildChildren(children: JSXChildren | undefined) {
    const result: RenderElement[] = []
    if (isEmpty(children)) return result
    if (!Array.isArray(children)) return [buildNode(children)]
    for (const child of children) {
        if (child === null) continue
        if (Array.isArray(child)) {
            result.push(...buildChildren(child))
        } else {
            result.push(buildNode(child))
        }
    }
    return result
}

function performUnitOfWork(fiber: Fiber) {
    if (!fiber.dom) {
        fiber.dom = createNode(fiber)
    }

    reconcile(fiber, buildChildren((fiber.props as any).children))

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

function reconcile(wipFiber: Fiber, elements: RenderElement[]) {
    let index = 0
    let prevSibling: Fiber | null = null
    let oldFiber = wipFiber.alternate?.child
    while (index < elements.length || oldFiber !== undefined) {
        const element = elements[index]
        let newFiber: Fiber
        const notEmpty = !isEmpty(element)
        const sameType = oldFiber && notEmpty && oldFiber.type === element.type
        if (sameType) {
            newFiber = {
                type: oldFiber!.type as any,
                props: (element as JSXElement).props,
                dom: oldFiber!.dom as any,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: EFFECT.UPDATE
            }
        }
        if (!sameType && notEmpty) {
            newFiber = {
                ...element,
                parent: wipFiber,
                effectTag: EFFECT.PLACEMENT
            }
        }
        if (!sameType && oldFiber) {
            oldFiber.effectTag = EFFECT.DELETION
            deletions.push(oldFiber)
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if (index === 0) {
            wipFiber.child = newFiber!
        } else if (notEmpty) {
            prevSibling!.sibling = newFiber!
        }
        if (newFiber!) {
            prevSibling = newFiber!
        }
        index++
    }
}

requestIdleCallback(workloop)
