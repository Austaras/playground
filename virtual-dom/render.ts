import { isEmpty, has } from './utils'

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
    hooks?: {
        state: any
        queue: any[]
    }[]
    child?: Fiber
    sibling?: Fiber
    alternate?: Fiber
    effectTag?: EFFECT
}

interface NormalFiber extends BasicFiber {
    type?: JSXType
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

function commitWork(fiber: Fiber | undefined) {
    if (!fiber) return
    let domParentFiber = fiber.parent!
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent!
    }
    const domParent = domParentFiber.dom
    if (fiber.dom) {
        switch (fiber.effectTag) {
            case EFFECT.PLACEMENT: {
                let delFiber = fiber
                while (!delFiber.dom) {
                    delFiber = delFiber.child!
                }
                domParent.appendChild(delFiber.dom)
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

let count = 0
function workloop(deadline: IdleDeadline) {
    let shouldYield = false
    while (nextUnitofWork && !shouldYield) {
        nextUnitofWork = performUnitOfWork(nextUnitofWork)
        shouldYield = deadline.timeRemaining() < 1
        count ++
    }
    console.log(count)

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

let wipFiber: Fiber | null = null
let hookIndex = 0
function performUnitOfWork(fiber: Fiber) {
    if (fiber.type instanceof Function) {
        wipFiber = fiber
        hookIndex = 0
        wipFiber.hooks = []
        const children = [fiber.type(fiber.props)]
        reconcile(fiber, children)
    } else {
        if (!fiber.dom) {
            fiber.dom = createNode(fiber)
        }
        reconcile(fiber, buildChildren((fiber.props as any).children))
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

type Update<T> = ((arg: T) => T) | T
export function useState<T>(initial: T): [T, (arg: Update<T>) => void] {
    const oldHook = wipFiber!.alternate?.hooks?.[hookIndex]
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [] as Update<T>[]
    }

    const setState = (action: Update<T>) => {
        hook.queue.push(action)
        // TODO: don't
        wipRoot = {
            dom: currentRoot!.dom,
            props: currentRoot!.props,
            alternate: currentRoot
        } as any
        nextUnitofWork = wipRoot
        deletions = []
    }

    const actions = oldHook ? oldHook.queue : []
    actions.forEach(action => {
        hook.state = action instanceof Function ? action(hook.state) : action
    })

    wipFiber!.hooks!.push(hook)
    hookIndex++
    return [hook.state, setState]
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
