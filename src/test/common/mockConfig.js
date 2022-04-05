import Config from '../../main/models/config';

export const MockConfig = () => ({
    getPreferenceCookieName: jest.fn().mockReturnValue(Config.DEFAULTS.PREFERENCE_COOKIE_NAME),
    getCookieManifest: jest.fn(),
    getDefaultConsent: jest.fn().mockReturnValue(Config.DEFAULTS.CONSENT),
    shouldDeleteUncategorized: jest.fn().mockReturnValue(Config.DEFAULTS.DELETE_UNCATEGORIZED),
    getCookieBannerId: jest.fn().mockReturnValue('cookie-banner-id'),
    getPreferencesFormId: jest.fn().mockReturnValue('cookie-preference-form'),
    getPreferenceCookieExpiryDays: jest.fn().mockReturnValue(Config.DEFAULTS.PREFERENCE_COOKIE_EXPIRY)
});
