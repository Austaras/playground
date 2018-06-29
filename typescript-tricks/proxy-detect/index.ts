class Person {
    public money = 100
    public house = {
        door: "Hodor",
        window: {
            height: 100,
            width: 50
        }
    }
    public children: number[]
}

function trap<T extends { [k: string]: any }>(object: T, key?: string) {
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

const person = trap(new Person())
person.money = 7
person.money++
delete person.money
person.house.window.width = 75
person.house = {
    door: "Hodor",
    window: {
        height: 100,
        width: 50
    }
}
delete person.house.door
person.children = [1, 2, 3, 4, 5]
person.children.reverse()
