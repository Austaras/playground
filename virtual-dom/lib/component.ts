import { NormalFiber } from './fiber'
import { update } from './reconcile'

export const FIBER = Symbol.for('fiber')

export abstract class Component<P = {}, S = {}, R = JSXElement> {
    protected abstract state: S
    private [FIBER]: NormalFiber
    constructor(public props: P) {}
    public abstract render(): R
    public setState(state: Partial<S>) {
        this.state = { ...this.state, ...state }
        update({
            type: this[FIBER].type as ClassComponent,
            instance: this,
            props: this[FIBER].props,
            parent: this[FIBER].parent,
            alternate: this[FIBER]
        } as any)
    }
}
