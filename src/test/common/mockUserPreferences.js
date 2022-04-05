export const MockUserPreferences = () => ({
    processPreferences: jest.fn(),
    getPreferences: jest.fn(),
    setPreferences: jest.fn(),
    getPreferenceCookie: jest.fn(),
    savePreferencesToCookie: jest.fn(),
    loadPreferencesFromCookie: jest.fn(),
    loadPreferenceDefaults: jest.fn()
});
