export const MockConfig = () => ({
    getPreferenceCookieName: jest.fn().mockReturnValue('cm-user-preferences'),
    getCookieManifest: jest.fn(),
    getDefaultConsent: jest.fn().mockReturnValue(false),
    shouldDeleteUncategorized: jest.fn().mockReturnValue(true),
    getCookieBannerId: jest.fn().mockReturnValue('cookie-banner-id'),
    getPreferencesFormId: jest.fn().mockReturnValue('cookie-preference-form')
})