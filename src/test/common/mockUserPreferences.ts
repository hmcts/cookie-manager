import { vi } from 'vitest';

export const MockUserPreferences = () => ({
    processPreferences: vi.fn(),
    getPreferences: vi.fn(),
    setPreferences: vi.fn(),
    getPreferenceCookie: vi.fn(),
    savePreferencesToCookie: vi.fn(),
    loadPreferencesFromCookie: vi.fn(),
    loadPreferenceDefaults: vi.fn()
});
