import {
    AdditionalOptions, CookieBanner,
    CookieManagerConfig,
    CookieManifest,
    PreferencesForm,
    UserPreferences
} from '../interfaces/Config';

export const isString = (property: string) => typeof property === 'string' && property.trim() !== '';
export const isBoolean = (property: any) => typeof property === 'boolean';
export const isNumber = (property: any) => typeof property === 'number' && !isNaN(property);
export const isUndefined = (property: any) => property === undefined;
export const isArray = (property: any[]) => Array.isArray(property) && property.length;
export const isArrayOfType = (property: any[], type: Function) => isArray(property) && property.every(value => type(value));

export class ConfigHandler {
    static defaultConfig: CookieManagerConfig = {
        userPreferences: {
            cookieName: 'cookie-preferences',
            cookieExpiry: 365,
            cookieSecure: false
        },
        preferencesForm: {
            class: 'cookie-preferences-form'
        },
        cookieBanner: {
            class: 'cookie-banner',
            showWithPreferencesForm: false,
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
            disableCookieBanner: false,
            disableCookiePreferencesForm: false,
            deleteUndefinedCookies: true,
            defaultConsent: false
        }
    }

    private readonly configTypes = {
        userPreferences: {
            cookieName: isString,
            cookieExpiry: isNumber,
            cookieSecure: isBoolean
        },
        preferencesForm: {
            class: isString
        },
        cookieBanner: {
            class: isString,
            showWithPreferencesForm: isBoolean,
            actions: {
                name: isString,
                buttonClass: isString,
                confirmationClass: { OR: [isUndefined, isString] },
                consent: { OR: [isUndefined, isBoolean, (property: any) => isArrayOfType(property, isString)] }
            }
        },
        additionalOptions: {
            disableCookieBanner: isBoolean,
            disableCookiePreferencesForm: isBoolean,
            deleteUndefinedCookies: isBoolean,
            defaultConsent: isBoolean
        },
        cookieManifest: {
            categoryName: isString,
            optional: { OR: [isUndefined, isBoolean] },
            matchBy: { OR: [isUndefined, (property) => isString(property) && ['exact', 'startsWith', 'includes'].indexOf(property) !== -1] },
            cookies: (property: any) => isArrayOfType(property, isString)
        }
    }

    typeOfTester (value: any, testers: Function | { AND?: Function[], OR?: Function[] }) {
        if (typeof testers === 'function') return testers(value);

        if (testers.AND) {
            return testers.AND.every(testFunction => testFunction(value));
        } else {
            return testers.OR.some(testFunction => testFunction(value));
        }
    }

    validateUserPreferencesConfig (configuration: Partial<UserPreferences>) {
        for (const key in this.configTypes.userPreferences) {
            if (!this.typeOfTester(configuration[key], this.configTypes.userPreferences[key])) throw new ConfigError(key);
        }
    }

    validateAdditionalOptionsConfig (configuration: Partial<AdditionalOptions>) {
        for (const key in this.configTypes.additionalOptions) {
            if (!this.typeOfTester(configuration[key], this.configTypes.additionalOptions[key])) throw new ConfigError(key);
        }
    }

    validatePreferencesFormConfig (configuration: Partial<PreferencesForm>) {
        for (const key in this.configTypes.preferencesForm) {
            if (!this.typeOfTester(configuration[key], this.configTypes.preferencesForm[key])) throw new ConfigError(key);
        }
    }

    validateCookieBannerConfig (configuration: Partial<CookieBanner>) {
        const { actions, ...options } = this.configTypes.cookieBanner;
        for (const key in options) {
            if (!this.typeOfTester(configuration[key], this.configTypes.cookieBanner[key])) throw new ConfigError(key);
        }

        configuration.actions.forEach(action => {
            for (const key in actions) {
                if (!this.typeOfTester(action[key], this.configTypes.cookieBanner.actions[key])) throw new ConfigError(key);
            }
        });
    }

    validateCookieManifestConfig (configuration: Partial<CookieManifest>[]) {
        configuration.forEach(cookieCategory => {
            for (const key in this.configTypes.cookieManifest) {
                if (!this.typeOfTester(cookieCategory[key], this.configTypes.cookieManifest[key])) throw new ConfigError(key);
            }
        });
    }

    validateConfig (configuration: CookieManagerConfig) {
        this.validateUserPreferencesConfig(configuration.userPreferences);
        this.validateAdditionalOptionsConfig(configuration.additionalOptions);
        this.validatePreferencesFormConfig(configuration.preferencesForm);
        this.validateCookieBannerConfig(configuration.cookieBanner);
        this.validateCookieManifestConfig(configuration.cookieManifest);
    }

    mergeConfigurations (providedConfig: Partial<CookieManagerConfig>): CookieManagerConfig {
        const finalConfig = { ...ConfigHandler.defaultConfig };

        if (Object.keys(providedConfig).length) {
            finalConfig.userPreferences = { ...ConfigHandler.defaultConfig.userPreferences, ...providedConfig.userPreferences };
            finalConfig.additionalOptions = { ...ConfigHandler.defaultConfig.additionalOptions, ...providedConfig.additionalOptions };
            finalConfig.preferencesForm = { ...ConfigHandler.defaultConfig.preferencesForm, ...providedConfig.preferencesForm };
            finalConfig.cookieBanner = { ...ConfigHandler.defaultConfig.cookieBanner, ...providedConfig.cookieBanner };
            finalConfig.cookieManifest = providedConfig.cookieManifest ?? ConfigHandler.defaultConfig.cookieManifest;

            this.validateConfig(finalConfig);
        }

        return finalConfig;
    }
}

class ConfigError extends Error {
    constructor (property: string) {
        super(`Configuration property '${property}' is malformed, missing or has an unexpected value.`);
        this.name = 'ConfigError';
    }
}
