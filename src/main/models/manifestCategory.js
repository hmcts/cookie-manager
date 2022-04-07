export default class ManifestCategory {
    constructor (name, cookies = [], optional = true, matchBy = 'startsWith') {
        this._name = name;
        this._cookies = cookies;
        this._optional = optional;
        this._matchBy = matchBy;
    }

    getName () {
        return this._name;
    };

    getCookies () {
        return this._cookies;
    }

    getMatchBy () {
        return this._matchBy;
    }

    isOptional () {
        return this._optional;
    };
}
