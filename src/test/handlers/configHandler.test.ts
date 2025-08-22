import { vi } from 'vitest';
import { ConfigHandler } from '../../main/handlers/configHandler';
import {
    AdditionalOptions,
    CookieBanner, CookieManagerConfig,
    CookieManifest,
    PreferencesForm,
    UserPreferences
} from '../../main/interfaces/Config';

describe('ConfigHandler', function () {
    describe('validateUserPreferences', function () {
        test('Valid configuration', () => {
            const configHandler = new ConfigHandler();

            const userPreferencesConfig: Partial<UserPreferences> = {
                cookieName: 'cookie',
                cookieExpiry: 365,
                cookieSecure: false
            };

            expect(() => configHandler.validateUserPreferencesConfig(userPreferencesConfig)).not.toThrow();
        });

        test('Invalid configuration', () => {
            const configHandler = new ConfigHandler();

            const userPreferencesConfig: any = {
                cookieName: 'cookie',
                cookieExpiry: 365,
                cookieSecure: 'shouldBeABoolean'
            };

            expect(() => configHandler.validateUserPreferencesConfig(userPreferencesConfig)).toThrow();
        });
    });

    describe('validateAdditionalOptions', function () {
        test('Valid configuration', () => {
            const configHandler = new ConfigHandler();

            const additionalOptionsConfig: AdditionalOptions = {
                disableCookieBanner: true,
                disableCookiePreferencesForm: true,
                defaultConsent: false,
                deleteUndefinedCookies: true
            };

            expect(() => configHandler.validateAdditionalOptionsConfig(additionalOptionsConfig)).not.toThrow();
        });

        test('Invalid configuration', () => {
            const configHandler = new ConfigHandler();

            const additionalOptionsConfig: any = {
                disableCookieBanner: true,
                disableCookiePreferencesForm: 'someString',
                defaultConsent: false,
                deleteUndefinedCookies: true
            };

            expect(() => configHandler.validateAdditionalOptionsConfig(additionalOptionsConfig)).toThrow();
        });
    });

    describe('validatePreferencesFormConfig', function () {
        test('Valid configuration', () => {
            const configHandler = new ConfigHandler();

            const preferencesFormConfig: PreferencesForm = {
                class: 'some-class-name'
            };

            expect(() => configHandler.validatePreferencesFormConfig(preferencesFormConfig)).not.toThrow();
        });

        test('Invalid configuration', () => {
            const configHandler = new ConfigHandler();

            const preferencesFormConfig: any = {
                class: false
            };

            expect(() => configHandler.validatePreferencesFormConfig(preferencesFormConfig)).toThrow();
        });
    });

    describe('validateCookieManifestConfig', function () {
        test('Valid configuration', () => {
            const configHandler = new ConfigHandler();

            const cookieManifestConfig: CookieManifest[] = [
                {
                    categoryName: 'someCategory',
                    optional: true,
                    matchBy: 'startsWith',
                    cookies: ['someCookie']
                }
            ];

            expect(() => configHandler.validateCookieManifestConfig(cookieManifestConfig)).not.toThrow();
        });

        test('Valid configuration without optionals', () => {
            const configHandler = new ConfigHandler();

            const cookieManifestConfig: CookieManifest[] = [
                {
                    categoryName: 'someCategory',
                    cookies: ['someCookie']
                }
            ];

            expect(() => configHandler.validateCookieManifestConfig(cookieManifestConfig)).not.toThrow();
        });

        describe('Invalid configuration', () => {
            test('Incorrect matchBy type', () => {
                const configHandler = new ConfigHandler();

                const cookieManifestConfig: CookieManifest[] = [
                    {
                        categoryName: 'someCategory',
                        optional: true,
                        matchBy: 'thisIsIncorrect',
                        cookies: ['someCookie']
                    }
                ];

                expect(() => configHandler.validateCookieManifestConfig(cookieManifestConfig)).toThrow();
            });

            test('Empty cookies array', () => {
                const configHandler = new ConfigHandler();

                const cookieManifestConfig: CookieManifest[] = [
                    {
                        categoryName: 'someCategory',
                        optional: true,
                        matchBy: 'thisIsIncorrect',
                        cookies: []
                    }
                ];

                expect(() => configHandler.validateCookieManifestConfig(cookieManifestConfig)).toThrow();
            });
        });
    });

    describe('validateCookieBannerConfig', function () {
        describe('Valid configuration', () => {
            test('Valid configuration with optionals', () => {
                const configHandler = new ConfigHandler();

                const cookieBannerConfig: CookieBanner = {
                    class: 'some-class-name',
                    showWithPreferencesForm: false,
                    actions: [
                        {
                            name: 'actionName',
                            buttonClass: 'action-button-class',
                            confirmationClass: 'action-confirmation-class',
                            consent: true
                        }
                    ]
                };

                expect(() => configHandler.validateCookieBannerConfig(cookieBannerConfig)).not.toThrow();
            });

            test('Valid configuration without optionals', () => {
                const configHandler = new ConfigHandler();

                const cookieBannerConfig: CookieBanner = {
                    class: 'some-class-name',
                    showWithPreferencesForm: false,
                    actions: [
                        {
                            name: 'actionName',
                            buttonClass: 'action-button-class',
                            consent: ['apm']
                        },
                        {
                            name: 'actionName',
                            buttonClass: 'action-button-class',
                            confirmationClass: 'action-confirmation-class'
                        }
                    ]
                };

                expect(() => configHandler.validateCookieBannerConfig(cookieBannerConfig)).not.toThrow();
            });
        });

        test('Invalid configuration', () => {
            const configHandler = new ConfigHandler();

            const cookieBannerConfig: any = {
                class: 'some-class-name',
                showWithPreferencesForm: 'someString',
                actions: [
                    {
                        name: 'actionName',
                        buttonClass: 'action-button-class',
                        confirmationClass: 'action-confirmation-class',
                        consent: true
                    }
                ]
            };

            expect(() => configHandler.validateCookieBannerConfig(cookieBannerConfig)).toThrow();
        });

        test('Invalid actions configuration', () => {
            const configHandler = new ConfigHandler();

            const cookieBannerConfig: any = {
                class: 'some-class-name',
                showWithPreferencesForm: true,
                actions: [
                    {
                        confirmationClass: 'action-confirmation-class',
                        consent: true
                    }
                ]
            };

            expect(() => configHandler.validateCookieBannerConfig(cookieBannerConfig)).toThrow();
        });
    });

    describe('mergeConfigurations', function () {
        test('Return default config', () => {
            const configHandler = new ConfigHandler();
            configHandler.validateConfig = vi.fn();

            expect(configHandler.mergeConfigurations({} as CookieManagerConfig)).toStrictEqual(ConfigHandler.defaultConfig);
            expect(configHandler.validateConfig).not.toHaveBeenCalled();
        });

        test('Return merged config', () => {
            const configHandler = new ConfigHandler();
            const customConfig: Partial<CookieManagerConfig> = {
                userPreferences: {
                    cookieSecure: true
                },
                cookieManifest: [
                    {
                        categoryName: 'analytics',
                        cookies: [
                            '_ga'
                        ]
                    }
                ]
            };
            const expectedUserPreferences = {
                cookieName: 'cookie-preferences',
                cookieExpiry: 365,
                cookieSecure: true
            };
            const expectedCookieManifest = [
                {
                    categoryName: 'analytics',
                    cookies: [
                        '_ga'
                    ]
                }
            ];
            configHandler.validateConfig = vi.fn();

            expect(configHandler.mergeConfigurations(customConfig)).toStrictEqual({
                ...ConfigHandler.defaultConfig,
                userPreferences: expectedUserPreferences,
                cookieManifest: expectedCookieManifest
            });
            expect(configHandler.validateConfig).toHaveBeenCalled();
        });

        test('Throw malformed/incorrect config error', () => {
            const configHandler = new ConfigHandler();
            const customConfig: any = {
                userPreferences: {
                    cookieSecure: true
                },
                cookieManifest: [
                    {
                        cookies: []
                    }
                ]
            };

            const validateConfigSpy = vi.spyOn(configHandler, 'validateConfig');

            expect(() => configHandler.mergeConfigurations(customConfig)).toThrow();
            expect(validateConfigSpy).toHaveBeenCalled();
        });
    });
});
