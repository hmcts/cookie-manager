export default class Cookie {
    constructor (
        private readonly name: string,
        private readonly value: any
    ) {}

    enable (expiry?: number, isSecure?: boolean) {
        let expires = '';
        let secure = '';
        let value = this.value;
        if (expiry) {
            expires = ';expires=' + new Date(Date.now() + expiry).toUTCString();
        }

        if (isSecure) {
            secure = ';secure';
        }

        if (typeof this.value === 'object') {
            value = JSON.stringify(value);
        }

        document.cookie = this.name + '=' + value + expires + secure + ';path=/';
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
