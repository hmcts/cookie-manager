export default function ManifestCategory (name, optional = true) {
    this._name = name;
    this._optional = optional;
}

ManifestCategory.prototype.getName = function() {
    return this._name;
};

ManifestCategory.prototype.isOptional = function() {
    return this._optional;
};