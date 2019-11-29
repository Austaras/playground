import { Properties } from 'csstype'

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [elemName in HTMLElementTagName]: JSXProps
        }
    }

    type HTMLElementTagName = keyof HTMLElementTagNameMap

    interface JSXAttributes {
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
    interface JSXElement<T = {}> {
        type: HTMLElementTagName
        props: JSXProps & T
    }

    type JSXConfig<T = {}> = JSXAttributes & T

    type text = string | number
    type JSXChildrenType = JSXElement | text | null
    type JSXChildren = TypeOrArr<JSXElement | text | null>
}
