import { EffectHook, RefHook, StateHook } from './fiber'
import { Action, addEffect, getDispatcher, getOldHook, setNewHook } from './reconcile'
import { depEqual } from './utils'

export function useState<T>(initial: T): [T, (arg: Action<T>) => void] {
    const oldHook = getOldHook() as StateHook | undefined
    let hook: StateHook
    if (oldHook) {
        hook = {
            state: oldHook.state,
            queue: [],
            // reference to dispatcher should remain same
            dispatcher: oldHook.dispatcher
        }
    } else {
        hook = {
            state: initial,
            queue: [],
            dispatcher: getDispatcher()
        }
    }

    const actions = oldHook ? oldHook.queue : []
    actions.forEach(action => {
        hook.state = action instanceof Function ? action(hook.state) : action
    })

    setNewHook(hook)
    return [hook.state as T, hook.dispatcher as (arg: Action<T>) => void]
}

export function useEffect(eff: () => void, dep: unknown[]): void {
    const oldHook = getOldHook() as EffectHook | undefined
    if (!oldHook || !depEqual(oldHook.dep, dep)) {
        addEffect(eff)
    }

    setNewHook({ dep })
}

type RefVal<T> = T | (() => T)
export function useRef<T>(initial: RefVal<T>) {
    let oldHook = getOldHook() as RefHook | undefined

    if (!oldHook) {
        oldHook = {
            current: initial instanceof Function ? initial() : initial
        }
    }

    setNewHook(oldHook)

    return oldHook as { current: T }
}
