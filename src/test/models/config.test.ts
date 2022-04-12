import Config from '../../main/models/config';

describe('Config', () => {
    describe('getPreferenceCookieName', () => {
        test('Should get preference cookie name from config', () => {
            const preferenceCookieName = 'preference-cookie-test';
            const testConfig = {
                userPreferences: {
                    cookieName: preferenceCookieName
                }
            };
            const config = new Config(testConfig);

            expect(config.getPreferenceCookieName()).toBe(preferenceCookieName);
        });

        test('Should use default preference cookie name', () => {
            const config = new Config({});
            expect(config.getPreferenceCookieName()).toBe(Config.DEFAULTS.PREFERENCE_COOKIE_NAME);
        });
    });

    test('getCookieManifest', () => {
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
        const testConfig = { cookieManifest: cookieManifest };

        const config = new Config(testConfig);

        expect(config.getCookieManifest()).toBe(cookieManifest);
    });

    describe('getDefaultConsent', () => {
        test('Default consent set to false', () => {
            const testConfig = {
                userPreferences: {
                    defaultConsent: false
                }
            };
            const config = new Config(testConfig);

            expect(config.getDefaultConsent()).toBe(false);
        });

        test('Default consent set to true', () => {
            const testConfig = {
                userPreferences: {
                    defaultConsent: true
                }
            };
            const config = new Config(testConfig);

            expect(config.getDefaultConsent()).toBe(true);
        });

        test('Default consent not set in config, use default value', () => {
            const config = new Config({});
            expect(config.getDefaultConsent()).toBe(Config.DEFAULTS.CONSENT);
        });
    });

    describe('shouldDeleteUncategorized', () => {
        test('Should delete set to false', () => {
            const testConfig = {
                deleteUndefinedCookies: false
            };
            const config = new Config(testConfig);

            expect(config.shouldDeleteUncategorized()).toBe(false);
        });

        test('Should delete set to true', () => {
            const testConfig = {
                deleteUndefinedCookies: test
            };
            const config = new Config(testConfig);

            expect(config.shouldDeleteUncategorized()).toBe(test);
        });

        test('Should delete not set in config, use default value', () => {
            const config = new Config({});
            expect(config.shouldDeleteUncategorized()).toBe(Config.DEFAULTS.DELETE_UNCATEGORIZED);
        });
    });

    describe('getCookieBannerConfiguration', () => {
        test('Should return banner class set in config', () => {
            const cookieBannerConfig = {
                class: 'cookie-banner',
                actions: [
                    {
                        name: 'hide',
                        buttonClass: 'cookie-banner-hide-button'
                    }
                ]
            };
            const testConfig = {
                cookieBanner: cookieBannerConfig
            };
            const config = new Config(testConfig);

            expect(config.getCookieBannerConfiguration()).toBe(cookieBannerConfig);
        });

        test('Should return default banner class', () => {
            const config = new Config({});

            expect(config.getCookieBannerConfiguration()).toBe(Config.DEFAULTS.COOKIE_BANNER_CONFIG);
        });
    });

    describe('getPreferenceFormClass', () => {
        test('Should return preferences form class set in config', () => {
            const preferenceFormClass = 'cookie-preference-form-test';
            const testConfig = {
                preferencesForm: {
                    class: preferenceFormClass
                }
            };

            const config = new Config(testConfig);

            expect(config.getPreferencesFormClass()).toBe(preferenceFormClass);
        });

        test('Should return default preferences form class', () => {
            const config = new Config({});

            expect(config.getPreferencesFormClass()).toBe(Config.DEFAULTS.PREFERENCES_FORM_CLASS);
        });
    });

    describe('getPreferenceCookieExpiryDays', () => {
        test('Should return expiry days set in config', () => {
            const cookieExpiryDays = 7;
            const testConfig = {
                userPreferences: {
                    cookieExpiry: cookieExpiryDays
                }
            };

            const config = new Config(testConfig);

            expect(config.getPreferenceCookieExpiryDays()).toBe(cookieExpiryDays);
        });

        test('Should return default expiry days', () => {
            const config = new Config({});

            expect(config.getPreferenceCookieExpiryDays()).toBe(Config.DEFAULTS.PREFERENCE_COOKIE_EXPIRY);
        });
    });
});
