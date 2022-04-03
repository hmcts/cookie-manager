import {when} from "jest-when";
import CookieHandler from "../../main/handlers/cookieHandler";
import {deleteAllCookies} from "../common/common";
import ManifestCategory from "../../main/models/manifestCategory";
import Cookie from "../../main/models/cookie";

describe('CookieHandler', () => {
    const manifestHandler = {
        getCategoryByCookieName: jest.fn(),
        getCategories: jest.fn()
    };

    beforeEach(() => {
        deleteAllCookies();
    })

    test('getCookie', () => {
        const cookieName = 'first-non-essential-cookie';
        const cookieValue = 'test-value';
        const cookiePath = 'path=/';
        const cookieCategory = new ManifestCategory('non-essential', true)

        document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
        expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);

        const expectedCookie = new Cookie(cookieName, cookieValue, cookieCategory);
        when(manifestHandler.getCategoryByCookieName).calledWith(cookieName).mockReturnValue(cookieCategory);

        const cookieHandler = new CookieHandler(manifestHandler);
        jest.spyOn(cookieHandler, 'getAllCookies');

        expect(cookieHandler.getCookie(cookieName)).toStrictEqual(expectedCookie);
        expect(cookieHandler.getAllCookies).toHaveBeenCalled();
    });

    describe('getAllCookies', () => {

        test('Get single cookie', () => {
            const cookieName = 'first-non-essential-cookie';
            const cookieCategory = new ManifestCategory('non-essential', true);
            const expectedCookies = [ new Cookie(cookieName, 'test-value', cookieCategory) ];
            const cookieHandler = new CookieHandler(manifestHandler);

            document.cookie = `${cookieName}=test-value;path=/`;
            expect(document.cookie).toBe('first-non-essential-cookie=test-value');

            when(manifestHandler.getCategoryByCookieName).calledWith(cookieName).mockReturnValue(cookieCategory);

            expect(cookieHandler.getAllCookies()).toStrictEqual(expectedCookies);
            expect(manifestHandler.getCategoryByCookieName).toHaveBeenCalledWith(cookieName);
        })

        test('Get multiple cookies', () => {
            const cookieOneName = 'first-non-essential-cookie';
            const cookieOneCategory = new ManifestCategory('non-essential', true);
            const cookieTwoName = 'first-essential-cookie';
            const cookieTwoCategory = new ManifestCategory('essential', true);
            const expectedCookies = [
                new Cookie(cookieOneName, 'test-value', cookieOneCategory),
                new Cookie(cookieTwoName, 'test-value', cookieTwoCategory)
            ];
            const cookieHandler = new CookieHandler(manifestHandler);

            document.cookie = 'first-non-essential-cookie=test-value;path=/';
            document.cookie = 'first-essential-cookie=test-value;path=/';
            expect(document.cookie).toBe('first-non-essential-cookie=test-value; first-essential-cookie=test-value');

            when(manifestHandler.getCategoryByCookieName).calledWith(cookieOneName).mockReturnValue(cookieOneCategory);
            when(manifestHandler.getCategoryByCookieName).calledWith(cookieTwoName).mockReturnValue(cookieTwoCategory);

            expect(cookieHandler.getAllCookies()).toStrictEqual(expectedCookies);
            expect(manifestHandler.getCategoryByCookieName).toHaveBeenCalledWith(cookieOneName);
            expect(manifestHandler.getCategoryByCookieName).toHaveBeenCalledWith(cookieTwoName);
        })
    })
})
