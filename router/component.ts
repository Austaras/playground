export class Component {
    constructor(
        public element: Element
    ) { }
}

export class Servant extends Component {
    constructor(name: string) {
        const element = document.createElement('p')
        element.innerHTML = `You are currently choosing Servant <b>${name}</b>`
        element.classList.add('component')
        super(element)
    }
}

export class Saber extends Servant {
    constructor() {
        super('Saber')
    }
}

export class Lancer extends Servant {
    constructor() {
        super('Lancer')
    }
}

export class Archer extends Servant {
    constructor() {
        super('Archer')
    }
}

export class Default extends Component {
    constructor() {
        const element = document.createElement('p')
        element.innerHTML = `Please choose your servant`
        element.classList.add('component')
        super(element)
    }
}

export class NotFound extends Component {
    constructor() {
        const element = document.createElement('p')
        element.innerHTML = `This Servant doesn't exist!`
        element.classList.add('component')
        super(element)
    }
}
