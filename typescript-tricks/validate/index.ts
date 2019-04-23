type ruleFunc = (val: any) => boolean
type Rules = Record<string, ruleFunc | null>

export function makeValidate<T extends Rules>(rules: T) {
    return function validate(...ruleNames: Array<keyof T>) {
        return (target: Object, key: string, descriptor: PropertyDescriptor) => {
            const original: Function = descriptor.value
            descriptor.value = function(...args: any[]) {
                let error: keyof T = ''
                let ind: number
                for (ind = 0; ind < ruleNames.length; ind++) {
                    const ruleName = ruleNames[ind]
                    const arg = arguments[ind]
                    if (ruleName && !rules[ruleName]!(arg)) {
                        error = ruleNames[ind]
                        break
                    }
                }
                if (error) {
                    console.error(
                        `${target.constructor.name}.${key} get` +
                            ` an invalid parameter, which index is ${ind}, disobeys rule ${error}`
                    )
                } else {
                    original.apply(this, args)
                }
            }
            return descriptor
        }
    }
}

const rules = {
    '': null,
    hex(val: string) {
        return val.match(/^(0x|0X)?[a-fA-F\d]+$/) ? true : false
    },
    moreThan20(val: number) {
        return val > 20
    }
} as const

const validate = makeValidate(rules)

class Foo {
    private foo = 'Foo'
    @validate('hex', '', 'moreThan20')
    public bar(hex: string, _: any, num: number) {
        console.log(this.foo)
        console.log(hex, num - 20)
    }
}

const foo = new Foo()
foo.bar('0x123', null, 21)
foo.bar('01x233', null, 21)
foo.bar('test', undefined, 21)
foo.bar('0xfff', NaN, 19)
