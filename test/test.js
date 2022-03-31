const {
    CookieManager,
    Cookie,
    CookieHandler,
    ManifestCategory,
    ManifestHandler,
    Config, UserPreferences,
} = require('../index');
const { when } = require('jest-when');

// Silence debug output
console.debug = function () {};
console.error = function () {};

// TEST FUNCTIONS
const getmMockedCookieJar = () => ({
    get: jest.spyOn(document, 'cookie', 'get'),
    set: jest.spyOn(document, 'cookie', 'set')
});

function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

// TESTS
describe('CookieManager', () => {
    const config = {
        'user-preference-cookie-name': 'preference-cookie',
        'cookie-manifest': [
            {
                "category-name": "essential",
                "optional": false,
                "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
            },
            {
                "category-name": "non-essential",
                "optional": true,
                "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
            },
            {
                "category-name": "another-non-essential",
                "optional": true,
                "cookies": [ "third-non-essential-cookie" ]
            }
        ]
    }


    test('init', () => {
        const cookieManager = new CookieManager(config);

        cookieManager.processCookies = jest.fn();

        cookieManager.init();
        expect(cookieManager.processCookies).toBeCalled();
    });

    describe('Process cookies', () => {
        const cookieOne = 'first-essential-cookie=cookie-value';
        const cookieTwo = 'second-non-essential-cookie=cookie-value';
        const cookieThree = 'third-non-essential-cookie=cookie-value';
        const cookieFour = 'first-non-essential-cookie=cookie-value';

        beforeEach(() => {
            deleteAllCookies();
        })

        test('Process cookies with default consent set to false', () => {
            const customConfig = {...config, 'default-consent-value': false }
            const cookieManager = new CookieManager(customConfig);
            document.cookie = cookieOne;
            document.cookie = cookieTwo;
            document.cookie = cookieThree;

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}`);

            cookieManager.init();

            expect(document.cookie).toBe(`${cookieOne}`);
        });

        test('Process cookies with default consent set to true', () => {
            const customConfig = {...config, 'default-consent-value': true }
            const cookieManager = new CookieManager(customConfig);
            document.cookie = cookieOne;
            document.cookie = cookieTwo;
            document.cookie = cookieThree;

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}`);

            cookieManager.init();
            cookieManager.processCookies();

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}`);
        });

        test('Process cookies with user preferences set', () => {
            const customConfig = {...config, 'default-consent-value': false }
            const cookieManager = new CookieManager(customConfig);
            const preferenceCookie = `preference-cookie=${JSON.stringify({ 'non-essential': 'off', 'another-non-essential': 'on' })}`;
            document.cookie = cookieOne;
            document.cookie = cookieTwo;
            document.cookie = cookieThree;
            document.cookie = cookieFour;
            document.cookie = preferenceCookie;

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}; ${cookieFour}; ${preferenceCookie}`);

            cookieManager.init();

            expect(document.cookie).toBe(`${cookieOne}; ${cookieThree}; ${preferenceCookie}`);
        });

        describe('Process cookies which are uncategorized', () => {

            beforeEach(() => {
                deleteAllCookies();
            })

            test('Processed uncategorized cookies should be deleted', () => {
                const customConfig = {...config, 'delete-undefined-cookies': true }
                const cookieManager = new CookieManager(customConfig);
                const preferenceCookie = `preference-cookie=${JSON.stringify({ 'non-essential': 'off', 'another-non-essential': 'on' })}`;

                document.cookie = cookieOne;
                document.cookie = 'uncategorized-cookie=cookie-value'
                document.cookie = preferenceCookie;

                expect(document.cookie).toBe(`${cookieOne}; uncategorized-cookie=cookie-value; ${preferenceCookie}`);

                cookieManager.init();

                expect(document.cookie).toBe(`${cookieOne}; ${preferenceCookie}`);
            });

            test('Processed uncategorized cookies should be kept', () => {
                const customConfig = {...config, 'delete-undefined-cookies': false }
                const cookieManager = new CookieManager(customConfig);
                const preferenceCookie = `preference-cookie=${JSON.stringify({ 'non-essential': 'off', 'another-non-essential': 'on'})}`;

                document.cookie = cookieOne;
                document.cookie = 'uncategorized-cookie=cookie-value'
                document.cookie = preferenceCookie;

                expect(document.cookie).toBe(`${cookieOne}; uncategorized-cookie=cookie-value; ${preferenceCookie}`);

                cookieManager.init();

                expect(document.cookie).toBe(`${cookieOne}; uncategorized-cookie=cookie-value; ${preferenceCookie}`);
            })
        });
    })
});

