import { when } from 'jest-when';
import CookieHandler from '../../main/handlers/cookieHandler';
import { deleteAllCookies } from '../common/common';
import ManifestCategory from '../../main/models/manifestCategory';
import Cookie from '../../main/models/cookie';
import { MockConfig } from '../common/mockConfig';
import { MockUserPreferences } from '../common/mockUserPreferences';

describe('CookieHandler', () => {
    const manifestHandler = {
        getCategoryByCookieName: jest.fn(),
        getCategories: jest.fn()
    };

    let mockConfig;
    let mockUserPreferences;

    const essentialCategory = new ManifestCategory('essential', false);
    const nonEssentialCategory = new ManifestCategory('non-essential');
    const SecondNonEssentialCategory = new ManifestCategory('another-non-essential');

    const cookieOne = new Cookie('essential-cookie', 'cookie-value');
    const cookieTwo = new Cookie('first-non-essential-cookie', 'cookie-value');
    const cookieThree = new Cookie('third-non-essential-cookie', 'cookie-value');
    const cookieFour = new Cookie('third-non-essential-cookie', 'cookie-value');

    beforeEach(() => {
        deleteAllCookies();
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
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
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);

            when(mockConfig.shouldDeleteUncategorized).mockReturnValue(false);
            cookieHandler._processUnCategorizedCookies = jest.fn();
            cookieHandler._processNonConsentedCookies = jest.fn();
            cookieHandler.processCookies();

            expect(cookieHandler._processUnCategorizedCookies).not.toHaveBeenCalled();
            expect(cookieHandler._processNonConsentedCookies).toHaveBeenCalled();
        });

        test('_processUnCategorizedCookies should be called if delete uncategorized cookies is true', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);

            when(mockConfig.shouldDeleteUncategorized).mockReturnValue(true);
            cookieHandler._processUnCategorizedCookies = jest.fn();
            cookieHandler._processNonConsentedCookies = jest.fn();
            cookieHandler.processCookies();

            expect(cookieHandler._processUnCategorizedCookies).toHaveBeenCalled();
            expect(cookieHandler._processNonConsentedCookies).toHaveBeenCalled();
        });

        test('_processNonConsentedCookies should be called', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);

            cookieHandler._processUnCategorizedCookies = jest.fn();
            cookieHandler._processNonConsentedCookies = jest.fn();
            cookieHandler.processCookies();

            expect(cookieHandler._processNonConsentedCookies).toHaveBeenCalled();
        });
    });

    describe('processNonConsentedCookies', () => {
        test('Process cookies with all consent set to false', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: false,
                [SecondNonEssentialCategory.getName()]: false
            });
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieThree.getName()).mockReturnValue(SecondNonEssentialCategory);
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne, cookieTwo, cookieThree]);
            cookieOne.disable = jest.fn();
            cookieTwo.disable = jest.fn();
            cookieThree.disable = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(cookieTwo.disable).toHaveBeenCalled();
            expect(cookieThree.disable).toHaveBeenCalled();
            spy.mockRestore();
        });

        test('Process cookies with all consent set to true', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: true,
                [SecondNonEssentialCategory.getName()]: true
            });
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieThree.getName()).mockReturnValue(SecondNonEssentialCategory);
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne, cookieTwo, cookieThree]);
            cookieOne.disable = jest.fn();
            cookieTwo.disable = jest.fn();
            cookieThree.disable = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(cookieTwo.disable).not.toHaveBeenCalled();
            expect(cookieThree.disable).not.toHaveBeenCalled();
            spy.mockRestore();
        });

        test('Process cookies with user preferences set', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({
                [nonEssentialCategory.getName()]: true,
                [SecondNonEssentialCategory.getName()]: false
            });
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieOne.getName()).mockReturnValue(essentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieThree.getName()).mockReturnValue(SecondNonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieFour.getName()).mockReturnValue(SecondNonEssentialCategory);

            CookieHandler.getAllCookies = jest.fn().mockReturnValue([cookieOne, cookieTwo, cookieThree, cookieFour]);

            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieOne, cookieTwo, cookieThree, cookieFour]);
            cookieOne.disable = jest.fn();
            cookieTwo.disable = jest.fn();
            cookieThree.disable = jest.fn();
            cookieFour.disable = jest.fn();

            cookieHandler._processNonConsentedCookies();
            expect(cookieOne.disable).not.toHaveBeenCalled();
            expect(cookieTwo.disable).not.toHaveBeenCalled();
            expect(cookieThree.disable).toHaveBeenCalled();
            expect(cookieFour.disable).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('processUnCategorizedCookies', () => {
        test('Single uncategorized cookie should be deleted', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);
            const unCategorizedCookie = new Cookie('random-cookie', 'value');
            const unCategorizedCategory = new ManifestCategory('un-categorized');

            when(mockUserPreferences.getPreferences).mockReturnValue({ 'non-essential': true, 'another-non-essential': true });
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieThree.getName()).mockReturnValue(SecondNonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookie.getName()).mockReturnValue(unCategorizedCategory);
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieTwo, cookieThree, unCategorizedCookie]);
            cookieTwo.disable = jest.fn();
            cookieThree.disable = jest.fn();
            unCategorizedCookie.disable = jest.fn();

            cookieHandler._processUnCategorizedCookies();
            expect(cookieTwo.disable).not.toHaveBeenCalled();
            expect(cookieThree.disable).not.toHaveBeenCalled();
            expect(unCategorizedCookie.disable).toHaveBeenCalled();
            spy.mockRestore();
        });

        test('Multiple uncategorized cookies should be deleted', () => {
            const cookieHandler = new CookieHandler(mockConfig, manifestHandler, mockUserPreferences);
            const unCategorizedCookie = new Cookie('random-cookie', 'value');
            const unCategorizedCookieTwo = new Cookie('random-cookie', 'value');
            const unCategorizedCategory = new ManifestCategory('un-categorized');

            when(mockUserPreferences.getPreferences).mockReturnValue({ 'non-essential': true, 'another-non-essential': true });
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieTwo.getName()).mockReturnValue(nonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieThree.getName()).mockReturnValue(SecondNonEssentialCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookie.getName()).mockReturnValue(unCategorizedCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(unCategorizedCookieTwo.getName()).mockReturnValue(unCategorizedCategory);
            const spy = jest.spyOn(CookieHandler, 'getAllCookies');
            spy.mockReturnValue([cookieTwo, cookieThree, unCategorizedCookie, unCategorizedCookieTwo]);
            cookieTwo.disable = jest.fn();
            cookieThree.disable = jest.fn();
            unCategorizedCookie.disable = jest.fn();
            unCategorizedCookieTwo.disable = jest.fn();

            cookieHandler._processUnCategorizedCookies();
            expect(cookieTwo.disable).not.toHaveBeenCalled();
            expect(cookieThree.disable).not.toHaveBeenCalled();
            expect(unCategorizedCookie.disable).toHaveBeenCalled();
            expect(unCategorizedCookieTwo.disable).toHaveBeenCalled();
            spy.mockRestore();
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
