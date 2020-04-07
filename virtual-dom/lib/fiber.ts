/* eslint-disable prefer-rest-params */
import { Component } from './component'
import { isEmpty } from './utils'

export const TYPE_TEXT = Symbol.for('text')
export const enum EFFECT {
    APPEND,
    UPDATE,
    DELETION
}

export interface TextNode {
    type: typeof TYPE_TEXT
    props: text
}

export type RenderElement = TextNode | JSXElement
export interface StateHook {
    state: any
    queue: any[]
    dispatcher: (arg: any) => void
}
export interface EffectHook {
    dep: any[]
}
export interface RefHook {
    current: any
}
export type Hook = StateHook | EffectHook | RefHook
export interface BasicFiber {
    parent?: Fiber
    hooks?: Hook[]
    instance?: Component
    child?: Fiber
    sibling?: Fiber
    alternate?: Fiber
    effectTag?: EFFECT
}

export interface NormalFiber extends BasicFiber {
    type?: JSXType
    dom?: HTMLElement
    props: JSXProps
}

export interface RenderedFiber extends NormalFiber {
    dom: HTMLElement
}

export interface TextFiber extends BasicFiber {
    type: typeof TYPE_TEXT
    dom?: Text
    props: text
}

export type Fiber = TextFiber | NormalFiber

function buildNode(node: text | JSXElement): RenderElement {
    if (typeof node === 'object') return node
    return {
        type: TYPE_TEXT,
        props: node
    }
}

export function sanitizeChildren(children: JSXChildren | undefined) {
    const result: RenderElement[] = []
    if (isEmpty(children)) return result
    if (!Array.isArray(children)) return [buildNode(children)]
    for (const child of children) {
        if (child === null) continue
        if (Array.isArray(child)) {
            result.push(...sanitizeChildren(child))
        } else {
            result.push(buildNode(child))
        }
    }
    return result
}

export function copyFiber(fiber: Fiber, ...more: Exclude<keyof Fiber, 'child'>[]): Fiber
export function copyFiber(fiber: Fiber): Fiber {
    const res: any = { child: fiber.child }
    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            res[arguments[i]] = fiber[arguments[i] as keyof Fiber]
        }
    }
    return res
}
