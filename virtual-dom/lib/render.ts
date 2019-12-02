import { sanitizeChildren, EFFECT, Fiber, RenderElement } from './fiber'
import { createNode, updateDom } from './dom'

let nextUnitofWork: Fiber | undefined
let wipRoot: Fiber | undefined
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

function workloop(deadline: IdleDeadline) {
    while (nextUnitofWork && deadline.timeRemaining() > 1) {
        nextUnitofWork = performUnitOfWork(nextUnitofWork)
    }

    if (!nextUnitofWork && wipRoot) {
        deletions.forEach(commitWork)
        commitWork(wipRoot.child)
        currentRoot = wipRoot
        delete currentRoot.alternate
        wipRoot = undefined
    }
    requestIdleCallback(workloop)
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
        const sameType = oldFiber && element && oldFiber.type === element.type
        if (sameType) {
            newFiber = {
                type: oldFiber!.type as any,
                props: (element as JSXElement).props,
                dom: oldFiber!.dom as any,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: EFFECT.UPDATE
            }
        } else {
            if (element) {
                newFiber = {
                    ...element,
                    parent: wipFiber,
                    effectTag: EFFECT.PLACEMENT
                }
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

requestIdleCallback(workloop)
