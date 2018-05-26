import "reflect-metadata"

const rules = {
    "": null,
    hex(val: string) {
        return val.match(/^(0x|0X)?[a-fA-F\d]+$/) ? true : false
    },
    moreThan20(val: number) {
        return val > 20
    }
}

type rule = keyof typeof rules

function validate(...ruleName: rule[]) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        const original: Function = descriptor.value
        descriptor.value = function() {
            let error = ""
            const errorInd = 0
            for (const ind in arguments) {
                const ruleInd = ruleName[ind]
                const arg = arguments[ind]
                if (ruleInd && !(rules[ruleInd] as Function)(arg)) {
                    error = ruleName[ind]
                    break
                }
            }
            if (error) {
                console.error(`${target.constructor.name}.${key} get` +
                    ` an invalid parameter, which index is ${errorInd}, disobeys rule ${error}`)
            } else {
                original.apply(this, arguments)
            }
        }
        return descriptor
    }
}

class Foo {
    @validate("hex", "", "moreThan20")
    public bar(hex: string, sth: any, num: number) {
        console.log(hex, num - 20)
    }
}

const foo = new Foo()
foo.bar("0x123", null, 21)
foo.bar("test", undefined, 21)
foo.bar("0xfff", NaN, 19)
