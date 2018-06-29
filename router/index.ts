import { Archer, Default, Lancer, NotFound, Saber } from "./component"
import { Router } from "./router"

import { RouterConfig } from "./routerConfig"

const config: RouterConfig = {
    routes: [
        { path: "", content: Default },
        { path: "Saber", content: Saber },
        { path: "Lancer", content: Lancer },
        { path: "Archer", content: Archer },
        { path: "notfound", content: NotFound },
        { path: "**", redirect: "notfound" }
    ]
}

const router = new Router(config)

const test = document.getElementById("test") as HTMLButtonElement
test.onclick = () => router.to("Saber")
