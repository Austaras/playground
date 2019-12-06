import { Component, FIBER } from './component'
import { createNode, updateNode } from './dom'
import { EFFECT, Fiber, NormalFiber, RenderElement, sanitizeChildren, EffectHook, StateHook } from './fiber'
import { depEqual } from './utils'

let nextUnitofWork: Fiber | undefined
let wipRoot: Fiber | undefined
let currentRoot: Fiber | undefined
let deletions: Fiber[] = []
let effects: (() => void)[] = []

function workloop(deadline: IdleDeadline) {
    while (nextUnitofWork && deadline.timeRemaining() > 1) {
        nextUnitofWork = performUnitOfWork(nextUnitofWork)
    }

    if (!nextUnitofWork && wipRoot) {
        deletions.forEach(commitWork)
        commitWork(wipRoot.child)
        effects.forEach(e => e())
        effects = []
        currentRoot = wipRoot
        delete currentRoot.alternate
        wipRoot = undefined
    }
    if (nextUnitofWork) requestIdleCallback(workloop)
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
        reconcile(fiber, children)
    } else {
        if (!fiber.dom) {
            fiber.dom = createNode(fiber)
        }
        reconcile(fiber, sanitizeChildren((fiber.props as JSXProps).children))
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
                let newFiber = fiber
                while (!newFiber.dom) {
                    newFiber = newFiber.child!
                }
                domParent.appendChild(newFiber.dom)
                break
            }
            case EFFECT.UPDATE: {
                if (fiber.props !== fiber.alternate!.props) {
                    updateNode(fiber, fiber.alternate!.props)
                }
                delete fiber.alternate
                break
            }
            case EFFECT.DELETION: {
                if (domParent.contains(fiber.dom)) return domParent.removeChild(fiber.dom)
            }
        }
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function reconcile(wipFiber: Fiber, elements: RenderElement[]) {
    if (elements.length > 10) console.log(elements)
    let index = 0
    let prevSibling: Fiber | null = null
    let oldFiber = wipFiber.alternate?.child
    // TODO: key
    while (index < elements.length || oldFiber !== undefined) {
        const element = elements[index]
        let newFiber: Fiber
        const sameType = oldFiber && element && oldFiber.type === element.type
        if (sameType) {
            newFiber = {
                type: oldFiber!.type,
                props: element.props,
                dom: oldFiber!.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: EFFECT.UPDATE
            } as any
        } else {
            if (element) {
                newFiber = {
                    type: element.type,
                    props: element.props,
                    parent: wipFiber,
                    effectTag: EFFECT.PLACEMENT
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

export function update(fiber: Fiber) {
    wipRoot = fiber
    nextUnitofWork = wipRoot
    deletions = []
    requestIdleCallback(workloop)
}

type Action<T> = ((arg: T) => T) | T
export function useState<T>(initial: T): [T, (arg: Action<T>) => void] {
    const oldHook = wipFiber!.alternate?.hooks?.[hookIndex] as StateHook | undefined
    const currentFiber = wipFiber as NormalFiber
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
                currentFiber.alternate = { ...currentFiber }
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
    return [hook.state, hook.dispatcher]
}

export function useEffect(eff: () => void, dep: any[]): void {
    const oldHook = wipFiber!.alternate?.hooks?.[hookIndex] as EffectHook | undefined
    if (!oldHook || !depEqual(oldHook.dep, dep)) {
        effects.push(eff)
    }

    wipFiber!.hooks!.push({ dep })
    hookIndex++
}
