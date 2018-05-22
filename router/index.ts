import { Router } from "./router"
const view = document.getElementById("view")
const config: RouterConfig = {
    routes: [
        { path: "Foo", content: "Foo" },
        { path: "Bar", content: "Bar" },
        { path: "Baz", content: "Baz" }
    ]
}

const router = new Router(config)




