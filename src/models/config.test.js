import Config from "./config";

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