import { watch } from './define-property'
import { Person } from './person'
import { trap } from './proxy'
import { watcherFunc } from './shared'

const person1 = watch(new Person(), watcherFunc)
const person2 = trap(new Person(), watcherFunc)

function test(person: Person) {
    person.money = 7
    person.money++
    person.house.window.width = 75
    const window = Object.create(null)
    window.height = 100
    window.width = 75
    person.house = {
        door: 'Hodor',
        window,
        furnitures: person.house.furnitures
    }
    person.house.window.height = 99

    person.children = [1, 2, 3, 4, 5]
    person.children.reverse()
    person.children.pop()
    person.children.push(9)
    person.children.sort((a, b) => a - b)
    person.house.furnitures.push('another chair')

    person.car.push({ name: 'Benz', value: 100000, wheel: [1, 2, 3] })
    person.car[0].value = 50000
    person.car[0].wheel.push(4)

    console.warn('only proxy can detect following')
    person.superAbility = 'can fly'
    person.children[0] = 3
    // @ts-ignore
    delete person.money
    // @ts-ignore
    delete person.house.door

    console.warn("this is evil, don't even try")
    person.children.length = 7
    person.children.length = 4
}

console.log('-------begin defineProperty test-------')
test(person1)
console.log('--------end defineProperty test--------')
console.log()
console.log('------------begin proxy test------------')
test(person2)
console.log('-------------end proxy test-------------')
