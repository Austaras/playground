import { Archer, Lancer, Saber } from "./component"
import { Router } from "./router"

const config: RouterConfig = {
    routes: [
        { path: "Saber", content: Saber },
        { path: "Lancer", content: Lancer },
        { path: "Archer", content: Archer }
    ]
}

const router = new Router(config)
