import { Component, FIBER } from './component'
import { createNode, appendNode, removeNode, updateNode } from './render'
import { schedule } from './schedule'
import {
    EFFECT,
    EffectHook,
    Fiber,
    copyFiber,
    NormalFiber,
    RefHook,
    RenderElement,
    sanitizeChildren,
    StateHook,
    RenderedFiber
} from './fiber'
import { depEqual } from './utils'

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

type Action<T> = ((arg: T) => T) | T
export function useState<T>(initial: T): [T, (arg: Action<T>) => void] {
    const currentFiber = wipFiber as NormalFiber
    const oldHook = currentFiber.alternate?.hooks?.[hookIndex] as StateHook | undefined
    const index = hookIndex
    let hook: StateHook
    if (oldHook) {
        hook = {
            state: oldHook.state,
            queue: [],
            dispatcher: oldHook.dispatcher
        }
    } else {
        hook = {
            state: initial,
            queue: [],
            dispatcher: (action: Action<T>) => {
                currentFiber.alternate = copyFiber(currentFiber, 'hooks')
                ;(currentFiber.alternate.hooks![index] as StateHook).queue.push(action)
                update(currentFiber)
            }
        }
    }

    const actions = oldHook ? oldHook.queue : []
    actions.forEach(action => {
        hook.state = action instanceof Function ? action(hook.state) : action
    })

    wipFiber!.hooks!.push(hook)
    hookIndex++
    return [hook.state as T, hook.dispatcher as (arg: Action<T>) => void]
}

export function useEffect(eff: () => void, dep: unknown[]): void {
    const oldHook = wipFiber!.alternate?.hooks?.[hookIndex] as EffectHook | undefined
    if (!oldHook || !depEqual(oldHook.dep, dep)) {
        effects.push(eff)
    }

    wipFiber!.hooks!.push({ dep })
    hookIndex++
}

type RefVal<T> = T | (() => T)
export function useRef<T>(initial: RefVal<T>) {
    const oldHook = wipFiber!.alternate?.hooks?.[hookIndex] as RefHook | undefined
    if (!oldHook) {
        const current = initial instanceof Function ? initial() : initial
        wipFiber!.hooks!.push({ current })
    } else {
        wipFiber!.hooks!.push(oldHook)
    }
    hookIndex++
    return wipFiber!.hooks![hookIndex - 1] as {
        current: T
    }
}
