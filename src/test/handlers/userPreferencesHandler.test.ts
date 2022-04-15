import { when } from 'jest-when';
import UserPreferences from '../../main/handlers/userPreferencesHandler';
import CookieHandler from '../../main/handlers/cookieHandler';
import { MockConfig } from '../common/mockConfig';
import { MockManifestHandler } from '../common/mockManifestHandler';
import { MockedCookieJar } from '../common/mockCookieJar';
import { Cookie } from '../../main/interfaces/Cookie';
import { CookieCategory } from '../../main/interfaces/CookieCategory';

describe('UserPreferences', () => {
    let mockConfig;
    let mockCookieJar;
    let mockManifestHandler;

    const expiryMilliseconds = 365 * 24 * 60 * 60 * 1000;

    beforeEach(() => {
        mockConfig = MockConfig();
        mockCookieJar = MockedCookieJar();
        mockManifestHandler = MockManifestHandler();
    });

    describe('processPreferences', () => {
        test('Should load preferences from cookie when preference cookie is present', () => {
            const preferenceCookie: Cookie = { name: mockConfig.getUserPreferencesCookieName(), value: { 'non-essential': true } };
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferencesFromCookie = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferenceCookie);

            userPreferences.processPreferences();
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences._loadPreferencesFromCookie).toHaveBeenCalledWith();
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });

        test('Should load preferences from defaults when preference cookie is not present', () => {
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

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
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            userPreferences.setPreferences(preferences);
            expect(userPreferences.getPreferences()).toStrictEqual(preferences);
        });

        test('Get empty preferences when preferences haven`t been set', () => {
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            expect(userPreferences.getPreferences()).toStrictEqual({});
        });
    });

    test('setPreferences', () => {
        const preferences = { essential: true };
        const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

        expect(userPreferences.getPreferences()).toStrictEqual({});
        userPreferences.setPreferences(preferences);
        expect(userPreferences.getPreferences()).toStrictEqual(preferences);
    });

    test('getPreferenceCookie', () => {
        const preferences = { essential: true };
        const expectedPreferenceCookie: Cookie = { name: mockConfig.getUserPreferencesCookieName(), value: preferences };
        const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

        CookieHandler.getCookie = jest.fn().mockReturnValue(expectedPreferenceCookie);

        expect(userPreferences.getPreferenceCookie()).toBe(expectedPreferenceCookie);
        expect(mockConfig.getUserPreferencesCookieName).toHaveBeenCalled();
        expect(CookieHandler.getCookie).toHaveBeenCalledWith(mockConfig.getUserPreferencesCookieName());
    });

    describe('savePreferencesToCookie', () => {
        test('Save single preference to cookie', () => {
            const preferences = { essential: true };
            const expectedCookiePreferences = { essential: 'on' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).mockReturnValue(preferences);
            when(mockConfig.getUserPreferencesCookieName).mockReturnValue(mockConfig.getUserPreferencesCookieName());

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(mockConfig.getUserPreferencesCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${mockConfig.getUserPreferencesCookieName()}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};secure;path=/;`);
        });

        test('Save multiple preferences to cookie', () => {
            const preferences = { 'non-essential': true, 'another-non-essential': false };
            const expectedCookiePreferences = { 'non-essential': 'on', 'another-non-essential': 'off' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).mockReturnValue(preferences);
            when(mockConfig.getUserPreferencesCookieName).mockReturnValue(mockConfig.getUserPreferencesCookieName());

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(mockConfig.getUserPreferencesCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${mockConfig.getUserPreferencesCookieName()}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};secure;path=/;`);
        });
    });

    describe('loadPreferencesFromCookie', () => {
        test('Load from cookie successfully', () => {
            const categoryName = 'non-essential';
            const preferences = { [categoryName]: 'off' };

            const preferencesCookie: Cookie = { name: mockConfig.getUserPreferencesCookieName(), value: JSON.stringify(preferences) };
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            userPreferences.getPreferenceCookie = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(mockManifestHandler.getCategories).calledWith().mockReturnValue([{ name: categoryName, optional: true }]);

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
        });

        test('Handle JSON parse of cookie failure', () => {
            const preferencesCookie: Cookie = { name: mockConfig.getUserPreferencesCookieName(), value: { 'non-essential': 'off' } };
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            CookieHandler.deleteCookie = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences._loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(preferencesCookie);
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
        });

        test('Handle malformed cookie failure', () => {
            const preferencesCookie: Cookie = { name: mockConfig.getUserPreferencesCookieName(), value: JSON.stringify('malformedCookie') };
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            CookieHandler.deleteCookie = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences._loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(preferencesCookie);
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
        });

        test('Handle outdated cookie failure', () => {
            const preferences = { 'non-essential': 'off' };
            const expectedPreferences = { 'non-essential': false, 'second-non-essential': false };

            const preferencesCookie: Cookie = { name: mockConfig.getUserPreferencesCookieName(), value: JSON.stringify(preferences) };
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);

            CookieHandler.deleteCookie = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences._loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences._loadPreferenceDefaults).calledWith().mockReturnValue(expectedPreferences);
            when(mockManifestHandler.getCategories).calledWith().mockReturnValue([
                { name: 'non-essential', optional: true },
                { name: 'second-non-essential', optional: true }
            ]);

            expect(userPreferences._loadPreferencesFromCookie()).toStrictEqual(expectedPreferences);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(preferencesCookie);
            expect(userPreferences._loadPreferenceDefaults).toHaveBeenCalled();
        });
    });

    describe('loadPreferenceDefaults', () => {
        test('Load default preferences as off', () => {
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);
            const manifestCategoryOne: CookieCategory = { name: 'essential', optional: false };
            const manifestCategoryTwo: CookieCategory = { name: 'non-essential', optional: true };

            when(mockConfig.getDefaultConsent).calledWith().mockReturnValue(false);
            when(mockManifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences._loadPreferenceDefaults()).toStrictEqual({ 'non-essential': false });
            expect(mockConfig.getDefaultConsent).toHaveBeenCalled();
            expect(mockManifestHandler.getCategories).toHaveBeenCalled();
        });

        test('Load default preferences as on', () => {
            const userPreferences = new UserPreferences(mockConfig, mockManifestHandler);
            const manifestCategoryOne: CookieCategory = { name: 'essential', optional: false };
            const manifestCategoryTwo: CookieCategory = { name: 'non-essential', optional: true };

            when(mockConfig.getDefaultConsent).calledWith().mockReturnValue(true);
            when(mockManifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences._loadPreferenceDefaults()).toStrictEqual({ 'non-essential': true });
            expect(mockConfig.getDefaultConsent).toHaveBeenCalled();
            expect(mockManifestHandler.getCategories).toHaveBeenCalled();
        });
    });
});
