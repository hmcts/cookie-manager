import { when } from 'jest-when';
import UserPreferences from '../../main/handlers/userPreferencesHandler';
import Cookie from '../../main/models/cookie';
import ManifestCategory from '../../main/models/manifestCategory';
import { getMockedCookieJar, deleteAllCookies } from '../common/common';
import CookieHandler from '../../main/handlers/cookieHandler';
import { MockConfig } from '../common/mockConfig';

describe('UserPreferences', () => {
    const manifestHandler = {
        getCategoryByCookieName: jest.fn(),
        getCategories: jest.fn()
    };
    const mockConfig = MockConfig();
    const mockCookieJar = getMockedCookieJar();

    const preferenceCookieName = 'preference-cookie';
    const expiryMilliseconds = 365 * 24 * 60 * 60 * 1000;

    beforeEach(() => {
        deleteAllCookies();
    });

    describe('processPreferences', () => {
        test('Should load preferences from cookie when preference cookie is present', () => {
            const preferenceCookie = new Cookie(preferenceCookieName, { 'non-essential': true });
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferencesFromCookie = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferenceCookie);

            userPreferences.processPreferences();
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences._loadPreferencesFromCookie).toHaveBeenCalledWith(preferenceCookie);
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });

        test('Should load preferences from defaults when preference cookie is not present', () => {
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(undefined);

            userPreferences.processPreferences();
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });
    });

    describe('getPreferences', () => {
        test('Get preferences which have been set', () => {
            const preferences = { essential: true };
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            userPreferences.setPreferences(preferences);
            expect(userPreferences.getPreferences()).toStrictEqual(preferences);
        });

        test('Get empty preferences when preferences havent been set', () => {
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            expect(userPreferences.getPreferences()).toStrictEqual({});
        });
    });

    test('setPreferences', () => {
        const preferences = { essential: true };
        const userPreferences = new UserPreferences(mockConfig, manifestHandler);

        expect(userPreferences.getPreferences()).toStrictEqual({});
        userPreferences.setPreferences(preferences);
        expect(userPreferences.getPreferences()).toStrictEqual(preferences);
    });

    test('getPreferenceCookie', () => {
        const preferences = { essential: true };
        const expectedPreferenceCookie = new Cookie(preferenceCookieName, preferences);
        const userPreferences = new UserPreferences(mockConfig, manifestHandler);

        CookieHandler.getCookie = jest.fn().mockReturnValue(expectedPreferenceCookie);
        when(mockConfig.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName);

        expect(userPreferences.getPreferenceCookie()).toBe(expectedPreferenceCookie);
        expect(mockConfig.getPreferenceCookieName).toHaveBeenCalled();
        expect(CookieHandler.getCookie).toHaveBeenCalledWith(preferenceCookieName);
    });

    describe('savePreferencesToCookie', () => {
        test('Save single preference to cookie', () => {
            const preferences = { essential: true };
            const expectedCookiePreferences = { essential: 'on' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).calledWith().mockReturnValue(preferences);
            when(mockConfig.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName);

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(mockConfig.getPreferenceCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};path=/`);
            expect(document.cookie).toBe(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)}`);
        });

        test('Save multiple preferences to cookie', () => {
            const preferences = { 'non-essential': true, 'another-non-essential': false };
            const expectedCookiePreferences = { 'non-essential': 'on', 'another-non-essential': 'off' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).calledWith().mockReturnValue(preferences);
            when(mockConfig.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName);

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(mockConfig.getPreferenceCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};path=/`);
            expect(document.cookie).toBe(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)}`);
        });
    });

    describe('loadPreferencesFromCookie', () => {
        test('Load from cookie successfully', () => {
            const categoryName = 'non-essential';
            const preferences = { [categoryName]: 'off' };

            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify(preferences));
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            userPreferences.getPreferenceCookie = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([new ManifestCategory(categoryName)]);

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
        });

        test('Handle JSON parse of cookie failure', () => {
            const preferencesCookie = new Cookie(preferenceCookieName, { 'non-essential': 'off' });
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences._loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
        });

        test('Handle malformed cookie failure', () => {
            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify('malformedCookie'));
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences._loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
        });

        test('Handle outdated cookie failure', () => {
            const preferences = { 'non-essential': 'off' };
            const expectedPreferences = { 'non-essential': false, 'second-non-essential': false };

            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify(preferences));
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences._loadPreferenceDefaults).calledWith().mockReturnValue(expectedPreferences);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([
                new ManifestCategory('non-essential'),
                new ManifestCategory('second-non-essential')
            ]);

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual(expectedPreferences);
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
        });
    });

    describe('loadPreferenceDefaults', () => {
        test('Load default preferences as off', () => {
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);
            const manifestCategoryOne = new ManifestCategory('essential', false);
            const manifestCategoryTwo = new ManifestCategory('non-essential', true);

            when(mockConfig.getDefaultConsent).calledWith().mockReturnValue(false);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences._loadPreferenceDefaults()).toStrictEqual({ 'non-essential': false });
            expect(mockConfig.getDefaultConsent).toHaveBeenCalled();
            expect(manifestHandler.getCategories).toHaveBeenCalled();
        });

        test('Load default preferences as on', () => {
            const userPreferences = new UserPreferences(mockConfig, manifestHandler);
            const manifestCategoryOne = new ManifestCategory('essential', false);
            const manifestCategoryTwo = new ManifestCategory('non-essential', true);

            when(mockConfig.getDefaultConsent).calledWith().mockReturnValue(true);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences._loadPreferenceDefaults()).toStrictEqual({ 'non-essential': true });
            expect(mockConfig.getDefaultConsent).toHaveBeenCalled();
            expect(manifestHandler.getCategories).toHaveBeenCalled();
        });
    });
});
