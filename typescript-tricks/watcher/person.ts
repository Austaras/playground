export class Person {
    public money = 100
    public house = {
        door: 'Hodor',
        window: {
            height: 100,
            width: 50
        },
        furnitures: ['table', 'chair']
    }
    public children: number[] = []
    public car: { name: string, value: number, wheel: number[] }[] = []
    public superAbility?: string
}
