export default class ManifestCategory {
    constructor (name, optional = true) {
        this._name = name;
        this._optional = optional;
    }

    getName () {
        return this._name;
    };

    isOptional () {
        return this._optional;
    };
}
