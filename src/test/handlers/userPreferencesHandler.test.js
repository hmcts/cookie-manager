import {when} from "jest-when";
import UserPreferences from "../../main/handlers/userPreferencesHandler";
import Cookie from "../../main/models/cookie";
import ManifestCategory from "../../main/models/manifestCategory";
import {getmMockedCookieJar, deleteAllCookies} from "../common/common";

describe('UserPreferences', () => {
    const manifestHandler = {
        getCategoryByCookieName: jest.fn(),
        getCategories: jest.fn()
    };
    const config = {
        getPreferenceCookieName: jest.fn(),
        getCookieManifest: jest.fn(),
        getDefaultConsent: jest.fn()
    };
    const cookieHandler = {
        getAllCookies: jest.fn(),
        getCookie: jest.fn()
    };
    const mockCookieJar = getmMockedCookieJar();

    const preferenceCookieName = 'preference-cookie';
    const expiryMilliseconds = 365 * 24 * 60 * 60 * 1000;

    beforeEach(() => {
        deleteAllCookies();
    });

    describe('processPreferences', () => {

        test('Should load preferences from cookie when preference cookie is present', () => {
            const preferenceCookie = new Cookie(preferenceCookieName, { 'non-essential': true }, 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferencesFromCookie = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferenceCookie);

            userPreferences.processPreferences()
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences.loadPreferencesFromCookie).toHaveBeenCalledWith(preferenceCookie);
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });

        test('Should load preferences from defaults when preference cookie is not present', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(undefined);

            userPreferences.processPreferences()
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });
    })

    describe('getPreferences', () => {

        test('Get preferences which have been set', () => {
            const preferences = { essential: true };
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.setPreferences(preferences);
            expect(userPreferences.getPreferences()).toStrictEqual(preferences);
        });

        test('Get empty preferences when preferences havent been set', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            expect(userPreferences.getPreferences()).toStrictEqual({});
        });
    })

    test('setPreferences', () => {
        const preferences = { essential: true };
        const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

        expect(userPreferences.getPreferences()).toStrictEqual({});
        userPreferences.setPreferences(preferences);
        expect(userPreferences.getPreferences()).toStrictEqual(preferences);
    });

    test('getPreferenceCookie', () => {
        const preferences = { essential: true };
        const expectedPreferenceCookie = new Cookie(preferenceCookieName, preferences, 'internal');
        const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

        when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName)
        when(cookieHandler.getCookie).calledWith(preferenceCookieName).mockReturnValue(expectedPreferenceCookie)

        expect(userPreferences.getPreferenceCookie()).toBe(expectedPreferenceCookie);
        expect(config.getPreferenceCookieName).toHaveBeenCalled();
        expect(cookieHandler.getCookie).toHaveBeenCalledWith(preferenceCookieName);
    });

    describe('savePreferencesToCookie', () => {

        test('Save single preference to cookie', () => {
            const preferences = { essential: true };
            const expectedCookiePreferences = { essential: 'on' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).calledWith().mockReturnValue(preferences);
            when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName)

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(config.getPreferenceCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};path=/`);
            expect(document.cookie).toBe(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)}`);
        });

        test('Save multiple preferences to cookie', () => {
            const preferences = { 'non-essential': true, 'another-non-essential': false };
            const expectedCookiePreferences = { 'non-essential': 'on', 'another-non-essential': 'off' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).calledWith().mockReturnValue(preferences);
            when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName)

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(config.getPreferenceCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};path=/`);
            expect(document.cookie).toBe(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)}`);
        });
    })

    describe('loadPreferencesFromCookie', () => {

        test('Load from cookie successfully', () => {
            const categoryName = 'non-essential'
            const preferences = { [categoryName]: 'off' };

            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify(preferences), 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferenceCookie = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([new ManifestCategory(categoryName)]);

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual({'non-essential': false});
        });

        test('Handle JSON parse of cookie failure', () => {
            const preferencesCookie = new Cookie(preferenceCookieName, { 'non-essential': 'off' }, 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences.loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
        })

        test('Handle malformed cookie failure', () => {
            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify('malformedCookie'), 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences.loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
        })

        test('Handle outdated cookie failure', () => {
            const preferences = { 'non-essential': 'off' };
            const expectedPreferences = {'non-essential': false, 'second-non-essential': false};

            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify(preferences), 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences.loadPreferenceDefaults).calledWith().mockReturnValue(expectedPreferences);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([
                new ManifestCategory('non-essential'),
                new ManifestCategory('second-non-essential')
            ]);

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual(expectedPreferences);
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
        })
    })

    describe('loadPreferenceDefaults', () => {

        test('Load default preferences as off', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);
            const manifestCategoryOne = new ManifestCategory('essential', false);
            const manifestCategoryTwo = new ManifestCategory('non-essential', true);

            when(config.getDefaultConsent).calledWith().mockReturnValue(false);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences.loadPreferenceDefaults()).toStrictEqual({'non-essential': false})
            expect(config.getDefaultConsent).toHaveBeenCalled();
            expect(manifestHandler.getCategories).toHaveBeenCalled();
        })

        test('Load default preferences as on', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);
            const manifestCategoryOne = new ManifestCategory('essential', false);
            const manifestCategoryTwo = new ManifestCategory('non-essential', true);

            when(config.getDefaultConsent).calledWith().mockReturnValue(true);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences.loadPreferenceDefaults()).toStrictEqual({'non-essential': true})
            expect(config.getDefaultConsent).toHaveBeenCalled();
            expect(manifestHandler.getCategories).toHaveBeenCalled();
        })
    })
})