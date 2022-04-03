import {when} from "jest-when";
import ManifestCategory from "../../main/models/manifestCategory";
import ManifestHandler from "../../main/handlers/manifestHandler";

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

    describe('getCategories', () => {

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

    describe('getCategoryByCookieName', () => {

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
