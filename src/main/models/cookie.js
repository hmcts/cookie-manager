export default function Cookie (name, value, category = 'un-categorized') {
    this._name = name;
    this._value = value;
    this._category = category;
}

Cookie.prototype.enable = function(expiry) {
    let expires = '';
    let value = this._value;
    if (expiry) {
        expires = ';expires='+ new Date(Date.now() + expiry).toUTCString();
    }

    if(typeof this._value === 'object') {
        value = JSON.stringify(value);
    }

    document.cookie = this._name + '=' + value + expires + ';path=/';
    console.debug(`Saved '${this._name}' cookie`);
};

Cookie.prototype.disable = function () {
    console.debug(`Deleting cookie '${this.getName()}'`);
    document.cookie = this._name + '=;expires=' + new Date(1000).toUTCString() + ';path=/';
};

Cookie.prototype.getName = function() {
    return this._name;
};

Cookie.prototype.getValue = function() {
    return this._value;
};

Cookie.prototype.getCategory = function() {
    return this._category;
};