import { Route, RouterConfig } from "./routerConfig"

export class Router {
    private routes: { [path: string]: Route } = {}
    private view: Element

    constructor(init: RouterConfig) {
        init.routes.forEach(route => this.routes[route.path] = route)
        this.procHtml()
        this.handelPopState()
        if (location.pathname !== "/") {
            const current = "/" + this.match(location.pathname).path
            this.setView(this.match(location.pathname).content.element)
            history.replaceState({ current }, undefined, location.pathname)
        }
    }

    private match(pathStr: string) {
        const path = pathStr.split("/").filter(i => i !== "")
        let res = this.routes[0]
        for (const name of path) {
            res = this.routes[name]
        }
        return res
    }

    private procHtml() {
        const links = Array.from(document.querySelectorAll("a"))
        links.forEach(item => {
            const to = item.getAttribute("route-to")
            if (!to) return // is a normal <a> tag
            // make my <a> tags look like normal a tags
            item.removeAttribute("route-to")
            item.href = to
            item.onclick = e => {
                e.preventDefault()
                this.setView(this.match(to).content.element)
                history.pushState({ current: to }, undefined, to)
            }
        })
        const view = document.querySelector("router-view")
        if (view) { 
            this.view = view 
            this.setView(document.createElement("div")) // make template a legal html
        }
    }

    private handelPopState() {
        window.addEventListener("popstate", e => {
            console.log(e.state)
        })
    }

    private setView(ele: Element) {
        const parent = this.view.parentElement
        if (parent) {
            parent.replaceChild(ele, this.view)
            this.view = ele
        }
    }

    public to() {

    }

    public setData() {

    }

    public back(step: number) {
        history.back(step)
    }

    public forward(step: number) {
        history.forward(step)
    }
}