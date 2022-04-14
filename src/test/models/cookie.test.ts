import Cookie from '../../main/models/cookie';
import { deleteAllCookies } from '../common/common';

describe('Cookie', () => {
    const cookieName = 'test-cookie';
    const cookieValue = 'test-value';

    beforeEach(() => {
        deleteAllCookies();
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
