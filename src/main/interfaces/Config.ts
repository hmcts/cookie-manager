export interface UserPreferences {
    cookieName: string;
    cookieExpiry: number;
    cookieSecure: boolean;
}

export interface PreferencesForm {
    class: string;
}

export interface CookieBanner {
    class: string;
    showWithPreferencesForm: boolean;
    actions: {
        name: string;
        buttonClass: string;
        confirmationClass?: string;
        consent?: string[] | boolean;
    }[]
}

export interface CookieManifest {
    categoryName: string;
    optional?: boolean;
    matchBy?: string;
    cookies: string[];
}

export interface AdditionalOptions {
    disableCookieBanner: boolean;
    disableCookiePreferencesForm: boolean;
    deleteUndefinedCookies: boolean;
    defaultConsent: boolean;
}

export interface CookieManagerConfig {
    userPreferences: Partial<UserPreferences>;
    preferencesForm: Partial<PreferencesForm>;
    cookieBanner: Partial<CookieBanner>;
    cookieManifest: CookieManifest[];
    additionalOptions: Partial<AdditionalOptions>;
}
