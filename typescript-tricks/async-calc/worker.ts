// make typescript satisfy
const ctx: Worker & Record<string, Function> = self as any
ctx.onmessage = event => {
    const { funcStr, name, args }: {
        funcStr: string
        name: string
        args: any[]
    } = event.data
    let paramStr: string
    let body: string
    if (funcStr.startsWith('function')) {
        // is normal function
        paramStr = funcStr.slice(
            funcStr.indexOf('(') + 1, funcStr.indexOf(')')
        )
        body = funcStr.slice(
            funcStr.indexOf('{') + 1, -1
        )
    } else {
        // is arrow function
        [paramStr, body] = funcStr.split('=>').map(str => str.trim())
        if (paramStr.startsWith('(')) {
            // for functions not like x => x * x
            paramStr = paramStr.slice(1, -1)
        }
        if (body[0] !== '{') {
            // for functions like x => x * x
            body = 'return ' + body
        } else {
            body = body.slice(1, -1)
        }
    }
    const params = paramStr.split(',').map(str => str.trim())
    // for recursive function
    ctx[name] = new Function(...params, body)
    const ret = ctx[name](...args)
    delete ctx[name]
    ctx.postMessage(ret)
}
