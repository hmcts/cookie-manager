import Config from '../../main/models/config';
import { IConfig } from '../../main/interfaces/Config';

describe('Config', () => {
    const defaultConfig = {
        userPreferences: {
            cookieName: 'cookie-preferences',
            cookieExpiry: 365,
            cookieSecure: true
        },
        preferencesForm: {
            class: 'cookie-preferences-form'
        },
        cookieBanner: {
            class: 'cookie-banner',
            actions: [
                {
                    name: 'accept',
                    buttonClass: 'cookie-banner-accept-button',
                    confirmationClass: 'cookie-banner-accept-message',
                    consent: true
                },
                {
                    name: 'reject',
                    buttonClass: 'cookie-banner-reject-button',
                    confirmationClass: 'cookie-banner-reject-message',
                    consent: false
                },
                {
                    name: 'hide',
                    buttonClass: 'cookie-banner-hide-button'
                }
            ]
        },
        cookieManifest: [],
        additionalOptions: {
            deleteUndefinedCookies: true,
            defaultConsent: false
        }
    };

    describe('getPreferenceCookieName', () => {
        test('Should get preference cookie name from config', () => {
            const preferenceCookieName = 'preference-cookie-test';
            const testConfig: Partial<IConfig> = {
                userPreferences: {
                    cookieName: preferenceCookieName
                }
            };
            const config = new Config(testConfig);

            expect(config.getUserPreferencesCookieName()).toBe(preferenceCookieName);
        });

        test('Should use default preference cookie name', () => {
            const config = new Config({});
            expect(config.getUserPreferencesCookieName()).toBe(defaultConfig.userPreferences.cookieName);
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
        const testConfig = {
            cookieManifest: cookieManifest
        };

        const config = new Config(testConfig);

        expect(config.getCookieManifest()).toBe(cookieManifest);
    });

    describe('getDefaultConsent', () => {
        test('Default consent set to false', () => {
            const testConfig = {
                additionalOptions: {
                    defaultConsent: false
                }
            };
            const config = new Config(testConfig);

            expect(config.getDefaultConsent()).toBe(false);
        });

        test('Default consent set to true', () => {
            const testConfig = {
                additionalOptions: {
                    defaultConsent: true
                }
            };
            const config = new Config(testConfig);

            expect(config.getDefaultConsent()).toBe(true);
        });

        test('Default consent not set in config, use default value', () => {
            const config = new Config({});
            expect(config.getDefaultConsent()).toBe(defaultConfig.additionalOptions.defaultConsent);
        });
    });

    describe('shouldDeleteUncategorized', () => {
        test('Should delete set to false', () => {
            const testConfig = {
                additionalOptions: {
                    deleteUndefinedCookies: false
                }
            };
            const config = new Config(testConfig);

            expect(config.shouldDeleteUncategorized()).toBe(false);
        });

        test('Should delete set to true', () => {
            const testConfig = {
                additionalOptions: {
                    deleteUndefinedCookies: true
                }
            };
            const config = new Config(testConfig);

            expect(config.shouldDeleteUncategorized()).toBe(true);
        });

        test('Should delete not set in config, use default value', () => {
            const config = new Config({});
            expect(config.shouldDeleteUncategorized()).toBe(defaultConfig.additionalOptions.deleteUndefinedCookies);
        });
    });

    describe('getCookieBannerConfiguration', () => {
        test('Should return cookie banner configuration set in config', () => {
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

            expect(config.getCookieBannerConfiguration()).toStrictEqual(cookieBannerConfig);
        });

        test('Should return default banner configuration', () => {
            const config = new Config({});

            expect(config.getCookieBannerConfiguration()).toStrictEqual(defaultConfig.cookieBanner);
        });
    });

    describe('getPreferenceFormClass', () => {
        test('Should return preferences form configuration set in config', () => {
            const preferenceFormConfiguration = {
                class: 'cookie-preferences-form'
            };
            const testConfig = {
                preferencesForm: preferenceFormConfiguration
            };

            const config = new Config(testConfig);

            expect(config.getPreferencesFormConfiguration()).toBe(preferenceFormConfiguration);
        });

        test('Should return default preferences configuration', () => {
            const config = new Config({});

            expect(config.getPreferencesFormConfiguration()).toStrictEqual(defaultConfig.preferencesForm);
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

            expect(config.getUserPreferencesCookieExpiry()).toBe(cookieExpiryDays);
        });

        test('Should return default expiry days', () => {
            const config = new Config({});

            expect(config.getUserPreferencesCookieExpiry()).toBe(defaultConfig.userPreferences.cookieExpiry);
        });
    });
});
