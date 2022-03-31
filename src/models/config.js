export default function Config (configObject) {
    this._config = configObject;
}

Config.prototype.getPreferenceCookieName = function () {
    return this._config['user-preference-cookie-name'];
}

Config.prototype.getCookieManifest = function () {
    return this._config['cookie-manifest'];
}

Config.prototype.getDefaultConsent = function () {
    return this._config['default-consent-value'] ?? false;
}

Config.prototype.shouldDeleteUncategorized = function () {
    return this._config['delete-undefined-cookies'] ?? true;
}