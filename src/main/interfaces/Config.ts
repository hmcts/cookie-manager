export interface CookieManagerConfig {
    userPreferences?: {
        cookieName?: string,
        cookieExpiry?: number,
        cookieSecure?: boolean
    },
    preferencesForm?: {
        class: string
    };
    cookieBanner?: {
        class?: string,
        showWithPreferencesForm?: boolean,
        actions?: {
            name: string;
            buttonClass: string;
            confirmationClass?: string;
            consent?: string[] | boolean;
        }[]
    };
    cookieManifest?: {
        categoryName: string,
        optional?: boolean,
        matchBy?: string,
        cookies: string[]
    }[];
    additionalOptions?: {
        deleteUndefinedCookies?: boolean,
        defaultConsent?: boolean
    };
}
