import { Properties } from 'csstype'

type TypeOrArr<T> = T[] | T
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any
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

    interface JSXProps extends JSXAttributes {
        children: JSXChildren
    }
    interface JSXElement<T = {}> {
        type: HTMLElementTagName
        props: JSXProps & T
    }

    type JSXConfig<T = {}> = JSXAttributes & T

    type text = string | number
    type JSXChildrenType = JSXElement | text | null
    type JSXChildren = TypeOrArr<JSXChildrenType>
}
