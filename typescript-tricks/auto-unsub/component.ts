import { BasicService } from './service'
import { Inject } from './utils'

@Inject // Typescript will save meatadata
export class Component {
    public a = 'a'
    constructor(private ser: BasicService) {
        this.ser.sub(() => {
            console.log('subscribing by', this.constructor.name)
        })
    }

}
