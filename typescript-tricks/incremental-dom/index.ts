const NODE_DATA_KEY = '__ID_Data__'

declare global {
    interface Node {
        __ID_Data__?: NodeData
    }
}

type Dict = Record<string, any>

// The current nodes being processed
let currentNode: Node | null = null
let currentParent: Node | null = null

class NodeData {
    public text?: string // attrs
    public attrMap?: Dict

    constructor(
        public name: string // key
    ) {}
}

function getData(node: Node) {
    if (!node[NODE_DATA_KEY]) {
        node[NODE_DATA_KEY] = new NodeData(node.nodeName.toLowerCase())
    }

    return node[NODE_DATA_KEY]!
}

function enterNode() {
    currentParent = currentNode
    currentNode = null
}

function nextNode() {
    currentNode = currentNode ? currentNode.nextSibling : currentParent!.firstChild
}

function exitNode() {
    currentNode = currentParent
    currentParent = currentParent!.parentNode
}

function matches(matchNode: Node, name: string) {
    const data = getData(matchNode)
    return name === data.name // && key === data.key
}

function applyAttr(node: HTMLElement, add: Dict, remove: Dict) {
    Object.entries(add).forEach(([key, value]) => {
        if (typeof value === 'function') {
            node.addEventListener(key, value)
            return
        }
        node.setAttribute(key, value)
    })
    Object.entries(remove).forEach(([key, value]) => {
        if (typeof value === 'function') {
            node.removeEventListener(key, value)
            return
        }
        node.removeAttribute(key)
    })
}

function updateAttr(node: Node, newAttrMap: Dict) {
    if (!(node instanceof HTMLElement)) return
    const data = getData(node)
    const attrMap = data.attrMap ?? {}
    const add: Dict = {}
    const remove: Dict = {}
    const keys = Object.keys(attrMap).concat(Object.keys(newAttrMap))
    for (const key of keys) {
        if (!newAttrMap[key]) {
            remove[key] = attrMap[key]
            continue
        }
        if (!attrMap[key]) {
            add[key] = newAttrMap[key]
            continue
        }
        if (newAttrMap[key] !== attrMap[key]) {
            add[key] = attrMap[key]
            remove[key] = attrMap[key]
            continue
        }
    }
    applyAttr(node, add, remove)
}

function renderDOM(name: string): Node {
    if (currentNode && matches(currentNode, name /* key */)) {
        return currentNode
    }

    const node = name === '#text' ? document.createTextNode('') : document.createElement(name)

    currentParent!.insertBefore(node, currentNode)

    currentNode = node

    return node
}

function elementOpen(name: string, attrMap?: Dict) {
    nextNode()
    /* const node = */
    const node = renderDOM(name)
    if (attrMap) updateAttr(node, attrMap)
    enterNode()

    return currentParent
}

function elementClose(_node: string /* only for mark */): Node | null {
    exitNode()

    return currentNode
}

function text(value: string) {
    nextNode()
    const node = renderDOM('#text') as Text

    // checks for text updates
    const data = getData(node)
    if (data && data.text !== value) {
        data.text = value
        node.data = value
    }

    return currentNode
}

function hook(action: Dict) {
    Object.keys(action).forEach(key => {
        const orig = action[key]
        action[key] = function(ev: Event) {
            orig(ev)
            patch(document.body, render, data, action)
        }
    })
}

export function patch(node: Node, fn: (d: Dict, a: Dict) => void, data: Dict, action: Dict) {
    currentNode = node

    enterNode()
    fn(data, action)
    exitNode()
}

const data = {
    user: 'Alexey',
    counter: 1
}

const action = {
    inc() {
        data.counter++
    },
    dec() {
        data.counter--
    },
    input(e: Event) {
        data.user = (e.target as HTMLInputElement).value
    }
}

function render(data: Dict, action: Dict) {
    elementOpen('h1')
    {
        text('Hello, ' + data.user)
    }
    elementClose('h1')
    elementOpen('input', {
        value: data.user,
        input: action.input
    })
    elementClose('input')
    elementOpen('ul')
    {
        elementOpen('li')
        {
            text('Counter: ')
            elementOpen('span')
            {
                text(data.counter.toString())
            }
            elementClose('span')
        }
        elementClose('li')
    }

    elementClose('ul')

    elementOpen('button', {
        click: action.inc
    })
    {
        text('increment')
    }
    elementClose('button')

    elementOpen('button', {
        click: action.dec
    })
    {
        text('decrement')
    }
    elementClose('button')
}

hook(action)

patch(document.body, render, data, action)
