export default class Cookie {
    constructor (
        private readonly name: string,
        private readonly value: any
    ) {}

    getName () {
        return this.name;
    };

    getValue () {
        return this.value;
    };
}
