import { Properties } from 'csstype'

import { Component } from './render'

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [elemName in Exclude<HTMLElementTagName, 'input'>]: JSXProps
        } & {
            input: InputProps
        }
    }

    type HTMLElementTagName = keyof HTMLElementTagNameMap

    type JSXEvent<E = HTMLElement> = (
        event: Event & {
            target: E
        }
    ) => void
    interface JSXEventProps {
        onClick?: JSXEvent
        onFocus?: JSXEvent
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

    interface JSXHasChildren {
        children?: JSXChildren
    }

    interface JSXProps extends JSXAttributes, JSXHasChildren {}
    interface InputProps extends JSXAttributes, JSXHasChildren {
        value?: text
        onChange?: JSXEvent<HTMLInputElement>
        onInput?: JSXEvent<HTMLInputElement>
    }
    type FunctionComponent<T = {}, R = JSXElement> = (props: T) => R
    type ClassComponent<T = {}, S = {}, R = JSXElement> = new (props: T) => Component<T, S, R>
    interface JSXNode<T = {}> {
        type: HTMLElementTagName
        props: JSXProps & T
    }
    interface JSXElement<T = {}, R = JSXNode> {
        type: JSXType<T, R>
        props: JSXProps & T
    }

    type JSXType<T = {}, R = JSXNode> = HTMLElementTagName | FunctionComponent<T, R> | ClassComponent<T, R>
    type JSXConfig<T = {}> = JSXAttributes & T

    type text = string | number
    type JSXChild = JSXElement | text | null
    type JSXChildren = TypeOrArr<JSXElement | text | null>
}
