import Config from '../../main/models/config';

export const MockConfig = () => ({
    getPreferenceCookieName: jest.fn().mockReturnValue(Config.DEFAULTS.PREFERENCE_COOKIE_NAME),
    getCookieManifest: jest.fn(),
    getDefaultConsent: jest.fn().mockReturnValue(Config.DEFAULTS.CONSENT),
    shouldDeleteUncategorized: jest.fn().mockReturnValue(Config.DEFAULTS.DELETE_UNCATEGORIZED),
    getCookieBannerConfiguration: jest.fn().mockReturnValue(Config.DEFAULTS.COOKIE_BANNER_CONFIG),
    getPreferencesFormClass: jest.fn().mockReturnValue('cookie-preferences-form'),
    getPreferenceCookieExpiryDays: jest.fn().mockReturnValue(Config.DEFAULTS.PREFERENCE_COOKIE_EXPIRY)
});
