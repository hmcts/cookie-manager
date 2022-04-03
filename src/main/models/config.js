
const DEFAULT_PREFERENCE_COOKIE_NAME = 'cm-user-preferences'
const DEFAULT_CONSENT                = false;
const DEFAULT_COOKIE_BANNER_ID       = 'cm-cookie-banner';
const DEFAULT_PREFERENCES_FORM_ID    = "cm-preference-form"

export default function Config (configObject) {
    this._config = configObject;
}

Config.prototype.getPreferenceCookieName = function () {
    return this._config['user-preference-cookie-name'] ?? DEFAULT_PREFERENCE_COOKIE_NAME;
}

Config.prototype.getCookieManifest = function () {
    return this._config['cookie-manifest'];
}

Config.prototype.getDefaultConsent = function () {
    return this._config['default-consent-value'] ?? DEFAULT_CONSENT;
}

Config.prototype.shouldDeleteUncategorized = function () {
    return this._config['delete-undefined-cookies'] ?? true;
}

Config.prototype.getCookieBannerId = function () {
    return this._config['cookie-banner-id'] ?? DEFAULT_COOKIE_BANNER_ID;
}

Config.prototype.getPreferencesFormId = function () {
    return this._config['preference-form-id'] ?? DEFAULT_PREFERENCES_FORM_ID;
}