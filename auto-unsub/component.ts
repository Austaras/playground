import { Inject } from "./utils"
import { BasicService } from "./service"

@Inject // Typescript will save meatadat
export class Component {
    public a = 'a'
    constructor(private ser: BasicService) {
        this.ser.sub(() => {
            console.log("subscribing by", this.constructor.name)
        })
    }

}