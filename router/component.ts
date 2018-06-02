export class Component {
    public element: Element
    constructor(name: string) {
        this.element = document.createElement("p")
        this.element.innerHTML = `You are currently choosing Servant <b>${name}</b>`
        this.element.classList.add("component")
    }
}

export class Saber extends Component {
    constructor() {
        super("Saber")
    }
}

export class Lancer extends Component {
    constructor() {
        super("Lancer")
    }
}

export class Archer extends Component {
    constructor() {
        super("Archer")
    }
}

export class Defalut {
    public element: Element
    constructor() {
        this.element = document.createElement("p")
        this.element.innerHTML = `Please choose your servant`
        this.element.classList.add("component")
    }
}

export class NotFound {
    public element: Element
    constructor() {
        this.element = document.createElement("p")
        this.element.innerHTML = `This Servant doesn't exist!`
        this.element.classList.add("component")
    }
}
