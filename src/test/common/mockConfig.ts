const testConfig = {
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
};

export const MockConfig = () => ({
    getUserPreferencesCookieName: jest.fn().mockReturnValue(testConfig.userPreferences.cookieName),
    getUserPreferencesCookieExpiry: jest.fn().mockReturnValue(testConfig.userPreferences.cookieExpiry),
    getUserPreferencesCookieSecure: jest.fn().mockReturnValue(testConfig.userPreferences.cookieSecure),

    getPreferencesFormConfiguration: jest.fn().mockReturnValue(testConfig.preferencesForm),

    getCookieBannerConfiguration: jest.fn().mockReturnValue(testConfig.cookieBanner),

    getCookieManifest: jest.fn().mockReturnValue(testConfig.cookieManifest),

    getDefaultConsent: jest.fn().mockReturnValue(testConfig.additionalOptions.defaultConsent),
    shouldDeleteUncategorized: jest.fn().mockReturnValue(testConfig.additionalOptions.deleteUndefinedCookies)
});
