import Cookie from "../models/cookie";

export default function UserPreferences (Config, ManifestHandler, CookieHandler) {
    this._Config = Config;
    this._CookieHandler = CookieHandler;
    this._ManifestHandler = ManifestHandler;
}

UserPreferences.prototype.processPreferences = function () {
    this._preferencesCookie = this.getPreferenceCookie();

    if(this._preferencesCookie) {
        this.setPreferences(this.loadPreferencesFromCookie(this._preferencesCookie));
    } else {
        this.setPreferences(this.loadPreferenceDefaults());
    }
}

UserPreferences.prototype.getPreferences = function () {
    if(!this._preferences) {
        console.error('User preferences not loaded/set, call .processPreferences() first')
        return {};
    }

    return this._preferences;
};

UserPreferences.prototype.setPreferences = function (preferences) {
    this._preferences = preferences;
};

UserPreferences.prototype.getPreferenceCookie = function () {
    return this._CookieHandler.getCookie(this._Config.getPreferenceCookieName());
};

UserPreferences.prototype.savePreferencesToCookie = function () {
    const cookieValue = {};
    const preferences = this.getPreferences();

    Object.keys(preferences).forEach(key => cookieValue[key] = preferences[key] ? 'on' : 'off');

    this._preferencesCookie = new Cookie(this._Config.getPreferenceCookieName(), cookieValue);
    this._preferencesCookie.enable(365 * 24 * 60 * 60 * 1000);
};

UserPreferences.prototype.loadPreferencesFromCookie = function () {
    let cookiePreferences;
    const preferenceCookie = this.getPreferenceCookie();

    try {
        console.debug('Loading preferences from cookie');
        cookiePreferences = JSON.parse(preferenceCookie.getValue());
    } catch (e) {
        console.error(`Unable to parse user preference cookie "${preferenceCookie.getName()}" as JSON.`);
        preferenceCookie.disable();
        return this.loadPreferenceDefaults();
    }

    try {
        if (typeof cookiePreferences !== 'object') {
            throw new Error('User preferences cookie is malformed');
        }

        for (const configCategory of this._ManifestHandler.getCategories().filter(category => category.isOptional())) {
            if (!Object.keys(cookiePreferences).includes(configCategory.getName())) {
                throw new Error('User preferences cookie is missing category: ' + configCategory.getName());
            }
        }
    } catch (e) {
        console.debug(e + ', deleting old user preferences cookie.');
        preferenceCookie.disable();
        return this.loadPreferenceDefaults();
    }

    const preferences = {};
    Object.keys(cookiePreferences).forEach(key => preferences[key] = cookiePreferences[key] === 'on');

    return preferences;
};

UserPreferences.prototype.loadPreferenceDefaults = function () {
    console.debug('Loading preferences from defaults');

    const preferences = {};
    this._ManifestHandler.getCategories()
        .filter(category => category.isOptional())
        .forEach(category => {
            preferences[category.getName()] = this._Config.getDefaultConsent();
        });

    return preferences;
};