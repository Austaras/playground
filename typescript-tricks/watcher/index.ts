import { Person } from './person'
import { trap } from './proxy'

const person2 = trap(new Person(),
    (action, key, prop, val) => console.log(
        `${action} ${key}.${prop} ` + (val ? `to ${val}` : ''))
)
person2.money = 7
person2.money++
delete person2.money
person2.house.window.width = 75
person2.house = {
    door: 'Hodor',
    window: {
        height: 100,
        width: 50
    }
}
delete person2.house.door
person2.children = [1, 2, 3, 4, 5]
person2.children.reverse()
