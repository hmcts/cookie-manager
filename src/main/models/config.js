export default class Config {
    static DEFAULTS = {
        PREFERENCE_COOKIE_NAME: 'cm-user-preferences',
        PREFERENCE_COOKIE_EXPIRY: 365,
        CONSENT: false,
        DELETE_UNCATEGORIZED: true,
        COOKIE_BANNER_ID: 'cm-cookie-banner',
        PREFERENCES_FORM_ID: 'cm-preference-form'
    }

    constructor (config) {
        this._config = config;
    }

    getPreferenceCookieName () {
        return this._config['user-preference-cookie-name'] ?? Config.DEFAULTS.PREFERENCE_COOKIE_NAME;
    }

    getCookieManifest () {
        return this._config['cookie-manifest'];
    }

    getDefaultConsent () {
        return this._config['default-consent-value'] ?? Config.DEFAULTS.CONSENT;
    }

    shouldDeleteUncategorized () {
        return this._config['delete-undefined-cookies'] ?? Config.DEFAULTS.DELETE_UNCATEGORIZED;
    }

    getCookieBannerId () {
        return this._config['cookie-banner-id'] ?? Config.DEFAULTS.COOKIE_BANNER_ID;
    }

    getPreferencesFormId () {
        return this._config['preference-form-id'] ?? Config.DEFAULTS.PREFERENCES_FORM_ID;
    }

    getPreferenceCookieExpiryDays () {
        return this._config['user-preference-cookie-expiry-days'] ?? Config.DEFAULTS.PREFERENCE_COOKIE_EXPIRY;
    }
}
