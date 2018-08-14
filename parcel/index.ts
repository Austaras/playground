import message from './message'
const i = 0
console.log(message + i)

class Animal {

}

class Dog extends Animal {
    public bark() {
        return '汪'
    }
}

class GreyHound extends Dog {
    public bark() {
        return 'test'
    }
}

function f(g: (dog: Dog) => Dog): string {
    const dog = new GreyHound()
    return g(dog).bark()
}

function gf(dog: GreyHound) {
    return dog
}

f(gf)
