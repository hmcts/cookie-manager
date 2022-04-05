export default class Cookie {
    constructor (name, value) {
        this._name = name;
        this._value = value;
    }

    enable (expiry) {
        let expires = '';
        let value = this._value;
        if (expiry) {
            expires = ';expires=' + new Date(Date.now() + expiry).toUTCString();
        }

        if (typeof this._value === 'object') {
            value = JSON.stringify(value);
        }

        document.cookie = this._name + '=' + value + expires + ';path=/';
        console.debug(`Saved '${this._name}' cookie`);
    };

    disable () {
        console.debug(`Deleting cookie '${this.getName()}'`);
        document.cookie = this._name + '=;expires=' + new Date(1000).toUTCString() + ';path=/';
    };

    getName () {
        return this._name;
    };

    getValue () {
        return this._value;
    };
}
