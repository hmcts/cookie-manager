
import { vi } from 'vitest';

export const MockedCookieJar = () => {
    const mockCookieJar = {
        get: vi.spyOn(document, 'cookie', 'get'),
        set: vi.spyOn(document, 'cookie', 'set')
    };

    mockCookieJar.set.mockClear();
    mockCookieJar.get.mockClear();

    return mockCookieJar;
};
