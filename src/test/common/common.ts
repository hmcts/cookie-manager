/* File for common test functions, ignored in Jest */
import { promises as fs } from 'fs';
import * as path from 'path';

export const getMockedCookieJar = () => ({
    get: jest.spyOn(document, 'cookie', 'get'),
    set: jest.spyOn(document, 'cookie', 'set')
});

export const deleteAllCookies = () => {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

export const loadHTMLFromFile = async (file) => {
    document.body.innerHTML = await fs.readFile(path.join(__dirname, '/../html/', file), 'utf-8');
};

export const wipeDocument = () => {
    document.body.innerHTML = '';
};
