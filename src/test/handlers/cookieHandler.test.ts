import { when } from 'jest-when';
import CookieHandler from '../../main/handlers/cookieHandler';
import { deleteAllCookies } from '../common/common';
import ManifestCategory from '../../main/models/manifestCategory';
import Cookie from '../../main/models/cookie';
import { MockConfig } from '../common/mockConfig';
import { MockUserPreferences } from '../common/mockUserPreferences';
import ManifestHandler from '../../main/handlers/manifestHandler';
import { MockManifestHandler } from '../common/mockManifestHandler';

describe('CookieHandler', () => {
    let mockConfig;
    let mockUserPreferences;
    let mockManifestHandler;

    const cookieOne = new Cookie('essential-cookie', 'cookie-value');
    const cookieTwo = new Cookie('first-non-essential-cookie', 'cookie-value');
    const cookieThree = new Cookie('third-non-essential-cookie', 'cookie-value');
    const cookieFour = new Cookie('fourth-non-essential-cookie', 'cookie-value');

    const essentialCategory = new ManifestCategory('essential', [cookieOne.getName()], false);
    const nonEssentialCategory = new ManifestCategory('non-essential', [cookieTwo.getName(), cookieThree.getName()]);
    const SecondNonEssentialCategory = new ManifestCategory('another-non-essential', [cookieFour.getName()]);

    beforeEach(() => {
        deleteAllCookies();
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
        mockManifestHandler = MockManifestHandler();
    });

    describe('getAllCookies', () => {
        beforeEach(() => {
            deleteAllCookies();
        });

        test('Get single cookie', () => {
            document.cookie = `${cookieOne.getName()}=${cookieOne.getValue()};path=/`;

            expect(CookieHandler.getAllCookies()).toStrictEqual([cookieOne]);
        });

        test('Get multiple cookies', () => {
            const expectedCookies = [cookieOne, cookieTwo, cookieThree];
            let expectedDocumentCookies = `${cookieOne.getName()}=${cookieOne.getValue()}; `;
            expectedDocumentCookies += `${cookieTwo.getName()}=${cookieTwo.getValue()}; `;
            expectedDocumentCookies += `${cookieThree.getName()}=${cookieThree.getValue()}`;

            document.cookie = `${cookieOne.getName()}=${cookieOne.getValue()};path=/`;
            document.cookie = `${cookieTwo.getName()}=${cookieTwo.getValue()};path=/`;
            document.cookie = `${cookieThree.getName()}=${cookieThree.getValue()};path=/`;
            document.cookie = `${cookieOne.getName()}=${cookieOne.getValue()};path=/`;

            expect(document.cookie).toBe(expectedDocumentCookies);

            expect(CookieHandler.getAllCookies()).toStrictEqual(expectedCookies);
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
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieFour.getName()).mockReturnValue(SecondNonEssentialCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieFour]);
            cookieOne.disable = jest.fn();
            cookieTwo.disable = jest.fn();
            cookieFour.disable = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(cookieTwo.disable).toHaveBeenCalled();
            expect(cookieFour.disable).toHaveBeenCalled();
        });

        test('Process cookies with all consent set to true', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: true,
                [SecondNonEssentialCategory.getName()]: true
            });
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieFour.getName()).mockReturnValue(SecondNonEssentialCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieFour]);
            cookieOne.disable = jest.fn();
            cookieTwo.disable = jest.fn();
            cookieFour.disable = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(cookieTwo.disable).not.toHaveBeenCalled();
            expect(cookieFour.disable).not.toHaveBeenCalled();
        });

        test('Process cookies with user preferences set', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: false,
                [SecondNonEssentialCategory.getName()]: true
            });
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieThree.getName()).mockReturnValue(nonEssentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieFour.getName()).mockReturnValue(SecondNonEssentialCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieThree, cookieFour]);
            cookieOne.disable = jest.fn();
            cookieTwo.disable = jest.fn();
            cookieThree.disable = jest.fn();
            cookieFour.disable = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(CookieHandler.getAllCookies).toHaveBeenCalled();
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(cookieTwo.disable).toHaveBeenCalled();
            expect(cookieThree.disable).toHaveBeenCalled();
            expect(cookieFour.disable).not.toHaveBeenCalled();
        });
    });

    describe('processUnCategorizedCookies', () => {
        test('Single uncategorized cookie should be deleted', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);
            const unCategorizedCookie = new Cookie('random-cookie', 'value');
            const unCategorizedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);

            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookie.getName()).mockReturnValue(unCategorizedCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, unCategorizedCookie]);
            cookieOne.disable = jest.fn();
            unCategorizedCookie.disable = jest.fn();

            cookieHandler._processUnCategorizedCookies();
            expect(mockManifestHandler.getCategoryByCookieName).toHaveBeenCalledTimes(2);
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(unCategorizedCookie.disable).toHaveBeenCalled();
        });

        test('Multiple uncategorized cookies should be deleted', () => {
            const cookieHandler = new CookieHandler(mockConfig, mockManifestHandler, mockUserPreferences);
            const unCategorizedCookie = new Cookie('random-cookie', 'value');
            const unCategorizedCookieTwo = new Cookie('random-cookie-two', 'value');
            const manifestCategory = new ManifestCategory('non-essential', ['categorized-cookie']);
            const unCategorizedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);

            when(mockManifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(manifestCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookie.getName()).mockReturnValue(unCategorizedCategory);
            when(mockManifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookieTwo.getName()).mockReturnValue(unCategorizedCategory);
            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, unCategorizedCookie, unCategorizedCookieTwo]);
            cookieOne.disable = jest.fn();
            unCategorizedCookie.disable = jest.fn();
            unCategorizedCookieTwo.disable = jest.fn();

            cookieHandler._processUnCategorizedCookies();
            expect(mockManifestHandler.getCategoryByCookieName).toHaveBeenCalledTimes(3);
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(unCategorizedCookie.disable).toHaveBeenCalled();
            expect(unCategorizedCookieTwo.disable).toHaveBeenCalled();
        });
    });

    describe('getCookie', () => {
        test('Get cookie when there is a single cookie', () => {
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne]);

            expect(CookieHandler.getCookie(cookieOne.getName())).toBe(cookieOne);
            spy.mockRestore();
        });

        test('Get cookie when there is a multiple cookies', () => {
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne, cookieTwo, cookieThree]);

            expect(CookieHandler.getCookie(cookieTwo.getName())).toBe(cookieTwo);
            spy.mockRestore();
        });
    });
});
