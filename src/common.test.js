/* File for common test functions, ignored in Jest */

export const getmMockedCookieJar = () => ({
    get: jest.spyOn(document, 'cookie', 'get'),
    set: jest.spyOn(document, 'cookie', 'set')
});

export const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}