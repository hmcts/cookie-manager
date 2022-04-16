import ManifestHandler from '../../main/handlers/manifestHandler';
import { CookieCategory } from '../../main/interfaces/CookieCategory';
import { CookieManagerConfig } from '../../main/interfaces/Config';
import { ConfigHandler } from '../../main/handlers/configHandler';

describe('ManifestHandler', () => {
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
    let mockConfig: CookieManagerConfig;

    beforeEach(() => {
        mockConfig = Object.create(ConfigHandler.defaultConfig);
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
            const expectedCategories: CookieCategory[] = [
                {
                    name: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }
            ];
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
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

            const expectedCategories: CookieCategory[] = [
                {
                    name: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    name: 'another-essential',
                    optional: false,
                    cookies: ['third-essential-cookie', 'fourth-essential-cookie']
                },
                {
                    name: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                }
            ];

            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
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
            const expectedCategories: CookieCategory[] = [
                {
                    name: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    name: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                }
            ];
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
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

            const expectedCategories: CookieCategory[] = [
                {
                    name: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    name: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                },
                {
                    name: 'another-non-essential',
                    optional: true,
                    cookies: ['third-non-essential-cookie', 'fourth-non-essential-cookie']
                }
            ];
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
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
            const expectedCategories: CookieCategory[] = [
                {
                    name: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    name: 'another-essential',
                    optional: false,
                    cookies: ['third-essential-cookie', 'fourth-essential-cookie']
                },
                {
                    name: 'non-essential',
                    optional: true,
                    cookies: ['first-non-essential-cookie', 'second-non-essential-cookie']
                },
                {
                    name: 'another-non-essential',
                    optional: true,
                    cookies: ['third-non-essential-cookie', 'fourth-non-essential-cookie']
                }
            ];
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
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
            const expectedCategories: CookieCategory[] = [
                {
                    name: 'essential',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                },
                {
                    name: 'non-essential',
                    optional: true,
                    cookies: ['non-essential-cookie']
                },
                {
                    name: 'non-essential',
                    optional: true,
                    cookies: ['non-essential-cookie-two']
                }
            ];
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
        });
    });

    describe('getCategoryByCookieName', () => {
        test('Get un-categorized category when cookie does not exist in manifest', () => {
            const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
            const nonManifestCookie = 'non-manifest-cookie';
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategoryByCookieName(nonManifestCookie)).toEqual(expectedCategory);
        });

        test('Get category for essential cookie', () => {
            const expectedCategory: CookieCategory = { name: 'essential', cookies: ['first-essential-cookie', 'second-essential-cookie'], optional: false };
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategoryByCookieName('first-essential-cookie')).toEqual(expectedCategory);
        });

        test('Get category for optional cookie', () => {
            const expectedCategory: CookieCategory = { name: 'non-essential', cookies: ['first-non-essential-cookie', 'second-non-essential-cookie'], optional: true };
            const manifestHandler = new ManifestHandler(mockConfig);

            mockConfig.cookieManifest = cookieManifest;

            expect(manifestHandler.getCategoryByCookieName('first-non-essential-cookie')).toEqual(expectedCategory);
        });

        describe('Get category for cookies by exact match', () => {
            test('Should return category for cookies that does exactly match', () => {
                const expectedCategory: CookieCategory = { name: 'essential', cookies: ['first-essential-cookie', 'second-essential-cookie'], optional: false, matchBy: 'exact' };
                const manifestHandler = new ManifestHandler(mockConfig);
                mockConfig.cookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'exact',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                expect(manifestHandler.getCategoryByCookieName('second-essential-cookie')).toEqual(expectedCategory);
            });

            test('Should return un-categorized category for cookie that does not exactly match', () => {
                const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
                const manifestHandler = new ManifestHandler(mockConfig);
                mockConfig.cookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'exact',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
            });
        });

        describe('Get category for cookies by includes match', () => {
            test('Should return category for cookies that does includes match', () => {
                const expectedCategory: CookieCategory = { name: 'essential', cookies: ['essential', 'test'], optional: false, matchBy: 'includes' };
                const manifestHandler = new ManifestHandler(mockConfig);
                mockConfig.cookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'includes',
                    optional: false,
                    cookies: ['essential', 'test']
                }];

                expect(manifestHandler.getCategoryByCookieName('cookie-test')).toEqual(expectedCategory);
            });

            test('Should return un-categorized category for cookie that does not includes match', () => {
                const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
                const manifestHandler = new ManifestHandler(mockConfig);
                mockConfig.cookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'includes',
                    optional: false,
                    cookies: ['test']
                }];

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
            });
        });

        describe('Get category for cookies by startsWith match', () => {
            test('Should return category for cookies that does startsWith match', () => {
                const expectedCategory: CookieCategory = { name: 'essential', cookies: ['first-essential-cookie', 'second-essential-cookie'], optional: false, matchBy: 'startsWith' };
                const manifestHandler = new ManifestHandler(mockConfig);
                mockConfig.cookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'startsWith',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                expect(manifestHandler.getCategoryByCookieName('second-essential-cookie')).toEqual(expectedCategory);
            });

            test('Should return un-categorized category for cookie that does not startsWith match', () => {
                const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
                const manifestHandler = new ManifestHandler(mockConfig);
                mockConfig.cookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'startsWith',
                    optional: false,
                    cookies: ['test']
                }];

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
            });
        });
    });
});
