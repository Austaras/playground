import { Component } from './component'
import { BasicService } from './service'
import { mount, unmount } from './utils'

const services: Services = { basic: new BasicService() } // Init services

const component = mount(Component, services) // Init components

services.basic.sub(() => console.log('%csubscribing by index', 'color: aqua'))

services.basic.pub() // serive publish message
unmount(component, services)
services.basic.pub()
