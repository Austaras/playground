import { genAlt, NormalFiber } from './fiber'
import { update } from './reconcile'

export const FIBER = Symbol.for('fiber')

export abstract class Component<P = {}, S = {}, R = JSXElement> {
    protected abstract state: S
    private [FIBER]: NormalFiber
    constructor(public props: P) {}
    public abstract render(): R
    public setState(state: Partial<S>) {
        this.state = { ...this.state, ...state }
        this[FIBER].alternate = genAlt(this[FIBER], 'instance')
        update(this[FIBER])
    }
}
