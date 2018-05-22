export class Router {
    private routes: Array<route>

    constructor(init: RouterConfig) {
        this.routes = init.routes
        this.preProcess()
        this.handelPopState()
        if (location.pathname !== "/") {
            const current = "/" + this.match(location.pathname).path
            history.replaceState({ current }, undefined, location.pathname)
        }
    }

    private match(pathStr: string) {
        const path = pathStr.split("/").filter(i => i !== "")
        let res = this.routes[0]
        for (const name of path) {
            res = this.routes.filter(i => i.path === name)[0]
        }
        return res
    }

    private preProcess() {
        const links = Array.from(document.querySelectorAll("a"))
        links.forEach(item => {
            const to = item.getAttribute("route-to")
            if (!to) return // is a normal <a> tag
            // make my <a> tags look like normal a tags
            item.removeAttribute("route-to")
            item.href = to
            item.onclick = e => {
                console.log(to)
                e.preventDefault()
                history.pushState({ current: to }, undefined, to)
            }
        })
    }

    private handelPopState() {
        window.addEventListener("popstate", e => {
            console.log(e.state)
        })
    }
}