import { Properties } from 'csstype'

import { HElement } from './h'

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [elemName in HTMLElementTagName]: JSXProps
        }
    }

    type HTMLElementTagName = keyof HTMLElementTagNameMap

    type JSXEvent = (event: Event) => void
    interface JSXEventProps {
        onClick?: JSXEvent
        onFocus?: JSXEvent
        onChange?: JSXEvent
    }
    interface JSXAttributes extends JSXEventProps {
        accessKey?: string
        className?: string
        contentEditable?: boolean
        dir?: string
        draggable?: boolean
        hidden?: boolean
        id?: string
        lang?: string
        slot?: string
        spellcheck?: boolean
        style?: Properties
        tabIndex?: number
        title?: string
        translate?: 'yes' | 'no'
    }
    type TypeOrArr<T> = T[] | T

    interface JSXProps extends JSXAttributes {
        children?: JSXChildren
    }
    type FunctionComponent<T = {}, R = JSXElement> = (props: T) => R
    type ClassComponent<T = {}, S = {}, R = JSXElement> = HElement<T, S, R>
    interface JSXNode<T = {}> {
        type: HTMLElementTagName
        props: JSXProps & T
    }
    interface JSXElement<T = {}, R = JSXNode> {
        type: HTMLElementTagName | FunctionComponent<T, R> | ClassComponent<T, R>
        props: JSXProps & T
    }

    type JSXType = HTMLElementTagName | FunctionComponent | ClassComponent
    type JSXConfig<T = {}> = JSXAttributes & T

    type text = string | number
    type JSXChild = JSXElement | text | null
    type JSXChildren = TypeOrArr<JSXElement | text | null>
}
