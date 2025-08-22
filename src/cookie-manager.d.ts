interface EventToken {
  type: string;
  token: string;
}

interface CookieManagerConfig {
  userPreferences?: Partial<{
    cookieName: string;
    cookieExpiry: number;
    cookieSecure: boolean;
  }>;
  preferencesForm?: Partial<{
    class: string;
  }>;
  cookieBanner?: Partial<{
    class: string;
    showWithPreferencesForm: boolean;
    actions: Array<{
      name: string;
      buttonClass: string;
      confirmationClass?: string;
      consent?: string[] | boolean;
    }>;
  }>;
  cookieManifest?: Array<{
    categoryName: string;
    optional?: boolean;
    matchBy?: string;
    cookies: string[];
  }>;
  additionalOptions?: Partial<{
    disableCookieBanner: boolean;
    disableCookiePreferencesForm: boolean;
    deleteUndefinedCookies: boolean;
    defaultConsent: boolean;
  }>;
}

declare const cookieManager: {
  on(eventName: string, callback: (eventData: any) => void): EventToken;
  off(eventToken: EventToken): void;
  init(config: CookieManagerConfig): void;
};

export default cookieManager;