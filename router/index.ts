import { Router } from "./router"
import { Saber, Lancer, Archer } from "./component"
import { RouterConfig } from "./routerConfig"

const saber = new Saber()
const lancer = new Lancer()
const archer = new Archer()

const config: RouterConfig = {
    routes: [
        { path: "Saber", content: saber },
        { path: "Lancer", content: lancer },
        { path: "Archer", content: archer }
    ]
}

const router = new Router(config)