describe('Config', () => {

    test('Get preference cookie name', () => {
        const cookieName = 'preference-cookie';
        const configOpts = { 'user-preference-cookie-name': cookieName };

        const config = new Config(configOpts);

        expect(config.getPreferenceCookieName()).toBe(cookieName);
    });

    test('Get cookie manifest', () => {
        const cookieManifest = [
            {
                "category-name": "essential",
                "optional": false,
                "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
            },
            {
                "category-name": "non-essential",
                "optional": true,
                "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
            },
            {
                "category-name": "another-non-essential",
                "optional": true,
                "cookies": [ "third-non-essential-cookie" ]
            }
        ];
        const configOpts = { 'cookie-manifest': cookieManifest };

        const config = new Config(configOpts);

        expect(config.getCookieManifest()).toBe(cookieManifest);
    });

    test('Get default consent', () => {
        const defaultConsent = false;
        const configOpts = { 'default-consent-value': defaultConsent };

        const config = new Config(configOpts);

        expect(config.getDefaultConsent()).toBe(defaultConsent);
    });

    test('Should delete uncategorized', () => {
        let shouldDelete = false;
        let configOpts = { 'delete-undefined-cookies': shouldDelete };
        let config = new Config(configOpts);

        expect(config.shouldDeleteUncategorized()).toBe(shouldDelete);

        shouldDelete = true;
        configOpts = { 'delete-undefined-cookies': shouldDelete };
        config = new Config(configOpts);

        expect(config.shouldDeleteUncategorized()).toBe(shouldDelete);
    });
});

describe('Cookie', () => {
    const mockCookieJar = getmMockedCookieJar();

    const cookieName = 'test-cookie';
    const cookieValue = 'test-value';
    const cookieJSONValue = {
        'test-json-key-1': 'test-json-value-1',
        'test-json-key-2': 'test-json-value-2'
    }
    const cookiePath = 'path=/';
    const categoryValue = 'test-category';
    const noCategoryValue = 'un-categorized';

    beforeEach(() => {
        mockCookieJar.get.mockClear();
        mockCookieJar.set.mockClear();
        deleteAllCookies();
    })

    test('Get cookie name', () => {
        const cookie = new Cookie(cookieName, cookieValue);
        expect(cookie.getName()).toBe(cookieName);
    });

    test('Get cookie value', () => {
        const cookie = new Cookie(cookieName, cookieValue);
        expect(cookie.getValue()).toBe(cookieValue);
    });

    describe('Get cookie category', () => {
        test('Get cookie category with defined category', () => {
            const cookie = new Cookie(cookieName, cookieValue, categoryValue);
            expect(cookie.getCategory()).toBe(categoryValue);
        });

        test('Get cookie category with no defined category', () => {
            const cookie = new Cookie(cookieName, cookieValue);
            expect(cookie.getCategory()).toBe(noCategoryValue);
        });
    });

    describe('Disable cookie', () => {
        const cookieClearDate = new Date(1000).toUTCString();

        test('When cookie exists in browser, disabling cookie deletes the cookie', () => {
            document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`)

            mockCookieJar.set.mockClear();

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.disable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=;expires=${cookieClearDate};${cookiePath}`);
            expect(document.cookie).toBe('')
        });

        test('When cookie does not exist in browser, disabling cookie does nothing', () => {
            expect(document.cookie).toBe(``);

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.disable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=;expires=${cookieClearDate};${cookiePath}`);
            expect(document.cookie).toBe('')
        });
    });

    describe('Enable cookie', () => {

        test('When cookie does not exist in browser, enabling cookie creates cookie', () => {
            expect(document.cookie).toBe(``);

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`)
        });

        test('When cookie already exists in browser, overwrite existing cookie', () => {
            document.cookie = `${cookieName}=${cookieValue};${cookiePath}`;
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`);
            const newCookieValue = 'new-test-value';

            const cookie = new Cookie(cookieName, newCookieValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${newCookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${newCookieValue}`)
        });

        test('Cookie with primitive for value is created correctly', () => {
            const cookie = new Cookie(cookieName, cookieValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`)
        })

        test('Cookie with JSON object for value is created correctly', () => {
            const expectedCookieValue = JSON.stringify(cookieJSONValue);

            const cookie = new Cookie(cookieName, cookieJSONValue);
            cookie.enable();

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${expectedCookieValue};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${expectedCookieValue}`)
        })

        test('Cookie with expiry parameter is created correctly', () => {
            const expiryMilliseconds = 7 * 24 * 60 * 60 * 1000;
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();

            const cookie = new Cookie(cookieName, cookieValue);
            cookie.enable(expiryMilliseconds); // 7 days

            expect(mockCookieJar.set).toHaveBeenCalledWith(`${cookieName}=${cookieValue};expires=${expiryDate};${cookiePath}`);
            expect(document.cookie).toBe(`${cookieName}=${cookieValue}`)
        })
    });
});

