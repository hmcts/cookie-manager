import Cookie from '../models/cookie';
import CookieHandler from './cookieHandler';
import { EventProcessor } from './EventHandler';

export default class UserPreferences {
    constructor (Config, ManifestHandler) {
        this._config = Config;
        this._manifestHandler = ManifestHandler;
    }

    processPreferences () {
        this._preferencesCookie = this.getPreferenceCookie();

        if (this._preferencesCookie) {
            this.setPreferences(this._loadPreferencesFromCookie(this._preferencesCookie));
        } else {
            this.setPreferences(this._loadPreferenceDefaults());
        }
    }

    getPreferences () {
        if (!this._preferences) {
            console.error('User preferences not loaded/set, call .processPreferences() first');
            return {};
        }

        return this._preferences;
    };

    setPreferences (preferences) {
        console.debug('Setting preferences to: ' + JSON.stringify(preferences));
        this._preferences = preferences;
        EventProcessor.emit('UserPreferencesSet', (preferences));
    };

    getPreferenceCookie () {
        return CookieHandler.getCookie(this._config.getPreferenceCookieName());
    };

    savePreferencesToCookie () {
        const cookieValue = {};
        const preferences = this.getPreferences();

        Object.keys(preferences).forEach(key => { cookieValue[key] = preferences[key] ? 'on' : 'off'; });

        this._preferencesCookie = new Cookie(this._config.getPreferenceCookieName(), cookieValue);
        this._preferencesCookie.enable(this._config.getPreferenceCookieExpiryDays() * 24 * 60 * 60 * 1000);
        EventProcessor.emit('UserPreferencesSaved', (cookieValue));
    };

    _loadPreferencesFromCookie () {
        let cookiePreferences;
        const preferenceCookie = this.getPreferenceCookie();

        try {
            console.debug('Loading preferences from cookie');
            cookiePreferences = JSON.parse(preferenceCookie.getValue());
        } catch (e) {
            console.error(`Unable to parse user preference cookie "${preferenceCookie.getName()}" as JSON.`);
            preferenceCookie.disable();
            return this._loadPreferenceDefaults();
        }

        if (typeof cookiePreferences !== 'object') {
            console.debug('User preferences cookie is malformed, deleting old user preferences cookie.');
            preferenceCookie.disable();
            return this._loadPreferenceDefaults();
        }

        if (this._manifestHandler.getCategories()
            .filter(category => category.isOptional())
            .some(category => !Object.keys(cookiePreferences).includes(category.getName()))) {
            console.debug('User preferences cookie is missing categories, deleting old user preferences cookie.');
            preferenceCookie.disable();
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
        this._manifestHandler.getCategories()
            .filter(category => category.isOptional())
            .forEach(category => {
                preferences[category.getName()] = this._config.getDefaultConsent();
                cookiePreferences[category.getName()] = this._config.getDefaultConsent() ? 'on' : 'off';
            });

        EventProcessor.emit('UserPreferencesLoaded', (cookiePreferences));
        return preferences;
    };
}
