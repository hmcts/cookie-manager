
export const MockedCookieJar = () => {
    const mockCookieJar = {
        get: jest.spyOn(document, 'cookie', 'get'),
        set: jest.spyOn(document, 'cookie', 'set')
    };

    mockCookieJar.set.mockClear();
    mockCookieJar.get.mockClear();

    return mockCookieJar;
};