describe('ManifestCategory', () => {
    const manifestName = 'test-cookie';

    test('Get category name', () => {
        const manifestCategory = new ManifestCategory(manifestName, true);
        expect(manifestCategory.getName()).toBe(manifestName);
    });

    describe('Get category optional status', () => {
        test('Get category is optional', () => {
            const manifestCategory = new ManifestCategory(manifestName, true);
            expect(manifestCategory.isOptional()).toBe(true);
        })

        test('Get category is essential', () => {
            const manifestCategory = new ManifestCategory(manifestName, false);
            expect(manifestCategory.isOptional()).toBe(false);
        })

        test('Get category is optional by default', () => {
            const manifestCategory = new ManifestCategory(manifestName);
            expect(manifestCategory.isOptional()).toBe(true);
        })
    })
})

describe('ManifestHandler', () => {
    const preferenceCookieName = 'preference-cookie';
    const cookieManifest = [
        {
            "category-name": "essential",
            "optional": false,
            "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
        },
        {
            "category-name": "non-essential",
            "optional": true,
            "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
        },
        {
            "category-name": "another-non-essential",
            "optional": true,
            "cookies": [ "third-non-essential-cookie" ]
        }
    ];
    const config = { getPreferenceCookieName: jest.fn(), getCookieManifest: jest.fn() }
    when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName);

    beforeEach(() => {
        config.getCookieManifest.mockClear();
    });

    describe('Get categories', () => {

        test('Get categories with single essential', () => {
            const cookieManifest = [
                {
                    "category-name": "essential",
                    "optional": false,
                    "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
                }
            ];
            const expectedCategories = [ new ManifestCategory('essential', false) ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })

        test('Get categories with multiple essential', () => {
            const cookieManifest = [
                {
                    "category-name": "essential",
                    "optional": false,
                    "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
                },
                {
                    "category-name": "another-essential",
                    "optional": false,
                    "cookies": [ "third-essential-cookie", "fourth-essential-cookie" ]
                },
                {
                    "category-name": "non-essential",
                    "optional": true,
                    "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
                }
            ];
            const expectedCategories = [
                new ManifestCategory('essential', false),
                new ManifestCategory('another-essential', false),
                new ManifestCategory('non-essential', true),
            ]
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })

        test('Get categories with single optional', () => {
            const cookieManifest = [
                {
                    "category-name": "essential",
                    "optional": false,
                    "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
                },
                {
                    "category-name": "non-essential",
                    "optional": true,
                    "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
                }
            ];
            const expectedCategories = [
                new ManifestCategory('essential', false),
                new ManifestCategory('non-essential', true),
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })

        test('Get categories with multiple optional', () => {
            const expectedCategories = [
                new ManifestCategory('essential', false),
                new ManifestCategory('non-essential', true),
                new ManifestCategory('another-non-essential', true),
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })

        test('Get categories with multiple essential and optional', () => {
            const cookieManifest = [
                {
                    "category-name": "essential",
                    "optional": false,
                    "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
                },
                {
                    "category-name": "another-essential",
                    "optional": false,
                    "cookies": [ "third-essential-cookie", "fourth-essential-cookie" ]
                },
                {
                    "category-name": "non-essential",
                    "optional": true,
                    "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
                },
                {
                    "category-name": "another-non-essential",
                    "optional": true,
                    "cookies": [ "third-non-essential-cookie" ]
                }
            ];
            const expectedCategories = [
                new ManifestCategory('essential', false),
                new ManifestCategory('another-essential', false),
                new ManifestCategory('non-essential', true),
                new ManifestCategory('another-non-essential', true)
            ]
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })

        test('Ignore categories when category is malformed', () => {
            const cookieManifest = [
                {
                    "category-name": "essential",
                    "optional": false,
                    "cookies": 'broken'
                },
                {
                    "category-name": "another-essential",
                    "optional": false,
                    "cookies": ['essential-cookie']
                },
                {
                    "cookies": [ "third-essential-cookie", "fourth-essential-cookie" ]
                },
            ];
            const expectedCategories = [
                new ManifestCategory('another-essential', false)
            ]
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })
    })

    describe('Get category by cookie name', () => {

        test(`Get 'internal' category when using preference cookie`, () => {
            const expectedCategory = new ManifestCategory('internal', false);
            const manifestHandler = new ManifestHandler(config);

            expect(manifestHandler.getCategoryByCookieName(preferenceCookieName)).toEqual(expectedCategory)
            expect(config.getCookieManifest).toHaveBeenCalledTimes(0);
        })

        test(`Get 'un-categorized' category when cookie does not exist in manifest`, () => {
            const expectedCategory = new ManifestCategory('un-categorized');
            const nonManifestCookie = 'non-manifest-cookie';
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName(nonManifestCookie)).toEqual(expectedCategory)
            expect(config.getCookieManifest).toHaveBeenCalled();

        })

        test(`Get category for essential cookie`, () => {
            const expectedCategory = new ManifestCategory('essential', false);
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName('first-essential-cookie')).toEqual(expectedCategory);
            expect(config.getCookieManifest).toHaveBeenCalled();
        })

        test(`Get category for optional cookie`, () => {
            const expectedCategory = new ManifestCategory('non-essential', true);
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName('first-non-essential-cookie')).toEqual(expectedCategory)
            expect(config.getCookieManifest).toHaveBeenCalled();
        })
    })
})

