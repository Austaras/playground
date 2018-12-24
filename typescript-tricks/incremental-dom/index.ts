export {}
const NODE_DATA_KEY = '__ID_Data__'

interface MyNode extends Node {
    __ID_Data__?: NodeData
}

// The current nodes being processed
let currentNode: Node | null = null
let currentParent: Node | null = null

class NodeData {
    public text?: string // attrs

    constructor(
        public name: string // key
    ) { }
}

function getData(node: MyNode) {
    if (!node[NODE_DATA_KEY]) {
        node[NODE_DATA_KEY] = new NodeData(node.nodeName.toLowerCase())
    }

    return node[NODE_DATA_KEY]
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

function matches(matchNode: MyNode, name: string) {
    const data = getData(matchNode)
    return name === data!.name // && key === data.key
}

function renderDOM(name: string): MyNode {
    if (currentNode && matches(currentNode, name/*, key */)) {
        return currentNode
    }

    const node = name === '#text' ?
        document.createTextNode('') :
        document.createElement(name)

    currentParent!.insertBefore(node, currentNode)

    currentNode = node

    return node
}

function elementOpen(name: string) {
    nextNode()
    /* const node = */
    renderDOM(name)
    enterNode()

    // TODO: check for updates, i.t attributes
    // const data = getData(node)

    return currentParent
}

function elementClose(_node: string /* only for mark */): MyNode | null {
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

function patch(node: MyNode, fn: Function, data: Record<string, any>) {
    currentNode = node

    enterNode()
    fn(data)
    exitNode()
}

function render(data: Record<string, any>) {
    elementOpen('h1')
    {
        text('Hello, ' + data.user)
    }
    elementClose('h1')
    elementOpen('ul')
    {
        elementOpen('li')
        {
            text('Counter: ')
            elementOpen('span')
            {
                text(data.counter)
            }
            elementClose('span')
        }
        elementClose('li')
    }

    elementClose('ul')
}

document.querySelector('button')!.addEventListener('click', () => {
    data.counter++
    patch(document.body, render, data)
})
document.querySelector('input')!.addEventListener('input', e => {
    data.user = (e.target as HTMLInputElement).value
    patch(document.body, render, data)
})

const data = {
    user: 'Alexey',
    counter: 1
}

patch(document.body, render, data)
