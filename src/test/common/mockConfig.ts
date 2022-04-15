export const defaultConfig = {
    userPreferences: {
        cookieName: 'cookie-preferences',
        cookieExpiry: 365,
        cookieSecure: true
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
        disableCookieBanner: false,
        disableCookiePreferencesForm: false,
        deleteUndefinedCookies: true,
        defaultConsent: false
    }
};

export const MockConfig = () => ({
    getUserPreferencesCookieName: jest.fn().mockReturnValue(defaultConfig.userPreferences.cookieName),
    getUserPreferencesCookieExpiry: jest.fn().mockReturnValue(defaultConfig.userPreferences.cookieExpiry),
    getUserPreferencesCookieSecure: jest.fn().mockReturnValue(defaultConfig.userPreferences.cookieSecure),
    getPreferencesFormConfiguration: jest.fn().mockReturnValue(defaultConfig.preferencesForm),
    getCookieBannerConfiguration: jest.fn().mockReturnValue(defaultConfig.cookieBanner),
    getCookieManifest: jest.fn().mockReturnValue(defaultConfig.cookieManifest),
    getDefaultConsent: jest.fn().mockReturnValue(defaultConfig.additionalOptions.defaultConsent),
    shouldDeleteUncategorized: jest.fn().mockReturnValue(defaultConfig.additionalOptions.deleteUndefinedCookies)
});
