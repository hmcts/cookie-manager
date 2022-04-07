import { when } from 'jest-when';
import ManifestCategory from '../../main/models/manifestCategory';
import ManifestHandler from '../../main/handlers/manifestHandler';

describe('ManifestHandler', () => {
    const preferenceCookieName = 'preference-cookie';
    const cookieManifest = [
        {
            categoryName: 'essential',
            optional: false,
            cookies: ['first-essential-cookie', 'second-essential-cookie']
        },
        {
            categoryName: 'non-essential',
            optional: true,
            cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
        },
        {
            categoryName: 'another-non-essential',
            optional: true,
            cookies: ['third-non-essential-cookie']
        }
    ];
    const config = { getPreferenceCookieName: jest.fn(), getCookieManifest: jest.fn() };
    when(config.getPreferenceCookieName).calledWith().mockReturnValue(preferenceCookieName);

    beforeEach(() => {
        config.getCookieManifest.mockClear();
    });

    describe('getCategories', () => {
        test('Get categories with single essential', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }
            ];
            const expectedCategories = [
                new ManifestCategory(
                    'essential',
                    ['first-essential-cookie', 'second-essential-cookie'],
                    false
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Get categories with multiple essential', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    categoryName: 'another-essential',
                    optional: false,
                    cookies: ['third-essential-cookie', 'fourth-essential-cookie']
                },
                {
                    categoryName: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                }
            ];
            const expectedCategories = [
                new ManifestCategory(
                    'essential',
                    ['first-essential-cookie', 'second-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'another-essential',
                    ['third-essential-cookie', 'fourth-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'non-essential',
                    ['first-non-essential-cookie', 'second-non-essential-cookie'],
                    true
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Get categories with single optional', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    categoryName: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                }
            ];
            const expectedCategories = [
                new ManifestCategory(
                    'essential',
                    ['first-essential-cookie', 'second-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'non-essential',
                    ['first-non-essential-cookie', 'second-non-essential-cookie'],
                    true
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Get categories with multiple optional', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    categoryName: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                },
                {
                    categoryName: 'another-non-essential',
                    optional: true,
                    cookies: ['third-non-essential-cookie', 'fourth-non-essential-cookie']
                }
            ];

            const expectedCategories = [
                new ManifestCategory(
                    'essential',
                    ['first-essential-cookie', 'second-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'non-essential',
                    ['first-non-essential-cookie', 'second-non-essential-cookie'],
                    true
                ),
                new ManifestCategory(
                    'another-non-essential',
                    ['third-non-essential-cookie', 'fourth-non-essential-cookie'],
                    true
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Get categories with multiple essential and optional', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    categoryName: 'another-essential',
                    optional: false,
                    cookies: ['third-essential-cookie', 'fourth-essential-cookie']
                },
                {
                    categoryName: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                },
                {
                    categoryName: 'another-non-essential',
                    optional: true,
                    cookies: ['third-non-essential-cookie', 'fourth-non-essential-cookie']
                }
            ];
            const expectedCategories = [
                new ManifestCategory(
                    'essential',
                    ['first-essential-cookie', 'second-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'another-essential',
                    ['third-essential-cookie', 'fourth-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'non-essential',
                    ['first-non-essential-cookie', 'second-non-essential-cookie'],
                    true
                ),
                new ManifestCategory(
                    'another-non-essential',
                    ['third-non-essential-cookie', 'fourth-non-essential-cookie'],
                    true
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Ignore categories when category is malformed', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: 'broken'
                },
                {
                    categoryName: 'another-essential',
                    optional: false,
                    cookies: ['essential-cookie']
                },
                {
                    cookies: ['third-essential-cookie', 'fourth-essential-cookie']
                }
            ];
            const expectedCategories = [
                new ManifestCategory(
                    'another-essential',
                    ['essential-cookie'],
                    false
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Duplicate categories are handled correctly', () => {
            const cookieManifest = [
                {
                    categoryName: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    categoryName: 'non-essential',
                    optional: true,
                    cookies: ['non-essential-cookie']
                },
                {
                    categoryName: 'non-essential',
                    optional: true,
                    cookies: ['non-essential-cookie-two']
                }
            ];
            const expectedCategories = [
                new ManifestCategory(
                    'essential',
                    ['first-essential-cookie', 'second-essential-cookie'],
                    false
                ),
                new ManifestCategory(
                    'non-essential',
                    ['non-essential-cookie'],
                    true
                ),
                new ManifestCategory(
                    'non-essential',
                    ['non-essential-cookie-two'],
                    true
                )
            ];
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });
    });

    describe('getCategoryByCookieName', () => {
        beforeEach(() => {
            config.getCookieManifest = jest.fn();
        });

        test('Get un-categorized category when cookie does not exist in manifest', () => {
            const expectedCategory = new ManifestCategory('un-categorized');
            const nonManifestCookie = 'non-manifest-cookie';
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName(nonManifestCookie)).toEqual(expectedCategory);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Get category for essential cookie', () => {
            const expectedCategory = new ManifestCategory('essential', ['first-essential-cookie', 'second-essential-cookie'], false);
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName('first-essential-cookie')).toEqual(expectedCategory);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        test('Get category for optional cookie', () => {
            const expectedCategory = new ManifestCategory('non-essential', ['first-non-essential-cookie', 'second-non-essential-cookie']);
            const manifestHandler = new ManifestHandler(config);

            when(config.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName('first-non-essential-cookie')).toEqual(expectedCategory);
            expect(config.getCookieManifest).toHaveBeenCalled();
        });

        describe('Get category for cookies by exact match', () => {
            test('Should return category for cookies that does exactly match', () => {
                const expectedCategory = new ManifestCategory('essential', ['first-essential-cookie', 'second-essential-cookie'], false, 'exact');
                const manifestHandler = new ManifestHandler(config);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'exact',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                when(config.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential-cookie')).toEqual(expectedCategory);
                expect(config.getCookieManifest).toHaveBeenCalled();
            });

            test('Should return un-categorized category for cookie that does not exactly match', () => {
                const expectedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);
                const manifestHandler = new ManifestHandler(config);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'exact',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                when(config.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
                expect(config.getCookieManifest).toHaveBeenCalled();
            });
        });

        describe('Get category for cookies by includes match', () => {
            test('Should return category for cookies that does includes match', () => {
                const expectedCategory = new ManifestCategory('essential', ['essential', 'test'], false, 'includes');
                const manifestHandler = new ManifestHandler(config);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'includes',
                    optional: false,
                    cookies: ['essential', 'test']
                }];

                when(config.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('cookie-test')).toEqual(expectedCategory);
                expect(config.getCookieManifest).toHaveBeenCalled();
            });

            test('Should return un-categorized category for cookie that does not includes match', () => {
                const expectedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);
                const manifestHandler = new ManifestHandler(config);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'includes',
                    optional: false,
                    cookies: ['test']
                }];

                when(config.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
                expect(config.getCookieManifest).toHaveBeenCalled();
            });
        });

        describe('Get category for cookies by startsWith match', () => {
            test('Should return category for cookies that does startsWith match', () => {
                const expectedCategory = new ManifestCategory('essential', ['test-cookie', 'cookies'], false, 'startsWith');
                const manifestHandler = new ManifestHandler(config);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'startsWith',
                    optional: false,
                    cookies: ['test-cookie', 'cookies']
                }];

                when(config.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('test-cookie-one')).toEqual(expectedCategory);
                expect(config.getCookieManifest).toHaveBeenCalled();
            });

            test('Should return un-categorized category for cookie that does not startsWith match', () => {
                const expectedCategory = new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);
                const manifestHandler = new ManifestHandler(config);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'startsWith',
                    optional: false,
                    cookies: ['test']
                }];

                when(config.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
                expect(config.getCookieManifest).toHaveBeenCalled();
            });
        });
    });
});
