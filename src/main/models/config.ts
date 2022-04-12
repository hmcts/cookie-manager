export default class Config {
    static DEFAULTS = {
        PREFERENCE_COOKIE_NAME: 'cm-user-preferences',
        PREFERENCE_COOKIE_EXPIRY: 365,
        CONSENT: false,
        DELETE_UNCATEGORIZED: true,
        PREFERENCES_FORM_CLASS: 'cookie-preferences-form',

        COOKIE_BANNER_CONFIG: {
            class: 'cookie-banner',
            actions: [
                {
                    name: 'accept',
                    buttonClass: 'cookie-banner-accept-button',
                    confirmationClass: 'cookie-banner-accept-message',
                    consent: true
                },
                {
                    name: 'reject',
                    buttonClass: 'cookie-banner-reject-button',
                    confirmationClass: 'cookie-banner-reject-message',
                    consent: false
                },
                {
                    name: 'hide',
                    buttonClass: 'cookie-banner-hide-button'
                }
            ]
        }
    }

    // eslint-disable-next-line no-useless-constructor
    constructor (
        private readonly config: any
    ) {}

    getPreferenceCookieName () {
        return this.config.userPreferences?.cookieName ?? Config.DEFAULTS.PREFERENCE_COOKIE_NAME;
    }

    getPreferenceCookieExpiryDays () {
        return this.config.userPreferences?.cookieExpiry ?? Config.DEFAULTS.PREFERENCE_COOKIE_EXPIRY;
    }

    getCookieManifest () {
        return this.config.cookieManifest ?? [];
    }

    getDefaultConsent () {
        return this.config.userPreferences?.defaultConsent ?? Config.DEFAULTS.CONSENT;
    }

    shouldDeleteUncategorized () {
        return this.config.deleteUndefinedCookies ?? Config.DEFAULTS.DELETE_UNCATEGORIZED;
    }

    getCookieBannerConfiguration () {
        return this.config.cookieBanner ?? Config.DEFAULTS.COOKIE_BANNER_CONFIG;
    }

    getPreferencesFormClass () {
        return this.config.preferencesForm?.class ?? Config.DEFAULTS.PREFERENCES_FORM_CLASS;
    }
}
