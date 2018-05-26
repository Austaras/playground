export class Component {
    public element: Element
    constructor(private name: string) {
        this.element = document.createElement("b")
        this.element.innerHTML = this.name
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

export class Undefined extends Component {
    constructor() {
        super("undefined")
    }
}
