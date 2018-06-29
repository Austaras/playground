export class Component {
    public element: Element
}

export class Servant extends Component {
    constructor(name: string) {
        super()
        this.element = document.createElement("p")
        this.element.innerHTML = `You are currently choosing Servant <b>${name}</b>`
        this.element.classList.add("component")
    }
}

export class Saber extends Servant {
    constructor() {
        super("Saber")
    }
}

export class Lancer extends Servant {
    constructor() {
        super("Lancer")
    }
}

export class Archer extends Servant {
    constructor() {
        super("Archer")
    }
}

export class Default extends Component {
    constructor() {
        super()
        this.element = document.createElement("p")
        this.element.innerHTML = `Please choose your servant`
        this.element.classList.add("component")
    }
}

export class NotFound extends Component {
    constructor() {
        super()
        this.element = document.createElement("p")
        this.element.innerHTML = `This Servant doesn't exist!`
        this.element.classList.add("component")
    }
}
