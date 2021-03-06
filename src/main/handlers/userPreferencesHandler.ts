import CookieHandler from './cookieHandler';
import { EventProcessor } from './eventHandler';
import ManifestHandler from './manifestHandler';
import { Cookie } from '../interfaces/Cookie';
import { CookieManagerConfig } from '../interfaces/Config';

export default class UserPreferences {
    private preferences: { [key: string]: boolean };

    constructor (
        private readonly config: CookieManagerConfig,
        private readonly manifestHandler: ManifestHandler
    ) {}

    processPreferences () {
        const preferencesCookie = this.getPreferenceCookie();

        if (preferencesCookie) {
            this.setPreferences(this._loadPreferencesFromCookie());
        } else {
            this.setPreferences(this._loadPreferenceDefaults());
        }
    }

    getPreferences () {
        if (!this.preferences) {
            console.error('User preferences not loaded/set, call .processPreferences() first');
            return {};
        }

        return this.preferences;
    };

    setPreferences (preferences: { [key: string]: boolean }) {
        console.debug('Setting preferences to: ' + JSON.stringify(preferences));
        this.preferences = preferences;
        EventProcessor.emit('UserPreferencesSet', (preferences));
    };

    getPreferenceCookie () {
        return CookieHandler.getCookie(this.config.userPreferences.cookieName);
    };

    savePreferencesToCookie () {
        const cookieValue = {};
        const preferences = this.getPreferences();

        Object.keys(preferences).forEach(key => { cookieValue[key] = preferences[key] ? 'on' : 'off'; });

        const preferencesCookie: Cookie = { name: this.config.userPreferences.cookieName, value: cookieValue };
        CookieHandler.saveCookie(preferencesCookie, this.config.userPreferences.cookieExpiry, this.config.userPreferences.cookieSecure);
        EventProcessor.emit('UserPreferencesSaved', (cookieValue));
    };

    _loadPreferencesFromCookie () {
        let cookiePreferences;
        const preferenceCookie = this.getPreferenceCookie();

        try {
            console.debug('Loading preferences from cookie');
            cookiePreferences = JSON.parse(preferenceCookie.value);
        } catch (e) {
            console.error(`Unable to parse user preference cookie "${preferenceCookie.name}" as JSON.`);
            CookieHandler.deleteCookie(preferenceCookie);
            return this._loadPreferenceDefaults();
        }

        if (typeof cookiePreferences !== 'object') {
            console.debug('User preferences cookie is malformed, deleting old user preferences cookie.');
            CookieHandler.deleteCookie(preferenceCookie);
            return this._loadPreferenceDefaults();
        }

        if (this.manifestHandler.getCategories()
            .filter(category => category.optional)
            .some(category => !Object.keys(cookiePreferences).includes(category.name))) {
            console.debug('User preferences cookie is missing categories, deleting old user preferences cookie.');
            CookieHandler.deleteCookie(preferenceCookie);
            return this._loadPreferenceDefaults();
        }

        const preferences = {};
        Object.keys(cookiePreferences).forEach(key => { preferences[key] = cookiePreferences[key] === 'on'; });

        EventProcessor.emit('UserPreferencesLoaded', (cookiePreferences));
        return preferences;
    };

    _loadPreferenceDefaults () {
        console.debug('Loading preferences from defaults');

        const preferences = {};
        const cookiePreferences = {};
        this.manifestHandler.getCategories()
            .filter(category => category.optional ?? true)
            .forEach(category => {
                preferences[category.name] = this.config.additionalOptions.defaultConsent;
                cookiePreferences[category.name] = this.config.additionalOptions.defaultConsent ? 'on' : 'off';
            });

        EventProcessor.emit('UserPreferencesLoaded', (cookiePreferences));
        return preferences;
    };
}
