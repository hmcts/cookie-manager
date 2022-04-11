export default class Config {
    static DEFAULTS = {
        PREFERENCE_COOKIE_NAME: 'cm-user-preferences',
        PREFERENCE_COOKIE_EXPIRY: 365,
        CONSENT: false,
        DELETE_UNCATEGORIZED: true,
        COOKIE_BANNER_CLASS: 'cookie-banner',
        PREFERENCES_FORM_CLASS: 'cookie-preferences-form',

        COOKIE_BANNER_CONFIG: {
            class: 'cookie-banner',
            actions: [
                {
                    name: 'accept',
                    buttonClass: 'cookie-banner-accept-button',
                    confirmationClass: 'cookie-banner-accept-message',
                    consentCategories: true
                },
                {
                    name: 'reject',
                    buttonClass: 'cookie-banner-reject-button',
                    confirmationClass: 'cookie-banner-reject-message',
                    consentCategories: false
                },
                {
                    name: 'hide',
                    buttonClass: 'cookie-banner-hide-button'
                }
            ]
        }
    }

    constructor (config) {
        this._config = config;
    }

    getPreferenceCookieName () {
        return this._config.userPreferences?.cookieName ?? Config.DEFAULTS.PREFERENCE_COOKIE_NAME;
    }

    getPreferenceCookieExpiryDays () {
        return this._config.userPreferences?.cookieExpiry ?? Config.DEFAULTS.PREFERENCE_COOKIE_EXPIRY;
    }

    getCookieManifest () {
        return this._config.cookieManifest ?? [];
    }

    getDefaultConsent () {
        return this._config.userPreferences?.defaultConsent ?? Config.DEFAULTS.CONSENT;
    }

    shouldDeleteUncategorized () {
        return this._config.deleteUndefinedCookies ?? Config.DEFAULTS.DELETE_UNCATEGORIZED;
    }

    getCookieBannerConfiguration () {
        return this._config.cookieBanner ?? Config.DEFAULTS.COOKIE_BANNER_CONFIG;
    }

    getPreferencesFormClass () {
        return this._config.preferencesForm?.class ?? Config.DEFAULTS.PREFERENCES_FORM_CLASS;
    }
}
