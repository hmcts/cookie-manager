import { when } from 'jest-when';
import CookieHandler from '../../main/handlers/cookieHandler';
import { deleteAllCookies } from '../common/common';
import ManifestCategory from '../../main/models/manifestCategory';
import { MockConfig } from '../common/mockConfig';
import { MockUserPreferences } from '../common/mockUserPreferences';
import ManifestHandler from '../../main/handlers/manifestHandler';
import { MockManifestHandler } from '../common/mockManifestHandler';
import { MockedCookieJar } from '../common/mockCookieJar';
import { Cookie } from '../../main/interfaces/Cookie';

describe('CookieHandler', () => {
    let mockCookieJar;
    let mockConfig;
    let mockUserPreferences;
    let mockManifestHandler;

    const cookieOne: Cookie = { name: 'essential-cookie', value: 'cookie-value' };
    const cookieTwo: Cookie = { name: 'first-non-essential-cookie', value: 'cookie-value' };
    const cookieThree: Cookie = { name: 'third-non-essential-cookie', value: 'cookie-value' };
    const cookieFour: Cookie = { name: 'fourth-non-essential-cookie', value: 'cookie-value' };

    const essentialCategory = new ManifestCategory('essential', [cookieOne.name], false);
    const nonEssentialCategory = new ManifestCategory('non-essential', [cookieTwo.name, cookieThree.name]);
    const SecondNonEssentialCategory = new ManifestCategory('another-non-essential', [cookieFour.name]);

    beforeEach(() => {
        deleteAllCookies();
        mockCookieJar = MockedCookieJar();
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
        mockManifestHandler = MockManifestHandler();
    });

    describe('getAllCookies', () => {
        beforeEach(() => {
            deleteAllCookies();
        });

        test('Get single cookie', () => {
            document.cookie = `${cookieOne.name}=${cookieOne.value};path=/`;

            expect(CookieHandler.getAllCookies()).toStrictEqual([cookieOne]);
        });

        test('Get multiple cookies', () => {
            const expectedCookies = [cookieOne, cookieTwo, cookieThree];
            let expectedDocumentCookies = `${cookieOne.name}=${cookieOne.value}; `;
            expectedDocumentCookies += `${cookieTwo.name}=${cookieTwo.value}; `;
            expectedDocumentCookies += `${cookieThree.name}=${cookieThree.value}`;

            document.cookie = `${cookieOne.name}=${cookieOne.value};path=/`;
            document.cookie = `${cookieTwo.name}=${cookieTwo.value};path=/`;
            document.cookie = `${cookieThree.name}=${cookieThree.value};path=/`;
            document.cookie = `${cookieOne.name}=${cookieOne.value};path=/`;

            expect(document.cookie).toBe(expectedDocumentCookies);

            expect(CookieHandler.getAllCookies()).toStrictEqual(expectedCookies);
        });
    });

    describe('getCookie', () => {
        test('Get cookie when there is a single cookie', () => {
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne]);

            expect(CookieHandler.getCookie(cookieOne.name)).toBe(cookieOne);
            spy.mockRestore();
        });

        test('Get cookie when there is a multiple cookies', () => {
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne, cookieTwo, cookieThree]);

            expect(CookieHandler.getCookie(cookieTwo.name)).toBe(cookieTwo);
            spy.mockRestore();
        });
    });

    describe('deleteCookie', () => {
        const cookieName = 'test-cookie';
        const cookieValue = 'test-value';
        const cookiePath = 'path=/';
        const cookieClearDate = new Date(-1).toUTCString();

        test('Should delete cookie on current domain', () => {
            const cookie = { name: cookieName, value: cookieValue };
            document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);

            mockCookieJar.set.mockClear();

            CookieHandler.deleteCookie(cookie);
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=;expires=${cookieClearDate};domain=localhost;${cookiePath};`);
            expect(document.cookie).toBe('');
        });

        test('Should delete cookie on dot domain', () => {
            const cookie = { name: cookieName, value: cookieValue };
            document.cookie = `${cookieName}=${cookieValue};${cookiePath};domain=.localhost;`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);

            mockCookieJar.set.mockClear();

            CookieHandler.deleteCookie(cookie);
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=;expires=${cookieClearDate};domain=.localhost;${cookiePath};`);
            expect(document.cookie).toBe('');
        });
    });

    describe('saveCookie', () => {
        const cookieName = 'test-cookie';
        const cookieValue = 'test-value';
        const cookiePath = 'path=/;';

        test('When cookie does not exist in browser, enabling cookie creates cookie', () => {
            expect(document.cookie).toBe('');

            const cookie = { name: cookieName, value: cookieValue };
            CookieHandler.saveCookie(cookie);

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
        });

        test('When cookie already exists in browser, overwrite existing cookie', () => {
            document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
            const newCookieValue = 'new-test-value';

            const cookie = { name: cookieName, value: newCookieValue };
            CookieHandler.saveCookie(cookie);

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${newCookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${newCookieValue}`);
        });

        test('Cookie with primitive for value is created correctly', () => {
            const cookie = { name: cookieName, value: cookieValue };
            CookieHandler.saveCookie(cookie);

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
        });

        test('Cookie with JSON object for value is created correctly', () => {
            const cookieJSONValue = { testObject: false };
            const expectedCookieValue = JSON.stringify(cookieJSONValue);

            const cookie = { name: cookieName, value: cookieJSONValue };
            CookieHandler.saveCookie(cookie);

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${expectedCookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${expectedCookieValue}`);
        });

        test('Cookie with expiry parameter is created correctly', () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);

            const cookie = { name: cookieName, value: cookieValue };
            CookieHandler.saveCookie(cookie, 7);

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};expires=${date.toUTCString()};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
        });

        test('Cookie with secure parameter is created correctly', () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);

            const cookie = { name: cookieName, value: cookieValue };
            CookieHandler.saveCookie(cookie, 7, true);

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};expires=${date.toUTCString()};secure;${cookiePath}`);
        });
    });

    describe('processCookies', () => {
        test('_processUnCategorizedCookies should not be called if delete uncategorized cookies is false', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockConfig.shouldDeleteUncategorized).mockReturnValue(false);
            cookieHandler._processUnCategorizedCookies = jest.fn();
            cookieHandler._processNonConsentedCookies = jest.fn();
            cookieHandler.processCookies();

            expect(cookieHandler._processUnCategorizedCookies).not.toHaveBeenCalled();
            expect(cookieHandler._processNonConsentedCookies).toHaveBeenCalled();
        });

        test('_processUnCategorizedCookies should be called if delete uncategorized cookies is true', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockConfig.shouldDeleteUncategorized).mockReturnValue(true);
            cookieHandler._processUnCategorizedCookies = jest.fn();
            cookieHandler._processNonConsentedCookies = jest.fn();
            cookieHandler.processCookies();

            expect(cookieHandler._processUnCategorizedCookies).toHaveBeenCalled();
            expect(cookieHandler._processNonConsentedCookies).toHaveBeenCalled();
        });

        test('_processNonConsentedCookies should be called', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            cookieHandler._processUnCategorizedCookies = jest.fn();
            cookieHandler._processNonConsentedCookies = jest.fn();
            cookieHandler.processCookies();

            expect(cookieHandler._processNonConsentedCookies).toHaveBeenCalled();
        });
    });

    describe('processNonConsentedCookies', () => {
        test('Process cookies with all consent set to false', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: false,
                [SecondNonEssentialCategory.getName()]: false
            });
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.name).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieTwo.name).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieFour.name).mockReturnValue(SecondNonEssentialCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieFour]);
            CookieHandler.deleteCookie = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(CookieHandler.deleteCookie).not.toHaveBeenCalledWith(cookieOne);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(cookieTwo);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(cookieFour);
        });

        test('Process cookies with all consent set to true', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: true,
                [SecondNonEssentialCategory.getName()]: true
            });
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.name).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieTwo.name).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieFour.name).mockReturnValue(SecondNonEssentialCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieFour]);
            CookieHandler.deleteCookie = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(CookieHandler.deleteCookie).not.toHaveBeenCalled();
        });

        test('Process cookies with user preferences set', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: false,
                [SecondNonEssentialCategory.getName()]: true
            });
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.name).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieTwo.name).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieThree.name).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieFour.name).mockReturnValue(SecondNonEssentialCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieThree, cookieFour]);
            CookieHandler.deleteCookie = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(CookieHandler.deleteCookie).not.toHaveBeenCalledWith(cookieOne);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(cookieTwo);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(cookieThree);
            expect(CookieHandler.deleteCookie).not.toHaveBeenCalledWith(cookieFour);
        });
    });

    describe('processUnCategorizedCookies', () => {
        test('Single uncategorized cookie should be deleted', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);
            const unCategorizedCookie: Cookie = { name: 'random-cookie', value: 'value' };
            const unCategorizedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);

            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.name).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookie.name).mockReturnValue(unCategorizedCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, unCategorizedCookie]);
            CookieHandler.deleteCookie = jest.fn();

            cookieHandler._processUnCategorizedCookies();
            expect(mockManifestHandler.getCategoryByCookieName).toHaveBeenCalledTimes(2);
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(CookieHandler.deleteCookie).not.toHaveBeenCalledWith(cookieOne);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(unCategorizedCookie);
        });

        test('Multiple uncategorized cookies should be deleted', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);
            const unCategorizedCookie: Cookie = { name: 'random-cookie', value: 'value' };
            const unCategorizedCookieTwo: Cookie = { name: 'random-cookie-two', value: 'value' };
            const manifestCategory = new ManifestCategory('non-essential', ['categorized-cookie']);
            const unCategorizedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);

            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.name).mockReturnValue(manifestCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookie.name).mockReturnValue(unCategorizedCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookieTwo.name).mockReturnValue(unCategorizedCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, unCategorizedCookie, unCategorizedCookieTwo]);
            CookieHandler.deleteCookie = jest.fn();

            cookieHandler._processUnCategorizedCookies();
            expect(mockManifestHandler.getCategoryByCookieName).toHaveBeenCalledTimes(3);
            expect(CookieHandler.deleteCookie).not.toHaveBeenCalledWith(cookieOne);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(unCategorizedCookie);
            expect(CookieHandler.deleteCookie).toHaveBeenCalledWith(unCategorizedCookieTwo);
        });
    });
});
