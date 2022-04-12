import Cookie from '../../main/models/cookie';
import { deleteAllCookies, getMockedCookieJar } from '../common/common';

describe('Cookie', () => {
    const mockCookieJar = getMockedCookieJar();

    const cookieName = 'test-cookie';
    const cookieValue = 'test-value';
    const cookieJSONValue = {
        'test-json-key-1': 'test-json-value-1',
        'test-json-key-2': 'test-json-value-2'
    };
    const cookiePath = 'path=/';

    beforeEach(() => {
        mockCookieJar.get.mockClear();
        mockCookieJar.set.mockClear();
        deleteAllCookies();
    });

    describe('enable', () => {
        test('When cookie does not exist in browser, enabling cookie creates cookie', () => {
            expect(document.cookie).toBe('');

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
        });

        test('When cookie already exists in browser, overwrite existing cookie', () => {
            document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
            const newCookieValue = 'new-test-value';

            const cookie = new Cookie(cookieName, newCookieValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${newCookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${newCookieValue}`);
        });

        test('Cookie with primitive for value is created correctly', () => {
            const cookie = new Cookie(cookieName, cookieValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
        });

        test('Cookie with JSON object for value is created correctly', () => {
            const expectedCookieValue = JSON.stringify(cookieJSONValue);

            const cookie = new Cookie(cookieName, cookieJSONValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${expectedCookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${expectedCookieValue}`);
        });

        test('Cookie with expiry parameter is created correctly', () => {
            const expiryMilliseconds = 7 * 24 * 60 * 60 * 1000;
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.enable(expiryMilliseconds); // 7 days

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};expires=${expiryDate};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
        });
    });

    describe('disable', () => {
        const cookieClearDate = new Date(1000).toUTCString();

        test('When cookie exists in browser, disabling cookie deletes the cookie', () => {
            document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);

            mockCookieJar.set.mockClear();

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.disable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=;expires=${cookieClearDate};${cookiePath}`);
            expect(document.cookie).toBe('');
        });

        test('When cookie does not exist in browser, disabling cookie does nothing', () => {
            expect(document.cookie).toBe('');

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.disable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=;expires=${cookieClearDate};${cookiePath}`);
            expect(document.cookie).toBe('');
        });
    });

    test('getName', () => {
        const cookie = new Cookie(cookieName, cookieValue);
        expect(cookie.getName()).toBe(cookieName);
    });

    test('getValue', () => {
        const cookie = new Cookie(cookieName, cookieValue);
        expect(cookie.getValue()).toBe(cookieValue);
    });
});
