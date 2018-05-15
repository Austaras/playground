class Person {
    money = 100
    house = {
        door: "Hodor",
        window: {
            height: 100,
            width: 50
        }
    }
}

function trap<T extends any>(object: T, key?: string) {
    key = key || "Base"
    for (const i in object) {
        if (typeof object[i] === "object") {
            object[i] = trap(object[i], i)
        }
    }
    const handler = {
        set(obj: T, prop: string, value: any, receiver: any) {
            console.log(`set ${key}.${prop} to ${value}`)
            if (typeof value === "object") {
                obj[prop] = trap(value, prop)
            } else {
                obj[prop] = value
            }
            return value
        },
        deleteProperty(obj: any, prop: string) {
            if (prop in obj) {
                console.log(`delete ${key}.${prop}`)
                delete obj[prop]
                return true
            }
            return false
        }
    }
    return new Proxy(object, handler)
}

const person = new Person()
const proxy = trap(person)
proxy.money = 7
proxy.money++
delete proxy.money
proxy.house.window.width = 75
proxy.house = {
    door: "Hodor",
    window: {
        height: 100,
        width: 50
    }
}
delete proxy.house.door
