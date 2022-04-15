import { when } from 'jest-when';
import ManifestHandler from '../../main/handlers/manifestHandler';
import { MockConfig } from '../common/mockConfig';
import { CookieCategory } from '../../main/interfaces/CookieCategory';

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
    let mockConfig;

    beforeEach(() => {
        mockConfig = MockConfig();
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

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
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

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
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

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
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

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
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

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
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
            const expectedCategories: CookieCategory[] = [
                {
                    name: 'another-essential',
                    optional: false,
                    cookies: ['essential-cookie']
                }
            ];
            const manifestHandler = new ManifestHandler(mockConfig);

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
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

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategories()).toEqual(expectedCategories);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
        });
    });

    describe('getCategoryByCookieName', () => {
        beforeEach(() => {
            mockConfig.getCookieManifest = jest.fn();
        });

        test('Get un-categorized category when cookie does not exist in manifest', () => {
            const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
            const nonManifestCookie = 'non-manifest-cookie';
            const manifestHandler = new ManifestHandler(mockConfig);

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName(nonManifestCookie)).toEqual(expectedCategory);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
        });

        test('Get category for essential cookie', () => {
            const expectedCategory: CookieCategory = { name: 'essential', cookies: ['first-essential-cookie', 'second-essential-cookie'], optional: false };
            const manifestHandler = new ManifestHandler(mockConfig);

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName('first-essential-cookie')).toEqual(expectedCategory);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
        });

        test('Get category for optional cookie', () => {
            const expectedCategory: CookieCategory = { name: 'non-essential', cookies: ['first-non-essential-cookie', 'second-non-essential-cookie'], optional: true };
            const manifestHandler = new ManifestHandler(mockConfig);

            when(mockConfig.getCookieManifest).calledWith().mockReturnValue(cookieManifest);

            expect(manifestHandler.getCategoryByCookieName('first-non-essential-cookie')).toEqual(expectedCategory);
            expect(mockConfig.getCookieManifest).toHaveBeenCalled();
        });

        describe('Get category for cookies by exact match', () => {
            test('Should return category for cookies that does exactly match', () => {
                const expectedCategory: CookieCategory = { name: 'essential', cookies: ['first-essential-cookie', 'second-essential-cookie'], optional: false, matchBy: 'exact' };
                const manifestHandler = new ManifestHandler(mockConfig);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'exact',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                when(mockConfig.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential-cookie')).toEqual(expectedCategory);
                expect(mockConfig.getCookieManifest).toHaveBeenCalled();
            });

            test('Should return un-categorized category for cookie that does not exactly match', () => {
                const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
                const manifestHandler = new ManifestHandler(mockConfig);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'exact',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                when(mockConfig.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
                expect(mockConfig.getCookieManifest).toHaveBeenCalled();
            });
        });

        describe('Get category for cookies by includes match', () => {
            test('Should return category for cookies that does includes match', () => {
                const expectedCategory: CookieCategory = { name: 'essential', cookies: ['essential', 'test'], optional: false, matchBy: 'includes' };
                const manifestHandler = new ManifestHandler(mockConfig);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'includes',
                    optional: false,
                    cookies: ['essential', 'test']
                }];

                when(mockConfig.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('cookie-test')).toEqual(expectedCategory);
                expect(mockConfig.getCookieManifest).toHaveBeenCalled();
            });

            test('Should return un-categorized category for cookie that does not includes match', () => {
                const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
                const manifestHandler = new ManifestHandler(mockConfig);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'includes',
                    optional: false,
                    cookies: ['test']
                }];

                when(mockConfig.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
                expect(mockConfig.getCookieManifest).toHaveBeenCalled();
            });
        });

        describe('Get category for cookies by startsWith match', () => {
            test('Should return category for cookies that does startsWith match', () => {
                const expectedCategory: CookieCategory = { name: 'essential', cookies: ['first-essential-cookie', 'second-essential-cookie'], optional: false, matchBy: 'startsWith' };
                const manifestHandler = new ManifestHandler(mockConfig);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'startsWith',
                    optional: false,
                    cookies: ['first-essential-cookie', 'second-essential-cookie']
                }];

                when(mockConfig.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential-cookie')).toEqual(expectedCategory);
                expect(mockConfig.getCookieManifest).toHaveBeenCalled();
            });

            test('Should return un-categorized category for cookie that does not startsWith match', () => {
                const expectedCategory = { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
                const manifestHandler = new ManifestHandler(mockConfig);
                const mockCookieManifest = [{
                    categoryName: 'essential',
                    matchBy: 'startsWith',
                    optional: false,
                    cookies: ['test']
                }];

                when(mockConfig.getCookieManifest).mockReturnValue(mockCookieManifest);

                expect(manifestHandler.getCategoryByCookieName('second-essential')).toEqual(expectedCategory);
                expect(mockConfig.getCookieManifest).toHaveBeenCalled();
            });
        });
    });
});
