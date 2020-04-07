import { Component, FIBER } from './component'
import {
    EFFECT,
    Fiber,
    Hook,
    NormalFiber,
    RenderElement,
    RenderedFiber,
    StateHook,
    copyFiber,
    sanitizeChildren
} from './fiber'
import { appendNode, createNode, removeNode, updateNode } from './render'
import { schedule } from './schedule'

let nextUnitofWork: Fiber | undefined
let wipRoot: Fiber | undefined
let currentRoot: Fiber | undefined
let deletions: Fiber[] = []
let effects: (() => void)[] = []

const pendingWorks = new Set<Fiber>()

function workloop(deadline: IdleDeadline) {
    if (wipRoot === undefined) {
        wipRoot = pendingWorks.values().next().value
        pendingWorks.delete(wipRoot!)
        nextUnitofWork = wipRoot
    }
    while (nextUnitofWork && deadline.timeRemaining() > 1) {
        nextUnitofWork = performUnitOfWork(nextUnitofWork)
    }

    if (!nextUnitofWork && wipRoot) {
        deletions.forEach(commitWork)
        deletions = []
        commitWork(wipRoot.child)
        effects.forEach(e => e())
        effects = []
        currentRoot = wipRoot
        currentRoot.alternate = undefined
        wipRoot = undefined
    }
    if (nextUnitofWork || pendingWorks.size > 0) schedule(workloop)
}

export function update(fiber: Fiber) {
    if (fiber === wipRoot) {
        wipRoot = fiber
        nextUnitofWork = wipRoot
        return
    }
    pendingWorks.add(fiber)
    if (pendingWorks.size === 1) schedule(workloop)
}

let wipFiber: Fiber | null = null
let hookIndex = 0
function performUnitOfWork(fiber: Fiber) {
    if (fiber.type instanceof Function) {
        let children
        if (fiber.type.prototype instanceof Component) {
            if (!fiber.instance) {
                fiber.instance = new (fiber.type as ClassComponent)(fiber.props)
                ;(fiber.instance as any)[FIBER] = fiber as NormalFiber
            }
            children = [fiber.instance.render()]
        } else {
            wipFiber = fiber
            hookIndex = 0
            wipFiber.hooks = []
            children = [(fiber.type as FunctionComponent)(fiber.props)]
        }
        reconcileChildren(fiber, children)
    } else {
        if (!fiber.dom) {
            fiber.dom = createNode(fiber)
        }
        reconcileChildren(fiber, sanitizeChildren((fiber.props as JSXProps).children))
    }

    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling && nextFiber !== wipRoot) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent!
    }
}

function commitWork(fiber: Fiber | undefined) {
    if (!fiber) return
    let domParentFiber = fiber.parent!
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent!
    }
    const domParent = domParentFiber.dom as HTMLElement
    if (fiber.dom) {
        switch (fiber.effectTag) {
            case EFFECT.APPEND: {
                appendNode(domParent, fiber)
                break
            }
            case EFFECT.UPDATE: {
                if (fiber.props !== fiber.alternate!.props) {
                    updateNode(fiber as RenderedFiber, fiber.alternate!.props)
                }
                fiber.alternate = undefined
                break
            }
            case EFFECT.DELETION: {
                return removeNode(domParent, fiber)
            }
        }
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function reconcileChildren(wipFiber: Fiber, elements: RenderElement[]) {
    let index = 0
    let prevSibling: Fiber | null = null
    let oldFiber = wipFiber.alternate?.child
    // TODO: key
    while (index < elements.length || oldFiber !== undefined) {
        const element = elements[index]
        let newFiber: Fiber
        const sameType = oldFiber && element && oldFiber.type === element.type
        if (sameType) {
            oldFiber!.alternate = copyFiber(oldFiber!, 'props', 'hooks', 'sibling')
            newFiber = oldFiber!
            newFiber.parent = wipFiber
            newFiber.props = element.props
            newFiber.sibling = undefined
            newFiber.effectTag = EFFECT.UPDATE
            oldFiber = newFiber.alternate
        } else {
            if (element) {
                newFiber = {
                    type: element.type,
                    props: element.props,
                    parent: wipFiber,
                    effectTag: EFFECT.APPEND
                } as any
            }
            if (oldFiber) {
                oldFiber.effectTag = EFFECT.DELETION
                deletions.push(oldFiber)
            }
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if (index === 0) {
            wipFiber.child = newFiber!
        } else if (element) {
            prevSibling!.sibling = newFiber!
        }
        if (newFiber!) {
            prevSibling = newFiber!
        }
        index++
    }
}

export const getOldHook = () => wipFiber!.alternate?.hooks?.[hookIndex]
export function setNewHook(hook: Hook) {
    wipFiber!.hooks!.push(hook)
    hookIndex++
}
export type Action<T> = ((arg: T) => T) | T
export function getDispatcher<T>() {
    const currentFiber = wipFiber as NormalFiber
    const index = hookIndex
    return (action: Action<T>) => {
        currentFiber.alternate = copyFiber(currentFiber, 'hooks')
        ;(currentFiber.alternate.hooks![index] as StateHook).queue.push(action)
        update(currentFiber)
    }
}
export const addEffect = (eff: () => void) => effects.push(eff)