describe('CookieHandler', () => {
    const manifestHandler = {
        getCategoryByCookieName: jest.fn(),
        getCategories: jest.fn()
    };

    beforeEach(() => {
        deleteAllCookies();
    })

    test('Get cookie', () => {
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

    describe('Get all cookies', () => {

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

describe('UserPreferences', () => {
    const manifestHandler = {
        getCategoryByCookieName: jest.fn(),
        getCategories: jest.fn()
    };
    const config = {
        getPreferenceCookieName: jest.fn(),
        getCookieManifest: jest.fn(),
        getDefaultConsent: jest.fn()
    };
    const cookieHandler = {
        getAllCookies: jest.fn(),
        getCookie: jest.fn()
    };
    const mockCookieJar = getmMockedCookieJar();

    const preferenceCookieName = 'preference-cookie';
    const expiryMilliseconds = 365 * 24 * 60 * 60 * 1000;

    beforeEach(() => {
        deleteAllCookies();
    });

    describe('Process preferences', () => {

        test('Should load preferences from cookie when preference cookie is present', () => {
            const preferenceCookie = new Cookie(preferenceCookieName, { 'non-essential': true }, 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferencesFromCookie = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferenceCookie);

            userPreferences.processPreferences()
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences.loadPreferencesFromCookie).toHaveBeenCalledWith(preferenceCookie);
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });

        test('Should load preferences from defaults when preference cookie is not present', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();
            userPreferences.setPreferences = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(undefined);

            userPreferences.processPreferences()
            expect(userPreferences.getPreferenceCookie).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
            expect(userPreferences.setPreferences).toHaveBeenCalled();
        });
    })

    describe('Get preferences', () => {

        test('Get preferences which have been set', () => {
            const preferences = { essential: true };
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.setPreferences(preferences);
            expect(userPreferences.getPreferences()).toStrictEqual(preferences);
        });

        test('Get empty preferences when preferences havent been set', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            expect(userPreferences.getPreferences()).toStrictEqual({});
        });
    })

    test('Set preferences', () => {
        const preferences = { essential: true };
        const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

        expect(userPreferences.getPreferences()).toStrictEqual({});
        userPreferences.setPreferences(preferences);
        expect(userPreferences.getPreferences()).toStrictEqual(preferences);
    });

    test('Get preference cookie', () => {
        const preferences = { essential: true };
        const expectedPreferenceCookie = new Cookie(preferenceCookieName, preferences, 'internal');
        const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

        when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName)
        when(cookieHandler.getCookie).calledWith(preferenceCookieName).mockReturnValue(expectedPreferenceCookie)

        expect(userPreferences.getPreferenceCookie()).toBe(expectedPreferenceCookie);
        expect(config.getPreferenceCookieName).toHaveBeenCalled();
        expect(cookieHandler.getCookie).toHaveBeenCalledWith(preferenceCookieName);
    });

    describe('Save preference cookie', () => {

        test('Save single preference to cookie', () => {
            const preferences = { essential: true };
            const expectedCookiePreferences = { essential: 'on' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).calledWith().mockReturnValue(preferences);
            when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName)

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(config.getPreferenceCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};path=/`);
            expect(document.cookie).toBe(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)}`);
        });

        test('Save multiple preferences to cookie', () => {
            const preferences = { 'non-essential': true, 'another-non-essential': false };
            const expectedCookiePreferences = { 'non-essential': 'on', 'another-non-essential': 'off' };
            const expiryDate = new Date(Date.now() + expiryMilliseconds).toUTCString();
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferences = jest.fn();

            when(userPreferences.getPreferences).calledWith().mockReturnValue(preferences);
            when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName)

            userPreferences.savePreferencesToCookie();
            expect(userPreferences.getPreferences).toHaveBeenCalled();
            expect(config.getPreferenceCookieName).toHaveBeenCalled();
            expect(mockCookieJar.set).toHaveBeenCalledWith(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)};expires=${expiryDate};path=/`);
            expect(document.cookie).toBe(`${preferenceCookieName}=${JSON.stringify(expectedCookiePreferences)}`);
        });
    })

    describe('Load preferences from cookie', () => {

        test('Load from cookie successfully', () => {
            const categoryName = 'non-essential'
            const preferences = { [categoryName]: 'off' };

            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify(preferences), 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            userPreferences.getPreferenceCookie = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([new ManifestCategory(categoryName)]);

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual({'non-essential': false});
        });

        test('Handle JSON parse of cookie failure', () => {
            const preferencesCookie = new Cookie(preferenceCookieName, { 'non-essential': 'off' }, 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences.loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
        })

        test('Handle malformed cookie failure', () => {
            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify('malformedCookie'), 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences.loadPreferenceDefaults).calledWith().mockReturnValue({ 'non-essential': false });

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual({ 'non-essential': false });
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
        })

        test('Handle outdated cookie failure', () => {
            const preferences = { 'non-essential': 'off' };
            const expectedPreferences = {'non-essential': false, 'second-non-essential': false};

            const preferencesCookie = new Cookie(preferenceCookieName, JSON.stringify(preferences), 'internal');
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);

            preferencesCookie.disable = jest.fn();
            userPreferences.getPreferenceCookie = jest.fn();
            userPreferences.loadPreferenceDefaults = jest.fn();

            when(userPreferences.getPreferenceCookie).calledWith().mockReturnValue(preferencesCookie);
            when(userPreferences.loadPreferenceDefaults).calledWith().mockReturnValue(expectedPreferences);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([
                new ManifestCategory('non-essential'),
                new ManifestCategory('second-non-essential')
            ]);

            expect(userPreferences.loadPreferencesFromCookie()).toStrictEqual(expectedPreferences);
            expect(preferencesCookie.disable).toHaveBeenCalled();
            expect(userPreferences.loadPreferenceDefaults).toHaveBeenCalled();
        })
    })

    describe('Load preferences from default', () => {

        test('Load default preferences as off', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);
            const manifestCategoryOne = new ManifestCategory('essential', false);
            const manifestCategoryTwo = new ManifestCategory('non-essential', true);

            when(config.getDefaultConsent).calledWith().mockReturnValue(false);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences.loadPreferenceDefaults()).toStrictEqual({'non-essential': false})
            expect(config.getDefaultConsent).toHaveBeenCalled();
            expect(manifestHandler.getCategories).toHaveBeenCalled();
        })

        test('Load default preferences as on', () => {
            const userPreferences = new UserPreferences(config, manifestHandler, cookieHandler);
            const manifestCategoryOne = new ManifestCategory('essential', false);
            const manifestCategoryTwo = new ManifestCategory('non-essential', true);

            when(config.getDefaultConsent).calledWith().mockReturnValue(true);
            when(manifestHandler.getCategories).calledWith().mockReturnValue([manifestCategoryOne, manifestCategoryTwo]);

            expect(userPreferences.loadPreferenceDefaults()).toStrictEqual({'non-essential': true})
            expect(config.getDefaultConsent).toHaveBeenCalled();
            expect(manifestHandler.getCategories).toHaveBeenCalled();
        })
    })
})