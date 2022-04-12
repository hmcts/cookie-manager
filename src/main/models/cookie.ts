export default class Cookie {
    // eslint-disable-next-line no-useless-constructor
    constructor (
        private readonly name: string,
        private readonly value: any
    ) {}

    enable (expiry?) {
        let expires = '';
        let value = this.value;
        if (expiry) {
            expires = ';expires=' + new Date(Date.now() + expiry).toUTCString();
        }

        if (typeof this.value === 'object') {
            value = JSON.stringify(value);
        }

        document.cookie = this.name + '=' + value + expires + ';path=/';
        console.debug(`Saved '${this.name}' cookie`);
    };

    disable () {
        console.debug(`Deleting cookie '${this.getName()}'`);
        document.cookie = this.name + '=;expires=' + new Date(1000).toUTCString() + ';path=/';
    };

    getName () {
        return this.name;
    };

    getValue () {
        return this.value;
    };
}
