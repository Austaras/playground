import { Component } from "./component"
import { BasicService } from "./service"
import { mount, unmount } from "./utils";

const services: Services = { basic: new BasicService() } // Init services

const component = mount(Component, services) // Init components

services.basic.pub() // serive publish message
unmount(component, services)
services.basic.sub(() => console.log("subscribing by index"))
services.basic.pub()
