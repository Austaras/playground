import { Component } from "./component"
import { BasicService } from "./service"
import { init } from "./utils";

const services: Services = { 'basic': new BasicService() } // Init services

const component = init(Component, services)//new Component(services.ser) // Init components

function umount(comp: Warpped) {
    if (comp.watch){
        for (const [key, val] of Object.entries(comp.watch)) {
            val.forEach((f: Function) => {
                services[key].unsub(f)
            })
        }
    }

    comp = {}
}

services.basic.pub()  // serive publish message
umount(component)  // component unmounted
services.basic.sub(() => console.log("subscribing by index"))
services.basic.pub()