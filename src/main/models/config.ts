import { CookieManagerConfig } from '../interfaces/Config';

export default class Config {
    private readonly defaultConfig = {
        userPreferences: {
            cookieName: 'cookie-preferences',
            cookieExpiry: 365,
            cookieSecure: false
        },
        preferencesForm: {
            class: 'cookie-preferences-form'
        },
        cookieBanner: {
            class: 'cookie-banner',
            showWithPreferencesForm: false,
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
        },
        cookieManifest: [],
        additionalOptions: {
            deleteUndefinedCookies: true,
            defaultConsent: false
        }
    }

    private activeConfig: CookieManagerConfig = {};

    constructor (config: Partial<CookieManagerConfig>) {
        if (config) {
            this.activeConfig.userPreferences = { ...this.defaultConfig.userPreferences, ...config.userPreferences };
            this.activeConfig.preferencesForm = config.preferencesForm ?? this.defaultConfig.preferencesForm;
            this.activeConfig.cookieBanner = { ...this.defaultConfig.cookieBanner, ...config.cookieBanner };
            this.activeConfig.cookieManifest = config.cookieManifest ?? this.defaultConfig.cookieManifest;
            this.activeConfig.additionalOptions = { ...this.defaultConfig.additionalOptions, ...config.additionalOptions };
        } else {
            this.activeConfig = this.defaultConfig;
        }
    }

    /* UserPreferences */
    getUserPreferencesCookieName () {
        return this.activeConfig.userPreferences.cookieName;
    }

    getUserPreferencesCookieExpiry () {
        return this.activeConfig.userPreferences.cookieExpiry;
    }

    getUserPreferencesCookieSecure () {
        return this.activeConfig.userPreferences.cookieSecure;
    }

    /* PreferencesForm */
    getPreferencesFormConfiguration () {
        return this.activeConfig.preferencesForm;
    }

    /* CookieBanner */
    getCookieBannerConfiguration () {
        return this.activeConfig.cookieBanner;
    }

    /* CookieManifest */
    getCookieManifest () {
        return this.activeConfig.cookieManifest;
    }

    /* AdditionalOptions */
    getDefaultConsent () {
        return this.activeConfig.additionalOptions.defaultConsent;
    }

    shouldDeleteUncategorized () {
        return this.activeConfig.additionalOptions.deleteUndefinedCookies;
    }
}
